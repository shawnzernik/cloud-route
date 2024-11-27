import express from "express";
import { Logger } from "../../tre/Logger";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { ContentDto } from "common/src/tre/models/ContentDto";
import { ContentEntity } from "../data/ContentEntity";
import { ContentRepository } from "../data/ContentRepository";

export class ContentService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/content/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.getGuid) });
        app.get("/api/v0/contents", (req, resp) => { this.responseDtoWrapper(req, resp, this.getList) });
        app.post("/api/v0/content", (req, resp) => { this.responseDtoWrapper(req, resp, this.postSave) });
        app.delete("/api/v0/content/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.deleteGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<ContentDto | null> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Content:Read", req, ds);

        const guid = req.params["guid"];
        const ret = await new ContentRepository(ds).findOneBy({ guid: guid });
        return ret;
    }

    public async getList(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<ContentDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Content:List", req, ds);

        const ret = await new ContentRepository(ds).find({ order: { pathAndName: "ASC" } });
        return ret;
    }

    public async postSave(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Content:Save", req, ds);

        const entity = new ContentEntity();
        entity.copyFrom(req.body as ContentDto);
        await new ContentRepository(ds).save([entity]);
    }

    public async deleteGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Content:Delete", req, ds);

        const guid = req.params["guid"];
        await new ContentRepository(ds).delete({ guid: guid });
    }
}