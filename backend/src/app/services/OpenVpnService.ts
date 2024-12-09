import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";
import { OpenVpnLogic } from "../logic/OpenVpnLogic";
import { FileDto } from "common/src/app/models/FileDto";

export class OpenVpnService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/openvpn/apply", (req, resp) => { this.responseDtoWrapper(req, resp, this.apply) });
        app.get("/api/v0/openvpn/certs", (req, resp) => { this.responseDtoWrapper(req, resp, this.listCerts) });
        app.get("/api/v0/openvpn/create/ca", (req, resp) => { this.responseDtoWrapper(req, resp, this.createCa) });
        app.post("/api/v0/openvpn/create/client", (req, resp) => { this.responseDtoWrapper(req, resp, this.createClient) });
    }


    public async listCerts(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<FileDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "OpenVpn:Cert:List", req, ds);

        const ret = await OpenVpnLogic.listCerts();
        return ret;
    }
    public async createCa(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "OpenVpn:Create:CA", req, ds);

        await OpenVpnLogic.createCa(logger, ds);
    }
    public async createClient(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "OpenVpn:Create:Client", req, ds);

        await OpenVpnLogic.createClient(logger, ds, req.body.cn);
    }

    public async apply(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "OpenVpn:Apply", req, ds);

        await OpenVpnLogic.apply(logger, ds);
    }
}