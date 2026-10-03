import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CourseLevel, TestCategory } from '@prisma/client';

export class CreateTestDto {
  @ApiProperty({ example: 'JLPT N5 Toʻliq Mock Imtihon #3' })
  @IsString()
  @IsNotEmpty({ message: 'Test nomi boʻsh boʻlmasligi kerak' })
  title: string;

  @ApiProperty({ example: 'jlpt-n5-mock-3' })
  @IsString()
  @IsNotEmpty({ message: 'Slug boʻsh boʻlmasligi kerak' })
  slug: string;

  @ApiPropertyOptional({ example: 'N5 daraja toʻliq mock imtihoni' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.N5 })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiPropertyOptional({ enum: TestCategory, default: TestCategory.MOCK_EXAM })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiProperty({ example: 105 })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsOptional()
  @IsInt()
  passingScore?: number;

  @ApiPropertyOptional({ example: 180, default: 180 })
  @IsOptional()
  @IsInt()
  totalScore?: number;

  @ApiPropertyOptional({ example: 'https://example.com/audio.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Bogʻlangan kurs ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Muallif ID' })
  @IsOptional()
  @IsString()
  authorId?: string;
}

export class UpdateTestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ enum: TestCategory })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  passingScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;
}

export class CreateQuestionDto {
  @ApiProperty({
    example: 'MODULE_1_VOCAB',
    description: 'MODULE_1_VOCAB, MODULE_2_GRAMMAR_READING, MODULE_3_LISTENING',
  })
  @IsString()
  @IsNotEmpty()
  section: string;

  @ApiPropertyOptional({ example: '問題1: 漢字の 読み方' })
  @IsOptional()
  @IsString()
  mondaiTitle?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  questionNumber: number;

  @ApiProperty({ example: '毎朝、しんぶんを 読みます。' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiPropertyOptional({ example: 'Matn yoki dialog konteksti' })
  @IsOptional()
  @IsString()
  contextText?: string;

  @ApiProperty({ example: ['まいあさ', 'まいばん', 'まいあざ', 'まいしゅう'] })
  @IsArray()
  options: string[];

  @ApiProperty({ example: 'まいあさ' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiPropertyOptional({ example: 'Oʻzbekcha tushuntirish va grammatik qoida' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 3, default: 3 })
  @IsOptional()
  @IsInt()
  points?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mondaiTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  questionNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  questionText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  points?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}
