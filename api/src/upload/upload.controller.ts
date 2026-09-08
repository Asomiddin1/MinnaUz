import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Res,
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
import { extname } from 'path';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { StorageService } from '../storage/storage.service';

@ApiTags('Fayl Yuklash (Uploads)')
@Controller('upload')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

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
      limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max video limit
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Fayl tanlanmadi');
    }
    const key = `videos/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`;
    const uploaded = await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });
    return {
      success: true,
      ...uploaded,
      originalName: file.originalname,
      size: file.size,
      filename: key,
    };
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
          allowedMimes.includes(file.mimetype) &&
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
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max audio limit (covers 40-50 min JLPT listening audio)
      },
    }),
  )
  async uploadAudio(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Audio fayl tanlanmadi');
    }
    const key = `audio/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`;
    const uploaded = await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });
    return {
      success: true,
      ...uploaded,
      originalName: file.originalname,
      size: file.size,
      filename: key,
    };
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
          'image/jpg',
        ];
        const allowedExt = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (
          allowedMimes.includes(file.mimetype) &&
          allowedExt.test(file.originalname)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Faqat rasm formatdagi fayllar (JPEG, PNG, WebP, GIF) qabul qilinadi',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB max image limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Rasm fayli tanlanmadi');
    }
    const key = `images/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname).toLowerCase()}`;
    const uploaded = await this.storage.upload({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });
    return {
      success: true,
      ...uploaded,
      originalName: file.originalname,
      size: file.size,
      filename: key,
    };
  }

  @Get('download')
  @ApiOperation({ summary: 'S3 faylini vaqtinchalik signed URL orqali yuklab olish' })
  async download(@Query('key') key: string, @Res() res: Response) {
    if (!key || key.includes('..') || key.startsWith('/')) {
      throw new BadRequestException('Notoʻgʻri storage key');
    }
    const url = await this.storage.getDownloadUrl(key);
    return res.redirect(url);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'S3 faylini oʻchirish' })
  async delete(@Query('key') key: string) {
    if (!key || key.includes('..') || key.startsWith('/')) {
      throw new BadRequestException('Notoʻgʻri storage key');
    }
    await this.storage.delete(key);
    return { success: true };
  }
}
