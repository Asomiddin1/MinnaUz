import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminTeachersService } from './admin-teachers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Admin Panel - Oʻqituvchilar Boshqaruvi (Teachers Management)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/teachers')
export class AdminTeachersController {
  constructor(private readonly adminTeachersService: AdminTeachersService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha oʻqituvchilar roʻyxati va statistikasi' })
  async getTeachers() {
    return this.adminTeachersService.getTeachers();
  }

  @Post(':userId/assign-role')
  @ApiOperation({ summary: 'Foydalanuvchiga TEACHER rolini berish' })
  async assignTeacherRole(@Param('userId') userId: string) {
    return this.adminTeachersService.assignTeacherRole(userId);
  }

  @Post(':userId/remove-role')
  @ApiOperation({
    summary: 'Oʻqituvchi rolini bekor qilish (USER ga qaytarish)',
  })
  async removeTeacherRole(@Param('userId') userId: string) {
    return this.adminTeachersService.removeTeacherRole(userId);
  }

  @Patch('assign-course')
  @ApiOperation({ summary: 'Kursni oʻqituvchiga biriktirish' })
  async assignCourseToTeacher(
    @Body('courseId') courseId: string,
    @Body('teacherId') teacherId: string,
  ) {
    return this.adminTeachersService.assignCourseToTeacher(courseId, teacherId);
  }

  // === LESSON DELETION REQUESTS ===
  @Get('deletion-requests')
  @ApiOperation({
    summary: 'Oʻqituvchilar tomonidan yuborilgan dars oʻchirish soʻrovlari',
  })
  async getDeletionRequests() {
    return this.adminTeachersService.getDeletionRequests();
  }

  @Post('deletion-requests/:lessonId/approve')
  @ApiOperation({
    summary: 'Darsni oʻchirish soʻrovini tasdiqlash (Bazadan oʻchirish)',
  })
  async approveLessonDeletion(@Param('lessonId') lessonId: string) {
    return this.adminTeachersService.approveLessonDeletion(lessonId);
  }

  @Post('deletion-requests/:lessonId/reject')
  @ApiOperation({ summary: 'Darsni oʻchirish soʻrovini rad etish' })
  async rejectLessonDeletion(@Param('lessonId') lessonId: string) {
    return this.adminTeachersService.rejectLessonDeletion(lessonId);
  }
}
