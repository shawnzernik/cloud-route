export interface SystemTopProcessDto {
    pid: number;
    user: string;
    priority: number | "rt";
    nice: number;
    memVirtual: number;
    memResident: number;
    memShared: number;
    status: string,
    cpuPercentage: number;
    memPercentage: number;
    cpuTimeSeconds: number;
    command: string;
}