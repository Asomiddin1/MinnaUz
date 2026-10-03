import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { CoursesService } from './courses.service';
import {
  UpdateProgressDto,
  LogStudyTimeDto,
  SaveStudyPlanDto,
  ToggleFlashcardDto,
  BatchFlashcardDto,
  ToggleKanjiFlashcardDto,
  BatchKanjiFlashcardDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Kurslar va Darslar (Courses & Lessons)')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: any): string | undefined {
    try {
      if (req.user?.id) return req.user.id;
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify<JwtPayload>(token);
        return payload?.sub;
      }
    } catch {
      // ignore invalid/expired tokens — treated as anonymous
    }
    return undefined;
  }

  @Get('user/stats')
  @ApiOperation({
    summary:
      'Foydalanuvchining oʻrganish statistikasi (streak, oʻrganilgan soʻzlar, darslar)',
  })
  async getUserStats(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getUserStats(userId);
  }

  @Post('user/study-time')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchi platformada oʻtkazgan oʻrganish vaqtini saqlash',
  })
  async logStudyTime(
    @CurrentUser('id') userId: string,
    @Body() dto: LogStudyTimeDto,
  ) {
    return this.coursesService.logStudyTime(userId, dto.minutes ?? 1);
  }

  @Get('user/study-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining shaxsiy oʻrganish rejasini olish',
  })
  async getStudyPlan(@CurrentUser('id') userId: string) {
    return this.coursesService.getUserStudyPlan(userId);
  }

  @Post('user/study-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Foydalanuvchining shaxsiy oʻrganish rejasini saqlash yoki yangilash',
  })
  async saveStudyPlan(
    @CurrentUser('id') userId: string,
    @Body() body: SaveStudyPlanDto,
  ) {
    return this.coursesService.saveUserStudyPlan(userId, body);
  }

  // === VOCABULARY & FLASHCARDS ===
  @Get('vocab/all')
  @ApiOperation({
    summary: 'Foydalanuvchiga ochiq boʻlgan barcha kurslar lugʻatlarini olish',
  })
  async getAllVocab(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getAllUserVocab(userId);
  }

  @Get('vocab/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lugʻat va flashcard statistikasi (yodlangan / yodlanayotgan)',
  })
  async getVocabStats(@CurrentUser('id') userId: string) {
    return this.coursesService.getVocabStats(userId);
  }

  @Post('vocab/flashcards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soʻzni flashcardga qoʻshish yoki holatini almashtirish',
  })
  async toggleFlashcard(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleFlashcardDto,
  ) {
    return this.coursesService.setFlashcardStatus(
      userId,
      dto.kotobaId,
      dto.status,
    );
  }

  @Post('vocab/flashcards/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bir nechta soʻzlarni birvarakay flashcardga qoʻshish',
  })
  async batchAddFlashcards(
    @CurrentUser('id') userId: string,
    @Body() dto: BatchFlashcardDto,
  ) {
    return this.coursesService.batchAddFlashcards(
      userId,
      dto.kotobaIds,
      dto.status,
    );
  }

  @Delete('vocab/flashcards/:kotobaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soʻzni flashcard toʻplamidan olib tashlash' })
  async removeFlashcard(
    @CurrentUser('id') userId: string,
    @Param('kotobaId') kotobaId: string,
  ) {
    return this.coursesService.removeFlashcard(userId, kotobaId);
  }

  @Post('vocab/flashcards/batch-remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bir nechta soʻzlarni birvarakay flashcard toʻplamidan chiqarish',
  })
  async batchRemoveFlashcards(
    @CurrentUser('id') userId: string,
    @Body() dto: BatchFlashcardDto,
  ) {
    return this.coursesService.batchRemoveFlashcards(userId, dto.kotobaIds);
  }

  // === KANJI & FLASHCARDS ===
  @Get('kanji/all')
  @ApiOperation({
    summary: 'Foydalanuvchiga ochiq boʻlgan barcha kurslar Kanjilarini olish',
  })
  async getAllKanji(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getAllUserKanji(userId);
  }

  @Get('kanji/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kanji va flashcard statistikasi (yodlangan / yodlanayotgan)',
  })
  async getKanjiStats(@CurrentUser('id') userId: string) {
    return this.coursesService.getKanjiStats(userId);
  }

  @Post('kanji/flashcards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kanjini flashcardga qoʻshish yoki holatini almashtirish',
  })
  async toggleKanjiFlashcard(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleKanjiFlashcardDto,
  ) {
    return this.coursesService.setKanjiFlashcardStatus(
      userId,
      dto.kanjiId,
      dto.status,
    );
  }

  @Post('kanji/flashcards/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bir nechta Kanjilarni birvarakay flashcardga qoʻshish',
  })
  async batchAddKanjiFlashcards(
    @CurrentUser('id') userId: string,
    @Body() dto: BatchKanjiFlashcardDto,
  ) {
    return this.coursesService.batchAddKanjiFlashcards(
      userId,
      dto.kanjiIds,
      dto.status,
    );
  }

  @Delete('kanji/flashcards/:kanjiId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kanjini flashcard toʻplamidan olib tashlash' })
  async removeKanjiFlashcard(
    @CurrentUser('id') userId: string,
    @Param('kanjiId') kanjiId: string,
  ) {
    return this.coursesService.removeKanjiFlashcard(userId, kanjiId);
  }

  @Post('kanji/flashcards/batch-remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bir nechta Kanjilarni birvarakay flashcard toʻplamidan chiqarish',
  })
  async batchRemoveKanjiFlashcards(
    @CurrentUser('id') userId: string,
    @Body() dto: BatchKanjiFlashcardDto,
  ) {
    return this.coursesService.batchRemoveKanjiFlashcards(userId, dto.kanjiIds);
  }

  @Get()
  @ApiOperation({
    summary: 'Barcha kurslar roʻyxatini olish (oʻzlashtirish progressi bilan)',
  })
  async getCourses(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getCourses(userId);
  }

  @Get(':idOrSlug')
  @ApiOperation({
    summary: 'Bitta kurs tafsilotlari, modullar va darslar xaritasi (Roadmap)',
  })
  async getCourseDetails(@Param('idOrSlug') idOrSlug: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getCourseDetails(idOrSlug, userId);
  }

  @Get(':courseId/lessons/:lessonId')
  @ApiOperation({
    summary:
      'Dars tafsilotlari va 5 ta boʻlim kontenti (Kotoba, Bunpou, Kanji, Renshuu, Kaiwa)',
  })
  async getLesson(@Param('lessonId') lessonId: string, @Req() req: any) {
    const userId = this.extractUserId(req);
    return this.coursesService.getLesson(lessonId, userId);
  }

  @Post(':courseId/lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dars boʻlimi yoki test natijasi progressini saqlash',
  })
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.coursesService.updateProgress(userId, lessonId, dto);
  }
}
