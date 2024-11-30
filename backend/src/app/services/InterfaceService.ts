import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";
import { InterfaceStatsDto } from "common/src/app/models/InterfaceStatsDto";
import { InterfaceLogic } from "../logic/InterfaceLogic";

export class ProcService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        // // ip address
        // app.get("/api/v0/interface/addresses", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
        // // ip link
        // app.get("/api/v0/interface/links", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
        // // netplan ip lease DEV
        // app.get("/api/v0/interface/leases/:dev", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
        // // netplan apply
        // app.get("/api/v0/interface/apply/:dev", (req, resp) => { this.responseDtoWrapper(req, resp, this.getNetDev) });
    }

    // public async getNetDev(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<InterfaceStatsDto[]> {
    //     await logger.trace();
    //     await BaseService.checkSecurityName(logger, "Interface:Addresses", req, ds);

    //     return InterfaceLogic.readNetDev();
    // }
}