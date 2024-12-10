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
import { OpenVpnService } from "../services/OpenVpnService";
import { Table } from "../../tre/components/Table";

interface Props { }
interface State extends BasePageState {
    dto: OpenVpnDto;
    certs: any[];
    clientCn: string;
}

class Page extends BasePage<Props, State> {
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
            certs: [],
            clientCn: ""
        };
    }

    private async loadCerts(token: string): Promise<void> {
        const ret = [];

        const certs = await OpenVpnService.listCerts(token);
        for (const cert of certs) {
            ret.push({
                "fullname": cert.path + "/" + cert.name,
                "File Name": cert.name,
                "Bytes": cert.size,
                "Modified": cert.modified
            });
        }

        await this.updateState({
            certs: ret
        });
    }
    public async componentDidMount(): Promise<void> {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            const setting = await SettingService.getKey(token, "OpenVPN:JSON");
            const dto = JSON.parse(setting.value) as unknown as OpenVpnDto;
            await this.updateState({ dto: dto });

            await this.loadCerts(token);

            await this.events.setLoading(false);
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }

    private async createCaClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            await OpenVpnService.createCa(token);

            await this.loadCerts(token);

            await this.events.setLoading(false);
        }
        catch (err) {
            await this.events.setLoading(false);
            await ErrorMessage(this, err);
        }
    }
    private async createClientClicked() {
        try {
            await this.events.setLoading(true);

            const token = await AuthService.getToken();
            await OpenVpnService.createClient(token, this.state.clientCn);

            await this.loadCerts(token);

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
                leftMenuGuid="44596222-4db4-4f3f-aef5-35e118a29d87"
            >
                <Heading level={1}>Certificates</Heading>
                <Table
                    items={this.state.certs}
                    primaryKey="fullname"
                ></Table>
                <FlexRow>
                    <Button label="Create CA" onClick={this.createCaClicked.bind(this)} />
                </FlexRow>
                <Heading level={2}>New Client</Heading>
                <Form>
                    <Field label="FQ Host Name"><Input
                        value={this.state.clientCn}
                        onChange={async (value) => {
                            await this.updateState({ clientCn: value });
                        }}
                    /></Field>
                </Form>
                <FlexRow>
                    <Button label="Create Client" onClick={this.createClientClicked.bind(this)} />
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
