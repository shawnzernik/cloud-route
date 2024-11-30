import { SystemTopProcessDto } from "./SystemTopProcessDto";

export interface SystemTopDto {
    timestamp: Date;
    uptimeMinutes: number;
    users: number;
    load1min: number;
    load5min: number;
    load15min: number;

    tasksTotal: number;
    tasksRunning: number;
    tasksSleeping: number;
    tasksStopped: number;
    tasksZombie: number;

    cpuUser: number;
    cpuSystem: number;
    cpuNiced: number;
    cpuIdle: number;
    cpuWaitIo: number;
    cpuHwInt: number;
    cpuSwInt: number;
    cpuStolen: number;

    memTotal: number;
    memFree: number;
    memUsed: number;
    memBuffCache: number;

    swapTotal: number;
    swapFree: number;
    swapUsed: number;
    swapAvailable: number;

    processes: SystemTopProcessDto[];
}