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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

const uploadDir = join(process.cwd(), 'uploads', 'videos');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const audioUploadDir = join(process.cwd(), 'uploads', 'audio');
if (!existsSync(audioUploadDir)) {
  mkdirSync(audioUploadDir, { recursive: true });
}

const imageUploadDir = join(process.cwd(), 'uploads', 'images');
if (!existsSync(imageUploadDir)) {
  mkdirSync(imageUploadDir, { recursive: true });
}

@ApiTags('Fayl Yuklash (Uploads)')
@Controller('upload')
export class UploadController {
  @Post('video')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Dars uchun video yuklash (MP4, WebM, MOV)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `video-${uniqueSuffix}${ext}`);
        },
      }),
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
  uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Fayl tanlanmadi');
    }
    const relativeUrl = `/uploads/videos/${file.filename}`;
    return {
      success: true,
      url: relativeUrl,
      originalName: file.originalname,
      size: file.size,
      filename: file.filename,
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, audioUploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `audio-${uniqueSuffix}${ext}`);
        },
      }),
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
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max audio limit (covers 40-50 min JLPT listening audio)
      },
    }),
  )
  uploadAudio(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Audio fayl tanlanmadi');
    }
    const relativeUrl = `/uploads/audio/${file.filename}`;
    return {
      success: true,
      url: relativeUrl,
      originalName: file.originalname,
      size: file.size,
      filename: file.filename,
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
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, imageUploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `img-${uniqueSuffix}${ext}`);
        },
      }),
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
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB max image limit
      },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Rasm fayli tanlanmadi');
    }
    const relativeUrl = `/uploads/images/${file.filename}`;
    return {
      success: true,
      url: relativeUrl,
      originalName: file.originalname,
      size: file.size,
      filename: file.filename,
    };
  }
}
