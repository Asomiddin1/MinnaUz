import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerItemDto {
  @ApiProperty({ example: 'question-uuid' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ example: 'わたし' })
  @IsString()
  selectedAnswer: string;
}

export class SubmitTestDto {
  @ApiProperty({ type: [AnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];

  @ApiProperty({ example: 3420, description: 'Sarflangan vaqt (soniyalarda)' })
  @IsOptional()
  @IsInt()
  timeSpentSeconds?: number;
}
