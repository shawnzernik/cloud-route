export interface OpenVpnDto {
    caCountry: string;
    caProvince: string;
    caCity: string;
    caOrganization: string;
    caOrgUnit: string;
    caEmail: string;
    caCnHostName: string;

    publicIp: string;

    serverCnHostName: string;
    serverPort: number;
    serverProtocol: string;

    clientNetwork: string;
    clientNetworkBits: number;

    exposedNetwork: string;
    exposedNetworkBits: number;
    exposedDns: string;
}