export declare class UploadsService {
    private readonly uploadDir;
    ensureUploadDir(): void;
    saveFile(file: Express.Multer.File): {
        filename: string;
        url: string;
        mimeType: string;
        size: number;
    };
}
