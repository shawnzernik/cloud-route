import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { AdapterDto } from "common/src/app/models/AdapterDto";

export class AdapterService {
    public static async get(token: string, guid: string): Promise<AdapterDto> {
        const ret = await FetchWrapper.get<AdapterDto>({
            url: "/api/v0/adapter/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async list(token: string): Promise<AdapterDto[]> {
        const ret = await FetchWrapper.get<AdapterDto[]>({
            url: "/api/v0/adapters",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async save(token: string, dto: AdapterDto): Promise<void> {
        await FetchWrapper.post({
            url: "/api/v0/adapter",
            body: dto,
            corelation: UUIDv4.generate(),
            token: token
        });
    }

    public static async delete(token: string, guid: string): Promise<void> {
        await FetchWrapper.delete({
            url: "/api/v0/adapter/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}