import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";

export class SystemService {
    public static async getTop(token: string): Promise<SystemTopDto> {
        const ret = await FetchWrapper.get<SystemTopDto>({
            url: "/api/v0/system/top",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
}