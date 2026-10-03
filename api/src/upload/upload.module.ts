import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { SupabaseStorageService } from './supabase-storage.service';
import { CloudflareR2StorageService } from './cloudflare-r2-storage.service';
import { STORAGE_SERVICE } from './storage.interface';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [
    CloudflareR2StorageService,
    SupabaseStorageService,
    {
      provide: STORAGE_SERVICE,
      useExisting: CloudflareR2StorageService,
    },
  ],
  exports: [
    CloudflareR2StorageService,
    SupabaseStorageService,
    STORAGE_SERVICE,
  ],
})
export class UploadModule {}
