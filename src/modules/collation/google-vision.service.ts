import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { parseEc8aOcrText, type VisionExtract } from './ocr-ec8a-parse';

const VISION_TIMEOUT_MS = 25_000;

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: ImageAnnotatorClient | null = null;

  constructor(private config: ConfigService) {
    this.client = this.createClient();
  }

  isConfigured() {
    return this.client != null;
  }

  async extractEc8a(photoUrls: string[], partyCodes: string[]): Promise<VisionExtract> {
    if (!this.client) {
      return {
        fields: {},
        partyResults: {},
        confidence: null,
        unreadable: true,
        error: 'Google Cloud Vision is not configured',
      };
    }

    const buffers: Buffer[] = [];
    for (const url of photoUrls) {
      const file = await this.readPhoto(url);
      if (file) buffers.push(file);
    }

    if (buffers.length === 0) {
      return {
        fields: {},
        partyResults: {},
        confidence: null,
        unreadable: true,
        error: 'EC8A photo file was not found on disk',
      };
    }

    const texts: string[] = [];
    for (const content of buffers) {
      const text = await this.detectText(content);
      if (text) texts.push(text);
    }

    if (texts.length === 0) {
      return {
        fields: {},
        partyResults: {},
        confidence: null,
        unreadable: true,
        error: 'Google Cloud Vision returned no text',
      };
    }

    return parseEc8aOcrText(texts.join('\n'), partyCodes);
  }

  private createClient(): ImageAnnotatorClient | null {
    const json =
      this.config.get<string>('GOOGLE_CLOUD_VISION_CREDENTIALS') ??
      this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS_JSON');
    const keyFile =
      this.config.get<string>('GOOGLE_APPLICATION_CREDENTIALS') ??
      this.config.get<string>('GOOGLE_CLOUD_VISION_KEYFILE');
    const projectId = this.config.get<string>('GOOGLE_CLOUD_PROJECT');

    try {
      if (json?.trim()) {
        const credentials = JSON.parse(json) as { project_id?: string; client_email?: string };
        this.logger.log('Google Cloud Vision initialized from JSON credentials');
        return new ImageAnnotatorClient({
          projectId: projectId || credentials.project_id,
          credentials,
        });
      }
      if (keyFile && existsSync(keyFile)) {
        this.logger.log('Google Cloud Vision initialized from key file');
        return new ImageAnnotatorClient({
          projectId,
          keyFilename: keyFile,
        });
      }
    } catch (error) {
      this.logger.error({ err: error }, 'Failed to initialize Google Cloud Vision');
      return null;
    }

    this.logger.warn(
      'Google Cloud Vision is not configured; set GOOGLE_CLOUD_VISION_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS',
    );
    return null;
  }

  private async detectText(content: Buffer): Promise<string | null> {
    if (!this.client) return null;
    try {
      const request = this.client.documentTextDetection({ image: { content } });
      const [result] = await Promise.race([
        request,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Vision timed out')), VISION_TIMEOUT_MS);
        }),
      ]);
      const text = result.fullTextAnnotation?.text?.trim();
      if (text) return text;
      return result.textAnnotations?.[0]?.description?.trim() || null;
    } catch (error) {
      this.logger.warn({ err: error }, 'Google Cloud Vision documentTextDetection failed');
      return null;
    }
  }

  private async readPhoto(url: string): Promise<Buffer | null> {
    const filename = this.filenameFromUrl(url);
    if (!filename) return null;
    const fullPath = join(process.cwd(), 'uploads', filename);
    if (!existsSync(fullPath)) return null;
    if (filename.toLowerCase().endsWith('.pdf')) {
      this.logger.warn({ filename }, 'PDF EC8A OCR is not enabled yet; use a photo');
      return null;
    }
    return readFile(fullPath);
  }

  private filenameFromUrl(url: string): string | null {
    const marker = '/uploads/';
    const index = url.lastIndexOf(marker);
    const raw = index >= 0 ? url.slice(index + marker.length) : basename(url);
    const filename = raw.split('?')[0]?.split('#')[0];
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return null;
    }
    return filename;
  }
}
