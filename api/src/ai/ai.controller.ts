import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AiService,
  ExplainMistakeResponse,
  GeneratedDokkaiResponse,
  KaiwaResponse,
  TranslateResult,
} from './ai.service';
import { TranslateDto } from './dto/translate.dto';
import { KaiwaMessageDto } from './dto/kaiwa.dto';
import { ExplainMistakeDto } from './dto/explain.dto';
import { GenerateDokkaiDto } from './dto/dokkai.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Yaponcha va Oʻzbekcha matnlarni sunʼiy intellekt orqali tarjima qilish',
  })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli tarjima' })
  async translate(@Body() dto: TranslateDto): Promise<TranslateResult> {
    return this.aiService.translate(dto.text, dto.direction);
  }

  @Post('kaiwa')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Darslikdagi 5-qadamli AI Sensei bilan interaktiv muloqot',
  })
  @ApiResponse({ status: 200, description: 'AI Sensei javobi va tahlili' })
  async chatKaiwa(
    @Body() dto: KaiwaMessageDto,
    @CurrentUser('id') userId?: string,
  ): Promise<KaiwaResponse> {
    return this.aiService.chatKaiwa(dto, userId);
  }

  @Post('explain-mistake')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test savolidagi xato javobni AI orqali tushuntirish',
  })
  @ApiResponse({ status: 200, description: 'Xatoning tushuntirilishi' })
  async explainMistake(
    @Body() dto: ExplainMistakeDto,
  ): Promise<ExplainMistakeResponse> {
    return this.aiService.explainMistake(dto);
  }

  @Post('generate-dokkai')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Yangi Dokkai (oʻqish) matni va testini AI orqali generatsiya qilish',
  })
  @ApiResponse({ status: 200, description: 'Generatsiya qilingan matn' })
  async generateDokkai(
    @Body() dto: GenerateDokkaiDto,
  ): Promise<GeneratedDokkaiResponse> {
    return this.aiService.generateDokkai(dto);
  }
}
