import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { ContentDto } from "common/src/tre/models/ContentDto";

export class ContentService {
    public static async get(token: string, guid: string): Promise<ContentDto> {
        const ret = await FetchWrapper.get<ContentDto>({
            url: "/api/v0/content/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async getByPathAndName(token: string, pathAndName: string): Promise<ContentDto> {
        const ret = await FetchWrapper.get<ContentDto>({
            url: "/api/v0/content/pn" + pathAndName,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async list(token: string): Promise<ContentDto[]> {
        const ret = await FetchWrapper.get<ContentDto[]>({
            url: "/api/v0/contents",
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }

    public static async save(token: string, dto: ContentDto): Promise<void> {
        await FetchWrapper.post({
            url: "/api/v0/content",
            body: dto,
            corelation: UUIDv4.generate(),
            token: token
        });
    }

    public static async delete(token: string, guid: string): Promise<void> {
        await FetchWrapper.delete({
            url: "/api/v0/content/" + guid,
            corelation: UUIDv4.generate(),
            token: token
        });
    }
}