import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';
import { CloudflareR2StorageService } from './cloudflare-r2-storage.service';
import { StorageCategory } from './storage.interface';
import { CreatePresignedUrlDto, CompleteUploadDto } from './dto/upload.dto';
import { PrismaService } from '../prisma/prisma.service';

interface AuthUser {
  id: string;
  role: Role;
}

const CATEGORY_LIMITS: Record<StorageCategory, number> = {
  videos: 500 * 1024 * 1024, // 500 MB
  audio: 100 * 1024 * 1024, // 100 MB
  images: 20 * 1024 * 1024, // 20 MB
  avatars: 5 * 1024 * 1024, // 5 MB
  documents: 50 * 1024 * 1024, // 50 MB
  materials: 50 * 1024 * 1024, // 50 MB
};

const ALLOWED_MIMES: Record<StorageCategory, string[]> = {
  videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/jpg',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'text/plain',
  ],
  materials: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'application/zip',
  ],
};

@ApiTags('Fayl Yuklash (Cloudflare R2 Direct Upload)')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly storage: CloudflareR2StorageService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 1. Presigned Upload URL olish (Direct Upload boshlash)
   */
  @Post('presigned-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Direct Upload uchun Cloudflare R2 presigned URL olish va metadata yaratish',
  })
  async createPresignedUrl(
    @Body() dto: CreatePresignedUrlDto,
    @CurrentUser() user: AuthUser,
  ) {
    const { category, filename, mimetype, size } = dto;

    // 1. Huquq tekshiruvi: avatars - barcha userlar, qolgan kategoriyalar - ADMIN/TEACHER
    if (category !== 'avatars') {
      const isPrivileged = [
        Role.ADMIN,
        Role.SUPER_ADMIN,
        Role.TEACHER,
      ].includes(user?.role);
      if (!isPrivileged) {
        throw new ForbiddenException(
          'Ushbu kategoriyaga fayl yuklash uchun huquqingiz yetarli emas',
        );
      }
    }

    // 2. MIME tekshiruvi
    const allowedMimes = ALLOWED_MIMES[category] || [];
    if (!allowedMimes.includes(mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Ushbu fayl formati (${mimetype}) ruxsat etilmagan`,
      );
    }

    // 3. Hajm tekshiruvi
    const limit = CATEGORY_LIMITS[category];
    if (size > limit) {
      const limitMb = Math.round(limit / (1024 * 1024));
      throw new BadRequestException(
        `Fayl hajmi ruxsat etilgan limitdan oshib ketdi (Maksimal: ${limitMb} MB)`,
      );
    }

    // 4. Presigned PUT URL generatsiya qilish
    const presigned = await this.storage.createPresignedUploadUrl(
      category,
      filename,
      mimetype,
      900, // 15 daqiqa
    );

    const isPublic = this.storage.isPublicCategory(category);
    const bucket = this.config.get<string>('R2_BUCKET', 'minnauz-storage');

    // 5. PostgreSQL'da PENDING holatdagi StoredFile yozuvini yaratish
    const fileRecord = await this.prisma.storedFile.create({
      data: {
        userId: user?.id || null,
        originalName: filename,
        objectKey: presigned.objectKey,
        bucket,
        category,
        mimeType: mimetype,
        size,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
        status: 'PENDING',
        url: isPublic ? presigned.publicUrl : null,
      },
    });

    return {
      success: true,
      fileId: fileRecord.id,
      uploadUrl: presigned.uploadUrl,
      objectKey: presigned.objectKey,
      isPublic,
      publicUrl: presigned.publicUrl,
      expiresIn: presigned.expiresIn,
    };
  }

  /**
   * 2. Direct Upload yakunlangani haqida tasdiqlash
   */
  @Post('complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Direct Upload yakunlangach, R2 mavjudligini tekshirish va statusni COMPLETED qilish',
  })
  async completeUpload(
    @Body() dto: CompleteUploadDto,
    @CurrentUser() user: AuthUser,
  ) {
    const fileRecord = await this.prisma.storedFile.findUnique({
      where: { id: dto.fileId },
    });

    if (!fileRecord) {
      throw new NotFoundException('Fayl yozuvi topilmadi');
    }

    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(user?.role);
    if (fileRecord.userId && fileRecord.userId !== user?.id && !isAdmin) {
      throw new ForbiddenException("Ushbu faylni tasdiqlashga huquqingiz yo'q");
    }

    if (fileRecord.status === 'COMPLETED') {
      return {
        success: true,
        fileId: fileRecord.id,
        objectKey: fileRecord.objectKey,
        url: fileRecord.url,
        isPublic: fileRecord.visibility === 'PUBLIC',
      };
    }

    // R2 da fayl haqiqatda yuklanganligini tekshirish
    const exists = await this.storage.exists(fileRecord.objectKey);
    if (!exists) {
      throw new BadRequestException(
        "Fayl Cloudflare R2 saqlagichida topilmadi. Yuklash to'liq yakunlanmagan",
      );
    }

    const isPublic = fileRecord.visibility === 'PUBLIC';
    const publicUrl = isPublic
      ? this.storage.getPublicUrl(fileRecord.objectKey)
      : null;

    const updated = await this.prisma.storedFile.update({
      where: { id: fileRecord.id },
      data: {
        status: 'COMPLETED',
        url: publicUrl,
      },
    });

    return {
      success: true,
      fileId: updated.id,
      objectKey: updated.objectKey,
      url: updated.url,
      isPublic,
    };
  }

  /**
   * 3. Fayl yuklab olish / o'qish uchun havola (Private fayllar uchun Signed URL)
   */
  @Get('file/:id/download-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Fayl uchun kirish havolasini olish (Private fayllar uchun Signed URL qaytaradi)',
  })
  async getFileDownloadUrl(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const fileRecord = await this.prisma.storedFile.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      throw new NotFoundException('Fayl topilmadi');
    }

    // Agar ommaviy fayl bo'lsa, to'g'ridan-to'g'ri public URL beriladi
    if (fileRecord.visibility === 'PUBLIC') {
      return {
        success: true,
        url: fileRecord.url || this.storage.getPublicUrl(fileRecord.objectKey),
        isPublic: true,
      };
    }

    // Private fayllar uchun huquq tekshiruvi
    const isOwner = fileRecord.userId === user?.id;
    const isPrivileged = [Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER].includes(
      user?.role,
    );

    if (!isOwner && !isPrivileged && user?.role !== Role.USER) {
      throw new ForbiddenException("Ushbu faylga kirish huquqingiz yo'q");
    }

    // Qisqa muddatli Signed Download URL berish (30 daqiqa)
    const signedUrl = await this.storage.createPresignedDownloadUrl(
      fileRecord.objectKey,
      1800,
    );

    return {
      success: true,
      url: signedUrl,
      isPublic: false,
      expiresIn: 1800,
    };
  }

  /**
   * 4. Orphan (chala qolgan) fayllarni tozalash (Admin vazifasi)
   */
  @Post('cleanup-orphans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Chala qolgan (PENDING > 2 soat) fayllarni R2 va bazadan tozalash',
  })
  async cleanupOrphanFiles() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const orphans = await this.prisma.storedFile.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: twoHoursAgo },
      },
      take: 100,
    });

    let cleanedCount = 0;
    for (const orphan of orphans) {
      try {
        await this.storage.delete(
          orphan.category as StorageCategory,
          orphan.objectKey,
        );
        await this.prisma.storedFile.update({
          where: { id: orphan.id },
          data: { status: 'FAILED' },
        });
        cleanedCount++;
      } catch {
        // ignore single failure and continue
      }
    }

    return {
      success: true,
      cleanedCount,
      totalPendingExamined: orphans.length,
    };
  }

  // ==========================================
  // LEGACY BACKWARD COMPATIBILITY ENDPOINTS
  // ==========================================

  @Post('video')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Dars uchun video yuklash (Legacy Server-Upload)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ALLOWED_MIMES.videos;
        const allowedExt = /\.(mp4|webm|mov|mkv)$/i;
        if (
          allowedMimes.includes(file.mimetype) &&
          allowedExt.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Faqat video formatdagi fayllar (MP4, WebM, MOV) qabul qilinadi',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException('Fayl tanlanmadi');
    const { objectKey } = this.storage.generateObjectKey(
      'videos',
      file.originalname,
    );
    const key = await this.storage.upload(
      'videos',
      objectKey,
      file.buffer,
      file.mimetype,
    );

    const bucket = this.config.get<string>('R2_BUCKET', 'minnauz-storage');
    const stored = await this.prisma.storedFile.create({
      data: {
        userId: user?.id || null,
        originalName: file.originalname,
        objectKey,
        bucket,
        category: 'videos',
        mimeType: file.mimetype,
        size: file.size,
        visibility: 'PRIVATE',
        status: 'COMPLETED',
      },
    });

    return {
      success: true,
      fileId: stored.id,
      objectKey,
      url: key,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post('audio')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Audio yuklash (Legacy Server-Upload)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ALLOWED_MIMES.audio;
        const allowedExt = /\.(mp3|m4a|wav|aac|ogg|webm|flac)$/i;
        if (
          allowedMimes.includes(file.mimetype) ||
          allowedExt.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Faqat audio formatdagi fayllar (MP3, M4A, WAV, AAC, OGG) qabul qilinadi',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException('Audio fayl tanlanmadi');
    const { objectKey } = this.storage.generateObjectKey(
      'audio',
      file.originalname,
    );
    const key = await this.storage.upload(
      'audio',
      objectKey,
      file.buffer,
      file.mimetype,
    );

    const bucket = this.config.get<string>('R2_BUCKET', 'minnauz-storage');
    const stored = await this.prisma.storedFile.create({
      data: {
        userId: user?.id || null,
        originalName: file.originalname,
        objectKey,
        bucket,
        category: 'audio',
        mimeType: file.mimetype,
        size: file.size,
        visibility: 'PRIVATE',
        status: 'COMPLETED',
      },
    });

    return {
      success: true,
      fileId: stored.id,
      objectKey,
      url: key,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Post('image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Rasm yuklash (Legacy Server-Upload)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ALLOWED_MIMES.images;
        const allowedExt = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
        if (
          allowedMimes.includes(file.mimetype) ||
          allowedExt.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Faqat rasm formatdagi fayllar (JPEG, PNG, WebP, GIF, SVG) qabul qilinadi',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException('Rasm fayli tanlanmadi');
    const { objectKey } = this.storage.generateObjectKey(
      'images',
      file.originalname,
    );
    const url = await this.storage.upload(
      'images',
      objectKey,
      file.buffer,
      file.mimetype,
    );

    const bucket = this.config.get<string>('R2_BUCKET', 'minnauz-storage');
    const stored = await this.prisma.storedFile.create({
      data: {
        userId: user?.id || null,
        originalName: file.originalname,
        objectKey,
        bucket,
        category: 'images',
        mimeType: file.mimetype,
        size: file.size,
        visibility: 'PUBLIC',
        status: 'COMPLETED',
        url,
      },
    });

    return {
      success: true,
      fileId: stored.id,
      objectKey,
      url,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
