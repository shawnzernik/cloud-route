export interface FileDto {
    path: string;
    name: string;
    size: number;
    modified: Date;
    base64?: string;
}