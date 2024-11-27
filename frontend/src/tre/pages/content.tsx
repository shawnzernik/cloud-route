import * as React from "react";
import { createRoot } from "react-dom/client";
import { Dialogue, ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { Heading } from "../../tre/components/Heading";
import { Form } from "../../tre/components/Form";
import { Field } from "../../tre/components/Field";
import { Input } from "../../tre/components/Input";
import { ContentDto } from "common/src/tre/models/ContentDto";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FlexRow } from "../../tre/components/FlexRow";
import { Button } from "../../tre/components/Button";
import { ContentService } from "../services/ContentService";
import { AuthService } from "../../tre/services/AuthService";
import { TextArea } from "../../tre/components/TextArea";
import { UserService } from "../../tre/services/UserService";
import { SettingService } from "../../tre/services/SettingService";
import { SelectOption } from "../../tre/components/SelectOption";
import { Select } from "../../tre/components/Select";
import { AuthLogic } from "../../tre/logic/AuthLogic";
import { Dictionary } from "common/src/tre/Dictionary";
import { Checkbox } from "../../tre/components/Checkbox";
import { SecurableService } from "../../tre/services/SecurableService";
import { ContentMimeTypeDto } from "common/src/tre/models/ContentMimeTypeDto";
import { ContentLogic } from "common/src/tre/logic/ContentLogic";
import { PayloadDto } from "common/src/tre/models/PayloadDto";
import { PayloadLogic } from "common/src/tre/logic/PayloadLogic";
import { PayloadService } from "../services/PayloadService";

interface Props { }
interface State extends BasePageState {
    contentDto: ContentDto;
    payloadDto: PayloadDto | undefined;
    userOptions: any[];
    mimeOptions: any[];
    securableOptions: any[];

}

class Page extends BasePage<Props, State> {
    private auth: AuthLogic;
    private mimeTypeToDescription: Dictionary<string> = {};
    private mimeTypes: ContentMimeTypeDto[];

    public constructor(props: Props) {
        super(props);

        const date = new Date(Date.now());

        const newGuid = UUIDv4.generate();
        this.state = {
            ...BasePage.defaultState,
            contentDto: {
                guid: newGuid,
                title: "",
                pathAndName: "",
                mimeType: "",
                encodedSize: 0,
                created: date,
                createdBy: "",
                modified: date,
                modifiedBy: "",
                binary: false,
                securablesGuid: ""
            },
            payloadDto: {
                guid: newGuid,
                content: ""
            },
            userOptions: [<SelectOption display="" value="" />],
            mimeOptions: [<SelectOption display="" value="" />],
            securableOptions: [<SelectOption display="" value="" />],
        }
    }

    private async loadSelectOptions(token: string) {
        // users
        const userOptions = [<SelectOption display="" value="" />];
        const userList = await UserService.list(token);
        for (const user of userList)
            userOptions.push(<SelectOption display={user.emailAddress} value={user.guid} />);

        // securables
        const securableOptions = [<SelectOption display="" value="" />];
        const securableList = await SecurableService.list(token);
        for (const securable of securableList)
            securableOptions.push(<SelectOption display={securable.displayName} value={securable.guid} />);

        // mime types
        const mimeTypesSetting = await SettingService.getKey(token, "Content:MIME Types");
        let mimeTypes;
        try { mimeTypes = JSON.parse(mimeTypesSetting.value) as ContentMimeTypeDto[]; }
        catch (err) {
            await ErrorMessage(this, err);
            return;
        }
        mimeTypes = mimeTypes.sort((a, b) => {
            if (a.description < b.description)
                return -1;
            if (a.description == b.description)
                return 0;
            return 1;
        });

        const mimeOptions = [<SelectOption display="" value="" />];
        const mimeTypeToDescription: Dictionary<string> = {};
        for (const mimeType of mimeTypes) {
            mimeTypeToDescription[mimeType.mimetype] = mimeType.description;
            mimeOptions.push(<SelectOption display={mimeType.description} value={mimeType.mimetype} />);
        }

        return {
            userOptions: userOptions,
            securableOptions: securableOptions,
            mimeTypes: mimeTypes,
            mimeOptions: mimeOptions,
            mimeTypeToDescription: mimeTypeToDescription
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.events.setLoading(true);

        const token = await AuthService.getToken();

        // load select options / foreign keys
        let {
            userOptions,
            securableOptions,
            mimeTypes,
            mimeOptions,
            mimeTypeToDescription
        } = await this.loadSelectOptions(token);

        this.mimeTypes = mimeTypes;
        this.mimeTypeToDescription = mimeTypeToDescription;

        // get user data
        const publicKey = await AuthService.publicKey();
        this.auth = await AuthLogic.tokenLogin(token, publicKey);

        // prime new content and payload
        let contentDto = this.jsonCopy(this.state.contentDto);
        contentDto.createdBy = this.auth.user.guid;
        contentDto.modifiedBy = this.auth.user.guid;

        let payloadDto: PayloadDto = {
            guid: contentDto.guid,
            content: ""
        };

        await this.updateState({
            mimeOptions: mimeOptions,
            userOptions: userOptions,
            securableOptions: securableOptions,
            contentDto: contentDto,
            payloadDto: payloadDto
        });

        // if not requesting existing
        const guid = this.queryString("guid");
        if (!guid) {
            await this.events.setLoading(false);
            return;
        }

        // load existing
        contentDto = await ContentService.get(token, guid);
        if (!contentDto.binary)
            payloadDto = await PayloadService.get(token, guid);
        else
            payloadDto = undefined;

        await this.updateState({
            contentDto: contentDto,
            payloadDto: payloadDto
        });

        await this.events.setLoading(false);
    }

    public async saveClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();
            const contentDto = this.jsonCopy(this.state.contentDto);

            const guid = this.queryString("guid");
            if (guid) {
                contentDto.modifiedBy = this.auth.user.guid;
                contentDto.modified = new Date(Date.now());
            }

            let payloadDto;
            if (this.state.payloadDto) {
                payloadDto = this.jsonCopy(this.state.payloadDto);
                contentDto.encodedSize = payloadDto.content.length;
            }

            ContentLogic.normalizeName(contentDto);

            await ContentService.save(token, contentDto);
            if (this.state.payloadDto)
                await PayloadService.save(token, payloadDto);

            window.location.replace("content.html?guid=" + this.state.contentDto.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    public async deleteClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();

            const tempModel = await ContentService.get(token, this.state.contentDto.guid);
            tempModel.deletedBy = this.auth.user.guid;
            tempModel.deleted = new Date(Date.now());
            await ContentService.save(token, tempModel);

            window.location.replace("content.html?guid=" + this.state.contentDto.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    public async restoreClicked() {
        this.events.setLoading(true);
        try {
            const token = await AuthService.getToken();

            const tempModel = await ContentService.get(token, this.state.contentDto.guid);
            tempModel.deletedBy = null;
            tempModel.deleted = null;
            tempModel.modifiedBy = this.auth.user.guid;
            tempModel.modified = new Date(Date.now());
            await ContentService.save(token, tempModel);

            window.location.replace("content.html?guid=" + this.state.contentDto.guid);
            return;
        }
        catch (err) {
            await ErrorMessage(this, err);
            await this.events.setLoading(false);
        }
    }

    private async fileUploaded(files: FileList) {
        if (files.length != 1) {
            ErrorMessage(this, new Error(`You can only upload one file. We received ${files.length} file(s)!`));
            return;
        }

        const file = files.item(0);

        if (!this.mimeTypeToDescription[file.type]) {
            await ErrorMessage(this, new Error(`MIME type '${file.type}' is invalid!`));
            return;
        }

        let parts = this.state.contentDto.pathAndName.split("/");
        let pathAndName = "/";
        for (let cnt = 0; cnt < parts.length - 1; cnt++) {
            let part = parts[cnt].trim();
            if (part.length > 0 && part !== "." && part !== "..")
                pathAndName += part + "/";
        }
        pathAndName += file.name;

        const arrBuffer = await file.arrayBuffer();
        const base64 = PayloadLogic.encode(new Uint8Array(arrBuffer));

        const contentDto = this.jsonCopy(this.state.contentDto);
        contentDto.pathAndName = pathAndName;
        contentDto.mimeType = file.type;
        contentDto.encodedSize = base64.length;
        const payloadDto: PayloadDto = {
            guid: contentDto.guid,
            content: base64
        };

        ContentLogic.normalize(contentDto, payloadDto, this.mimeTypes);

        await this.updateState({
            contentDto: contentDto,
            payloadDto: payloadDto
        });
    }

    private viewClicked() {
        window.location.assign("markdown.html?pathAndName=" + this.state.contentDto.pathAndName);
    }

    public render(): React.ReactNode {
        const decodedUrl = `/api/v0/content/decoded${this.state.contentDto.pathAndName}`;

        return (
            <Navigation
                state={this.state} events={this.events}
                topMenuGuid="b1e3c680-0f62-4931-8a68-4be9b4b070f7"
                leftMenuGuid="527f06a9-0378-47c6-9b16-a9c0b72c757e"
            >
                <Heading level={1}>Content Edit</Heading>
                <Form
                    page={this}
                    fileUploaded={this.fileUploaded.bind(this)}
                >
                    <Field label="GUID" size={3}><Input
                        readonly={true}
                        value={this.state.contentDto.guid}
                    /></Field>
                    <Field label="Title"><Input
                        value={this.state.contentDto.title}
                        onChange={async (value) => {
                            const newModel = this.jsonCopy(this.state.contentDto);
                            newModel.title = value;
                            await this.updateState({ contentDto: newModel });
                        }}
                    /></Field>
                    <Field label="Path and Name"><Input
                        value={this.state.contentDto.pathAndName}
                        onChange={async (value) => {
                            const newModel = this.jsonCopy(this.state.contentDto);
                            newModel.pathAndName = value;
                            await this.updateState({ contentDto: newModel });
                        }}
                    /></Field>
                    <FlexRow gap="0">
                        <Field label="Securable" size={2}><Select
                            value={this.state.contentDto.securablesGuid}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.contentDto);
                                newModel.securablesGuid = value;
                                await this.updateState({ contentDto: newModel });
                            }}
                        >{this.state.securableOptions}</Select></Field>
                        <Field label="MIME Type" size={2}><Select
                            value={this.state.contentDto.mimeType}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.contentDto);
                                newModel.mimeType = value;
                                await this.updateState({ contentDto: newModel });
                            }}
                        >{this.state.mimeOptions}</Select></Field>
                        <Field label="Encoded Size" size={1}><Input
                            value={this.state.contentDto.encodedSize.toString()}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.contentDto);
                                newModel.encodedSize = Number.parseInt(value);
                                await this.updateState({ contentDto: newModel });
                            }}
                        /></Field>
                        <Field label="Binary" size={1}><Checkbox
                            checked={this.state.contentDto.binary}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.contentDto);
                                newModel.binary = value;
                                await this.updateState({ contentDto: newModel });
                            }}
                        /></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Created" size={2}><Input
                            value={this.state.contentDto.created ? this.state.contentDto.created.toString() : ""}
                        /></Field>
                        <Field label="Created By" size={3}><Select
                            value={this.state.contentDto.createdBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Modified" size={2}><Input
                            value={this.state.contentDto.modified ? this.state.contentDto.modified.toString() : ""}
                        /></Field>
                        <Field label="Modified By" size={3}><Select
                            value={this.state.contentDto.modifiedBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                    <FlexRow gap="0">
                        <Field label="Deleted" size={2}><Input
                            value={this.state.contentDto.deleted ? this.state.contentDto.deleted.toString() : ""}
                        /></Field>
                        <Field label="Deleted By" size={3}><Select
                            value={this.state.contentDto.deletedBy}
                        >{this.state.userOptions}</Select></Field>
                    </FlexRow>
                </Form>
                <FlexRow gap="1em">
                    {this.state.contentDto.deleted ? null : <Button label="Save" onClick={this.saveClicked.bind(this)} />}
                    {this.state.contentDto.deleted ? null : <Button label="Delete" onClick={this.deleteClicked.bind(this)} />}
                    {this.state.contentDto.deleted ? <Button label="Restore" onClick={this.restoreClicked.bind(this)} /> : null}
                    {this.state.contentDto.mimeType == "text/markdown" ? <Button label="View" onClick={this.viewClicked.bind(this)} /> : null}
                </FlexRow>
                {
                    this.state.contentDto.binary
                        ? <Field label="Download">
                            <a target="_blank" href={decodedUrl}>{decodedUrl}</a>
                        </Field>
                        : <Field label="Content"><TextArea
                            showAll={true}
                            monospace={true}
                            value={PayloadLogic.uint8ArrayToString(PayloadLogic.decode(this.state.payloadDto.content))}
                            onChange={async (value) => {
                                const newModel = this.jsonCopy(this.state.payloadDto);
                                newModel.content = PayloadLogic.encode(PayloadLogic.stringToUint8Array(value));
                                await this.updateState({ payloadDto: newModel });
                            }}
                        /></Field>
                }
            </Navigation>
        );
    }
}

window.onload = () => {
    const element = document.getElementById("root");
    const root = createRoot(element);
    root.render(<Page />)
};
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};