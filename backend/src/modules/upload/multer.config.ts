import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
            cb(null, `${randomName}${extname(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
