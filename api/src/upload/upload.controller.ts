import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { SupabaseStorageService } from './supabase-storage.service';

@ApiTags('Fayl Yuklash (Uploads)')
@Controller('upload')
export class UploadController {
  constructor(private readonly storage: SupabaseStorageService) {}

  @Post('video')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Dars uchun video yuklash (MP4, WebM, MOV)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/x-matroska',
        ];
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
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fayl tanlanmadi');
    const ext = extname(file.originalname).toLowerCase();
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const url = await this.storage.uploadFile('videos', filename, file.buffer, file.mimetype);
    return { success: true, url, originalName: file.originalname, size: file.size, filename };
  }

  @Post('audio')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Choukai yoki dars uchun audio yuklash (MP3, M4A, WAV, OGG, AAC)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
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
        ];
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
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Audio fayl tanlanmadi');
    const ext = extname(file.originalname).toLowerCase();
    const filename = `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const url = await this.storage.uploadFile('audio', filename, file.buffer, file.mimetype);
    return { success: true, url, originalName: file.originalname, size: file.size, filename };
  }

  @Post('image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Banner yoki rasm yuklash (JPEG, PNG, WebP, GIF, SVG)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
          'image/jpg',
        ];
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
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Rasm fayli tanlanmadi');
    const ext = extname(file.originalname).toLowerCase();
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const url = await this.storage.uploadFile('images', filename, file.buffer, file.mimetype);
    return { success: true, url, originalName: file.originalname, size: file.size, filename };
  }
}
