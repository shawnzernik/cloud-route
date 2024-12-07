import fs from "fs";
import { EntitiesDataSource } from "../../tre/data/EntitiesDataSource";
import { SettingRepository } from "../../tre/data/SettingRepository";
import { SystemLogic } from "./SystemLogic";
import { OpenVpnDto } from "common/src/app/models/OpenVpnDto";
import { Config } from "../../Config";
import path from "path";

export class OpenVpnLogic {
    public static async apply(ds: EntitiesDataSource) {
        const logic = new OpenVpnLogic();
        await logic.applyNat(ds);
    }
    private ipTablesScript: string = "";
    private serverConf: string = "";
    private openVpnService: string = "";
    private async applyNat(ds: EntitiesDataSource) {
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
        this.applySetVar(/%CLIENT_SUBNET_MASK%/g, this.calculateSubnetMask(config.clientNetworkBits));
        this.applySetVar(/%CLIENT_NETWORK_TYPE%/g, config.clientNetworkType);

        this.applySetVar(/%EXPOSED_NETWORK%/g, config.exposedNetwork);
        this.applySetVar(/%EXPOSED_NETWORK_BITS%/g, config.exposedNetworkBits.toString());
        this.applySetVar(/%EXPOSED_SUBNET_MASK%/g, this.calculateSubnetMask(config.exposedNetworkBits));
        this.applySetVar(/%EXPOSED_DNS%/g, config.exposedDns);

        await this.applySaveFiles();
        this.applyRestartOpenVpn();
    }
    private async applyRestartOpenVpn() {
        await SystemLogic.execute("sudo", ["systemctl", "enable", "openvpn-nat"]);
        await SystemLogic.execute("sudo", ["systemctl", "stop", "openvpn-nat"]);
        await SystemLogic.execute("sudo", ["systemctl", "start", "openvpn-nat"]);
    }
    private async applySaveFiles() {
        const shellScriptName = path.join(Config.tempDirectory, "openvpn-nat.sh");
        fs.writeFileSync(shellScriptName, this.ipTablesScript, { encoding: "utf8" });
        await SystemLogic.execute("sudo", ["mv", shellScriptName, "/usr/local/bin/openvpn-nat.sh"]);

        const serverConfName = path.join(Config.tempDirectory, "server.conf");
        fs.writeFileSync(serverConfName, this.serverConf, { encoding: "utf8" });
        await SystemLogic.execute("sudo", ["mv", serverConfName, "/etc/openvpn/server.conf"]);

        const serviceName = path.join(Config.tempDirectory, "openvpn-nat.service");
        fs.writeFileSync(serviceName, this.openVpnService, { encoding: "utf8" });
        await SystemLogic.execute("sudo", ["mv", serviceName, "/etc/systemd/system/openvpn-nat.service"]);
    }
    private applyLoadFiles() {
        this.ipTablesScript = fs.readFileSync("./templates/usr/local/bin/openvpn-nat.sh", { encoding: "utf8" });
        this.serverConf = fs.readFileSync("./templates/etc/openvpn/server.conf", { encoding: "utf8" });
        this.openVpnService = fs.readFileSync("./templates/etc/systemd/system/openvpn-nat.service", { encoding: "utf8" });
    }
    private calculateSubnetMask(bits: number): string {
        let ret = "";
        let remaining = bits;

        if (bits > 32)
            throw new Error("CIDR greate than 32 not allowed!");

        for (let cnt = 0; cnt < 4; cnt++) {
            if (remaining < 1)
                ret += "0.";
            else if (remaining >= 8) {
                ret += "255.";
                remaining += -8;
            } else {
                ret += Math.pow(2, remaining).toString() + ".";
                remaining = 0;
            }
        }

        if (remaining != 0)
            throw new Error("Invalid remaining bit count!");

        return ret.substring(0, ret.length - 1);
    }
    private applySetVar(regex: RegExp, value: string) {
        this.ipTablesScript = this.ipTablesScript.replace(regex, value);
        this.serverConf = this.serverConf.replace(regex, value);
        this.openVpnService = this.openVpnService.replace(regex, value);
    }

    public static async createCertAuth(ds: EntitiesDataSource) {
        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const openVpnDto = JSON.parse(setting.value) as OpenVpnDto;

        const caReq = {
            EASYRSA_REQ_COUNTRY: openVpnDto.caCountry,
            EASYRSA_REQ_PROVINCE: openVpnDto.caProvince,
            EASYRSA_REQ_CITY: openVpnDto.caCity,
            EASYRSA_REQ_ORG: openVpnDto.caOrganization,
            EASYRSA_REQ_OU: openVpnDto.caOrgUnit,
            EASYRSA_REQ_EMAIL: openVpnDto.caEmail,
            EASYRSA_BATCH: "1",
        };

        SystemLogic.execute("sudo", ["make-cadir", "/etc/openvpn/easy-rsa"]);
        SystemLogic.execute(
            "sudo",
            ["./easyrsa", "init-pki"],
            {
                cwd: "/etc/openvpn/easy-rsa",
                env: { ...caReq }
            }
        );
        SystemLogic.execute(
            "sudo",
            ["./easyrsa", "build-ca", "nopass"],
            {
                cwd: "/etc/openvpn/easy-rsa",
                env: {
                    ...caReq,
                    EASYRSA_REQ_CN: openVpnDto.caCnHostName
                }
            }
        );
        SystemLogic.execute(
            "sudo",
            ["./easyrsa", "gen-hd"],
            {
                cwd: "/etc/openvpn/easy-rsa",
                env: {
                    ...caReq,
                    EASYRSA_DH_KEY_SIZE: "2048"
                }
            }
        );

        SystemLogic.execute("sudo", ["cp", "/etc/openvpn/easy-rsa/pki/dh.pem", "/etc/openvpn/"]);
        SystemLogic.execute("sudo", ["cp", "/etc/openvpn/easy-rsa/pki/ca.crt", "/etc/openvpn/"]);
    }
    public static async createCert(ds: EntitiesDataSource, cn: string) {
        const setting = await new SettingRepository(ds).findByKey("OpenVPN:JSON");
        const openVpnDto = JSON.parse(setting.value) as OpenVpnDto;

        const caReq = {
            EASYRSA_REQ_COUNTRY: openVpnDto.caCountry,
            EASYRSA_REQ_PROVINCE: openVpnDto.caProvince,
            EASYRSA_REQ_CITY: openVpnDto.caCity,
            EASYRSA_REQ_ORG: openVpnDto.caOrganization,
            EASYRSA_REQ_OU: openVpnDto.caOrgUnit,
            EASYRSA_REQ_EMAIL: openVpnDto.caEmail,
            EASYRSA_BATCH: "1",
        };

        SystemLogic.execute(
            "sudo",
            ["./easyrsa", "gen-req", cn, "nopass"],
            {
                cwd: "/etc/openvpn/easy-rsa",
                env: {
                    ...caReq,
                    EASYRSA_REQ_CN: cn
                }
            }
        );
        SystemLogic.execute(
            "sudo",
            ["./easyrsa", "sign-req", "server", cn],
            {
                cwd: "/etc/openvpn/easy-rsa",
                env: {
                    ...caReq,
                    EASYRSA_DH_KEY_SIZE: "2048"
                }
            }
        );

        SystemLogic.execute("sudo", ["cp", "/etc/openvpn/easy-rsa/pki/issued/" + cn + ".crt", "/etc/openvpn/"]);
        SystemLogic.execute("sudo", ["cp", "/etc/openvpn/easy-rsa/pki/private/" + cn + ".key", "/etc/openvpn/"]);
    }
}