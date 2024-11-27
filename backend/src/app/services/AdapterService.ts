import express from "express";
import Logger from "../../tre/Logger";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { AdapterDto } from "common/src/app/models/AdapterDto";
import { AdapterEntity } from "../data/AdapterEntity";
import { AdapterRepository } from "../data/AdapterRepository";

export class AdapterService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/adapter/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.getGuid) });
        app.get("/api/v0/adapters", (req, resp) => { this.responseDtoWrapper(req, resp, this.getList) });
        app.post("/api/v0/adapter", (req, resp) => { this.responseDtoWrapper(req, resp, this.postSave) });
        app.delete("/api/v0/adapter/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.deleteGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<AdapterDto | null> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Adapter:Read", req, ds);

        const guid = req.params["guid"];
        const ret = await new AdapterRepository(ds).findOneBy({ guid: guid });
        return ret;
    }

    public async getList(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<AdapterDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Adapter:List", req, ds);

        const ret = await new AdapterRepository(ds).find();
        return ret;
    }

    public async postSave(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Adapter:Save", req, ds);

        const entity = new AdapterEntity();
        entity.copyFrom(req.body as AdapterDto);
        await new AdapterRepository(ds).save([entity]);
    }

    public async deleteGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Adapter:Delete", req, ds);

        const guid = req.params["guid"];
        await new AdapterRepository(ds).delete({ guid: guid });
    }
}