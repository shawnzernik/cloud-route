import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { ContentDto } from "common/src/tre/models/ContentDto";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { ContentService } from "../services/ContentService";
import { AuthService } from "../../tre/services/AuthService";
import { PayloadDto } from "common/src/tre/models/PayloadDto";
import { PayloadService } from "../services/PayloadService";
import { Markdown } from "../../tre/components/Markdown";
import { PayloadLogic } from "common/src/tre/logic/PayloadLogic";

interface Props { }
interface State extends BasePageState {
    contentDto: ContentDto;
    payloadDto: PayloadDto | undefined;
}

class Page extends BasePage<Props, State> {
    private navRef: React.RefObject<Navigation>;

    public constructor(props: Props) {
        super(props);

        this.navRef = React.createRef();

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
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.events.setLoading(true);

        const token = await AuthService.getToken();

        const guid = this.queryString("guid");
        const pathAndName = this.queryString("pathAndName");

        const topMenu = this.queryString("topMenu") || "";
        const leftMenu = this.queryString("leftMenu") || "";
        this.navRef.current.setMenus(topMenu, leftMenu);

        let contentDto: ContentDto;
        if (guid && pathAndName) {
            await ErrorMessage(this, new Error("You must provide either guid or path and name, not both!"));
            return;
        }

        if (guid)
            contentDto = await ContentService.get(token, guid);
        if (pathAndName)
            contentDto = await ContentService.getByPathAndName(token, pathAndName);

        if (!contentDto) {
            await ErrorMessage(this, new Error("You must provide a guid or path and name!"));
            return;
        }

        if (contentDto.binary) {
            await ErrorMessage(this, new Error("Contents is binary!"));
            return;
        }

        if (contentDto.mimeType !== "text/markdown") {
            await ErrorMessage(this, new Error("Contents MIME type is not markdown!"));
            return;
        }

        document.title = contentDto.title;

        let payloadDto = await PayloadService.get(token, contentDto.guid);

        await this.updateState({
            contentDto: contentDto,
            payloadDto: payloadDto
        });

        await this.events.setLoading(false);
    }

    public render(): React.ReactNode {
        let str = "";

        if (this.state.payloadDto) {
            const buff = PayloadLogic.decode(this.state.payloadDto.content);
            str = PayloadLogic.uint8ArrayToString(buff);
        }

        return (
            <Navigation
                ref={this.navRef}
                state={this.state} events={this.events}
                topMenuGuid=""
                leftMenuGuid=""
            >
                <Markdown page={this}>{str}</Markdown>
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