import { DataSource, Repository } from "typeorm";
import { PayloadEntity } from "./PayloadEntity";

export class PayloadRepository extends Repository<PayloadEntity> {
    public constructor(ds: DataSource) {
        super(PayloadEntity, ds.createEntityManager(), ds.createQueryRunner());
    }
}