import * as React from "react";
import { createRoot } from "react-dom/client";
import { Dialogue, ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { Heading } from "../../tre/components/Heading";
import { Form } from "../../tre/components/Form";
import { Field } from "../../tre/components/Field";
import { Input } from "../../tre/components/Input";
import { AdapterDto } from "common/src/app/models/AdapterDto";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { Checkbox } from "../../tre/components/Checkbox";
import { FlexRow } from "../../tre/components/FlexRow";
import { Button } from "../../tre/components/Button";
import { AdapterService } from "../services/AdapterService";
import { AuthService } from "../../tre/services/AuthService";
import { ExtendedAdapterService } from "../services/ExtendedAdapterService";
import { SystemService } from "../services/SystemService";

interface Props { }
interface State extends BasePageState {
    adapter: AdapterDto
}

class Page extends BasePage<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            ...BasePage.defaultState,
            adapter: {
                deviceName: "",
                displayName: "",
                enable: false,
                guid: UUIDv4.generate(),
                ip4NetworkBits: 24,
                dnsSearch: "",
                ip4Address: "",
                ip4DefaultGateway: "",
                ip4DnsAddresses: "",
            }
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            this.events.setLoading(true);
            const token = await AuthService.getToken();

            let adapter = this.jsonCopy(this.state.adapter);

            const device = this.queryString("device");
            if (device) {
                const load = await ExtendedAdapterService.getDevice(token, device);
                if (load)
                    adapter = load;
                else
                    adapter.deviceName = device;
            }

            const guid = this.queryString("guid");
            if (guid) {
                const load = await ExtendedAdapterService.get(token, guid);
                if (!load)
                    throw new Error("You adapter for GUID " + guid + " does not exist!");
                adapter = load;
            }

            this.updateState({ adapter: adapter });

            this.events.setLoading(false);
        }
        catch (err) {
            await ErrorMessage(this, err);
        }
    }

    public async saveClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            await ExtendedAdapterService.save(token, this.state.adapter);

            await this.events.setLoading(false);

            SystemService.setEtcNetplan(token);

            await Dialogue(this, "Success", "You data was saved!");
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }
    public async deleteClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            await ExtendedAdapterService.delete(token, this.state.adapter.guid);

            await this.events.setLoading(false);
            window.history.back();
            return;
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }

    public render(): React.ReactNode {
        return (
            <Navigation
                state={this.state} events={this.events}
                topMenuGuid="b9aeb1c2-4f07-4e91-bbef-25ed565b6ab3"
                leftMenuGuid="4fa7b2ae-953d-45ed-bc83-2194176b0c59"
            >
                <Heading level={1}>Adapter Edit</Heading>
                <Form>
                    <Field label="GUID" size={3}><Input
                        value={this.state.adapter.guid}
                    /></Field>
                </Form>
                <Form>
                    <Field label="Display Name" size={2}><Input
                        value={this.state.adapter.displayName ? this.state.adapter.displayName : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.displayName = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                    <Field label="Device Name" size={1}><Input
                        value={this.state.adapter.deviceName ? this.state.adapter.deviceName : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.deviceName = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                    <Field label="Enabled" size={1}><Checkbox
                        checked={this.state.adapter.enable}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.enable = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                </Form>
                <Form>
                    <Field label="Address" size={2}><Input
                        value={this.state.adapter.ip4Address ? this.state.adapter.ip4Address : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.ip4Address = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                    <Field label="Network Bits" size={1}><Input
                        value={this.state.adapter.ip4NetworkBits.toString()}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.ip4NetworkBits = Number.parseInt(value);
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                    <Field label="Gateway" size={2}><Input
                        value={this.state.adapter.ip4DefaultGateway ? this.state.adapter.ip4DefaultGateway : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.ip4DefaultGateway = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                </Form>
                <Form>
                    <Field label="DNS Servers"><Input
                        value={this.state.adapter.ip4DnsAddresses ? this.state.adapter.ip4DnsAddresses : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.ip4DnsAddresses = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                    <Field label="Search Suffix"><Input
                        value={this.state.adapter.dnsSearch ? this.state.adapter.dnsSearch : ""}
                        onChange={async (value) => {
                            const newAdapter = this.jsonCopy(this.state.adapter);
                            newAdapter.dnsSearch = value;
                            await this.updateState({ adapter: newAdapter });
                        }}
                    /></Field>
                </Form>
                <FlexRow>
                    <Button label="Save" onClick={this.saveClicked.bind(this)} />
                    <Button label="Delete" onClick={this.deleteClicked.bind(this)} />
                </FlexRow>
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
