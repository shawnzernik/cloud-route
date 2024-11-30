import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";
import { SystemLogic } from "../logic/SystemLogic";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";
import { SystemProcNetDevDto } from "common/src/app/models/SystemProcNetDevDto";

export class SystemService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/system/top", (req, resp) => { this.responseDtoWrapper(req, resp, this.getTop) });
        app.get("/api/v0/system/proc/net/dev", (req, resp) => { this.responseDtoWrapper(req, resp, this.getProcNetDev) });
        app.get("/api/v0/system/etc/netplan", (req, resp) => { this.responseDtoWrapper(req, resp, this.getEtcNetplan) });

        // // ip address
        // // ip link
        // // netplan ip lease DEV
        // // netplan apply
        // // w
        // // df
    }

    public async getTop(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<SystemTopDto> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "System:Top", req, ds);

        const ret = await SystemLogic.getTop();
        return ret;
    }
    public async getProcNetDev(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<SystemProcNetDevDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "System:Proc:Net:Dev", req, ds);

        const ret = await SystemLogic.getProcNetDev();
        return ret;
    }
    public async getEtcNetplan(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "System:Etc:Netplan", req, ds);

        await SystemLogic.getEtcNetplan(ds);
    }
}