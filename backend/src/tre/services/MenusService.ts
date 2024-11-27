import express from "express";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { BaseService } from "./BaseService";
import { MenuDto } from "common/src/tre/models/MenuDto";
import { MenuEntity } from "../data/MenuEntity";
import { Logger } from "../Logger";
import { MenuRepository } from "../data/MenuRepository";
import { SecurableDto } from "common/src/tre/models/SecurableDto";
import { SecurableRepository } from "../data/SecurableRepository";

export class MenuService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/menu/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.getGuid) });
        app.get("/api/v0/menus", (req, resp) => { this.responseDtoWrapper(req, resp, this.getList) });
        app.post("/api/v0/menu", (req, resp) => { this.responseDtoWrapper(req, resp, this.postSave) });
        app.delete("/api/v0/menu/:guid", (req, resp) => { this.responseDtoWrapper(req, resp, this.deleteGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<MenuDto | null> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Menu:Read", req, ds);

        const guid = req.params["guid"];
        const ret = await new MenuRepository(ds).findOneBy({ guid: guid });
        return ret;
    }

    public async getList(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<MenuDto[]> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Menu:List", req, ds);

        const ret = await new MenuRepository(ds).find();
        return ret;
    }

    public async postSave(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Menu:Save", req, ds);

        const menuEntity = new MenuEntity();
        menuEntity.copyFrom(req.body as MenuDto);
        await new MenuRepository(ds).save([menuEntity]);

        let parentEntity: MenuEntity | null = null;
        if (menuEntity.parentsGuid)
            parentEntity = await new MenuRepository(ds).findOneBy({ guid: menuEntity.parentsGuid });

        let securableName = "Menu:Item";
        if (parentEntity)
            securableName += ":" + parentEntity.display;
        securableName += ":" + menuEntity.display;

        const securableDto: SecurableDto = {
            guid: menuEntity.guid,
            displayName: securableName
        };
        await new SecurableRepository(ds).save([securableDto]);
    }

    public async deleteGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurityName(logger, "Menu:Delete", req, ds);

        const guid = req.params["guid"];
        let results = await new MenuRepository(ds).delete({ guid: guid });
        if (results.affected != 1)
            throw Error(`Affected menu rows = ${results.affected}!`);

        results = await new SecurableRepository(ds).delete({ guid: guid });
        if (results.affected != 1)
            throw Error(`Affected securable rows = ${results.affected}!`);
    }
}