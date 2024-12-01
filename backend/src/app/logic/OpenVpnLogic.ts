import { EntitiesDataSource } from "../../tre/data/EntitiesDataSource";
import { SettingRepository } from "../../tre/data/SettingRepository";
import { SystemLogic } from "./SystemLogic";
import { OpenVpnDto } from "common/src/app/models/OpenVpnDto";

export class OpenVpnLogic {
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