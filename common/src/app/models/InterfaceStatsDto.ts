// this matches /proc/net/dev
export interface InterfaceStatsDto {
    interface: string;
    timestamp: Date;

    rxBytes: number;
    rxPackets: number;
    rxErrs: number;
    rxDrop: number;
    rxFifo: number;
    rxFrame: number;
    rxCompressed: number;
    rxMulticast: number;

    txBytes: number;
    txPackets: number;
    txErrs: number;
    txDrop: number;
    txFifo: number;
    txFrame: number;
    txCompressed: number;
    txMulticast: number;
}