import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from '../tests/dto/admin-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Teacher Portal - Testlar & Savollar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('teacher/tests')
export class TeacherTestsController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @ApiOperation({ summary: 'Oʻqituvchining testlari roʻyxati' })
  async getTests(@CurrentUser() user: any) {
    return this.teacherService.getTeacherTests(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta test va uning savollari' })
  async getTestById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.getTestById(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi test yaratish' })
  async createTest(@Body() dto: CreateTestDto, @CurrentUser() user: any) {
    return this.teacherService.createTest(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Test maʼlumotlarini yangilash' })
  async updateTest(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateTest(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Testni oʻchirish' })
  async deleteTest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teacherService.deleteTest(id, user.id);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Testga yangi savol qoʻshish' })
  async createQuestion(
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.createQuestion(id, user.id, dto);
  }

  @Put('questions/:questionId')
  @ApiOperation({ summary: 'Savolni tahrirlash' })
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.updateQuestion(questionId, user.id, dto);
  }

  @Delete('questions/:questionId')
  @ApiOperation({ summary: 'Savolni oʻchirish' })
  async deleteQuestion(
    @Param('questionId') questionId: string,
    @CurrentUser() user: any,
  ) {
    return this.teacherService.deleteQuestion(questionId, user.id);
  }
}
