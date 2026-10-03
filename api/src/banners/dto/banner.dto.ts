import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({
    description: 'Banner sarlavhasi',
    example: 'MinnaUz 2.0 yangilanishi',
  })
  @IsString({ message: "Sarlavha matn bo'lishi kerak" })
  @IsNotEmpty({ message: 'Sarlavha kiritilishi shart' })
  title: string;

  @ApiProperty({
    description: 'Banner tavsifi',
    example: 'Platformadagi yangiliklar bilan tanishing',
  })
  @IsString({ message: "Tavsif matn bo'lishi kerak" })
  @IsNotEmpty({ message: 'Tavsif kiritilishi shart' })
  desc: string;

  @ApiPropertyOptional({ description: 'Teg matni', example: 'Yangilik' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Teg ikonka nomi', example: 'Sparkles' })
  @IsOptional()
  @IsString()
  tagIcon?: string;

  @ApiPropertyOptional({
    description: 'Banner rasmi URL',
    example: '/banner_art.png',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Tugma matni', example: 'Batafsil' })
  @IsOptional()
  @IsString()
  btnText?: string;

  @ApiPropertyOptional({
    description: 'Tugma havolasi (URL)',
    example: '/dashboard/courses',
  })
  @IsOptional()
  @IsString()
  btnUrl?: string;

  @ApiPropertyOptional({
    description: 'Tugma ikonka nomi',
    example: 'ArrowRight',
  })
  @IsOptional()
  @IsString()
  btnIcon?: string;

  @ApiPropertyOptional({
    enum: ['LINK', 'PLAN_MODAL', 'NOTIFICATION_DETAIL'],
    default: 'LINK',
    description: 'Harakat turi',
  })
  @IsOptional()
  @IsEnum(['LINK', 'PLAN_MODAL', 'NOTIFICATION_DETAIL'], {
    message: "Noto'g'ri harakat turi tanlandi",
  })
  actionType?: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';

  @ApiPropertyOptional({ description: 'Bogʻlangan xabarnoma ID si' })
  @IsOptional()
  @IsString()
  notificationId?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Banner faolligi', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Foydalanuvchi yopishi mumkinmi',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDismissible?: boolean;

  @ApiPropertyOptional({
    enum: ['ALL', 'USER', 'TEACHER'],
    default: 'ALL',
    description: 'Koʻrsatiladigan auditoriya',
  })
  @IsOptional()
  @IsEnum(['ALL', 'USER', 'TEACHER'], {
    message: "Noto'g'ri auditoriya tanlandi",
  })
  targetAudience?: 'ALL' | 'USER' | 'TEACHER';
}

export class UpdateBannerDto {
  @ApiPropertyOptional({ description: 'Banner sarlavhasi' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Banner tavsifi' })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({ description: 'Teg matni' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Teg ikonka nomi' })
  @IsOptional()
  @IsString()
  tagIcon?: string;

  @ApiPropertyOptional({ description: 'Banner rasmi URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'Tugma matni' })
  @IsOptional()
  @IsString()
  btnText?: string;

  @ApiPropertyOptional({ description: 'Tugma havolasi (URL)' })
  @IsOptional()
  @IsString()
  btnUrl?: string;

  @ApiPropertyOptional({ description: 'Tugma ikonka nomi' })
  @IsOptional()
  @IsString()
  btnIcon?: string;

  @ApiPropertyOptional({
    enum: ['LINK', 'PLAN_MODAL', 'NOTIFICATION_DETAIL'],
    description: 'Harakat turi',
  })
  @IsOptional()
  @IsEnum(['LINK', 'PLAN_MODAL', 'NOTIFICATION_DETAIL'])
  actionType?: 'LINK' | 'PLAN_MODAL' | 'NOTIFICATION_DETAIL';

  @ApiPropertyOptional({ description: 'Bogʻlangan xabarnoma ID si' })
  @IsOptional()
  @IsString()
  notificationId?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Banner faolligi' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Foydalanuvchi yopishi mumkinmi' })
  @IsOptional()
  @IsBoolean()
  isDismissible?: boolean;

  @ApiPropertyOptional({
    enum: ['ALL', 'USER', 'TEACHER'],
    description: 'Koʻrsatiladigan auditoriya',
  })
  @IsOptional()
  @IsEnum(['ALL', 'USER', 'TEACHER'])
  targetAudience?: 'ALL' | 'USER' | 'TEACHER';
}

export class ReorderBannersDto {
  @ApiProperty({
    type: [String],
    description: 'Banner identifikatorlari ketma-ketligi',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray({ message: 'bannerIds massiv boʻlishi kerak' })
  @IsString({ each: true, message: 'Har bir ID satr boʻlishi kerak' })
  bannerIds: string[];
}
