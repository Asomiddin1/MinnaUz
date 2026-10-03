import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import {
  CreateTeacherFeedbackDto,
  CreateTeacherAnnouncementDto,
} from './dto/teacher.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Teacher Portal - Boshqaruv & Talabalar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Oʻqituvchining asosiy statistikasi va oxirgi faolliklar',
  })
  async getStats(@CurrentUser() user: any) {
    return this.teacherService.getTeacherStats(user.id);
  }

  @Get('students')
  @ApiOperation({
    summary: 'Oʻqituvchining barcha talabalari roʻyxati va oʻzlashtirish foizi',
  })
  async getStudents(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
    @Query('search') search?: string,
  ) {
    return this.teacherService.getTeacherStudents(user.id, courseId, search);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Bitta talabaning toʻliq oʻqish tarixi va tahlili' })
  async getStudentDetail(
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.getStudentDetail(studentId, user.id);
  }

  @Post('students/feedback')
  @ApiOperation({
    summary: 'Talabaga shaxsiy fikr-mulohaza (Feedback) va baho yuborish',
  })
  async sendFeedback(
    @Body() dto: CreateTeacherFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.sendStudentFeedback(user.id, dto);
  }

  @Get('feedbacks')
  @ApiOperation({
    summary: 'Oʻqituvchi tomonidan yuborilgan barcha feedbacklar tarixi',
  })
  async getFeedbacks(
    @CurrentUser() user: any,
    @Query('studentId') studentId?: string,
  ) {
    return this.teacherService.getFeedbacks(user.id, studentId);
  }

  @Post('announcements')
  @ApiOperation({ summary: 'Kurs talabalariga eʼlon/xabarnoma yuborish' })
  async sendAnnouncement(
    @Body() dto: CreateTeacherAnnouncementDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.sendAnnouncement(user.id, dto);
  }
}
