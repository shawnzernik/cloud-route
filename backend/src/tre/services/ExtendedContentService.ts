import express from "express";
import { Logger } from "../../tre/Logger";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { ContentDto } from "common/src/tre/models/ContentDto";
import { ContentRepository } from "../data/ContentRepository";
import { PayloadRepository } from "../data/PayloadRepository";
import { MimeTypeResponseDto } from "../model/MimeTypeResponseDto";
import { PayloadLogic } from "common/src/tre/logic/PayloadLogic";

export class ExtendedContentService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/content/decoded*", (req, resp) => { this.mimeTypeResponseDtoWrapper(req, resp, this.getDecoded) });
        app.get("/api/v0/content/pn*", (req, resp) => { this.responseDtoWrapper(req, resp, this.getPathAndName) });
    }

    public async getDecoded(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<MimeTypeResponseDto> {
        await logger.trace();

        const pathAndName = req.params[0];
        const contentDto = await new ContentRepository(ds).findOneBy({ pathAndName: pathAndName });
        if (!contentDto)
            throw new Error("Could not locate content by path and name: " + pathAndName);

        await BaseService.checkSecurityGuid(logger, contentDto.securablesGuid, req, ds);

        const payloadDto = await new PayloadRepository(ds).findOneBy({ guid: contentDto.guid });
        if (!payloadDto)
            throw new Error(`Could not locate content '${pathAndName}' payload by GUID (${contentDto.guid})!`);

        let decoded = PayloadLogic.decode(payloadDto.content);

        return {
            mimetype: contentDto.mimeType,
            contents: decoded
        } as MimeTypeResponseDto;
    }
    public async getPathAndName(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<ContentDto | null> {
        await logger.trace();

        const pathAndName = req.params[0];
        const ret = await new ContentRepository(ds).findOneBy({ pathAndName: pathAndName });
        if (!ret)
            throw new Error("Could not locate file '" + pathAndName + "'!");

        await BaseService.checkSecurityGuid(logger, ret.securablesGuid, req, ds);

        return ret;
    }
}