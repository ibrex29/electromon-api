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

  publicBaseUrl(req?: {
    protocol?: string;
    get?: (name: string) => string | undefined;
    headers?: Record<string, unknown>;
  }) {
    const configured = process.env.API_PUBLIC_URL?.replace(/\/$/, '');
    if (configured) return configured;
    if (!req) {
      return (process.env.API_URL ?? `http://localhost:${process.env.API_PORT ?? 3001}`).replace(
        /\/$/,
        '',
      );
    }
    const host = req.get?.('host');
    if (host) {
      const forwarded = req.headers?.['x-forwarded-proto'];
      const proto = String(
        (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.protocol || 'http',
      ).split(',')[0];
      return `${proto}://${host}`;
    }
    return (process.env.API_URL ?? `http://localhost:${process.env.API_PORT ?? 3001}`).replace(
      /\/$/,
      '',
    );
  }

  saveFile(
    file: Express.Multer.File,
    req?: {
      protocol?: string;
      get?: (name: string) => string | undefined;
      headers?: Record<string, unknown>;
    },
  ) {
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

    const baseUrl = this.publicBaseUrl(req);
    return {
      filename,
      url: `${baseUrl}/uploads/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
