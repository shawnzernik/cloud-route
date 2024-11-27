export interface AdapterDto {
    guid: string;
    displayName: string;
    deviceName: string;
    enable: boolean;
    ip4Address?: string; // Optional
    ip4NetworkBits: number;
    ip4DefaultGateway?: string; // Optional
    ip4DnsAddresses?: string; // Optional
    dnsSearch?: string; // Optional
}