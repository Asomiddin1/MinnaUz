import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Readable } from 'stream';

export interface StorageUpload {
  buffer: Buffer;
  contentType: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl?: string;
  private readonly apiPublicUrl?: string;

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || '';
    this.publicBaseUrl = this.config.get<string>('AWS_S3_PUBLIC_BASE_URL');
    this.apiPublicUrl = this.config.get<string>('API_PUBLIC_URL');
    this.client = new S3Client({
      region: this.region,
      endpoint: this.config.get<string>('AWS_S3_ENDPOINT') || undefined,
      forcePathStyle: this.config.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true',
      credentials:
        this.config.get<string>('AWS_ACCESS_KEY_ID') &&
        this.config.get<string>('AWS_SECRET_ACCESS_KEY')
          ? {
              accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
              secretAccessKey: this.config.getOrThrow<string>(
                'AWS_SECRET_ACCESS_KEY',
              ),
            }
          : undefined,
    });
  }

  async upload(file: StorageUpload): Promise<{ key: string; url: string }> {
    this.ensureConfigured();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
        Body: file.buffer,
        ContentType: file.contentType,
      }),
    );

    return { key: file.key, url: this.getObjectUrl(file.key) };
  }

  async download(
    key: string,
  ): Promise<{ body: Readable; contentType?: string; contentLength?: number }> {
    this.ensureConfigured();
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );

    if (!response.Body) {
      throw new NotFoundException('Storage fayli topilmadi');
    }

    return {
      body: response.Body as Readable,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    this.ensureConfigured();
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(key: string): Promise<void> {
    this.ensureConfigured();
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getObjectUrl(key: string): string {
    this.ensureConfigured();
    if (this.apiPublicUrl) {
      return `${this.apiPublicUrl.replace(/\/+$/, '')}/api/upload/download?key=${encodeURIComponent(key)}`;
    }
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private ensureConfigured(): void {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is required');
    }
  }
}
