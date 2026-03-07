

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

        // Create folder if not exists
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },

    filename: (req: any, file, cb) => {

        const adminId = req.user.id;

        // Get document name (remove extension and spaces)
        const documentName = file.originalname
            .split('.')[0]
            .replace(/\s+/g, '_');

        // Format date DD-MM-YYYY
        const now = new Date();

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();

        const formattedDate = `${day}-${month}-${year}`;

        // Final filename
        const fileName = `${adminId}_${documentName}_${formattedDate}${extname(file.originalname)}`;

        cb(null, fileName);
    },

});


// ✅ File Filter (Only PDF)
export const businessDocsFilter = (req, file, cb) => {

    if (file.mimetype !== 'application/pdf') {

        return cb(
            new BadRequestException('Only PDF files are allowed'),
            false
        );
    }

    cb(null, true);
};


// ✅ File Size Limit (5MB)
export const businessDocsLimits = {

    fileSize: 5 * 1024 * 1024,

};
