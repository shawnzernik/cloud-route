import { AdapterDto } from "common/src/app/models/AdapterDto";
import { FetchWrapper } from "../../tre/services/FetchWrapper";
import { UUIDv4 } from "common/src/tre/logic/UUIDv4";
import { AdapterService } from "./AdapterService";

export class ExtendedAdapterService extends AdapterService {
    public static async getDevice(token: string, device: string): Promise<AdapterDto> {
        const ret = await FetchWrapper.get<AdapterDto>({
            url: "/api/v0/adapter/device/" + device,
            corelation: UUIDv4.generate(),
            token: token
        });
        return ret;
    }
}