import * as child_process from "child_process";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";
import { SystemTopProcessDto } from "common/src/app/models/SystemTopProcessDto";
import path from "path";
import fs, { existsSync } from "fs";
import { Config } from "../../Config";

export class SystemLogic {
    public static async getTop() {
        const out = await SystemLogic.execute("sudo", ["top", "-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k"]);
        // const out = await SystemLogic.execute("top", ["-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k"]);
        // const out = await SystemLogic.execute("sudo", ["top", "-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k", "-c"]);
        // const out = await SystemLogic.execute("top", ["-n", "1", "-b", "-w", "512", "-e", "k", "-E", "k", "-c"]);
        if (!existsSync(Config.tempDirectory))
            fs.mkdirSync(Config.tempDirectory, { recursive: true });
        fs.writeFileSync(path.join(Config.tempDirectory, "top.txt"), out, { encoding: "utf8" });

        const topRegex = /top\s+[0-9\-]+\s+([0-9]+):([0-9]+):([0-9]+)\s+up\s+([0-9]+):([0-9]+),\s+([0-9]+)\s+users,\s+load\s+average:\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+)\s*\n/g;
        const topMatches = out.matchAll(topRegex);
        const topArray = Array.from(topMatches);
        if (topArray.length != 1)
            throw new Error(`Could not match "top" regex "${topRegex.source}" in text:\n\n${out}`);
        const topGroups = Array.from(topArray[0]);

        const tasksRegex = /Tasks:\s+([0-9]+)\s+total,\s+([0-9]+)\s+running,\s+([0-9]+)\s+sleeping,\s+([0-9]+)\s+stopped,\s+([0-9]+)\s+zombie\s*\n/g;
        const tasksMatches = out.matchAll(tasksRegex);
        const tasksArray = Array.from(tasksMatches);
        if (tasksArray.length != 1)
            throw new Error(`Could not match "tasks" regex "${tasksRegex.source}" in text:\n\n${out}`);
        const tasksGroup = Array.from(tasksArray[0]);

        const cpuRegex = /%Cpu\(s\):\s*([0-9\.]+)\s*us,\s*([0-9\.]+)\s*sy,\s*([0-9\.]+)\s*ni,\s*([0-9\.]+)\s*id,\s*([0-9\.]+)\s*wa,\s*([0-9\.]+)\shi,\s*([0-9\.]+)\s*si,\s*([0-9\.]+)\s*st/g;
        const cpuMatches = out.matchAll(cpuRegex);
        const cpuArray = Array.from(cpuMatches);
        if (cpuArray.length != 1)
            throw new Error(`Could not match "cpu" regex "${cpuRegex.source}" in text:\n\n${out}`);
        const cpuGroups = Array.from(cpuArray[0]);

        const memRegex = /KiB\s+Mem\s+:\s+([0-9]+)\s+total,\s+([0-9]+)\s+free,\s+([0-9]+)\s+used,\s+([0-9]+)\s+buff\/cache\s*\n/g;
        const memMatches = out.matchAll(memRegex);
        const memArray = Array.from(memMatches);
        if (memArray.length != 1)
            throw new Error(`Could not match "mem" regex "${memRegex.source}" in text:\n\n${out}`);
        const memGroups = Array.from(memArray[0]);

        const swapRegex = /KiB\s+Swap:\s+([0-9]+)\s+total,\s+([0-9]+)\s+free,\s+([0-9]+)\s+used.\s+([0-9]+)\s+avail Mem\s*\n/g;
        const swapMatches = out.matchAll(swapRegex);
        const swapArray = Array.from(swapMatches);
        if (swapArray.length != 1)
            throw new Error(`Could not match "swap" regex "${swapRegex.source}" in text:\n\n${out}`);
        const swapGroups = Array.from(swapArray[0]);

        const ret: SystemTopDto = {
            timestamp: new Date(),

            uptimeMinutes: Number.parseInt(topGroups[4]) * 60 + Number.parseInt(topGroups[5]),
            users: Number.parseInt(topGroups[6]),
            load1min: Number.parseFloat(topGroups[7]),
            load5min: Number.parseFloat(topGroups[8]),
            load15min: Number.parseFloat(topGroups[9]),

            cpuUser: Number.parseInt(cpuGroups[1]),
            cpuSystem: Number.parseInt(cpuGroups[2]),
            cpuNiced: Number.parseInt(cpuGroups[3]),
            cpuIdle: Number.parseInt(cpuGroups[4]),
            cpuWaitIo: Number.parseInt(cpuGroups[5]),
            cpuHwInt: Number.parseInt(cpuGroups[6]),
            cpuSwInt: Number.parseInt(cpuGroups[7]),
            cpuStolen: Number.parseInt(cpuGroups[8]),

            tasksTotal: Number.parseInt(tasksGroup[1]),
            tasksRunning: Number.parseInt(tasksGroup[2]),
            tasksSleeping: Number.parseInt(tasksGroup[3]),
            tasksStopped: Number.parseInt(tasksGroup[4]),
            tasksZombie: Number.parseInt(tasksGroup[5]),

            memTotal: Number.parseInt(memGroups[1]),
            memFree: Number.parseInt(memGroups[2]),
            memUsed: Number.parseInt(memGroups[3]),
            memBuffCache: Number.parseInt(memGroups[4]),

            swapTotal: Number.parseInt(swapGroups[1]),
            swapFree: Number.parseInt(swapGroups[2]),
            swapUsed: Number.parseInt(swapGroups[3]),
            swapAvailable: Number.parseInt(swapGroups[4]),

            processes: []
        };

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

    private static async execute(cmd: string, args: string[] = [], options: child_process.SpawnOptionsWithoutStdio = {
        cwd: undefined,
        env: process.env
    }): Promise<string> {
        let out = "";
        return new Promise((resolve, reject) => {
            const ps = child_process.spawn(cmd, args, options);

            ps.stderr.on("data", (chunk) => {
                out += chunk;
            });
            ps.stdout.on("data", (chunk) => {
                out += chunk;
            });

            ps.on("close", (code) => {
                if (code != 0)
                    reject(new Error(out));
                else
                    resolve(out);
            });
        });
    }
}