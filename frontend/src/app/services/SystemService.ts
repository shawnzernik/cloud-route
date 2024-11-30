import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";
import { SystemProcNetDevDto } from "common/src/app/models/SystemProcNetDevDto";

export class SystemService {
    public static async getTop(token: string): Promise<SystemTopDto> {
        const ret = await FetchWrapper.get<SystemTopDto>({
            url: "/api/v0/system/top",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
    public static async getProcNetDev(token: string): Promise<SystemProcNetDevDto[]> {
        const ret = await FetchWrapper.get<SystemProcNetDevDto[]>({
            url: "/api/v0/system/proc/net/dev",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
    public static async setEtcNetplan(token: string): Promise<SystemProcNetDevDto[]> {
        const ret = await FetchWrapper.get<SystemProcNetDevDto[]>({
            url: "/api/v0/system/etc/netplan",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
}