import express from "express";
import { BaseService } from "../../tre/services/BaseService";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";
import { OpenVpnLogic } from "../logic/OpenVpnLogic";

export class OpenVpnService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/openvpn/apply", (req, resp) => { this.responseDtoWrapper(req, resp, this.getApply) });
    }

    public async getApply(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "OpenVpn:Apply", req, ds);

        await OpenVpnLogic.createCertAuth(ds);
        await OpenVpnLogic.createCert(ds, "vpn-server.lagovistatech.com");
        await OpenVpnLogic.createCert(ds, "client.lagovistatech.com");
    }
}