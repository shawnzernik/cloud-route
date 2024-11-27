import { Entity, PrimaryColumn, Column } from "typeorm";
import { CopyInterface } from "common/src/tre/logic/CopyInterface";
import { AdapterDto } from "common/src/app/models/AdapterDto";

@Entity("adapters")
export class AdapterEntity implements AdapterDto, CopyInterface<AdapterDto> {
    @PrimaryColumn({ name: "guid" })
    public guid: string = "";

    @Column({ name: "display_name" })
    public displayName: string = "";

    @Column({ name: "device_name" })
    public deviceName: string = "";

    @Column({ name: "enable" })
    public enable: boolean = false;

    @Column({ name: "ip4_address", nullable: true })
    public ip4Address?: string; // Optional

    @Column({ name: "ip4_network_bits" })
    public ip4NetworkBits: number = 0;

    @Column({ name: "ip4_default_gateway", nullable: true })
    public ip4DefaultGateway?: string; // Optional

    @Column({ name: "ip4_dns_addresses", nullable: true })
    public ip4DnsAddresses?: string; // Optional

    @Column({ name: "dns_search", nullable: true })
    public dnsSearch?: string; // Optional

    public copyFrom(source: AdapterDto): void {
        this.guid = source.guid;
        this.displayName = source.displayName;
        this.deviceName = source.deviceName;
        this.enable = source.enable;
        this.ip4Address = source.ip4Address;
        this.ip4NetworkBits = source.ip4NetworkBits;
        this.ip4DefaultGateway = source.ip4DefaultGateway;
        this.ip4DnsAddresses = source.ip4DnsAddresses;
        this.dnsSearch = source.dnsSearch;
    }

    public copyTo(dest: AdapterDto): void {
        dest.guid = this.guid;
        dest.displayName = this.displayName;
        dest.deviceName = this.deviceName;
        dest.enable = this.enable;
        dest.ip4Address = this.ip4Address;
        dest.ip4NetworkBits = this.ip4NetworkBits;
        dest.ip4DefaultGateway = this.ip4DefaultGateway;
        dest.ip4DnsAddresses = this.ip4DnsAddresses;
        dest.dnsSearch = this.dnsSearch;
    }
}