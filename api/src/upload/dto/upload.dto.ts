import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import type { StorageCategory } from '../storage.interface';

export class CreatePresignedUrlDto {
  @ApiProperty({ description: 'Faylning asl nomi', example: 'dars-1.mp4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @ApiProperty({ description: 'Faylning MIME-type turi', example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty({ description: 'Fayl hajmi baytlarda', example: 10485760 })
  @IsNumber()
  @Min(1)
  size: number;

  @ApiProperty({
    description: 'Fayl kategoriyasi/prefixi',
    enum: ['videos', 'audio', 'images', 'avatars', 'documents', 'materials'],
    example: 'videos',
  })
  @IsEnum(['videos', 'audio', 'images', 'avatars', 'documents', 'materials'])
  category: StorageCategory;
}

export class CompleteUploadDto {
  @ApiProperty({ description: 'Bazada yaratilgan fayl ID si' })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}
