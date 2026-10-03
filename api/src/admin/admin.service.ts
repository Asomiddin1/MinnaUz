import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Role } from '../auth/roles.enum';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  // 1. Get Users with Search, Role Filter, and Pagination
  async getUsers(query: UserQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sessions: true },
          },
        },
      }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        role: u.role,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        activeDevicesCount: u._count.sessions,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 2. Get User Stats
  async getUserStats() {
    const [
      totalUsers,
      verifiedUsers,
      superAdmins,
      admins,
      teachers,
      standardUsers,
      activeSessions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.user.count({ where: { role: Role.SUPER_ADMIN } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
      this.prisma.user.count({ where: { role: Role.USER } }),
      this.prisma.deviceSession.count(),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      totalAdmins: superAdmins + admins,
      superAdmins,
      admins,
      teachers,
      standardUsers,
      activeSessions,
    };
  }

  // 3. Get User By ID with Sessions
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { lastActiveAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      sessions: user.sessions.map((s) => ({
        id: s.id,
        deviceId: s.deviceId,
        deviceName: s.deviceName,
        os: s.os,
        browser: s.browser,
        ipAddress: s.ipAddress,
        lastActiveAt: s.lastActiveAt,
        createdAt: s.createdAt,
      })),
    };
  }

  // 4. Create User
  async createUser(dto: CreateUserDto, currentUser: any) {
    if (
      (dto.role === Role.ADMIN || dto.role === Role.SUPER_ADMIN) &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Adminlarni faqat Super Admin yarata oladi yoki tayinlay oladi',
      );
    }

    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException(
        'Ushbu email bilan allaqachon foydalanuvchi roʻyxatdan oʻtgan',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName?.trim(),
        role: dto.role || Role.USER,
        isVerified: dto.isVerified ?? false,
      },
    });

    this.logger.log(
      `[Admin] Yangi foydalanuvchi yaratildi: ${email} (${user.role})`,
    );

    return user;
  }

  // 5. Update User
  async updateUser(id: string, dto: UpdateUserDto, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (
      dto.role !== undefined &&
      (dto.role === Role.ADMIN || dto.role === Role.SUPER_ADMIN) &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Faqat Super Admin foydalanuvchini Admin qilib tayinlay oladi',
      );
    }

    if (
      (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) &&
      currentUser?.role !== Role.SUPER_ADMIN &&
      currentUser?.id !== user.id
    ) {
      throw new ForbiddenException(
        'Admin hisoblarini faqat Super Admin tahrirlashi mumkin',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName?.trim() : undefined,
        role: dto.role !== undefined ? dto.role : undefined,
        isVerified: dto.isVerified !== undefined ? dto.isVerified : undefined,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
      },
    });

    this.logger.log(
      `[Admin] Foydalanuvchi yangilandi: ${updated.email} (${updated.role})`,
    );

    return updated;
  }

  // 6. Delete User
  async deleteUser(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException(
        'Oʻzingizning hisobingizni oʻchira olmaysiz',
      );
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (
      (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Admin hisoblarini faqat Super Admin oʻchira oladi',
      );
    }

    if (user.role === Role.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException(
          'Yagona Super Admin hisobini oʻchirish taqiqlanadi',
        );
      }
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`[Admin] Foydalanuvchi oʻchirildi: ${user.email}`);

    return {
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli oʻchirildi',
    };
  }

  // 7. Revoke User Device Session
  async revokeUserDevice(userId: string, deviceId: string) {
    const deleted = await this.prisma.deviceSession.deleteMany({
      where: { userId, deviceId },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Qurilma sessiyasi topilmadi');
    }

    return {
      success: true,
      message: 'Qurilma sessiyasi bekor qilindi',
    };
  }
}
