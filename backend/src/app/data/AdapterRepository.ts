import { DataSource, Repository } from "typeorm";
import { AdapterEntity } from "./AdapterEntity";

export class AdapterRepository extends Repository<AdapterEntity> {
    public constructor(ds: DataSource) {
        super(AdapterEntity, ds.createEntityManager(), ds.createQueryRunner());
    }
}