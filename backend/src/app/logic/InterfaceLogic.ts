import { InterfaceStatsDto } from "common/src/app/models/InterfaceStatsDto";
import fs from "fs";

export class InterfaceLogic {
    public static readNetDev(): InterfaceStatsDto[] {
        const out = fs.readFileSync("/proc/net/dev", { encoding: "utf8" });
        const regex = /([a-zA-Z0-9]*):\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*([0-9]*)\s*/g;
        const matches = out.matchAll(regex);

        const ret: InterfaceStatsDto[] = [];
        for (const match of matches) {
            const dev: InterfaceStatsDto = {
                interface: match[0],
                timestamp: new Date(),
                rxBytes: Number.parseInt(match[1]),
                rxPackets: Number.parseInt(match[2]),
                rxErrs: Number.parseInt(match[3]),
                rxDrop: Number.parseInt(match[4]),
                rxFifo: Number.parseInt(match[5]),
                rxFrame: Number.parseInt(match[6]),
                rxCompressed: Number.parseInt(match[7]),
                rxMulticast: Number.parseInt(match[8]),
                txBytes: Number.parseInt(match[9]),
                txPackets: Number.parseInt(match[10]),
                txErrs: Number.parseInt(match[11]),
                txDrop: Number.parseInt(match[12]),
                txFifo: Number.parseInt(match[13]),
                txFrame: Number.parseInt(match[14]),
                txCompressed: Number.parseInt(match[15]),
                txMulticast: Number.parseInt(match[16])
            };
            ret.push(dev);
        }

        return ret;
    }
}