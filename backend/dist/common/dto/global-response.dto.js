"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalResponseDto = void 0;
class GlobalResponseDto {
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }
}
exports.GlobalResponseDto = GlobalResponseDto;
//# sourceMappingURL=global-response.dto.js.map