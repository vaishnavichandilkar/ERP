export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        message: string;
        filename: string;
        path: string;
    };
}
