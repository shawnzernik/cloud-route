export interface ContentDto {
    guid: string;
    title: string;
    pathAndName: string;
    mimeType: string;
    binary: boolean;
    encodedSize: number;
    securablesGuid: string;
    created: Date;
    createdBy: string;
    modified: Date;
    modifiedBy: string;
    deleted?: Date;
    deletedBy?: string;
}