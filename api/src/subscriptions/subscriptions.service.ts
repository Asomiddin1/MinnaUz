import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubscriptionTier,
  SubscriptionStatus,
  PaymentProvider,
  PaymentStatus,
  StoreItemCategory,
  NotificationType,
  NotificationAudience,
} from '@prisma/client';
import {
  CheckoutSubscriptionDto,
  ValidateCodeDto,
  GrantSubscriptionDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultPlans();
  }

  // Boshlang'ich tariflarni ma'lumotlar bazasiga kiritish (agar mavjud bo'lmasa)
  private async seedDefaultPlans() {
    try {
      const count = await this.prisma.subscriptionPlan.count();
      if (count > 0) return;

      this.logger.log('Seeding default subscription plans...');

      await this.prisma.subscriptionPlan.createMany({
        data: [
          {
            tier: SubscriptionTier.MONTHLY,
            name: 'Oylik Pro',
            nameRu: 'Месячный Pro',
            priceUzs: 49000,
            durationDays: 30,
            features: [
              'Barcha JLPT N5, N4, N3 darslari',
              'Cheksiz AI Speaking (Kaiwa) mashgʻulotlari',
              'Barcha audio va video darslar',
              'Mock testlar va reyting tizimi',
              'Reklamalarsiz interfeys',
            ],
            popular: false,
            order: 1,
            isActive: true,
          },
          {
            tier: SubscriptionTier.ANNUAL,
            name: 'Yillik VIP',
            nameRu: 'Годовой VIP',
            priceUzs: 299000,
            durationDays: 365,
            features: [
              'Barcha kurslar va yangi chiqadigan darslar',
              '40% gacha katta tejash',
              'Cheksiz AI Sensei tahlil va mashqlari',
              'VIP Yapon tili jamoasi aʼzoligi',
              'Yuklab olinadigan PDF qoʻllanmalar',
              'Yaponiyada oʻqish va ishlash konsultatsiyasi',
            ],
            popular: true,
            tag: 'Eng tejamkor',
            order: 2,
            isActive: true,
          },
        ],
      });

      this.logger.log('Default subscription plans successfully seeded!');
    } catch (err) {
      this.logger.warn(`Failed to seed plans: ${err}`);
    }
  }

  // 1. Barcha faol tariflarni olish
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  // 2. Foydalanuvchining joriy obunasi va foydalanilmagan do'kon vaucherlari
  async getMySubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const now = new Date();

    // Faol obunani qidirish
    const activeSub = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
      },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });

    const isPrivileged = false;
    const isPro = !!activeSub;

    let daysRemaining = 0;
    if (activeSub) {
      const diffMs = activeSub.endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Foydalanuvchining do'kondan olgan, hali ishlatilmagan chegirma vaucherlari
    const availableDiscounts = await this.prisma.userInventoryItem.findMany({
      where: {
        userId,
        isUsed: false,
        item: {
          category: StoreItemCategory.DISCOUNT,
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: { item: true },
      orderBy: { purchasedAt: 'desc' },
    });

    return {
      isPro,
      isPrivileged,
      subscription: activeSub
        ? {
            id: activeSub.id,
            tier: activeSub.tier,
            status: activeSub.status,
            startDate: activeSub.startDate,
            endDate: activeSub.endDate,
            autoRenew: activeSub.autoRenew,
            paymentMethod: activeSub.paymentMethod,
            daysRemaining,
            plan: activeSub.plan,
          }
        : null,
      availableDiscounts: availableDiscounts.map((d) => ({
        id: d.id,
        code: d.code,
        title: d.item.title,
        discountPercent: d.item.discountPercent || 10,
        expiresAt: d.expiresAt,
      })),
    };
  }

  // 3. Promokod yoki do'kon vaucherini tekshirish va chegirmali narxni hisoblash
  async validateDiscountCode(userId: string, dto: ValidateCodeDto) {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { tier: dto.tier },
    });

    if (!plan) {
      throw new NotFoundException('Tarif topilmadi');
    }

    const cleanCode = dto.code.trim().toUpperCase();

    // 1-navbatda: Talabaning shaxsiy inventaridagi vaucher kodini tekshirish
    const inventoryItem = await this.prisma.userInventoryItem.findFirst({
      where: {
        userId,
        code: cleanCode,
        isUsed: false,
      },
      include: { item: true },
    });

    let discountPercent = 0;
    let inventoryItemId: string | null = null;

    if (inventoryItem) {
      if (inventoryItem.expiresAt && inventoryItem.expiresAt < new Date()) {
        throw new BadRequestException(
          'Ushbu chegirma vaucherining amal qilish muddati tugagan',
        );
      }
      discountPercent = inventoryItem.item.discountPercent || 10;
      inventoryItemId = inventoryItem.id;
    } else {
      // 2-navbatda: Umumiy tizimli promokodlar (masalan: MINNA2026, WELCOME10)
      if (cleanCode === 'MINNA10') {
        discountPercent = 10;
      } else if (cleanCode === 'MINNA20') {
        discountPercent = 20;
      } else if (cleanCode === 'SAKURA30') {
        discountPercent = 30;
      } else {
        throw new BadRequestException(
          'Kiritilgan promokod yaroqsiz yoki allaqachon ishlatilgan',
        );
      }
    }

    const originalPrice = plan.priceUzs;
    const discountAmount = Math.round((originalPrice * discountPercent) / 100);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      valid: true,
      code: cleanCode,
      discountPercent,
      originalPrice,
      discountAmount,
      finalPrice,
      inventoryItemId,
    };
  }

  // 4. Checkout boshlash (To'lov tranzaksiyasini ochish)
  async initiateCheckout(userId: string, dto: CheckoutSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { tier: dto.tier },
    });

    if (!plan) {
      throw new NotFoundException('Tanlangan tarif topilmadi');
    }

    let discountAmount = 0;
    let finalAmount = plan.priceUzs;
    let promoCode: string | undefined = undefined;
    let inventoryItemId: string | undefined = undefined;

    // Agar promokod / do'kon vaucheri ko'rsatilgan bo'lsa
    if (dto.promoCode) {
      const val = await this.validateDiscountCode(userId, {
        code: dto.promoCode,
        tier: dto.tier,
      });
      discountAmount = val.discountAmount;
      finalAmount = val.finalPrice;
      promoCode = val.code;
      inventoryItemId = val.inventoryItemId || undefined;
    }

    // To'lov tranzaksiyasini yaratish
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        userId,
        originalAmountUzs: plan.priceUzs,
        discountAmountUzs: discountAmount,
        finalAmountUzs: finalAmount,
        provider: dto.provider,
        status: PaymentStatus.PENDING,
        promoCode,
        inventoryItemId,
        metadata: {
          tier: plan.tier,
          durationDays: plan.durationDays,
          planName: plan.name,
        },
      },
    });

    return {
      transactionId: transaction.id,
      plan: {
        tier: plan.tier,
        name: plan.name,
        durationDays: plan.durationDays,
      },
      originalAmount: plan.priceUzs,
      discountAmount,
      finalAmount,
      promoCode,
      provider: dto.provider,
      status: transaction.status,
    };
  }

  // 5. To'lov muvaffaqiyatli o'tganda (Payme/Click Webhook yoki Demo Simulyatsiya)
  async processPaymentSuccess(transactionId: string, externalId?: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      throw new NotFoundException('Toʻlov tranzaksiyasi topilmadi');
    }

    if (transaction.status === PaymentStatus.COMPLETED) {
      return {
        success: true,
        message: 'Ushbu toʻlov allaqachon qabul qilingan',
      };
    }

    const metadata = transaction.metadata as any;
    const tier =
      (metadata?.tier as SubscriptionTier) || SubscriptionTier.MONTHLY;
    const durationDays = metadata?.durationDays || 30;

    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { tier },
    });

    const now = new Date();

    // Talabada hozirda faol obuna borligini tekshirish
    const existingActiveSub = await this.prisma.userSubscription.findFirst({
      where: {
        userId: transaction.userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: now },
      },
      orderBy: { endDate: 'desc' },
    });

    let startDate = now;
    let endDate = new Date(now);

    if (existingActiveSub) {
      // Agar faol obuna bo'lsa, tugash sanasidan boshlab uzaytiriladi
      startDate = existingActiveSub.startDate;
      endDate = new Date(existingActiveSub.endDate);
      endDate.setDate(endDate.getDate() + durationDays);
    } else {
      endDate.setDate(endDate.getDate() + durationDays);
    }

    // Bazada tranzaksiya o'tkazish: tranzaksiyani COMPLETED qilish, vaucherni ishlatilgan deb belgilash, UserSubscription yaratish
    const [updatedTx, userSub] = await this.prisma.$transaction(async (tx) => {
      // 1. Agar do'kon vaucheri ishlatilgan bo'lsa, uni isUsed = true qilish
      if (transaction.inventoryItemId) {
        await tx.userInventoryItem.update({
          where: { id: transaction.inventoryItemId },
          data: { isUsed: true },
        });
      }

      // 2. UserSubscription yaratish yoki yangilash
      let sub;
      if (existingActiveSub) {
        sub = await tx.userSubscription.update({
          where: { id: existingActiveSub.id },
          data: {
            endDate,
            tier,
            planId: plan?.id || null,
            paymentMethod: transaction.provider,
            status: SubscriptionStatus.ACTIVE,
          },
        });
      } else {
        sub = await tx.userSubscription.create({
          data: {
            userId: transaction.userId,
            planId: plan?.id || null,
            tier,
            status: SubscriptionStatus.ACTIVE,
            startDate,
            endDate,
            paymentMethod: transaction.provider,
          },
        });
      }

      // 3. Tranzaksiyani yangilash
      const updatedTx = await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: now,
          externalId: externalId || `DEMO-${Date.now()}`,
          subscriptionId: sub.id,
        },
      });

      // 4. Talabaga Pro obuna uchun bonus tanga (+50 tanga) va Do'kondan sovg'a ramka (FRAME_SHOGUN)
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          coins: { increment: 50 },
          avatarFrame: 'FRAME_SHOGUN',
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId: transaction.userId,
          amount: 50,
          type: 'PRO_SUBSCRIPTION_BONUS',
          description: `"${plan?.name || 'Pro'}" obunasi xaridi uchun +50 sovg'a tangalari!`,
        },
      });

      return [updatedTx, sub];
    });

    // Foydalanuvchiga muvaffaqiyatli xabarnoma yuborish
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: 'Pro Obuna Faollashtirildi! 🎉',
          message: `Tabriklaymiz! Sizning "${plan?.name || 'Pro'}" obunangiz faollashtirildi. Barcha darslar, AI Sensei va imkoniyatlar siz uchun ochiq!`,
          audience: NotificationAudience.INDIVIDUAL,
          targetUserId: transaction.userId,
          type: NotificationType.UPDATE,
          actionUrl: '/dashboard',
          actionText: 'Darslarni boshlash',
        },
      });

      await this.prisma.userNotification.create({
        data: {
          userId: transaction.userId,
          notificationId: notif.id,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to create success notification: ${err}`);
    }

    return {
      success: true,
      message:
        'Toʻlov muvaffaqiyatli amalga oshirildi va obuna faollashtirildi!',
      subscription: userSub,
      transaction: updatedTx,
    };
  }

  // 6. Test/Simulyatsiya to'lovi (Demo rejimida bir zumda faollashtirish)
  async simulatePayment(userId: string, transactionId: string) {
    const tx = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx || tx.userId !== userId) {
      throw new NotFoundException('Toʻlov tranzaksiyasi topilmadi');
    }

    return this.processPaymentSuccess(transactionId, `SIMULATED-${Date.now()}`);
  }

  // 7. Obunani bekor qilish (Avto-yangilanishni to'xtatish)
  async cancelSubscription(userId: string) {
    const activeSub = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gt: new Date() },
      },
    });

    if (!activeSub) {
      throw new NotFoundException('Faol obuna topilmadi');
    }

    await this.prisma.userSubscription.update({
      where: { id: activeSub.id },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
        status: SubscriptionStatus.CANCELED,
      },
    });

    return {
      success: true,
      message:
        'Obunaning avtomatik yangilanishi bekor qilindi. Joriy davr tugaguncha foydalanishingiz mumkin.',
    };
  }

  // ====================================================
  // ADMIN METODLARI
  // ====================================================

  // Admin barcha obunachilarni ko'rishi
  async adminGetSubscriptions(
    page = 1,
    limit = 20,
    status?: SubscriptionStatus,
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
          plan: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userSubscription.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin statistikasi
  async adminGetStats() {
    const now = new Date();
    const [activeCount, totalCount, sumRevenue, plansBreakdown] =
      await Promise.all([
        this.prisma.userSubscription.count({
          where: { status: SubscriptionStatus.ACTIVE, endDate: { gt: now } },
        }),
        this.prisma.userSubscription.count(),
        this.prisma.paymentTransaction.aggregate({
          where: { status: PaymentStatus.COMPLETED },
          _sum: { finalAmountUzs: true },
        }),
        this.prisma.userSubscription.groupBy({
          by: ['tier'],
          _count: { id: true },
        }),
      ]);

    return {
      activeSubscribers: activeCount,
      totalSubscriptions: totalCount,
      totalRevenueUzs: sumRevenue._sum.finalAmountUzs || 0,
      plansBreakdown: plansBreakdown.reduce(
        (acc, cur) => {
          acc[cur.tier] = cur._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  // Admin qo'lda foydalanuvchiga Pro obuna berishi (Grant VIP)
  async adminGrantSubscription(dto: GrantSubscriptionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + dto.durationDays);

    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { tier: dto.tier },
    });

    const subscription = await this.prisma.userSubscription.create({
      data: {
        userId: dto.userId,
        planId: plan?.id || null,
        tier: dto.tier,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate,
        paymentMethod: PaymentProvider.ADMIN_MANUAL,
        notes: dto.notes || 'Admin tomonidan VIP taqdim etildi',
      },
    });

    // Sovg'a ramkani kiygizish
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { avatarFrame: 'FRAME_SHOGUN' },
    });

    // Bildirishnoma
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: 'Sizga Maxsus Pro Obuna Taqdim Etildi! 🎁',
          message: `Administrator tomonidan hisobingizga ${dto.durationDays} kunlik Pro obuna biriktirildi!`,
          audience: NotificationAudience.INDIVIDUAL,
          targetUserId: dto.userId,
          type: NotificationType.PROMO,
          actionUrl: '/dashboard',
          actionText: 'Oʻrganishni boshlash',
        },
      });

      await this.prisma.userNotification.create({
        data: {
          userId: dto.userId,
          notificationId: notif.id,
        },
      });
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `${user.email} hisobiga ${dto.durationDays} kunlik Pro obuna berildi!`,
      subscription,
    };
  }

  // ====================================================
  // ADMIN TARIFLAR (PLANS) CRUD
  // ====================================================

  async adminGetAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }

  async adminCreatePlan(dto: any) {
    if (!dto.name || dto.priceUzs === undefined || !dto.durationDays) {
      throw new BadRequestException(
        'Tarif nomi, narxi va davomiyligi kiritilishi shart',
      );
    }

    return this.prisma.subscriptionPlan.create({
      data: {
        tier: dto.tier || SubscriptionTier.MONTHLY,
        name: dto.name.trim(),
        nameRu: dto.nameRu?.trim() || null,
        priceUzs: Number(dto.priceUzs),
        durationDays: Number(dto.durationDays),
        features: dto.features || [],
        popular: Boolean(dto.popular),
        tag: dto.tag?.trim() || null,
        order: dto.order !== undefined ? Number(dto.order) : 0,
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      },
    });
  }

  async adminUpdatePlan(id: string, dto: any) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Tarif topilmadi');

    const data: any = {};
    if (dto.tier !== undefined) data.tier = dto.tier;
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.nameRu !== undefined) data.nameRu = dto.nameRu?.trim() || null;
    if (dto.priceUzs !== undefined) data.priceUzs = Number(dto.priceUzs);
    if (dto.durationDays !== undefined)
      data.durationDays = Number(dto.durationDays);
    if (dto.features !== undefined) data.features = dto.features;
    if (dto.popular !== undefined) data.popular = Boolean(dto.popular);
    if (dto.tag !== undefined) data.tag = dto.tag?.trim() || null;
    if (dto.order !== undefined) data.order = Number(dto.order);
    if (dto.isActive !== undefined) data.isActive = Boolean(dto.isActive);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  async adminDeletePlan(id: string) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Tarif topilmadi');

    await this.prisma.subscriptionPlan.delete({ where: { id } });
    return { success: true, message: 'Tarif muvaffaqiyatli oʻchirildi' };
  }

  async adminTogglePlan(id: string) {
    const existing = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Tarif topilmadi');

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  // ====================================================
  // ADMIN FOYDALANUVCHI OBUNALARI (USER SUBSCRIPTIONS) CRUD
  // ====================================================

  async adminUpdateUserSubscription(id: string, dto: any) {
    const existing = await this.prisma.userSubscription.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Obuna topilmadi');

    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.tier !== undefined) data.tier = dto.tier;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null;
    if (dto.endDate) {
      data.endDate = new Date(dto.endDate);
    }

    return this.prisma.userSubscription.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
        plan: true,
      },
    });
  }

  async adminExtendSubscription(id: string, days: number) {
    const existing = await this.prisma.userSubscription.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Obuna topilmadi');

    const now = new Date();
    const currentEnd = new Date(existing.endDate);
    const baseDate = currentEnd > now ? currentEnd : now;
    baseDate.setDate(baseDate.getDate() + Number(days));

    return this.prisma.userSubscription.update({
      where: { id },
      data: {
        endDate: baseDate,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
        plan: true,
      },
    });
  }

  async adminDeleteUserSubscription(id: string) {
    const existing = await this.prisma.userSubscription.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Obuna topilmadi');

    await this.prisma.userSubscription.delete({ where: { id } });
    return {
      success: true,
      message: 'Foydalanuvchi obunasi bekor qilindi va oʻchirildi',
    };
  }
}
