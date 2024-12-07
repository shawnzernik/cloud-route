import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";

export class OpenVpnService {
    public static async apply(token: string): Promise<void> {
        await FetchWrapper.get<void>({
            url: "/api/v0/openvpn/apply",
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}