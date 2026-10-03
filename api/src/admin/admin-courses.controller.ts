import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCoursesService } from './admin-courses.service';
import {
  CreateCourseDto,
  CreateModuleDto,
  CreateLessonDto,
} from '../courses/dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Admin Panel - Kurslar va Darslar Boshqaruvi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly adminCoursesService: AdminCoursesService) {}

  // === TEACHERS LIST ===
  @Get('teachers')
  @ApiOperation({
    summary:
      'Oʻqituvchilar va Adminlar roʻyxatini olish (Kurs muallifi tanlash uchun)',
  })
  async getTeachers() {
    return this.adminCoursesService.getTeachers();
  }

  // === COURSES ===
  @Get()
  @ApiOperation({ summary: 'Barcha kurslar roʻyxatini olish (Admin/Teacher)' })
  async getAllCourses(@CurrentUser() user: any) {
    return this.adminCoursesService.getAllCourses(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta kurs tafsilotlari va modullari' })
  async getCourseById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminCoursesService.getCourseById(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi kurs yaratish' })
  async createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.adminCoursesService.createCourse(dto, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Kursni tahrirlash' })
  async updateCourse(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCourseDto>,
    @CurrentUser() user: any,
  ) {
    return this.adminCoursesService.updateCourse(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kursni oʻchirish' })
  async deleteCourse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminCoursesService.deleteCourse(id, user.id, user.role);
  }

  // === MODULES ===
  @Post(':courseId/modules')
  @ApiOperation({ summary: 'Kursga yangi modul qoʻshish' })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.adminCoursesService.createModule(courseId, dto);
  }

  @Patch(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Modulni tahrirlash' })
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: Partial<CreateModuleDto>,
  ) {
    return this.adminCoursesService.updateModule(moduleId, dto);
  }

  @Delete(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Modulni oʻchirish' })
  async deleteModule(@Param('moduleId') moduleId: string) {
    return this.adminCoursesService.deleteModule(moduleId);
  }

  // === LESSONS ===
  @Post(':courseId/modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Modulga yangi dars qoʻshish' })
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.adminCoursesService.createLesson(moduleId, dto);
  }

  @Patch(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Darsni tahrirlash' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: Partial<CreateLessonDto> & { isPublished?: boolean },
  ) {
    return this.adminCoursesService.updateLesson(lessonId, dto);
  }

  @Delete(':courseId/lessons/:lessonId')
  @ApiOperation({ summary: 'Darsni oʻchirish' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.adminCoursesService.deleteLesson(lessonId);
  }

  // === CONTENT SECTIONS ===
  @Get(':courseId/lessons/:lessonId/content')
  @ApiOperation({
    summary:
      'Darsning toʻliq kontentini (Kotoba, Bunpou, Kanji, Renshuu) olish',
  })
  async getLessonContent(@Param('lessonId') lessonId: string) {
    return this.adminCoursesService.getLessonContent(lessonId);
  }

  @Post(':courseId/lessons/:lessonId/kotoba')
  @ApiOperation({ summary: 'Kotoba soʻz qoʻshish / tahrirlash' })
  async saveKotoba(@Param('lessonId') lessonId: string, @Body() data: any) {
    return this.adminCoursesService.saveKotobaItem(lessonId, data);
  }

  @Delete(':courseId/lessons/:lessonId/kotoba/:id')
  @ApiOperation({ summary: 'Kotoba soʻzini oʻchirish' })
  async deleteKotoba(@Param('id') id: string) {
    return this.adminCoursesService.deleteKotobaItem(id);
  }

  @Post(':courseId/lessons/:lessonId/bunpou')
  @ApiOperation({ summary: 'Bunpou qoidasini qoʻshish / tahrirlash' })
  async saveBunpou(@Param('lessonId') lessonId: string, @Body() data: any) {
    return this.adminCoursesService.saveBunpouItem(lessonId, data);
  }

  @Delete(':courseId/lessons/:lessonId/bunpou/:id')
  @ApiOperation({ summary: 'Bunpou qoidasini oʻchirish' })
  async deleteBunpou(@Param('id') id: string) {
    return this.adminCoursesService.deleteBunpouItem(id);
  }

  @Post(':courseId/lessons/:lessonId/kanji')
  @ApiOperation({ summary: 'Kanji iyeroglifini qoʻshish / tahrirlash' })
  async saveKanji(@Param('lessonId') lessonId: string, @Body() data: any) {
    return this.adminCoursesService.saveKanjiItem(lessonId, data);
  }

  @Delete(':courseId/lessons/:lessonId/kanji/:id')
  @ApiOperation({ summary: 'Kanji iyeroglifini oʻchirish' })
  async deleteKanji(@Param('id') id: string) {
    return this.adminCoursesService.deleteKanjiItem(id);
  }

  @Post(':courseId/lessons/:lessonId/renshuu')
  @ApiOperation({ summary: 'Renshuu mashqini qoʻshish / tahrirlash' })
  async saveRenshuu(@Param('lessonId') lessonId: string, @Body() data: any) {
    return this.adminCoursesService.saveRenshuuItem(lessonId, data);
  }

  @Delete(':courseId/lessons/:lessonId/renshuu/:id')
  @ApiOperation({ summary: 'Renshuu mashqini oʻchirish' })
  async deleteRenshuu(@Param('id') id: string) {
    return this.adminCoursesService.deleteRenshuuItem(id);
  }
}
