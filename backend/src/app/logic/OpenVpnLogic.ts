import fs, { mkdirSync } from "fs";
import path from "path";
import { OpenVpnDto } from "common/src/app/models/OpenVpnDto";
import { IPv4 } from "common/src/app/logic/IPv4";
import { SettingRepository } from "../../tre/data/SettingRepository";
import { SystemLogic } from "./SystemLogic";
import { Config } from "../../Config";
import { Logger } from "../../tre/Logger";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { FileDto } from "common/src/app/models/FileDto"
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";

export class OpenVpnLogic {
    public static async download(logger: Logger, ds: EntitiesDataSource, name: string): Promise<FileDto> {
        if (name.includes("/"))
            throw new Error("The name cannot contain forward slashes!");

        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const config = JSON.parse(setting.value) as OpenVpnDto;

        const dir = path.join(Config.tempDirectory, UUIDv4.generate());
        mkdirSync(dir, { recursive: true });

        let clientOvpn = fs.readFileSync("./templates/client.ovpn", { encoding: "utf8" });
        clientOvpn = clientOvpn.replace(/%PUBLIC_IP%/g, config.publicIp);
        clientOvpn = clientOvpn.replace(/%SERVER_PORT%/g, config.serverPort.toString());
        clientOvpn = clientOvpn.replace(/%SERVER_PROTOCOL%/g, config.serverProtocol);
        fs.writeFileSync(path.join(dir, "client.ovpn"), clientOvpn, { encoding: "utf8" });

        let keyName = name.replace(/\.crt/g, ".key");
        await SystemLogic.execute(logger, "sudo", ["bash", "./bash/download.sh", dir, name, keyName]);

        const zipFile = dir + ".zip";
        const buffer = fs.readFileSync(zipFile);
        const base64 = buffer.toString("base64");

        const file: FileDto = {
            path: "",
            name: path.basename(dir + ".zip"),
            modified: new Date(),
            size: base64.length,
            base64: base64
        };

        fs.rmSync(dir, { force: true, recursive: true });

        return file;
    }
    public static listCerts(): FileDto[] {
        const ret: FileDto[] = [];

        const dir = "/etc/openvpn";
        const entires = fs.readdirSync(dir);
        for (const entry of entires) {
            const fullname = path.join(dir, entry);
            const stat = fs.statSync(fullname);
            if (
                stat.isFile()
                && (
                    entry.endsWith(".pem") || entry.endsWith(".crt") || entry.endsWith(".key")
                )
            ) {
                ret.push({
                    name: entry,
                    path: dir,
                    modified: stat.mtime,
                    size: stat.size
                });
            }
        }

        return ret;
    }
    public static async apply(logger: Logger, ds: EntitiesDataSource) {
        const logic = new OpenVpnLogic();
        await logic.applyNat(logger, ds);
    }
    private ipTablesScript: string = "";
    private serverConf: string = "";
    private openVpnService: string = "";
    private async applyNat(logger: Logger, ds: EntitiesDataSource) {
        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const config = JSON.parse(setting.value) as OpenVpnDto;

        this.applyLoadFiles();

        this.applySetVar(/%CA_CITY%/g, config.caCity);
        this.applySetVar(/%CA_CN_HOST_NAME%/g, config.caCnHostName);
        this.applySetVar(/%CA_COUNTRY%/g, config.caCountry);
        this.applySetVar(/%CA_EMAIL%/g, config.caEmail);
        this.applySetVar(/%CA_ORG_UNIT%/g, config.caOrgUnit);
        this.applySetVar(/%CA_ORGANIZATION%/g, config.caOrganization);
        this.applySetVar(/%CA_PROVINCE%/g, config.caProvince);

        this.applySetVar(/%SERVER_CN_HOST_NAME%/g, config.serverCnHostName);
        this.applySetVar(/%SERVER_PORT%/g, config.serverPort.toString());
        this.applySetVar(/%SERVER_PROTOCOL%/g, config.serverProtocol);

        this.applySetVar(/%CLIENT_NETWORK%/g, config.clientNetwork);
        this.applySetVar(/%CLIENT_NETWORK_BITS%/g, config.clientNetworkBits.toString());
        this.applySetVar(/%CLIENT_SUBNET_MASK%/g, IPv4.calculateSubnetMask(config.clientNetworkBits));

        this.applySetVar(/%EXPOSED_NETWORK%/g, config.exposedNetwork);
        this.applySetVar(/%EXPOSED_NETWORK_BITS%/g, config.exposedNetworkBits.toString());
        this.applySetVar(/%EXPOSED_SUBNET_MASK%/g, IPv4.calculateSubnetMask(config.exposedNetworkBits));
        this.applySetVar(/%EXPOSED_DNS%/g, config.exposedDns);

        await this.applySaveFiles(logger);
    }
    private async applySaveFiles(logger: Logger) {
        const shellScriptName = path.resolve(Config.tempDirectory, "openvpn-nat.sh");
        fs.writeFileSync(shellScriptName, this.ipTablesScript, { encoding: "utf8" });

        const serverConfName = path.resolve(Config.tempDirectory, "server.conf");
        fs.writeFileSync(serverConfName, this.serverConf, { encoding: "utf8" });

        const serviceName = path.resolve(Config.tempDirectory, "openvpn-nat.service");
        fs.writeFileSync(serviceName, this.openVpnService, { encoding: "utf8" });

        await SystemLogic.execute(logger, "sudo", ["bash", "./bash/apply.sh"]);
    }
    private applyLoadFiles() {
        this.ipTablesScript = fs.readFileSync("./templates/usr/local/bin/openvpn-nat.sh", { encoding: "utf8" });
        this.serverConf = fs.readFileSync("./templates/etc/openvpn/server.conf", { encoding: "utf8" });
        this.openVpnService = fs.readFileSync("./templates/etc/systemd/system/openvpn-nat.service", { encoding: "utf8" });
    }
    private applySetVar(regex: RegExp, value: string) {
        this.ipTablesScript = this.ipTablesScript.replace(regex, value);
        this.serverConf = this.serverConf.replace(regex, value);
        this.openVpnService = this.openVpnService.replace(regex, value);
    }

    public static async createCa(logger: Logger, ds: EntitiesDataSource) {
        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const openVpnDto = JSON.parse(setting.value) as OpenVpnDto;

        const caReq = {
            EASYRSA_REQ_COUNTRY: openVpnDto.caCountry,
            EASYRSA_REQ_PROVINCE: openVpnDto.caProvince,
            EASYRSA_REQ_CITY: openVpnDto.caCity,
            EASYRSA_REQ_ORG: openVpnDto.caOrganization,
            EASYRSA_REQ_OU: openVpnDto.caOrgUnit,
            EASYRSA_REQ_EMAIL: openVpnDto.caEmail,
            EASYRSA_REQ_CN: openVpnDto.caCnHostName
        };

        await SystemLogic.execute(logger, "sudo", ["bash", "./bash/create-ca.sh"]);
        await this.createCert(logger, ds, openVpnDto.serverCnHostName, "server");
    }
    public static async createCert(logger: Logger, ds: EntitiesDataSource, cn: string, type: "client" | "server") {
        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const openVpnDto = JSON.parse(setting.value) as OpenVpnDto;

        const caReq = {
            EASYRSA_REQ_COUNTRY: openVpnDto.caCountry,
            EASYRSA_REQ_PROVINCE: openVpnDto.caProvince,
            EASYRSA_REQ_CITY: openVpnDto.caCity,
            EASYRSA_REQ_ORG: openVpnDto.caOrganization,
            EASYRSA_REQ_OU: openVpnDto.caOrgUnit,
            EASYRSA_REQ_EMAIL: openVpnDto.caEmail,
            EASYRSA_REQ_CN: cn
        };

        await SystemLogic.execute(logger, "sudo", ["bash", "./bash/create-cert.sh", cn, type]);
    }
}