"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_BYTES = 5 * 1024 * 1024;
let UploadsService = class UploadsService {
    uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    ensureUploadDir() {
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    saveFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!ALLOWED_MIME.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only JPEG, PNG, WebP, GIF, and PDF files are allowed');
        }
        if (file.size > MAX_BYTES) {
            throw new common_1.BadRequestException('File must be 5 MB or smaller');
        }
        this.ensureUploadDir();
        const ext = (0, path_1.extname)(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
        (0, fs_1.writeFileSync)((0, path_1.join)(this.uploadDir, filename), file.buffer);
        const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 3001}`;
        return {
            filename,
            url: `${baseUrl}/uploads/${filename}`,
            mimeType: file.mimetype,
            size: file.size,
        };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)()
], UploadsService);
//# sourceMappingURL=uploads.service.js.map