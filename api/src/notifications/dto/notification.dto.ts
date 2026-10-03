import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Xabarnoma sarlavhasi',
    example: 'MinnaUz 2.0 yangilanishi',
  })
  @IsString({ message: "Sarlavha matn bo'lishi kerak" })
  @IsNotEmpty({ message: 'Sarlavha kiritilishi shart' })
  title: string;

  @ApiProperty({
    description: 'Xabarnoma qisqa matni',
    example: 'Platformaga yangi imkoniyatlar qoʻshildi.',
  })
  @IsString({ message: "Xabar matni bo'lishi kerak" })
  @IsNotEmpty({ message: 'Xabar kiritilishi shart' })
  message: string;

  @ApiPropertyOptional({ description: 'Batafsil matn (Markdown)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Rasm URL manzili' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Video URL manzili' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Harakat tugmasi havolasi' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Harakat tugmasi matni' })
  @IsOptional()
  @IsString()
  actionText?: string;

  @ApiPropertyOptional({
    enum: ['ALL', 'USER', 'TEACHER', 'INDIVIDUAL'],
    default: 'ALL',
    description: 'Qabul qiluvchilar auditoriyasi',
  })
  @IsOptional()
  @IsEnum(['ALL', 'USER', 'TEACHER', 'INDIVIDUAL'], {
    message: "Noto'g'ri auditoriya tanlandi",
  })
  audience?: 'ALL' | 'USER' | 'TEACHER' | 'INDIVIDUAL';

  @ApiPropertyOptional({
    description: 'Muayyan foydalanuvchi ID si (agar INDIVIDUAL boʻlsa)',
  })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional({
    enum: ['INFO', 'ANNOUNCEMENT', 'SYSTEM', 'UPDATE', 'PROMO'],
    default: 'ANNOUNCEMENT',
    description: 'Xabarnoma turi',
  })
  @IsOptional()
  @IsEnum(['INFO', 'ANNOUNCEMENT', 'SYSTEM', 'UPDATE', 'PROMO'], {
    message: "Noto'g'ri xabarnoma turi tanlandi",
  })
  type?: 'INFO' | 'ANNOUNCEMENT' | 'SYSTEM' | 'UPDATE' | 'PROMO';

  @ApiPropertyOptional({ description: 'Darhol nashr etilsinmi', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Bosh sahifa uchun banner ham biriktirilsinmi',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  createBanner?: boolean;

  @ApiPropertyOptional({ description: 'Banner tegi' })
  @IsOptional()
  @IsString()
  bannerTag?: string;

  @ApiPropertyOptional({ description: 'Banner rasmi' })
  @IsOptional()
  @IsString()
  bannerImage?: string;
}
