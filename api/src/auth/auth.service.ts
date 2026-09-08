import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { randomUUID } from 'crypto';
import { Role, User } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

const MAX_DEVICES = 3;
const MAX_OTP_ATTEMPTS = 5;
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ||
  '1d') as JwtSignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  '30d') as JwtSignOptions['expiresIn'];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private storage: StorageService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // 1. Send 6-digit OTP code to email
  async sendOtp(dto: SendOtpDto) {
    const email = dto.email.toLowerCase().trim();

    // Invalidate old unverified OTP codes for this email
    await this.prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send real email via SMTP if configured
    await this.mailService.sendOtpEmail(email, code);

    return {
      success: true,
      message: 'Tasdiqlash kodi emailga yuborildi',
      expiresInSeconds: 300,
      // For development testing ease, code can be inspected in terminal/logs
      devCode: process.env.NODE_ENV === 'development' ? code : undefined,
    };
  }

  // ADMIN_EMAIL env'da ko'rsatilgan email SUPER_ADMIN rolini oladi
  private resolveRole(email: string): Role {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    return adminEmail && adminEmail === email ? Role.SUPER_ADMIN : Role.USER;
  }

  private async ensureAdminRole(user: User): Promise<User> {
    if (
      this.resolveRole(user.email) === Role.SUPER_ADMIN &&
      user.role !== Role.SUPER_ADMIN
    ) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { role: Role.SUPER_ADMIN },
      });
    }
    return user;
  }

  // 2. Verify OTP & Register/Login with Device Session
  async verifyOtp(dto: VerifyOtpDto, req: Request) {
    const email = dto.email.toLowerCase().trim();
    const code = dto.code.trim();

    // Check OTP validity
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException("Noto'g'ri yoki eskirgan tasdiqlash kodi");
    }

    if (otp.code !== code) {
      const attempts = otp.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts, used: attempts >= MAX_OTP_ATTEMPTS },
      });
      throw new BadRequestException("Noto'g'ri yoki eskirgan tasdiqlash kodi");
    }

    // Mark OTP as used
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Find or create User
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          isVerified: true,
          role: this.resolveRole(email),
        },
      });
    } else {
      if (!user.isVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
      }
      user = await this.ensureAdminRole(user);
    }

    return this.createDeviceSession(user, dto.deviceName, req);
  }

  // 3. Google OAuth Login
  async googleAuth(dto: GoogleAuthDto, req: Request) {
    let email: string | undefined;
    let fullName: string | undefined;
    let avatarUrl: string | undefined;

    try {
      if (
        process.env.NODE_ENV === 'development' &&
        (dto.token === 'google-mock-token' || dto.token.startsWith('dev-'))
      ) {
        // Fallback for local dev testing only
        email = 'google.user@example.com';
        fullName = 'Google Test User';
        avatarUrl = undefined;
      } else {
        // 1. Try Google ID Token verification
        if (process.env.GOOGLE_CLIENT_ID) {
          try {
            const ticket = await this.googleClient.verifyIdToken({
              idToken: dto.token,
              audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (payload?.email) {
              email = payload.email.toLowerCase();
              fullName = payload.name;
              avatarUrl = payload.picture;
            }
          } catch (idErr: any) {
            this.logger.warn(
              `ID Token xatosi (${idErr.message}), UserInfo API orqali tekshirilmoqda...`,
            );
          }
        }

        // 2. Try Google UserInfo API (supports access_token)
        if (!email) {
          try {
            const res = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: { Authorization: `Bearer ${dto.token}` },
              },
            );
            if (res.ok) {
              const userInfo = await res.json();
              if (userInfo?.email) {
                email = userInfo.email.toLowerCase();
                fullName = userInfo.name;
                avatarUrl = userInfo.picture;
              }
            }
          } catch (fetchErr: any) {
            this.logger.warn(`UserInfo fetch xatosi: ${fetchErr.message}`);
          }
        }

        // 3. Try TokenInfo endpoint
        if (!email) {
          try {
            const res = await fetch(
              `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.token}`,
            );
            if (res.ok) {
              const tokenInfo = await res.json();
              if (tokenInfo?.email) {
                email = tokenInfo.email.toLowerCase();
                fullName = tokenInfo.name;
                avatarUrl = tokenInfo.picture;
              }
            }
          } catch {}
        }

        if (!email) {
          throw new UnauthorizedException(
            "Google ma'lumotlari yaroqsiz yoki eskirgan",
          );
        }
      }
    } catch (err: any) {
      this.logger.error(`Google autentifikatsiyasida xatolik: ${err.message}`);
      throw new UnauthorizedException(
        "Google orqali autentifikatsiya muvaffaqiyatsiz bo'ldi",
      );
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName,
          avatarUrl,
          googleAvatarUrl: avatarUrl || null,
          isVerified: true,
          role: this.resolveRole(email),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName || user.fullName,
          avatarUrl: avatarUrl || user.avatarUrl,
          googleAvatarUrl: avatarUrl || user.googleAvatarUrl,
          isVerified: true,
        },
      });
      user = await this.ensureAdminRole(user);
    }

    return this.createDeviceSession(user, dto.deviceName, req);
  }

  // 4. Device Manager: Create / Enforce Max 3 Active Devices
  private async createDeviceSession(
    user: any,
    customDeviceName: string | undefined,
    req: Request,
  ) {
    const uaHeader = req.headers['user-agent'] || '';
    const parser = new UAParser(uaHeader);
    const uaResult = parser.getResult();

    const os = uaResult.os.name
      ? `${uaResult.os.name} ${uaResult.os.version || ''}`.trim()
      : 'Nomaʼlum OS';
    const browser = uaResult.browser.name
      ? `${uaResult.browser.name} ${uaResult.browser.version || ''}`.trim()
      : 'Nomaʼlum Brauzer';
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const deviceName = customDeviceName || `${browser} on ${os}`;
    const deviceId = randomUUID();

    // Generate Tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Enforce device limit and save new session atomically
    const session = await this.prisma.$transaction(async (tx) => {
      const existingSessions = await tx.deviceSession.findMany({
        where: { userId: user.id },
        orderBy: { lastActiveAt: 'asc' },
      });

      // If max device limit reached (>= 3), remove oldest session(s)
      if (existingSessions.length >= MAX_DEVICES) {
        const sessionIdsToRemove = existingSessions
          .slice(0, existingSessions.length - MAX_DEVICES + 1)
          .map((s) => s.id);
        await tx.deviceSession.deleteMany({
          where: { id: { in: sessionIdsToRemove } },
        });
      }

      return tx.deviceSession.create({
        data: {
          userId: user.id,
          deviceId,
          deviceName,
          os,
          browser,
          ipAddress,
          refreshToken: hashedRefreshToken,
          lastActiveAt: new Date(),
        },
      });
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      device: {
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        os: session.os,
        browser: session.browser,
        ipAddress: session.ipAddress,
        lastActiveAt: session.lastActiveAt,
      },
    };
  }

  // 5. Refresh tokens (rotate refresh token for the device session)
  async refreshTokens(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken);
    } catch {
      throw new UnauthorizedException(
        "Refresh token yaroqsiz yoki muddati o'tgan",
      );
    }

    if (!payload.deviceId) {
      throw new UnauthorizedException('Refresh token yaroqsiz');
    }

    const session = await this.prisma.deviceSession.findUnique({
      where: { deviceId: payload.deviceId },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Sessiya topilmadi yoki bekor qilingan');
    }

    const tokenMatches = await bcrypt.compare(
      dto.refreshToken,
      session.refreshToken,
    );
    if (!tokenMatches) {
      // Possible token reuse — revoke the session
      await this.prisma.deviceSession.delete({ where: { id: session.id } });
      throw new UnauthorizedException(
        'Sessiya xavfsizlik sababli bekor qilindi. Qaytadan kiring.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    const newPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId: session.deviceId,
    };

    const accessToken = this.jwtService.sign(newPayload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(newPayload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    await this.prisma.deviceSession.update({
      where: { id: session.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastActiveAt: new Date(),
      },
    });

    return { accessToken, refreshToken };
  }

  // 6. Get User's Active Devices List (Device Manager)
  async getUserDevices(userId: string, currentDeviceId?: string) {
    const sessions = await this.prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        os: true,
        browser: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.deviceId === currentDeviceId,
    }));
  }

  // 6. Revoke a specific device session
  async revokeDevice(userId: string, deviceId: string) {
    const session = await this.prisma.deviceSession.findFirst({
      where: { userId, deviceId },
    });

    if (!session) {
      throw new NotFoundException('Qurilma sessiyasi topilmadi');
    }

    await this.prisma.deviceSession.delete({
      where: { id: session.id },
    });

    return {
      success: true,
      message: 'Qurilma sessiyasi bekor qilindi',
    };
  }

  // 7. Logout (Delete current device session)
  async logout(userId: string, deviceId?: string) {
    if (deviceId) {
      await this.prisma.deviceSession.deleteMany({
        where: { userId, deviceId },
      });
    }
    return {
      success: true,
      message: 'Tizimdan muvaffaqiyatli chiqildi',
    };
  }

  // 8. Upload Profile Avatar (Single image, deletes old local avatar)
  async uploadAvatar(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException('Rasm fayli tanlanmadi');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Delete old uploaded avatar if it was a local file
    await this.deleteStoredFile(user.avatarUrl);

    // Retain existing google url if not set
    const googleAvatarUrl =
      user.googleAvatarUrl ||
      (user.avatarUrl?.includes('googleusercontent.com') ? user.avatarUrl : null);

    const uploaded = await this.storage.upload({
      key: `avatars/${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: uploaded.url,
        googleAvatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        googleAvatarUrl: true,
        avatarFrame: true,
        coins: true,
        role: true,
        isVerified: true,
      },
    });

    return updated;
  }

  // 9. Select Google Avatar as default
  async selectGoogleAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const googlePic =
      user.googleAvatarUrl ||
      (user.avatarUrl?.includes('googleusercontent.com') ? user.avatarUrl : null);

    if (!googlePic) {
      throw new BadRequestException('Google hisobi rasmi mavjud emas');
    }

    // Delete previous custom avatar file if present
    await this.deleteStoredFile(user.avatarUrl);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: googlePic,
        googleAvatarUrl: googlePic,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        googleAvatarUrl: true,
        avatarFrame: true,
        coins: true,
        role: true,
        isVerified: true,
      },
    });

    return updated;
  }

  // 10. Remove avatar (Revert to default initials)
  async removeAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Delete previous custom avatar file if present
    await this.deleteStoredFile(user.avatarUrl);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        googleAvatarUrl: true,
        avatarFrame: true,
        coins: true,
        role: true,
        isVerified: true,
      },
    });

    return updated;
  }

  private async deleteStoredFile(url?: string | null): Promise<void> {
    if (!url) return;
    const keyParam = '/api/upload/download?key=';
    const keyIndex = url.indexOf(keyParam);
    if (keyIndex !== -1) {
      const key = decodeURIComponent(url.slice(keyIndex + keyParam.length));
      if (key) await this.storage.delete(key);
      return;
    }
    const marker = '.amazonaws.com/';
    const index = url.indexOf(marker);
    if (index === -1) return;
    const key = url.slice(index + marker.length);
    if (key) await this.storage.delete(key);
  }

  // 11. Update Profile (Name)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName:
          dto.fullName !== undefined
            ? dto.fullName.trim() || null
            : user.fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        googleAvatarUrl: true,
        avatarFrame: true,
        coins: true,
        role: true,
        isVerified: true,
      },
    });

    return updated;
  }
}
