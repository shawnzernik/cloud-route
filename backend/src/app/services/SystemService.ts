import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";
import { SystemLogic } from "../logic/SystemLogic";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";

export class SystemService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        // top
        app.get("/api/v0/system/top", (req, resp) => { this.responseDtoWrapper(req, resp, this.getTop) });
        // // w
        // app.get("/api/v0/system/w", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
        // // df
        // app.get("/api/v0/system/df", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
    }

    public async getTop(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<SystemTopDto> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "System:Top", req, ds);

        const ret = await SystemLogic.getTop();
        return ret;
    }
}