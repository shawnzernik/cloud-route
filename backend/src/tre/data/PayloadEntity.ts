import { Entity, PrimaryColumn, Column } from "typeorm";
import { CopyInterface } from "common/src/tre/logic/CopyInterface";
import { PayloadDto } from "common/src/tre/models/PayloadDto";

@Entity("payloads")
export class PayloadEntity implements PayloadDto, CopyInterface<PayloadDto> {
    @PrimaryColumn({ name: "guid" })
    public guid: string = "";

    @Column({ name: "content" })
    public content: string = "";

    public copyFrom(source: PayloadDto): void {
        this.guid = source.guid;
        this.content = source.content;
    }

    public copyTo(dest: PayloadDto): void {
        dest.guid = this.guid;
        dest.content = this.content;
    }
}