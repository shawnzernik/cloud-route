import https from "https";
import fetch from "node-fetch";
import { PayloadDto } from "common/src/tre/models/PayloadDto";
import { Config } from "../../../Config";
import { EntitiesDataSource } from "../../data/EntitiesDataSource";
import { PayloadEntity } from "../../data/PayloadEntity";
import { PayloadRepository } from "../../data/PayloadRepository";

jest.setTimeout(Config.jestTimeoutSeconds * 1000);

describe("PayloadService", () => {
    let agent = new https.Agent({ rejectUnauthorized: false });
    let entityGuid = "faf76b3d-ed66-4182-a7c2-7ea6562785fe";
    let token: string | undefined;
    let eds: EntitiesDataSource;

    beforeAll(async () => {
        eds = new EntitiesDataSource();
        await eds.initialize();

        // Assuming a user creation step for authentication (not shown in your example)
        // This part would typically involve creating a user and obtaining a token for authentication
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
        try { await new PayloadRepository(eds).delete({ guid: entityGuid }); }
        catch (err) { /* eat error */ }

        await eds.destroy();
    }, Config.jestTimeoutSeconds * 1000);

    // test("POST /api/v0/payload - save new should return 200", async () => {
    //     if (!token)
    //         throw new Error("No token - did beforeAll() fail?");

    //     const entity = new PayloadEntity();
    //     entity.guid = entityGuid;
    //     entity.content = "Payload content example";

    //     const response = await fetch(Config.appUrl + "/api/v0/payload", {
    //         agent: agent,
    //         method: "POST",
    //         body: JSON.stringify(entity),
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": "Bearer " + token
    //         }
    //     });

    //     const obj = await response.json();
    //     if (!response.ok)
    //         throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

    //     expect(response.ok).toBeTruthy();
    //     expect(response.status).toBe(200);

    //     let reloaded = await new PayloadRepository(eds).findOneByOrFail({ guid: entityGuid });
    //     expect(entity.guid).toEqual(reloaded.guid);
    // }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/payloads should return payload list", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/payloads", {
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

        const data = obj["data"] as PayloadDto[];

        expect(data.length > 0).toBeTruthy();
        expect(data[0].guid).toBeTruthy();
        expect(data[0].content).toBeTruthy();
    }, Config.jestTimeoutSeconds * 1000);

    // test("GET /api/v0/payload/:guid should return payload and 200", async () => {
    //     if (!token)
    //         throw new Error("No token - did beforeAll() fail?");

    //     const response = await fetch(Config.appUrl + "/api/v0/payload/" + entityGuid, {
    //         agent: agent,
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": "Bearer " + token
    //         }
    //     });

    //     const obj = await response.json();
    //     if (!response.ok)
    //         throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

    //     if (!obj["data"])
    //         throw new Error("No data returned!");

    //     const data = obj["data"] as PayloadDto;

    //     expect(data.guid).toEqual(entityGuid);
    // }, Config.jestTimeoutSeconds * 1000);

    test("DELETE /api/v0/payload/:guid should delete payload and return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/payload/" + entityGuid, {
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

        let entity = await new PayloadRepository(eds).findBy({ guid: entityGuid });
        expect(entity.length).toEqual(0);
    }, Config.jestTimeoutSeconds * 1000);
});