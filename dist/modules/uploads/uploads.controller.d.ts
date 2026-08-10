import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    upload(file: Express.Multer.File): {
        filename: string;
        url: string;
        mimeType: string;
        size: number;
    };
}
