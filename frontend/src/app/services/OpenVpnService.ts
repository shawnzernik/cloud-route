import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { FileDto } from "common/src/app/models/FileDto";

export class OpenVpnService {
    static async downloadClient(token: string, client: string): Promise<FileDto> {
        const file = await FetchWrapper.get<FileDto>({
            url: "/api/v0/openvpn/download/" + client,
            corelation: UUIDv4.generate(),
            token: token
        });
        return file;
    }
    static async createClient(token: string, clientCn: string) {
        await FetchWrapper.post<void>({
            url: "/api/v0/openvpn/create/client",
            body: { cn: clientCn },
            corelation: UUIDv4.generate(),
            token: token
        });
    }
    static async createCa(token: string) {
        await FetchWrapper.get<void>({
            url: "/api/v0/openvpn/create/ca",
            corelation: UUIDv4.generate(),
            token: token
        });
    }
    static async listCerts(token: string) {
        const ret = await FetchWrapper.get<FileDto[]>({
            url: "/api/v0/openvpn/certs",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
    public static async apply(token: string): Promise<void> {
        await FetchWrapper.get<void>({
            url: "/api/v0/openvpn/apply",
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}