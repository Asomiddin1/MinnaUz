import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Admin Panel - Foydalanuvchilar (Users CRUD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/users')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Foydalanuvchilar statistikasi' })
  @ApiResponse({ status: 200, description: 'Statistika muvaffaqiyatli olindi' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get()
  @ApiOperation({
    summary: 'Foydalanuvchilar roʻyxati (Qidiruv, Filtr, Pagination)',
  })
  @ApiResponse({ status: 200, description: 'Foydalanuvchilar roʻyxati' })
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Bitta foydalanuvchi maʼlumotlari va faol sessiyalari',
  })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi maʼlumotlari' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yangi foydalanuvchi yaratish' })
  @ApiResponse({
    status: 201,
    description: 'Foydalanuvchi muvaffaqiyatli yaratildi',
  })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.adminService.createUser(dto, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Foydalanuvchi maʼlumotlarini tahrirlash' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi muvaffaqiyatli yangilandi',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.adminService.updateUser(id, dto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Foydalanuvchini oʻchirish' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi muvaffaqiyatli oʻchirildi',
  })
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.adminService.deleteUser(id, currentUserId);
  }

  @Delete(':id/devices/:deviceId')
  @ApiOperation({ summary: 'Foydalanuvchining qurilma sessiyasini toʻxtatish' })
  @ApiResponse({ status: 200, description: 'Qurilma sessiyasi oʻchirildi' })
  async revokeUserDevice(
    @Param('id') userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.adminService.revokeUserDevice(userId, deviceId);
  }
}
