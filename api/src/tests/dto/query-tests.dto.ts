import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CourseLevel, TestCategory } from '@prisma/client';

export class QueryTestsDto {
  @ApiPropertyOptional({
    enum: CourseLevel,
    description: 'JLPT darajasi (N5, N4, N3, N2, N1)',
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ enum: TestCategory, description: 'Test kategoriyasi' })
  @IsOptional()
  @IsEnum(TestCategory)
  category?: TestCategory;
}
