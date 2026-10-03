import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';

export { CreateNotificationDto };

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string, role?: string) {
    const audienceFilter = ['ALL'];
    if (role === 'USER' || role === 'STUDENT') {
      audienceFilter.push('USER');
    } else if (role === 'TEACHER') {
      audienceFilter.push('TEACHER');
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      audienceFilter.push('USER', 'TEACHER');
    }

    const notifications = await (this.prisma as any).notification.findMany({
      where: {
        isPublished: true,
        OR: [
          { audience: { in: audienceFilter } },
          { audience: 'INDIVIDUAL', targetUserId: userId },
        ],
      },
      include: {
        userReceipts: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n: any) => {
      const receipt = n.userReceipts?.[0];
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        content: n.content,
        imageUrl: n.imageUrl,
        videoUrl: n.videoUrl,
        actionUrl: n.actionUrl,
        actionText: n.actionText,
        audience: n.audience,
        type: n.type,
        createdAt: n.createdAt,
        isRead: !!receipt?.isRead,
        readAt: receipt?.readAt || null,
      };
    });
  }

  async getUnreadCount(userId: string, role?: string) {
    const notifications = await this.getUserNotifications(userId, role);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { unreadCount };
  }

  async getNotificationById(id: string, userId?: string) {
    const notification = await (this.prisma as any).notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Xabarnoma topilmadi');
    }

    if (userId) {
      try {
        await this.markAsRead(userId, id);
      } catch {
        // ignore
      }
    }

    return {
      ...notification,
      isRead: true,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    await (this.prisma as any).userNotification.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      update: {
        isRead: true,
        readAt: new Date(),
      },
      create: {
        userId,
        notificationId,
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string, role?: string) {
    const notifications = await this.getUserNotifications(userId, role);
    const updates = notifications.map((n) =>
      (this.prisma as any).userNotification.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId: n.id,
          },
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
        create: {
          userId,
          notificationId: n.id,
          isRead: true,
          readAt: new Date(),
        },
      }),
    );

    await this.prisma.$transaction(updates);
    return { success: true };
  }

  async getAllNotificationsAdmin() {
    const notifications = await (this.prisma as any).notification.findMany({
      include: {
        userReceipts: true,
        banners: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      content: n.content,
      imageUrl: n.imageUrl,
      videoUrl: n.videoUrl,
      actionUrl: n.actionUrl,
      actionText: n.actionText,
      audience: n.audience,
      targetUserId: n.targetUserId,
      type: n.type,
      isPublished: n.isPublished,
      createdAt: n.createdAt,
      readCount: (n.userReceipts || []).filter((r: any) => r.isRead).length,
      hasBanner: (n.banners || []).length > 0,
    }));
  }

  async createNotification(dto: CreateNotificationDto) {
    const notification = await (this.prisma as any).notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        content: dto.content || null,
        imageUrl: dto.imageUrl || null,
        videoUrl: dto.videoUrl || null,
        actionUrl: dto.actionUrl || null,
        actionText: dto.actionText || null,
        audience: dto.audience || 'ALL',
        targetUserId: dto.targetUserId || null,
        type: dto.type || 'ANNOUNCEMENT',
        isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      },
    });

    // If requested to create a corresponding Banner simultaneously
    if (dto.createBanner) {
      const highest = await (this.prisma as any).banner.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const nextOrder = (highest?.order ?? 0) + 1;

      await (this.prisma as any).banner.create({
        data: {
          title: dto.title,
          desc: dto.message,
          tag: dto.bannerTag || (dto.type === 'PROMO' ? 'Aksiya' : 'Eʼlon'),
          tagIcon: dto.videoUrl ? 'PlayCircle' : 'Sparkles',
          image: dto.bannerImage || dto.imageUrl || '/banner_art.png',
          btnText:
            dto.actionText ||
            (dto.videoUrl ? 'Videoni koʻrish' : 'Batafsil oʻqish'),
          btnIcon: dto.videoUrl ? 'PlayCircle' : 'ArrowRight',
          actionType: 'NOTIFICATION_DETAIL',
          notificationId: notification.id,
          order: nextOrder,
          isActive: true,
          isDismissible: true,
          targetAudience:
            dto.audience === 'TEACHER'
              ? 'TEACHER'
              : dto.audience === 'USER'
                ? 'USER'
                : 'ALL',
        },
      });
    }

    return notification;
  }

  async deleteNotification(id: string) {
    const existing = await (this.prisma as any).notification.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Xabarnoma topilmadi');
    }

    await (this.prisma as any).notification.delete({
      where: { id },
    });
    return { success: true, message: "Xabarnoma o'chirildi" };
  }
}
