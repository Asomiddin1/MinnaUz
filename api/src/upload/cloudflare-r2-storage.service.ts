import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  IStorageService,
  StorageCategory,
  PresignedUploadResult,
} from './storage.interface';

@Injectable()
export class CloudflareR2StorageService implements IStorageService {
  private readonly logger = new Logger(CloudflareR2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  // Categories considered public by default
  private readonly publicCategories: Set<StorageCategory> = new Set([
    'images',
    'avatars',
  ]);

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucketName = this.config.get<string>('R2_BUCKET', 'minnauz-storage');
    this.publicBaseUrl = this.config.get<string>(
      'R2_PUBLIC_URL',
      'https://media.minnauz.uz',
    );

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `Cloudflare R2 Storage initialized (bucket: ${this.bucketName}, endpoint: https://${accountId}.r2.cloudflarestorage.com)`,
    );

    if (
      this.publicBaseUrl.includes('<') ||
      this.publicBaseUrl === 'https://media.minnauz.uz' ||
      !this.publicBaseUrl.startsWith('https://')
    ) {
      this.logger.warn(
        'R2_PUBLIC_URL sozlanmagan yoki placeholder qiymatida! ' +
          'Cloudflare Dashboard > R2 > minnauz-storage > Settings > Public Access dan URL oling ' +
          'va R2_PUBLIC_URL env varini yangilang. Public fayllar (rasmlar, avatarlar) ko\'rinmasligi mumkin.',
      );
    }
  }

  isPublicCategory(category: StorageCategory): boolean {
    return this.publicCategories.has(category);
  }

  sanitizeFilename(name: string): string {
    return name
      .trim()
      .replace(/[/\\]/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  generateObjectKey(
    category: StorageCategory,
    originalFilename: string,
  ): { objectKey: string; sanitizedName: string; fileUuid: string } {
    const fileUuid = randomUUID();
    const sanitizedName = this.sanitizeFilename(originalFilename);
    const objectKey = `${category}/${fileUuid}/${sanitizedName}`;
    return { objectKey, sanitizedName, fileUuid };
  }

  async createPresignedUploadUrl(
    category: StorageCategory,
    originalFilename: string,
    mimetype: string,
    expiresIn = 900, // 15 daqiqa
  ): Promise<PresignedUploadResult> {
    if (!originalFilename) {
      throw new BadRequestException('Fayl nomi kiritilishi shart');
    }

    const { objectKey } = this.generateObjectKey(category, originalFilename);
    const isPublic = this.isPublicCategory(category);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        ContentType: mimetype,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const result: PresignedUploadResult = {
        uploadUrl,
        objectKey,
        isPublic,
        expiresIn,
      };

      if (isPublic) {
        result.publicUrl = this.getPublicUrl(objectKey);
      }

      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Presigned upload URL yaratishda xatolik [${objectKey}]: ${msg}`,
      );
      throw new InternalServerErrorException(
        'Upload URL yaratishda xatolik yuz berdi',
      );
    }
  }

  async createPresignedDownloadUrl(
    objectKey: string,
    expiresIn = 1800, // 30 daqiqa
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Presigned download URL yaratishda xatolik [${objectKey}]: ${msg}`,
      );
      throw new InternalServerErrorException(
        'Fayl yuklab olish havolasini yaratishda xatolik',
      );
    }
  }

  getPublicUrl(objectKey: string): string {
    const cleanBase = this.publicBaseUrl.replace(/\/+$/, '');
    const cleanKey = objectKey.replace(/^\/+/, '');
    return `${cleanBase}/${cleanKey}`;
  }

  async exists(objectKey: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
        }),
      );
      return true;
    } catch (error: unknown) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
        message?: string;
      };
      if (err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.warn(
        `R2 exists check xatosi [${objectKey}]: ${err?.message}`,
      );
      return false;
    }
  }

  async upload(
    category: StorageCategory,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const objectKey = filename.includes('/')
      ? filename
      : `${category}/${randomUUID()}/${this.sanitizeFilename(filename)}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
          Body: buffer,
          ContentType: mimetype,
        }),
      );

      return this.isPublicCategory(category)
        ? this.getPublicUrl(objectKey)
        : objectKey;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `R2 to'g'ridan-to'g'ri upload xatosi [${objectKey}]: ${msg}`,
      );
      throw new InternalServerErrorException(
        "Fayl yuklanmadi, qaytadan urinib ko'ring",
      );
    }
  }

  // Alias for backward compatibility
  async uploadFile(
    category: StorageCategory,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    return this.upload(category, filename, buffer, mimetype);
  }

  async delete(
    category: StorageCategory,
    objectKeyOrFilename: string,
  ): Promise<void> {
    const objectKey = objectKeyOrFilename.startsWith(`${category}/`)
      ? objectKeyOrFilename
      : `${category}/${objectKeyOrFilename}`;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: objectKey,
        }),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`R2 delete xatosi [${objectKey}]: ${msg}`);
    }
  }

  // Alias for backward compatibility
  async deleteFile(category: StorageCategory, filename: string): Promise<void> {
    return this.delete(category, filename);
  }

  extractFilename(urlOrKey: string, category?: StorageCategory): string | null {
    if (!urlOrKey) return null;

    try {
      // 1. Agar to'g'ridan-to'g'ri key bo'lsa (masalan: videos/uuid/name.mp4)
      if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) {
        return urlOrKey;
      }

      const url = new URL(urlOrKey);

      // 2. Agar eski Supabase URL bo'lsa
      if (category && url.pathname.includes(`/object/public/${category}/`)) {
        const marker = `/object/public/${category}/`;
        const idx = url.pathname.indexOf(marker);
        if (idx !== -1) {
          return `${category}/${url.pathname.slice(idx + marker.length)}`;
        }
      }

      // 3. Agar R2 CDN/Public URL bo'lsa (masalan: https://media.minnauz.uz/images/...)
      const cleanPath = url.pathname.replace(/^\/+/, '');
      return cleanPath || null;
    } catch {
      return null;
    }
  }
}
