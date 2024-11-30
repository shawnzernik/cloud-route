import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorMessage, Navigation } from "../../tre/components/Navigation";
import { BasePage, BasePageState } from "../../tre/components/BasePage";
import { SystemTopDto } from "common/src/app/models/SystemTopDto";
import { Heading } from "../../tre/components/Heading";
import { SystemService } from "../services/SystemService";
import { AuthService } from "../../tre/services/AuthService";
import { Form } from "../../tre/components/Form";
import { Field } from "../../tre/components/Field";
import { BootstrapIcon } from "../../tre/components/BootstrapIcon";

interface Props { }
interface State extends BasePageState {
    topDto: SystemTopDto | null;
    processSort: string;
    sortDirection: number;
}

class Page extends BasePage<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            ...BasePage.defaultState,
            topDto: null,
            processSort: "pid",
            sortDirection: 1
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.events.setLoading(true);

        try {
            const token = await AuthService.getToken();
            const topDto = await SystemService.getTop(token);

            await this.updateState({ topDto: topDto });

            await this.events.setLoading(false);
        }
        catch (err) {
            await ErrorMessage(this, err);
        }
    }

    private async sortProcessesBy(propoerty: string): Promise<void> {
        let sortDirection = this.state.sortDirection * -1;
        if (this.state.processSort != propoerty)
            sortDirection = 1;

        const newTopDto = this.jsonCopy(this.state.topDto);
        newTopDto.processes = newTopDto.processes.sort((a: any, b: any) => {
            if (a[propoerty] < b[propoerty])
                return -1 * sortDirection;
            if (a[propoerty] > b[propoerty])
                return 1 * sortDirection;
            return 0;
        });
        await this.updateState({
            topDto: newTopDto,
            processSort: propoerty,
            sortDirection: sortDirection
        });
    }

    public render(): React.ReactNode {
        let processes = <></>;
        if (this.state.topDto) {
            const processRows = [];
            for (const row of this.state.topDto.processes)
                processRows.push(<tr>
                    <td style={{ textAlign: "right" }}>{row.pid}</td>
                    <td>{row.user}</td>
                    <td style={{ textAlign: "right" }}>{row.priority}</td>
                    <td style={{ textAlign: "right" }}>{row.nice}</td>
                    <td style={{ textAlign: "right" }}>{row.memVirtual.toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>{row.memResident.toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>{row.memShared.toLocaleString()}</td>
                    <td style={{ textAlign: "center" }}>{row.status}</td>
                    <td style={{ textAlign: "right" }}>{row.cpuPercentage.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{row.memPercentage.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{row.cpuTimeSeconds.toFixed(2)}</td>
                    <td>{row.command}</td>
                </tr>);
            processes = <table>
                <thead>
                    <th style={{ textAlign: "right" }}>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "pid" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "pid" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "pid")}
                        />
                        PID
                    </th>
                    <th>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "user" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "user" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "user")}
                        />
                        User
                    </th>
                    <th style={{ textAlign: "right" }}>Priority</th>
                    <th style={{ textAlign: "right" }}>Nice</th>
                    <th style={{ textAlign: "right" }}>Virtual</th>
                    <th style={{ textAlign: "right" }}>Resident</th>
                    <th style={{ textAlign: "right" }}>Shared</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "cpuPercentage" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "cpuPercentage" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "cpuPercentage")}
                        />
                        % CPU
                    </th>
                    <th style={{ textAlign: "right" }}>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "memPercentage" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "memPercentage" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "memPercentage")}
                        />
                        % Memory
                    </th>
                    <th style={{ textAlign: "right" }}>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "cpuTimeSeconds" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "cpuTimeSeconds" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "cpuTimeSeconds")}
                        />
                        CPU Seconds
                    </th>
                    <th>
                        <BootstrapIcon size={1}
                            name={
                                "caret" +
                                (this.state.processSort == "command" && this.state.sortDirection < 0 ? "-up" : "-down") +
                                (this.state.processSort == "command" ? "-fill" : "")
                            }
                            onClick={this.sortProcessesBy.bind(this, "command")}
                        />
                        Command
                    </th>
                </thead>
                <tbody>
                    {processRows}
                </tbody>
            </table>;
        }

        return (
            <Navigation
                state={this.state} events={this.events}
                topMenuGuid="ce40996d-0a86-493c-b0f4-06bb45e312c8"
                leftMenuGuid="1094e878-7c5b-47c0-b8cf-076f1983c01f"
            >
                <Heading level={1}>System Information</Heading>

                <Form>
                    <Field label="Time Stamp" size={2}>{this.state.topDto ? this.state.topDto.timestamp.toString() : ""}</Field>
                    <Field label="Minutes Running" size={2}>{this.state.topDto ? this.state.topDto.uptimeMinutes.toString() : ""}</Field>
                    <Field label="Users" size={1}>{this.state.topDto ? this.state.topDto.users.toString() : ""}</Field>
                    <Field label="1 Min Load" size={1}>{this.state.topDto ? this.state.topDto.load1min.toFixed(2) : ""} %</Field>
                    <Field label="5 Min Load" size={1}>{this.state.topDto ? this.state.topDto.load5min.toFixed(2) : ""} %</Field>
                    <Field label="15 Min Load" size={1}>{this.state.topDto ? this.state.topDto.load15min.toFixed(2) : ""} %</Field>
                </Form>

                <Heading level={2}>CPU (%)</Heading>
                <Form>
                    <Field label="User" size={1}>{this.state.topDto ? this.state.topDto.cpuUser.toFixed(2) : ""}</Field>
                    <Field label="System" size={1}>{this.state.topDto ? this.state.topDto.cpuSystem.toFixed(2) : ""}</Field>
                    <Field label="Nice" size={1}>{this.state.topDto ? this.state.topDto.cpuNiced.toFixed(2) : ""}</Field>
                    <Field label="Idle" size={1}>{this.state.topDto ? this.state.topDto.cpuIdle.toFixed(2) : ""}</Field>
                    <Field label="Waiting IO" size={1}>{this.state.topDto ? this.state.topDto.cpuWaitIo.toFixed(2) : ""}</Field>
                    <Field label="HW Int" size={1}>{this.state.topDto ? this.state.topDto.cpuHwInt.toFixed(2) : ""}</Field>
                    <Field label="SW Int" size={1}>{this.state.topDto ? this.state.topDto.cpuSwInt.toFixed(2) : ""}</Field>
                    <Field label="Stolen" size={1}>{this.state.topDto ? this.state.topDto.cpuStolen.toFixed(2) : ""}</Field>
                </Form>

                <Heading level={2}>Memory (KB)</Heading>
                <Form>
                    <Field label="Total" size={1}>{this.state.topDto ? this.state.topDto.memTotal.toLocaleString() : ""}</Field>
                    <Field label="Free" size={1}>{this.state.topDto ? this.state.topDto.memFree.toLocaleString() : ""}</Field>
                    <Field label="Used" size={1}>{this.state.topDto ? this.state.topDto.memUsed.toLocaleString() : ""}</Field>
                    <Field label="Buff / Cache" size={1}>{this.state.topDto ? this.state.topDto.memBuffCache.toLocaleString() : ""}</Field>
                </Form>

                <Heading level={2}>Swap (KB)</Heading>
                <Form>
                    <Field label="Total" size={1}>{this.state.topDto ? this.state.topDto.swapTotal.toLocaleString() : ""}</Field>
                    <Field label="Free" size={1}>{this.state.topDto ? this.state.topDto.swapFree.toLocaleString() : ""}</Field>
                    <Field label="Used" size={1}>{this.state.topDto ? this.state.topDto.swapUsed.toLocaleString() : ""}</Field>
                    <Field label="Avaiable" size={1}>{this.state.topDto ? this.state.topDto.swapAvailable.toLocaleString() : ""}</Field>
                </Form>

                <Heading level={2}>Tasks</Heading>
                <Form>
                    <Field label="Total" size={1}>{this.state.topDto ? this.state.topDto.tasksTotal.toString() : ""}</Field>
                    <Field label="Running" size={1}>{this.state.topDto ? this.state.topDto.tasksRunning.toString() : ""}</Field>
                    <Field label="Sleeping" size={1}>{this.state.topDto ? this.state.topDto.tasksSleeping.toString() : ""}</Field>
                    <Field label="Stoped" size={1}>{this.state.topDto ? this.state.topDto.tasksStopped.toString() : ""}</Field>
                    <Field label="Zombie" size={1}>{this.state.topDto ? this.state.topDto.tasksZombie.toString() : ""}</Field>
                </Form>

                <Heading level={3}>Processes</Heading>
                {processes}
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
