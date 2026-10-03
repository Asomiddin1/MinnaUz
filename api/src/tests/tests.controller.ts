import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { SubmitTestDto } from './dto/submit-test.dto';
import { QueryTestsDto } from './dto/query-tests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('JLPT Testlar (JLPT Tests & Mock Exams)')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Barcha JLPT testlar roʻyxati (filtrlash bilan)' })
  async getTests(
    @Query() query: QueryTestsDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.testsService.findAll(userId, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining JLPT test topshirish statistikasi',
  })
  async getStats(@CurrentUser('id') userId: string) {
    return this.testsService.getStats(userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining topshirgan JLPT testlari tarixi',
  })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.testsService.getUserHistory(userId, limit);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Bitta test maʼlumotlari va savollari (slug yoki ID boʻyicha)',
  })
  async getTestBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.testsService.findBySlugOrId(slug, userId);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test javoblarini topshirish va baholash' })
  async submitTest(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitTestDto,
  ) {
    return this.testsService.submitTest(id, userId, dto);
  }

  @Get('results/:resultId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oldin topshirilgan test natijasi tafsilotlari' })
  async getResult(
    @Param('resultId') resultId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.testsService.getResultById(resultId, userId);
  }
}
