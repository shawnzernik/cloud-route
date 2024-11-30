import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { SystemProcNetDevDto } from "common/src/app/models/SystemProcNetDevDto";
import { Heading } from "../../tre/components/Heading";
import { SystemService } from "../services/SystemService";
import { AuthService } from "../../tre/services/AuthService";
import { Dictionary } from "common/src/tre/Dictionary";
import { BootstrapIcon } from "../../tre/components/BootstrapIcon";

interface Props { }
interface State extends BasePageState {
    devDtos: SystemProcNetDevDto[];
}

class Page extends BasePage<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            ...BasePage.defaultState,
            devDtos: [],
        };
    }

    public async componentDidMount(): Promise<void> {
        try {
            const token = await AuthService.getToken();
            const devDtos = await SystemService.getProcNetDev(token);

            const dtoByDev: Dictionary<SystemProcNetDevDto[]> = {};
            for (const dto of devDtos) {
                if (!dtoByDev[dto.interface])
                    dtoByDev[dto.interface] = [];
                dtoByDev[dto.interface].push(dto);
            }

            for (const dev in dtoByDev) {
                dtoByDev[dev] = dtoByDev[dev].sort((a, b) => {
                    const aTime = Date.parse(a.timestamp.toString());
                    const bTime = Date.parse(b.timestamp.toString());
                    return aTime - bTime;
                });
            }

            const devs: SystemProcNetDevDto[] = [];
            Object.keys(dtoByDev).forEach((dev) => {
                const seconds = (Date.parse(dtoByDev[dev][1].timestamp.toString()) - Date.parse(dtoByDev[dev][0].timestamp.toString())) / 1000;

                devs.push({
                    timestamp: dtoByDev[dev][1].timestamp,
                    interface: dtoByDev[dev][1].interface,
                    rxBytes: (dtoByDev[dev][1].rxBytes - dtoByDev[dev][0].rxBytes) / seconds,
                    rxCompressed: (dtoByDev[dev][1].rxCompressed - dtoByDev[dev][0].rxCompressed) / seconds,
                    rxDrop: (dtoByDev[dev][1].rxDrop - dtoByDev[dev][0].rxDrop) / seconds,
                    rxErrs: (dtoByDev[dev][1].rxErrs - dtoByDev[dev][0].rxErrs) / seconds,
                    rxFifo: (dtoByDev[dev][1].rxFifo - dtoByDev[dev][0].rxFifo) / seconds,
                    rxFrame: (dtoByDev[dev][1].rxFrame - dtoByDev[dev][0].rxFrame) / seconds,
                    rxMulticast: (dtoByDev[dev][1].rxMulticast - dtoByDev[dev][0].rxMulticast) / seconds,
                    rxPackets: (dtoByDev[dev][1].rxPackets - dtoByDev[dev][0].rxPackets) / seconds,
                    txBytes: (dtoByDev[dev][1].txBytes - dtoByDev[dev][0].txBytes) / seconds,
                    txCompressed: (dtoByDev[dev][1].txCompressed - dtoByDev[dev][0].txCompressed) / seconds,
                    txDrop: (dtoByDev[dev][1].txDrop - dtoByDev[dev][0].txDrop) / seconds,
                    txErrs: (dtoByDev[dev][1].txErrs - dtoByDev[dev][0].txErrs) / seconds,
                    txFifo: (dtoByDev[dev][1].txFifo - dtoByDev[dev][0].txFifo) / seconds,
                    txFrame: (dtoByDev[dev][1].txFrame - dtoByDev[dev][0].txFrame) / seconds,
                    txMulticast: (dtoByDev[dev][1].txMulticast - dtoByDev[dev][0].txMulticast) / seconds,
                    txPackets: (dtoByDev[dev][1].txPackets - dtoByDev[dev][0].txPackets) / seconds,
                });
            });

            await this.updateState({ devDtos: devs });
            setTimeout(this.componentDidMount.bind(this), 100);
        }
        catch (err) {
            await ErrorMessage(this, err);
        }
    }

    private rowClicked(dto: SystemProcNetDevDto) { }

    public render(): React.ReactNode {
        let list = <></>;
        if (this.state.devDtos) {
            const devices = [];
            for (const dto of this.state.devDtos)
                devices.push(<tr>
                    {
                        dto.interface === "lo"
                            ? <td></td>
                            : <td
                                style={{ textAlign: "center", cursor: "pointer", width: "4em" }}
                                onClick={() => {
                                    window.location.assign("/static/app/pages/adapter.html?device=" + dto.interface);
                                }}
                            ><BootstrapIcon name="pencil-fill" size={2} /></td>
                    }
                    <td>{dto.interface}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxBytes.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxPackets.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxDrop.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxFifo.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxFrame.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxCompressed.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.rxMulticast.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txBytes.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txPackets.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txDrop.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txFifo.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txFrame.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txCompressed.toFixed(0)}</td>
                    <td style={{ textAlign: "right" }}>{dto.txMulticast.toFixed(0)}</td>
                </tr>);
            list = <table>
                <thead>
                    <tr>
                        <th rowSpan={2}></th>
                        <th rowSpan={2}>Device</th>
                        <th colSpan={7}>Receive per Second</th>
                        <th colSpan={7}>Transmit per Second</th>
                    </tr>
                    <tr>
                        <th>Bytes</th>
                        <th>Packets</th>
                        <th>Drops</th>
                        <th>FIFOs</th>
                        <th>Frames</th>
                        <th>Compressed</th>
                        <th>Multicast</th>
                        <th>Bytes</th>
                        <th>Packets</th>
                        <th>Drops</th>
                        <th>FIFOs</th>
                        <th>Frames</th>
                        <th>Compressed</th>
                        <th>Multicast</th>
                    </tr>
                </thead>
                <tbody>
                    {devices}
                </tbody>
            </table >;
        }

        return (
            <Navigation
                state={this.state} events={this.events}
                topMenuGuid="ce40996d-0a86-493c-b0f4-06bb45e312c8"
                leftMenuGuid="01ae2cfa-8ed9-4b7e-b990-b5f9e947e29b"
            >
                <Heading level={1}>Adapters</Heading>
                {list}
            </Navigation>
        );
    }
}

window.onload = () => {
    const element = document.getElementById("root");
    const root = createRoot(element);
    root.render(<Page />)
};

window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};
