import https from "https";
import fetch from "node-fetch";
import { AdapterDto } from "common/src/app/models/AdapterDto";
import { Config } from "../../../Config";
import { EntitiesDataSource } from "../../data/EntitiesDataSource";
import { AdapterEntity } from "../../data/AdapterEntity";
import { AdapterRepository } from "../../data/AdapterRepository";

jest.setTimeout(Config.jestTimeoutSeconds * 1000);

describe("AdapterService", () => {
    let agent = new https.Agent({ rejectUnauthorized: false });
    let entityGuid = "b91e9cb6-1c1f-40a1-a6e3-8944d2f20f48";
    let token: string | undefined;
    let eds: EntitiesDataSource;

    const adapterEntity = new AdapterEntity();
    adapterEntity.guid = entityGuid;
    adapterEntity.displayName = "Test Adapter";
    adapterEntity.deviceName = "Test Device";
    adapterEntity.enable = true;
    adapterEntity.ip4NetworkBits = 24;

    beforeAll(async () => {
        eds = new EntitiesDataSource();
        await eds.initialize();

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
        try { await new AdapterRepository(eds).delete({ guid: entityGuid }); }
        catch (err) { /* eat error */ }

        await eds.destroy();
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/adapter - save new should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/adapter", {
            agent: agent,
            method: "POST",
            body: JSON.stringify(adapterEntity),
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

        const reloaded = await new AdapterRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(adapterEntity.guid).toEqual(reloaded.guid);
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/adapters should return adapter list", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/adapters", {
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

        const data = obj["data"] as AdapterDto[];

        expect(data.length > 0).toBeTruthy();
        expect(data[0].guid).toBeTruthy();
        expect(data[0].displayName).toBeTruthy();
        expect(data[0].deviceName).toBeTruthy();
        expect(data[0].enable).toBeTruthy();
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/adapter/:guid should return adapter and 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/adapter/" + entityGuid, {
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

        const data = obj["data"] as AdapterDto;

        expect(data.guid).toEqual(entityGuid);
    }, Config.jestTimeoutSeconds * 1000);

    test("DELETE /api/v0/adapter/:guid should delete adapter and return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/adapter/" + entityGuid, {
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

        const entity = await new AdapterRepository(eds).findBy({ guid: entityGuid });
        expect(entity.length).toEqual(0);
    }, Config.jestTimeoutSeconds * 1000);
});