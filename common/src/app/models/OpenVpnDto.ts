export interface OpenVpnDto {
    caCountry: string;
    caProvince: string;
    caCity: string;
    caOrganization: string;
    caOrgUnit: string;
    caEmail: string;
    caCnHostName: string;

    serverCnHostName: string;
    serverPort: Number;
    serverProtocol: string;

    clientNetwork: string;
    clientNetworkBits: Number;
    clientNetworkType: string;

    exposedNetwork: string;
    exposedNetworkBits: Number;
    exposedDns: string;
}