import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { RequestDeleteLessonDto } from './dto/teacher.dto';
import { CreateModuleDto, CreateLessonDto } from '../courses/dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Teacher Portal - Kurslar & Darslar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('teacher/courses')
export class TeacherCoursesController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @ApiOperation({
    summary: 'Oʻqituvchiga biriktirilgan barcha kurslar roʻyxati',
  })
  async getCourses(@CurrentUser() user: any) {
    return this.teacherService.getCourses(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta kurs detallari va barcha modullari' })
  async getCourseById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.getCourseById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kurs maʼlumotlarini yangilash' })
  async updateCourse(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateCourse(id, user.id, dto);
  }

  // === MODULES ===
  @Post(':id/modules')
  @ApiOperation({ summary: 'Kursga yangi modul qoʻshish' })
  async createModule(
    @Param('id') id: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.createModule(id, user.id, dto);
  }

  @Patch(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Modul nomini/tartibini tahrirlash' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: Partial<CreateModuleDto>,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateModule(moduleId, user.id, dto);
  }

  @Delete(':id/modules/:moduleId')
  @ApiOperation({ summary: 'Boʻsh modulni oʻchirish' })
  async deleteModule(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.deleteModule(moduleId, user.id);
  }

  // === LESSONS ===
  @Post(':id/modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Modulga yangi dars yaratish' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.createLesson(moduleId, user.id, dto);
  }

  @Patch(':id/lessons/:lessonId')
  @ApiOperation({
    summary: 'Darsni tahrirlash (video, pdf, summary, publish/unpublish)',
  })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateLesson(lessonId, user.id, dto);
  }

  // === LESSON DELETION REQUEST (ADMIN APPROVAL REQUIRED) ===
  @Post(':id/lessons/:lessonId/request-delete')
  @ApiOperation({
    summary:
      'Darsni oʻchirish soʻrovini Adminga yuborish (Toʻgʻridan-toʻgʻri oʻchirish cheklangan)',
  })
  async requestDeleteLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: RequestDeleteLessonDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.requestDeleteLesson(lessonId, user.id, dto);
  }

  @Post(':id/lessons/:lessonId/cancel-delete')
  @ApiOperation({ summary: 'Darsni oʻchirish soʻrovini bekor qilish' })
  async cancelDeleteLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.cancelDeleteLessonRequest(lessonId, user.id);
  }

  // === LESSON CONTENT (KOTOBA, BUNPOU, KANJI, RENSHUU) ===
  @Get('lessons/:lessonId/content')
  @ApiOperation({
    summary:
      'Darsning toʻliq kontentini olish (Lugʻat, Grammatika, Kanji, Mashqlar)',
  })
  async getLessonContent(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.getLessonContent(lessonId, user.id);
  }

  // Kotoba
  @Post('lessons/:lessonId/kotoba')
  @ApiOperation({ summary: 'Darsga yangi soʻz qoʻshish' })
  async addKotoba(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.addKotoba(lessonId, user.id, dto);
  }

  @Patch('lessons/kotoba/:id')
  @ApiOperation({ summary: 'Soʻzni tahrirlash' })
  async updateKotoba(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateKotoba(id, user.id, dto);
  }

  @Delete('lessons/kotoba/:id')
  @ApiOperation({ summary: 'Soʻzni oʻchirish' })
  async deleteKotoba(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.deleteKotoba(id, user.id);
  }

  // Bunpou
  @Post('lessons/:lessonId/bunpou')
  @ApiOperation({ summary: 'Darsga grammatika qoidasi qoʻshish' })
  async addBunpou(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.addBunpou(lessonId, user.id, dto);
  }

  @Patch('lessons/bunpou/:id')
  @ApiOperation({ summary: 'Grammatikani tahrirlash' })
  async updateBunpou(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateBunpou(id, user.id, dto);
  }

  @Delete('lessons/bunpou/:id')
  @ApiOperation({ summary: 'Grammatikani oʻchirish' })
  async deleteBunpou(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.deleteBunpou(id, user.id);
  }

  // Kanji
  @Post('lessons/:lessonId/kanji')
  @ApiOperation({ summary: 'Darsga kanji qoʻshish' })
  async addKanji(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.addKanji(lessonId, user.id, dto);
  }

  @Patch('lessons/kanji/:id')
  @ApiOperation({ summary: 'Kanjini tahrirlash' })
  async updateKanji(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateKanji(id, user.id, dto);
  }

  @Delete('lessons/kanji/:id')
  @ApiOperation({ summary: 'Kanjini oʻchirish' })
  async deleteKanji(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.deleteKanji(id, user.id);
  }

  // Renshuu
  @Post('lessons/:lessonId/renshuu')
  @ApiOperation({ summary: 'Darsga test/mashq savoli qoʻshish' })
  async addRenshuu(
    @Param('lessonId') lessonId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.addRenshuu(lessonId, user.id, dto);
  }

  @Patch('lessons/renshuu/:id')
  @ApiOperation({ summary: 'Mashq savolini tahrirlash' })
  async updateRenshuu(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateRenshuu(id, user.id, dto);
  }

  @Delete('lessons/renshuu/:id')
  @ApiOperation({ summary: 'Mashq savolini oʻchirish' })
  async deleteRenshuu(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.deleteRenshuu(id, user.id);
  }
}
