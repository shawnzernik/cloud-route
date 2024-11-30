import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { AdapterDto } from "common/src/app/models/AdapterDto";
import { AdapterEntity } from "../data/AdapterEntity";
import { AdapterRepository } from "../data/AdapterRepository";
import { Logger } from "../../tre/Logger";

export class ExtendedAdapterService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/adapter/device/:name", (req, resp) => { this.responseDtoWrapper(req, resp, this.getGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<AdapterDto | null> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Adapter:Read", req, ds);

        const name = req.params["name"];
        const ret = await new AdapterRepository(ds).findOneBy({ deviceName: name });
        return ret;
    }
}