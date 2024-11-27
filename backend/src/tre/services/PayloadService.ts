import express from "express";
import { Logger } from "../../tre/Logger";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { PayloadDto } from "common/src/tre/models/PayloadDto";
import { PayloadEntity } from "../data/PayloadEntity";
import { PayloadRepository } from "../data/PayloadRepository";
import { ContentRepository } from "../data/ContentRepository";

export class PayloadService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/payload/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.getGuid) });
        app.get("/api/v0/payloads", (req, resp) => { this.responseDtoWrapper(req, resp, this.getList) });
        app.post("/api/v0/payload", (req, resp) => { this.responseDtoWrapper(req, resp, this.postSave) });
        app.delete("/api/v0/payload/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.deleteGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<PayloadDto | null> {
        await logger.trace();

        const guid = req.params["guid"];

        const contentsDto = await new ContentRepository(ds).findOneBy({ guid: guid });
        await BaseService.checkSecurityGuid(logger, contentsDto!.securablesGuid, req, ds);

        const payloadDto = await new PayloadRepository(ds).findOneBy({ guid: guid });
        return payloadDto;
    }

    public async getList(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<PayloadDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Payload:List", req, ds);

        const ret = await new PayloadRepository(ds).find();
        return ret;
    }

    public async postSave(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Payload:Save", req, ds);

        const entity = new PayloadEntity();
        entity.copyFrom(req.body as PayloadDto);

        const contentsDto = await new ContentRepository(ds).findOneBy({ guid: entity.guid });
        await BaseService.checkSecurityGuid(logger, contentsDto!.securablesGuid, req, ds);

        await new PayloadRepository(ds).save([entity]);
    }

    public async deleteGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Payload:Delete", req, ds);

        const guid = req.params["guid"];
        await new PayloadRepository(ds).delete({ guid: guid });
    }
}