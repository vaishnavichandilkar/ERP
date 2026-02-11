import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

export const businessDocsStorage = diskStorage({
    destination: (req: any, file, cb) => {
        const adminId = req.user?.id;
        if (!adminId) {
            return cb(new Error('User not attached to request'), '');
        }
        const uploadPath = `./uploads/business-documents/${adminId}`;
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
    },
});

export const businessDocsFilter = (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
        // Reject file
        return cb(new BadRequestException('Only PDF files are allowed'), false);
    }
    cb(null, true);
};

export const businessDocsLimits = {
    fileSize: 5 * 1024 * 1024, // 5MB
};
