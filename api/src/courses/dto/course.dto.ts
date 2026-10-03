import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogStudyTimeDto {
  @ApiPropertyOptional({
    description: 'Oʻrganishga sarflangan daqiqalar (1-120)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  minutes?: number;
}

export class UpdateProgressDto {
  @ApiPropertyOptional({
    description: 'Tugatilgan boʻlimlar roʻyxati',
    example: ['kotoba', 'bunpou', 'kanji'],
  })
  @IsOptional()
  @IsArray()
  completedSections?: string[];

  @ApiPropertyOptional({
    description: 'Renshuu test bali (0-100)',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  quizScore?: number;

  @ApiPropertyOptional({
    description: 'Dars toʻliq tugatilganmi',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'Kurs nomi', example: 'Minna no Nihongo I (N5)' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Kurs slugi', example: 'minna-no-nihongo-1' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Kurs tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Kurs darajasi', example: 'N5' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Muqova rasmi URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Kurs muallifi (Oʻqituvchi ID)' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Nashr qilinganmi', example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateModuleDto {
  @ApiProperty({
    description: 'Modul nomi',
    example: '1-5 darslar: Tanishtiruv va asoslar',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Modul tavsifi' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateLessonDto {
  @ApiProperty({
    description: 'Dars nomi',
    example: '1-dars: Oʻzini tanishtirish',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Yaponcha sarlavha', example: '第1課' })
  @IsOptional()
  @IsString()
  japaneseTitle?: string;

  @ApiPropertyOptional({ description: 'Slug', example: 'lesson-1' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Video havola (YouTube va h.k.)' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Dars qisqacha mazmuni' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: 'AI suhbat ssenariysi (JSON)' })
  @IsOptional()
  kaiwaScenario?: any;

  @ApiPropertyOptional({ description: 'Tartib raqami', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({
    description: 'Dars bepulmi (hamma uchun)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Nashr qilinganmi', example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class SaveStudyPlanDto {
  @ApiPropertyOptional({ description: 'Maqsad darajasi', example: 'N5' })
  @IsOptional()
  @IsString()
  targetLevel?: string;

  @ApiPropertyOptional({ description: 'Haftalik maqsad soatlarda', example: 5 })
  @IsOptional()
  @IsNumber()
  weeklyGoalHours?: number;

  @ApiPropertyOptional({
    description: 'Kunlik maqsad daqiqalarda',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  dailyMinutes?: number;

  @ApiPropertyOptional({ description: 'Maqsad muddati (oylarda)', example: 3 })
  @IsOptional()
  @IsNumber()
  targetMonths?: number;

  @ApiPropertyOptional({ description: 'Reja sozlanganligi', example: true })
  @IsOptional()
  @IsBoolean()
  isConfigured?: boolean;
}

export class ToggleFlashcardDto {
  @ApiProperty({ description: 'Kotoba (Lugʻat) ID', example: 'uuid' })
  @IsString()
  kotobaId: string;

  @ApiPropertyOptional({
    description:
      'Flashcard holati: LEARNING (yodlanayotgan) yoki MASTERED (yodlangan)',
    enum: ['LEARNING', 'MASTERED'],
    example: 'LEARNING',
  })
  @IsOptional()
  @IsEnum(['LEARNING', 'MASTERED'])
  status?: 'LEARNING' | 'MASTERED';
}

export class BatchFlashcardDto {
  @ApiProperty({ description: 'Kotoba ID lari roʻyxati' })
  @IsArray()
  @IsString({ each: true })
  kotobaIds: string[];

  @ApiPropertyOptional({
    description: 'Holat: LEARNING yoki MASTERED',
    enum: ['LEARNING', 'MASTERED'],
    example: 'LEARNING',
  })
  @IsOptional()
  @IsEnum(['LEARNING', 'MASTERED'])
  status?: 'LEARNING' | 'MASTERED';
}

export class ToggleKanjiFlashcardDto {
  @ApiProperty({ description: 'Kanji ID' })
  @IsString()
  kanjiId: string;

  @ApiPropertyOptional({
    description: 'Flashcard holati: LEARNING yoki MASTERED',
    enum: ['LEARNING', 'MASTERED'],
    example: 'LEARNING',
  })
  @IsOptional()
  @IsEnum(['LEARNING', 'MASTERED'])
  status?: 'LEARNING' | 'MASTERED';
}

export class BatchKanjiFlashcardDto {
  @ApiProperty({ description: 'Kanji ID lari roʻyxati' })
  @IsArray()
  @IsString({ each: true })
  kanjiIds: string[];

  @ApiPropertyOptional({
    description: 'Holat: LEARNING yoki MASTERED',
    enum: ['LEARNING', 'MASTERED'],
    example: 'LEARNING',
  })
  @IsOptional()
  @IsEnum(['LEARNING', 'MASTERED'])
  status?: 'LEARNING' | 'MASTERED';
}
