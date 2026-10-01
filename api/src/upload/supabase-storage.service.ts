import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type StorageBucket = 'videos' | 'audio' | 'images' | 'avatars';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.supabase = createClient(url, key);
  }

  async uploadFile(
    bucket: StorageBucket,
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload xatosi [${bucket}/${filename}]: ${error.message}`);
      throw new InternalServerErrorException('Fayl yuklanmadi, qaytadan urinib ko\'ring');
    }

    return this.getPublicUrl(bucket, filename);
  }

  getPublicUrl(bucket: StorageBucket, filename: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  async deleteFile(bucket: StorageBucket, filename: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([filename]);
    if (error) {
      this.logger.warn(`Supabase delete xatosi [${bucket}/${filename}]: ${error.message}`);
    }
  }

  extractFilename(publicUrl: string, bucket: StorageBucket): string | null {
    try {
      const url = new URL(publicUrl);
      const marker = `/object/public/${bucket}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      return url.pathname.slice(idx + marker.length);
    } catch {
      return null;
    }
  }
}
