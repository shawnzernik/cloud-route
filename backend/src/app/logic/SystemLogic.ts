import * as child_process from "child_process";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";
import { SystemTopProcessDto } from "common/src/app/models/SystemTopProcessDto";
import { SystemProcNetDevDto } from "common/src/app/models/SystemProcNetDevDto";
import path from "path";
import * as fs from "fs";
import { Config } from "../../Config";
import { AdapterRepository } from "../data/AdapterRepository";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { Logger } from "../../tre/Logger";

export class SystemLogic {
    public static async getTop(logger: Logger) {
        const ret: SystemTopDto = {
            cpuHwInt: NaN, cpuIdle: NaN, cpuNiced: NaN, cpuStolen: NaN, cpuSwInt: NaN, cpuSystem: NaN, cpuUser: NaN, cpuWaitIo: NaN,
            load15min: NaN, load1min: NaN, load5min: NaN,
            memBuffCache: NaN, memFree: NaN, memTotal: NaN, memUsed: NaN,
            processes: [],
            swapAvailable: NaN, swapFree: NaN, swapTotal: NaN, swapUsed: NaN,
            tasksRunning: NaN, tasksSleeping: NaN, tasksStopped: NaN, tasksTotal: NaN, tasksZombie: NaN,
            timestamp: new Date(),
            uptimeMinutes: NaN,
            users: NaN
        }

        // const out = await SystemLogic.execute("sudo", ["top", "-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k"]);
        // // const out = await SystemLogic.execute("top", ["-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k"]);
        const out = await SystemLogic.execute(logger, "sudo", ["top", "-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k", "-c"]);
        // const out = await SystemLogic.execute("top", ["-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k", "-c"]);
        if (!fs.existsSync(Config.tempDirectory))
            fs.mkdirSync(Config.tempDirectory, { recursive: true });
        fs.writeFileSync(path.join(Config.tempDirectory, "top.txt"), out, { encoding: "utf8" });

        ret.timestamp = new Date();

        let topRegex = /top\s+[0-9\-]+\s+([0-9]+):([0-9]+):([0-9]+)\s+up\s+([0-9]+):([0-9]+),\s+([0-9]+)\s+user[s]?,\s+load\s+average:\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+)\s*\n/g;
        let topMatches = out.matchAll(topRegex);
        let topArray = Array.from(topMatches);
        if (topArray.length == 1) {
            const topGroups = Array.from(topArray[0]);

            ret.uptimeMinutes = Number.parseInt(topGroups[4]) * 60 + Number.parseInt(topGroups[5]);
            ret.users = Number.parseInt(topGroups[6]);
            ret.load1min = Number.parseFloat(topGroups[7]);
            ret.load5min = Number.parseFloat(topGroups[8]);
            ret.load15min = Number.parseFloat(topGroups[9]);
        } else {
            topRegex = /top\s+[0-9\-]+\s+([0-9]+):([0-9]+):([0-9]+)\s+up\s+([0-9]+)\s+min,\s+([0-9]+)\s+user[s]?,\s+load\s+average:\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+)\s*\n/g;
            topMatches = out.matchAll(topRegex);
            topArray = Array.from(topMatches);
            if (topArray.length != 1)
                throw new Error("Could not match top regexes in text!");

            const topGroups = Array.from(topArray[0]);

            ret.uptimeMinutes = Number.parseInt(topGroups[4]);
            ret.users = Number.parseInt(topGroups[5]);
            ret.load1min = Number.parseFloat(topGroups[6]);
            ret.load5min = Number.parseFloat(topGroups[7]);
            ret.load15min = Number.parseFloat(topGroups[8]);
        }

        const tasksRegex = /Tasks:\s+([0-9]+)\s+total,\s+([0-9]+)\s+running,\s+([0-9]+)\s+sleeping,\s+([0-9]+)\s+stopped,\s+([0-9]+)\s+zombie\s*\n/g;
        const tasksMatches = out.matchAll(tasksRegex);
        const tasksArray = Array.from(tasksMatches);
        if (tasksArray.length != 1)
            throw new Error(`Could not match "tasks" regex "${tasksRegex.source}" in text:\n\n${out}`);
        const tasksGroup = Array.from(tasksArray[0]);

        ret.tasksTotal = Number.parseInt(tasksGroup[1]);
        ret.tasksRunning = Number.parseInt(tasksGroup[2]);
        ret.tasksSleeping = Number.parseInt(tasksGroup[3]);
        ret.tasksStopped = Number.parseInt(tasksGroup[4]);
        ret.tasksZombie = Number.parseInt(tasksGroup[5]);

        const cpuRegex = /%Cpu\(s\):\s*([0-9\.]+)\s*us,\s*([0-9\.]+)\s*sy,\s*([0-9\.]+)\s*ni,\s*([0-9\.]+)\s*id,\s*([0-9\.]+)\s*wa,\s*([0-9\.]+)\shi,\s*([0-9\.]+)\s*si,\s*([0-9\.]+)\s*st/g;
        const cpuMatches = out.matchAll(cpuRegex);
        const cpuArray = Array.from(cpuMatches);
        if (cpuArray.length != 1)
            throw new Error(`Could not match "cpu" regex "${cpuRegex.source}" in text:\n\n${out}`);
        const cpuGroups = Array.from(cpuArray[0]);

        ret.cpuUser = Number.parseInt(cpuGroups[1]);
        ret.cpuSystem = Number.parseInt(cpuGroups[2]);
        ret.cpuNiced = Number.parseInt(cpuGroups[3]);
        ret.cpuIdle = Number.parseInt(cpuGroups[4]);
        ret.cpuWaitIo = Number.parseInt(cpuGroups[5]);
        ret.cpuHwInt = Number.parseInt(cpuGroups[6]);
        ret.cpuSwInt = Number.parseInt(cpuGroups[7]);
        ret.cpuStolen = Number.parseInt(cpuGroups[8]);

        const memRegex = /KiB\s+Mem\s+:\s+([0-9]+)\s+total,\s+([0-9]+)\s+free,\s+([0-9]+)\s+used,\s+([0-9]+)\s+buff\/cache\s*\n/g;
        const memMatches = out.matchAll(memRegex);
        const memArray = Array.from(memMatches);
        if (memArray.length != 1)
            throw new Error(`Could not match "mem" regex "${memRegex.source}" in text:\n\n${out}`);
        const memGroups = Array.from(memArray[0]);

        ret.memTotal = Number.parseInt(memGroups[1]);
        ret.memFree = Number.parseInt(memGroups[2]);
        ret.memUsed = Number.parseInt(memGroups[3]);
        ret.memBuffCache = Number.parseInt(memGroups[4]);

        const swapRegex = /KiB\s+Swap:\s+([0-9]+)\s+total,\s+([0-9]+)\s+free,\s+([0-9]+)\s+used.\s+([0-9]+)\s+avail Mem\s*\n/g;
        const swapMatches = out.matchAll(swapRegex);
        const swapArray = Array.from(swapMatches);
        if (swapArray.length != 1)
            throw new Error(`Could not match "swap" regex "${swapRegex.source}" in text:\n\n${out}`);
        const swapGroups = Array.from(swapArray[0]);

        ret.swapTotal = Number.parseInt(swapGroups[1]);
        ret.swapFree = Number.parseInt(swapGroups[2]);
        ret.swapUsed = Number.parseInt(swapGroups[3]);
        ret.swapAvailable = Number.parseInt(swapGroups[4]);

        ret.processes = [];

        const psRegex = /([0-9]+)\s+([^\s]+)\s+([\-0-9rt]+)\s+([\-0-9]+)\s+([0-9\.g]+)\s+([0-9]+)\s+([0-9]+)\s+([A-Z]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9]+):([0-9\.]+)\s+(.+)\n/g;
        const psMatches = out.matchAll(psRegex);
        const psArray = Array.from(psMatches);
        if (psArray.length != ret.tasksTotal)
            throw new Error(`Could not match "ps" regex "${psRegex.source}" in text:\n\n${out}`);

        for (let cnt = 0; cnt < psArray.length; cnt++) {
            const psGroups = Array.from(psArray[cnt]);
            const processDto: SystemTopProcessDto = {
                pid: Number.parseInt(psGroups[1]),
                user: psGroups[2],
                priority: psGroups[3] == "rt"
                    ? "rt"
                    : Number.parseInt(psGroups[3]),
                nice: Number.parseInt(psGroups[4]),
                memVirtual: Number.parseInt(psGroups[5]),
                memResident: Number.parseInt(psGroups[6]),
                memShared: Number.parseInt(psGroups[7]),
                status: psGroups[8],
                cpuPercentage: Number.parseFloat(psGroups[9]),
                memPercentage: Number.parseFloat(psGroups[10]),
                cpuTimeSeconds: Number.parseInt(psGroups[11]) * 60 + Number.parseFloat(psGroups[12]),
                command: psGroups[13]
            };
            ret.processes.push(processDto);
        }

        return ret;
    }

    public static async getProcNetDev(): Promise<SystemProcNetDevDto[]> {
        const getDevs = () => {
            const ret: SystemProcNetDevDto[] = [];

            const out = fs.readFileSync("/proc/net/dev", { encoding: "utf8" });

            const ifRegex = /([^\s:]+):\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)/g;
            const ifMatches = out.matchAll(ifRegex);
            const ifArray = Array.from(ifMatches);
            if (ifArray.length < 2)
                throw new Error("You must have at lest two adapters: loopback and a network interface!");

            for (const row of ifArray) {
                const ifGroups = Array.from(row);
                const dev: SystemProcNetDevDto = {
                    timestamp: new Date(),
                    interface: ifGroups[1],
                    rxBytes: Number.parseInt(ifGroups[2]),
                    rxPackets: Number.parseInt(ifGroups[3]),
                    rxErrs: Number.parseInt(ifGroups[4]),
                    rxDrop: Number.parseInt(ifGroups[5]),
                    rxFifo: Number.parseInt(ifGroups[6]),
                    rxFrame: Number.parseInt(ifGroups[7]),
                    rxCompressed: Number.parseInt(ifGroups[8]),
                    rxMulticast: Number.parseInt(ifGroups[9]),
                    txBytes: Number.parseInt(ifGroups[10]),
                    txPackets: Number.parseInt(ifGroups[11]),
                    txErrs: Number.parseInt(ifGroups[12]),
                    txDrop: Number.parseInt(ifGroups[13]),
                    txFifo: Number.parseInt(ifGroups[14]),
                    txFrame: Number.parseInt(ifGroups[15]),
                    txCompressed: Number.parseInt(ifGroups[16]),
                    txMulticast: Number.parseInt(ifGroups[17]),
                };
                ret.push(dev);
            }

            return ret;
        }
        return new Promise((resolve) => {
            let ret: SystemProcNetDevDto[] = getDevs();

            setTimeout(() => {
                ret = [...ret, ...getDevs()];
                resolve(ret);
            }, 1 * 1000);
        });
    }

    public static async getEtcNetplan(logger: Logger, ds: EntitiesDataSource): Promise<void> {
        try {
            await SystemLogic.execute(logger, "sudo", ["rm", "/etc/netplan/60-*.yaml"]);
        }
        catch {
            // ignore all
        }

        const adapters = await new AdapterRepository(ds).findBy({ enable: true });
        for (const adapter of adapters) {
            let template = fs.readFileSync("./templates/etc/netplan/static.yaml", { encoding: "utf8" });
            if (adapter.dhcp)
                template = fs.readFileSync("./templates/etc/netplan/dhcp.yaml", { encoding: "utf8" });

            template = template.replace(/%DEVICE%/g, adapter.deviceName);

            if (!adapter.dhcp) {
                template = template.replace(/%IP4_ADDRESS%/g, adapter.ip4Address!);
                template = template.replace(/%IP4_NETWORK_BITS%/g, adapter.ip4NetworkBits!.toString());
                template = template.replace(/%IP4_DEFAULT_GATEWAY%/g, adapter.ip4DefaultGateway!);
                template = template.replace(/%DNS_SEARCH%/g, adapter.dnsSearch!);
                template = template.replace(/%IP4_DNS_ADDRESSES%/g, adapter.ip4DnsAddresses!);
            }

            if (!fs.existsSync(Config.tempDirectory))
                fs.mkdirSync(Config.tempDirectory, { recursive: true });

            const tempFile = path.join(Config.tempDirectory, "60-" + adapter.deviceName + ".yaml");
            fs.writeFileSync(tempFile, template, { encoding: "utf8" });

            await SystemLogic.execute(logger, "sudo", ["chmod", "0600", tempFile]);
            await SystemLogic.execute(logger, "sudo", ["chown", "root:root", tempFile]);
            await SystemLogic.execute(logger, "sudo", ["mv", tempFile, "/etc/netplan/60-" + adapter.deviceName + ".yaml"]);
        }

        await SystemLogic.execute(logger, "sudo", ["netplan", "apply"]);
    }

    public static async execute(logger: Logger, cmd: string, args: string[] = [], options: child_process.SpawnOptionsWithoutStdio = {
        cwd: undefined,
        env: process.env
    }): Promise<string> {
        let actualCmd = cmd;
        for (const arg of args)
            actualCmd += " " + arg;

        await logger.log(">>>>>>>>\n" + actualCmd);

        let out = "";
        return new Promise((resolve, reject) => {
            const ps = child_process.spawn(cmd, args, options);

            ps.stderr.on("data", (chunk) => {
                out += chunk;
            });
            ps.stdout.on("data", (chunk) => {
                out += chunk;
            });

            ps.on("close", async (code) => {
                await logger.log("<<<<<<<<\n" + out);
                if (code != 0)
                    reject(new Error(out));
                else
                    resolve(out);
            });
        });
    }
}