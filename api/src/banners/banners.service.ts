import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { SupabaseStorageService } from '../upload/supabase-storage.service';

export { CreateBannerDto, UpdateBannerDto };

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private readonly supabaseStorage: SupabaseStorageService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAnnouncement();
  }

  async getPublicBanners(userRole?: string) {
    const audienceFilter = ['ALL'];
    if (userRole === 'USER' || userRole === 'STUDENT') {
      audienceFilter.push('USER');
    } else if (userRole === 'TEACHER') {
      audienceFilter.push('TEACHER');
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      audienceFilter.push('USER', 'TEACHER');
    }

    const banners = await (this.prisma as any).banner.findMany({
      where: {
        isActive: true,
        targetAudience: { in: audienceFilter },
      },
      include: {
        notification: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return banners;
  }

  async getAllBannersAdmin() {
    return (this.prisma as any).banner.findMany({
      include: {
        notification: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createBanner(dto: CreateBannerDto) {
    let targetOrder = dto.order;
    if (targetOrder === undefined || targetOrder === null) {
      const highest = await (this.prisma as any).banner.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      targetOrder = (highest?.order ?? 0) + 1;
    }

    return (this.prisma as any).banner.create({
      data: {
        title: dto.title,
        desc: dto.desc,
        tag: dto.tag || 'Yangilik',
        tagIcon: dto.tagIcon || 'Sparkles',
        image: dto.image || '/banner_art.png',
        btnText: dto.btnText || 'Batafsil',
        btnUrl: dto.btnUrl || null,
        btnIcon: dto.btnIcon || 'ArrowRight',
        actionType: dto.actionType || 'LINK',
        notificationId: dto.notificationId || null,
        order: targetOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        isDismissible: dto.isDismissible !== undefined ? dto.isDismissible : false,
        targetAudience: dto.targetAudience || 'ALL',
      },
      include: {
        notification: true,
      },
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const existing = await (this.prisma as any).banner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Banner topilmadi');
    }

    const dataToUpdate: any = { ...dto };
    if (dataToUpdate.notificationId === '') {
      dataToUpdate.notificationId = null;
    }
    if (dataToUpdate.btnUrl === '') {
      dataToUpdate.btnUrl = null;
    }

    return (this.prisma as any).banner.update({
      where: { id },
      data: dataToUpdate,
      include: {
        notification: true,
      },
    });
  }

  async deleteBanner(id: string) {
    const existing = await (this.prisma as any).banner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Banner topilmadi');
    }

    // Supabase'dan rasmni o'chirish (agar Supabase URL bo'lsa)
    if (existing.image) {
      const filename = this.supabaseStorage.extractFilename(existing.image, 'images');
      if (filename) {
        await this.supabaseStorage.deleteFile('images', filename);
      }
    }

    await (this.prisma as any).banner.delete({
      where: { id },
    });
    return { success: true, message: "Banner muvaffaqiyatli o'chirildi" };
  }

  async reorderBanners(bannerIds: string[]) {
    const updates = bannerIds.map((id, index) =>
      (this.prisma as any).banner.update({
        where: { id },
        data: { order: index + 1 },
      }),
    );
    await this.prisma.$transaction(updates);
    return { success: true, message: 'Tartib muvaffaqiyatli yangilandi' };
  }

  async toggleBannerActive(id: string) {
    const existing = await (this.prisma as any).banner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Banner topilmadi');
    }

    return (this.prisma as any).banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  async seedDefaultAnnouncement() {
    const count = await (this.prisma as any).banner.count();
    if (count === 0) {
      // Create initial sample notification and banner
      const notif = await (this.prisma as any).notification.create({
        data: {
          title: "MinnaUz 2.0 yangilanishi va JLPT imtihoniga tayyorgarlik kursi!",
          message: "Platformada yangi video darslar, sun'iy intellekt talaffuz tekshiruvchisi va testlar tizimi ishga tushirildi.",
          content: `### Xush kelibsiz MinnaUz 2.0 platformasiga!

Yapon tilini o'rganish endi yanada qulay va qiziqarli:
- **Minna no Nihongo** asosidagi to'liq 50 ta dars
- **Kanji va Lug'at** boyituvchi interaktiv kartalar
- **JLPT N5-N1** real imtihon simulyatori
- **AI Ustoz** bilan jonli muloqot va talaffuzni tekshirish

Videoni tomosha qiling va o'rganishni bugunoq boshlang!`,
          videoUrl: 'https://www.youtube.com/watch?v=k740_0ZJ5b8',
          imageUrl: '/banner_art.png',
          actionUrl: '/dashboard/courses',
          actionText: "Kurslarni ko'rish",
          audience: 'ALL',
          type: 'ANNOUNCEMENT',
          isPublished: true,
        },
      });

      await (this.prisma as any).banner.create({
        data: {
          title: "Yangi video darslar va JLPT imtihoni qo'llanmasi",
          desc: "MinnaUz 2.0 dagi barcha yangi imkoniyatlar va darsliklar bilan video orqali tanishing.",
          tag: "Video Qo'llanma",
          tagIcon: "Sparkles",
          image: "/banner_art.png",
          btnText: "Videoni ko'rish",
          btnIcon: "PlayCircle",
          actionType: "NOTIFICATION_DETAIL",
          notificationId: notif.id,
          order: 4,
          isActive: true,
          isDismissible: true,
          targetAudience: "ALL",
        },
      });
    }
  }
}
