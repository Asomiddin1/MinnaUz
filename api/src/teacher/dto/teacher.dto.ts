import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestDeleteLessonDto {
  @ApiProperty({ description: 'Darsni oʻchirish soʻrovi sababi' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateTeacherFeedbackDto {
  @ApiProperty({ description: 'Oʻquvchi ID raqami' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Kurs ID raqami' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Dars ID raqami' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Fikr mavzusi' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Oʻqituvchining tahliliy izohi yoki tavsiyasi' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({ description: 'Baho (1 dan 5 gacha)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}

export class CreateTeacherAnnouncementDto {
  @ApiProperty({ description: 'Kurs ID raqami' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Eʼlon sarlavhasi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Eʼlon matni' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
