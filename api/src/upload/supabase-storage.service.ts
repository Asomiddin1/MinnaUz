import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudflareR2StorageService } from './cloudflare-r2-storage.service';
import type { StorageCategory, StorageBucket } from './storage.interface';

export type { StorageBucket, StorageCategory };

/**
 * Backward compatibility wrapper around CloudflareR2StorageService.
 * Replaces old Supabase Storage while preserving existing method signatures.
 */
@Injectable()
export class SupabaseStorageService extends CloudflareR2StorageService {
  constructor(config: ConfigService) {
    super(config);
  }
}
