export interface AdapterDto {
    guid: string;
    displayName: string;
    deviceName: string;
    enable: boolean;
    dhcp: boolean;
    ip4Address?: string;
    ip4NetworkBits: number;
    ip4DefaultGateway?: string;
    ip4DnsAddresses?: string;
    dnsSearch?: string;
}