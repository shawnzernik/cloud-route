export interface OpenVpnDto {
    caCountry: string;
    caProvince: string;
    caCity: string;
    caOrganization: string;
    caOrgUnit: string;
    caEmail: string;
    caCnHostName: string;

    serverCnHostName: string;
    serverPort: number;
    serverProtocol: string;

    clientNetwork: string;
    clientNetworkBits: number;
    clientNetworkType: string;

    exposedNetwork: string;
    exposedNetworkBits: number;
    exposedDns: string;
}