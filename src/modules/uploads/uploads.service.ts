import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, GIF, and PDF files are allowed');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File must be 5 MB or smaller');
    }

    this.ensureUploadDir();

    const ext = extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg');
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(join(this.uploadDir, filename), file.buffer);

    const baseUrl = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 3001}`;
    return {
      filename,
      url: `${baseUrl}/uploads/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
