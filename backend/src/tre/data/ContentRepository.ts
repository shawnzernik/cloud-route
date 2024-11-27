import { DataSource, Repository } from "typeorm";
import { ContentEntity } from "./ContentEntity";

export class ContentRepository extends Repository<ContentEntity> {
    public constructor(ds: DataSource) {
        super(ContentEntity, ds.createEntityManager(), ds.createQueryRunner());
    }
}