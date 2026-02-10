"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads',
        filename: (req, file, cb) => {
            const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
            cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
            cb(null, true);
        }
        else {
            cb(new common_1.HttpException('Unsupported file type', common_1.HttpStatus.BAD_REQUEST), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map