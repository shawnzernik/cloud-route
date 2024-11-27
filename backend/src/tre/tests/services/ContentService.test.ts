import https from "https";
import fetch from "node-fetch";
import { ContentDto } from "common/src/tre/models/ContentDto";
import { Config } from "../../../Config";
import { EntitiesDataSource } from "../../data/EntitiesDataSource";
import { ContentEntity } from "../../data/ContentEntity";
import { ContentRepository } from "../../data/ContentRepository";
import { UserEntity } from "../../data/UserEntity";
import { UserRepository } from "../../data/UserRepository";

jest.setTimeout(Config.jestTimeoutSeconds * 1000);

describe("ContentService", () => {
    let agent = new https.Agent({ rejectUnauthorized: false });
    let entityGuid = "d452d09e-d2f3-4d2c-bd65-6b0b9dc6b83d";
    let token: string | undefined;
    let eds: EntitiesDataSource;

    let userEntity = new UserEntity();
    userEntity.guid = entityGuid;
    userEntity.displayName = "Content Test User";
    userEntity.emailAddress = "contenttest@localhost";
    userEntity.smsPhone = "555-555-5555";

    beforeAll(async () => {
        eds = new EntitiesDataSource();
        await eds.initialize();

        await new UserRepository(eds).save(userEntity);

        const body = JSON.stringify({
            emailAddress: "administrator@localhost",
            password: "Welcome123"
        });

        const response = await fetch(Config.appUrl + "/api/v0/auth/login", {
            agent: agent,
            method: "POST",
            body: body,
            headers: { "Content-Type": "application/json" }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("Return from login did not provide a 'data' with the token!");

        token = obj["data"] as string;
    }, Config.jestTimeoutSeconds * 1000);

    afterAll(async () => {
        try { await new ContentRepository(eds).delete({ guid: entityGuid }); }
        catch (err) { /* eat error */ }
        try { await new UserRepository(eds).delete({ guid: entityGuid }); }
        catch (err) { /* eat error */ }

        await eds.destroy();
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/content - save new should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const entity = new ContentEntity();
        entity.guid = entityGuid;
        entity.title = "Test Content";
        entity.pathAndName = "path/to/test/content.txt";
        entity.mimeType = "text/plain";
        entity.binary = false;
        entity.encodedSize = 1024;
        entity.securablesGuid = entityGuid;
        entity.created = new Date();
        entity.createdBy = entityGuid;
        entity.modified = new Date();
        entity.modifiedBy = entityGuid;

        const response = await fetch(Config.appUrl + "/api/v0/content", {
            agent: agent,
            method: "POST",
            body: JSON.stringify(entity),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        let reloaded = await new ContentRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(entity.guid).toEqual(reloaded.guid);
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/contents should return content list", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/contents", {
            agent: agent,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("No data returned!");

        const data = obj["data"] as ContentDto[];

        expect(data.length > 0).toBeTruthy();
        expect(data[0].guid).toBeTruthy();
        expect(data[0].title).toBeTruthy();
        expect(data[0].pathAndName).toBeTruthy();
        expect(data[0].mimeType).toBeTruthy();
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/content/:guid should return content and 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/content/" + entityGuid, {
            agent: agent,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("No data returned!");

        const data = obj["data"] as ContentDto;

        expect(data.guid).toEqual(entityGuid);
    }, Config.jestTimeoutSeconds * 1000);

    test("DELETE /api/v0/content/:guid should delete content and return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/content/" + entityGuid, {
            agent: agent,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        let entity = await new ContentRepository(eds).findBy({ guid: entityGuid });
        expect(entity.length).toEqual(0);
    }, Config.jestTimeoutSeconds * 1000);
});