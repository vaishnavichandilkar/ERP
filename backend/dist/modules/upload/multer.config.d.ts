export declare const multerConfig: {
    storage: import("multer").StorageEngine;
    fileFilter: (req: any, file: any, cb: any) => void;
    limits: {
        fileSize: number;
    };
};
