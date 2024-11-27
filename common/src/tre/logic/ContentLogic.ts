import { ContentDto } from "../models/ContentDto";
import { ContentMimeTypeDto } from "../models/ContentMimeTypeDto";
import { PayloadDto } from "../models/PayloadDto";
import { PayloadLogic } from "./PayloadLogic";

export class ContentLogic {
    public static normalize(contentDto: ContentDto, payloadDto: PayloadDto, mimeTypes: ContentMimeTypeDto[]): void {
        this.normalizeName(contentDto);
        this.normalizeContents(contentDto, payloadDto, mimeTypes);
    }
    public static normalizeContents(contentDto: ContentDto, payloadDto: PayloadDto, mimeTypes: ContentMimeTypeDto[]) {
        let mimeType: ContentMimeTypeDto | null = null;
        mimeTypes.forEach((t) => {
            if (!mimeType && t.mimetype == contentDto.mimeType)
                mimeType = t;
        });
        if (!mimeType)
            throw new Error(`MIME type '${contentDto.mimeType}' is not valid!`);

        const contents = PayloadLogic.decode(payloadDto.content);

        let isBinary = false;
        for (let cnt = 0; cnt < contents.length; cnt++) {
            let code = contents[cnt];
            if ((code < 32 || code > 126) && code !== 9 && code !== 10 && code !== 13) {
                isBinary = true;
                break;
            }
        }

        if (isBinary || (mimeType as ContentMimeTypeDto).encode) {
            contentDto.binary = true;
            contentDto.encodedSize = payloadDto.content.length;
        }
    }
    public static normalizeName(dto: ContentDto) {
        let parts = dto.pathAndName.split("/");

        let pathAndName = "";
        for (let cnt = 0; cnt < parts.length; cnt++) {
            let part = parts[cnt].trim();
            if (part.length > 0 && part !== "." && part !== "..")
                pathAndName += "/" + part;
        }

        dto.pathAndName = pathAndName;
    }
}

