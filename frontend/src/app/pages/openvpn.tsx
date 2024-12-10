import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { Heading } from "../../tre/components/Heading";
import { Form } from "../../tre/components/Form";
import { Field } from "../../tre/components/Field";
import { Input } from "../../tre/components/Input";
import { FlexRow } from "../../tre/components/FlexRow";
import { Button } from "../../tre/components/Button";
import { OpenVpnDto } from "common/src/app/models/OpenVpnDto";
import { SettingService } from "../../tre/services/SettingService";
import { AuthService } from "../../tre/services/AuthService";
import { Select } from "../../tre/components/Select";
import { SelectOption } from "../../tre/components/SelectOption";
import { OpenVpnService } from "../services/OpenVpnService";
import { Table } from "../../tre/components/Table";
import * as path from "path";

interface Props { }
interface State extends BasePageState {
    dto: OpenVpnDto;
}

class Page extends BasePage<Props, State> {
    private static cidrSelectOptions = [<SelectOption display="/0 (h.h.h.h) (h: 4b)" value="0" />,
    <SelectOption display="/1 (128.h.h.h) (h: 2b)" value="1" />,
    <SelectOption display="/2 (64.h.h.h) (h: 1b)" value="2" />,
    <SelectOption display="/3 (32.h.h.h) (h: 512m)" value="3" />,
    <SelectOption display="/4 (16.h.h.h) (h: 256m)" value="4" />,
    <SelectOption display="/5 (8.h.h.h) (h: 128m)" value="5" />,
    <SelectOption display="/6 (4.h.h.h) (h: 64m)" value="6" />,
    <SelectOption display="/7 (2.h.h.h) (h: 32m)" value="7" />,
    <SelectOption display="/8 (1.h.h.h) (h: 16m)" value="8" />,
    <SelectOption display="/9 (n.128.h.h) (h: 8m)" value="9" />,
    <SelectOption display="/10 (n.64.h.h) (h: 4m)" value="10" />,
    <SelectOption display="/11 (n.32.h.h) (h: 2m)" value="11" />,
    <SelectOption display="/12 (n.16.h.h) (h: 1m)" value="12" />,
    <SelectOption display="/13 (n.8.h.h) (h: 512k)" value="13" />,
    <SelectOption display="/14 (n.4.h.h) (h: 256k)" value="14" />,
    <SelectOption display="/15 (n.2.h.h) (h: 128k)" value="15" />,
    <SelectOption display="/16 (n.1.h.h) (h: 64k)" value="16" />,
    <SelectOption display="/17 (n.n.128.h) (h: 32k)" value="17" />,
    <SelectOption display="/18 (n.n.64.h) (h: 16k)" value="18" />,
    <SelectOption display="/19 (n.n.32.h) (h: 8k)" value="19" />,
    <SelectOption display="/20 (n.n.16.h) (h: 4k)" value="20" />,
    <SelectOption display="/21 (n.n.8.h) (h: 2k)" value="21" />,
    <SelectOption display="/22 (n.n.4.h) (h: 1k)" value="22" />,
    <SelectOption display="/23 (n.n.2.h) (h: 512)" value="23" />,
    <SelectOption display="/24 (n.n.1.h) (h: 256)" value="24" />,
    <SelectOption display="/25 (n.n.n.128) (h: 128)" value="25" />,
    <SelectOption display="/26 (n.n.n.64) (h: 64)" value="26" />,
    <SelectOption display="/27 (n.n.n.32) (h: 32)" value="27" />,
    <SelectOption display="/28 (n.n.n.16) (h: 16)" value="28" />,
    <SelectOption display="/29 (n.n.n.8) (h: 8)" value="29" />,
    <SelectOption display="/30 (n.n.n.4) (h: 4)" value="30" />,
    <SelectOption display="/31 (n.n.n.2) (h: 2)" value="31" />,
    <SelectOption display="/32 (n.n.n.1) (h: 1)" value="32" />];

    public constructor(props: Props) {
        super(props);

        this.state = {
            ...BasePage.defaultState,
            dto: {
                caCity: "Lago Vista",
                caProvince: "Texas",
                caCountry: "USA",
                caOrganization: "Lago Vista Technologies LLC",
                caOrgUnit: "Informatoin Technology",
                caEmail: "noemail@lagovistatech.com",
                caCnHostName: "ca.lagovistatech.com",
                clientNetwork: "10.0.1.0",
                clientNetworkBits: 24,
                clientNetworkType: "nat",
                exposedNetwork: "10.0.0.0",
                exposedNetworkBits: 24,
                exposedDns: "10.0.0.2",
                serverCnHostName: "openvpn.lagovistatech.com",
                serverPort: 1194,
                serverProtocol: "udp"
            },
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            const setting = await SettingService.getKey(token, "OpenVPN:JSON");
            const dto = JSON.parse(setting.value) as unknown as OpenVpnDto;
            await this.updateState({ dto: dto });

            await this.events.setLoading(false);
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }

    private async saveClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            const setting = await SettingService.getKey(token, "OpenVPN:JSON");
            setting.value = JSON.stringify(this.state.dto);
            await SettingService.save(token, setting);

            await this.events.setLoading(false);
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }
    private async applyClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            await OpenVpnService.apply(token);

            await this.events.setLoading(false);
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
                topMenuGuid="ce40996d-0a86-493c-b0f4-06bb45e312c8"
                leftMenuGuid="15489f89-07e7-487a-b4b6-b888289d1e85"
            >
                <Heading level={1}>Open VPN</Heading>
                <Heading level={2}>Certificate Authority</Heading>
                <Form>
                    <Field label="Country" size={1}><Input
                        value={this.state.dto.caCountry}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caCountry = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Province" size={2}><Input
                        value={this.state.dto.caProvince}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caProvince = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="City" size={2}><Input
                        value={this.state.dto.caCity}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caCity = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Organization" size={3}><Input
                        value={this.state.dto.caOrganization}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caOrganization = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Org. Unit" size={3}><Input
                        value={this.state.dto.caOrgUnit}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caOrgUnit = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Email" size={3}><Input
                        value={this.state.dto.caEmail}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caEmail = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="CN/Host Name" size={3}><Input
                        value={this.state.dto.caCnHostName}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caCnHostName = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                </Form>
                <Heading level={2}>VPN Server</Heading>
                <Form>
                    <Field label="CN/Host Name" size={3}><Input
                        value={this.state.dto.serverCnHostName}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.serverCnHostName = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Port" size={1}><Input
                        value={this.state.dto.serverPort ? this.state.dto.serverPort.toString() : "1194"}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.serverPort = Number.parseInt(value);
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="Protocol" size={1}><Select
                        value={this.state.dto.serverProtocol}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.serverProtocol = value;
                            await this.updateState({ dto: newDto });
                        }}
                    >
                        <SelectOption display="UDP" value="udp" />
                        <SelectOption display="TCP" value="tcp" />
                    </Select></Field>
                </Form>
                <Heading level={2}>Client Network</Heading>
                <Form>
                    <Field label="Network" size={1}><Input
                        value={this.state.dto.clientNetwork}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caCountry = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="CIDR" size={2}><Select
                        value={this.state.dto.clientNetworkBits ? this.state.dto.clientNetworkBits.toString() : "24"}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.clientNetworkBits = Number.parseInt(value);
                            await this.updateState({ dto: newDto });
                        }}
                    >
                        {Page.cidrSelectOptions}
                    </Select></Field>
                    <Field label="Network Type" size={1}><Select
                        value={this.state.dto.clientNetworkType}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.caCountry = value;
                            await this.updateState({ dto: newDto });
                        }}
                    >
                        <SelectOption display="NAT" value="nat" />
                        <SelectOption display="Bridge" value="bridge" />
                    </Select></Field>
                </Form>
                <Heading level={2}>Exposed Network</Heading>
                <Form>
                    <Field label="Network" size={1}><Input
                        value={this.state.dto.exposedNetwork}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.exposedNetwork = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                    <Field label="CIDR" size={2}><Select
                        value={this.state.dto.exposedNetworkBits ? this.state.dto.exposedNetworkBits.toString() : "22"}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.exposedNetworkBits = Number.parseInt(value);
                            await this.updateState({ dto: newDto });
                        }}
                    >
                        {Page.cidrSelectOptions}
                    </Select></Field>
                    <Field label="DNS" size={1}><Input
                        value={this.state.dto.exposedDns}
                        onChange={async (value) => {
                            const newDto = this.jsonCopy(this.state.dto);
                            newDto.exposedDns = value;
                            await this.updateState({ dto: newDto });
                        }}
                    /></Field>
                </Form>
                <FlexRow>
                    <Button label="Save" onClick={this.saveClicked.bind(this)} />
                    <Button label="Apply" onClick={this.applyClicked.bind(this)} />
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
