import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { PayloadDto } from "common/src/tre/models/PayloadDto";

export class PayloadService {
    public static async get(token: string, guid: string): Promise<PayloadDto> {
        const ret = await FetchWrapper.get<PayloadDto>({
            url: "/api/v0/payload/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async list(token: string): Promise<PayloadDto[]> {
        const ret = await FetchWrapper.get<PayloadDto[]>({
            url: "/api/v0/payloads",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async save(token: string, dto: PayloadDto): Promise<void> {
        await FetchWrapper.post({
            url: "/api/v0/payload",
            body: dto,
            corelation: UUIDv4.generate(),
            token: token
        });
    }

    public static async delete(token: string, guid: string): Promise<void> {
        await FetchWrapper.delete({
            url: "/api/v0/payload/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}