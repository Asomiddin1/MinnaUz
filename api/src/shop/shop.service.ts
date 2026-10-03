import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreItemCategory } from '@prisma/client';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Get all available items in the shop
  async getItems() {
    return this.prisma.storeItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  // 2. Get user's coin balance & streak state
  async getUserCoins(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        coins: true,
        streakDays: true,
        streakFrozen: true,
        avatarFrame: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  // 3. Get user's purchased inventory
  async getUserInventory(userId: string) {
    return this.prisma.userInventoryItem.findMany({
      where: { userId },
      include: {
        item: true,
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  // 4. Purchase an item with coins
  async purchaseItem(userId: string, itemId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, coins: true, streakFrozen: true, avatarFrame: true },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const item = await this.prisma.storeItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isAvailable) {
      throw new NotFoundException('Mahsulot mavjud emas');
    }

    if (user.coins < item.costCoins) {
      const needed = item.costCoins - user.coins;
      throw new BadRequestException(
        `Coinlaringiz yetarli emas! Sizda ${user.coins} coin bor, xarid uchun yana ${needed} coin kerak.`,
      );
    }

    // Generate discount promo code if discount voucher
    let code: string | undefined = undefined;
    if (item.category === StoreItemCategory.DISCOUNT) {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      code = `MINNA-${item.discountPercent || 10}-${rand}`;
    }

    // Calculate expiration if durationDays is defined
    let expiresAt: Date | undefined = undefined;
    if (item.durationDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + item.durationDays);
    }

    // Perform database transaction: deduct coins, add inventory, log transaction
    const [updatedUser, inventoryItem] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: item.costCoins },
          // If streak freeze purchased, activate streak frozen status
          ...(item.actionKey === 'STREAK_FREEZE' ? { streakFrozen: true } : {}),
          // If avatar frame, auto-equip it
          ...(item.category === StoreItemCategory.COSMETIC
            ? { avatarFrame: item.actionKey }
            : {}),
        },
        select: {
          id: true,
          coins: true,
          streakFrozen: true,
          avatarFrame: true,
        },
      }),
      this.prisma.userInventoryItem.create({
        data: {
          userId,
          itemId,
          code,
          expiresAt,
          isUsed: item.category === StoreItemCategory.COSMETIC, // cosmetics are equipped right away
        },
        include: {
          item: true,
        },
      }),
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: -item.costCoins,
          type: 'STORE_PURCHASE',
          description: `Doʻkondan "${item.title}" xarid qilindi`,
        },
      }),
    ]);

    return {
      success: true,
      message: `"${item.title}" muvaffaqiyatli xarid qilindi!`,
      remainingCoins: updatedUser.coins,
      inventoryItem,
    };
  }

  // 5. Equip / Unequip avatar frame
  async equipFrame(userId: string, frameKey: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarFrame: frameKey },
      select: { id: true, avatarFrame: true },
    });
  }

  // 6. Get coin transaction history
  async getCoinHistory(userId: string) {
    return this.prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 7. Helper: Award coins to user (e.g. for completed lessons, passed tests, streaks)
  async awardCoins(
    userId: string,
    amount: number,
    type: string,
    description: string,
  ) {
    if (amount <= 0) return;

    try {
      const [updatedUser] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { coins: { increment: amount } },
          select: { id: true, coins: true },
        }),
        this.prisma.coinTransaction.create({
          data: {
            userId,
            amount,
            type,
            description,
          },
        }),
      ]);

      return updatedUser;
    } catch (err) {
      this.logger.warn(`Failed to award coins to user ${userId}: ${err}`);
    }
  }

  // 8. Daily Streak Check-in (Real coin earning)
  async dailyCheckin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        coins: true,
        streakDays: true,
        streakFrozen: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Check today's date
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingCheckin = await this.prisma.coinTransaction.findFirst({
      where: {
        userId,
        type: 'DAILY_STREAK',
        createdAt: { gte: startOfToday },
      },
    });

    if (existingCheckin) {
      return {
        alreadyClaimed: true,
        coins: user.coins,
        streakDays: user.streakDays,
        message: 'Bugungi kunlik faollik tangalari allaqachon qabul qilingan!',
      };
    }

    // Check yesterday's activity to maintain or reset streak
    const yesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const hadYesterdayCheckin = await this.prisma.coinTransaction.findFirst({
      where: {
        userId,
        type: 'DAILY_STREAK',
        createdAt: {
          gte: yesterday,
          lt: startOfToday,
        },
      },
    });

    let newStreakDays = 1;
    if (hadYesterdayCheckin || user.streakFrozen) {
      newStreakDays = user.streakDays + 1;
    }

    // Base daily reward: +5 coins
    let reward = 5;
    let bonusMessage = '';

    if (newStreakDays > 0 && newStreakDays % 30 === 0) {
      reward += 150;
      bonusMessage = ' (30 kunlik oylik intizom uchun +150 bonus!)';
    } else if (newStreakDays > 0 && newStreakDays % 7 === 0) {
      reward += 30;
      bonusMessage = ' (7 kunlik haftalik intizom uchun +30 bonus!)';
    }

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward },
          streakDays: newStreakDays,
          streakFrozen: false,
        },
        select: {
          id: true,
          coins: true,
          streakDays: true,
          streakFrozen: true,
        },
      }),
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: reward,
          type: 'DAILY_STREAK',
          description: `Kunlik kirish (${newStreakDays}-kun)${bonusMessage} uchun mukofot tangalari`,
        },
      }),
    ]);

    return {
      alreadyClaimed: false,
      earnedCoins: reward,
      streakDays: updatedUser.streakDays,
      coins: updatedUser.coins,
      message: `Tabriklaymiz! Bugungi kunlik faollik uchun +${reward} tanga berildi! Kunlik streak: ${updatedUser.streakDays} kun 🔥`,
    };
  }

  // ==========================================
  // ADMIN PANEL METHODS
  // ==========================================

  // Admin stats
  async adminGetStats() {
    const [totalItems, totalPurchases, purchaseSum, categories] =
      await Promise.all([
        this.prisma.storeItem.count(),
        this.prisma.userInventoryItem.count(),
        this.prisma.coinTransaction.aggregate({
          where: { type: 'STORE_PURCHASE' },
          _sum: { amount: true },
        }),
        this.prisma.storeItem.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
      ]);

    return {
      totalItems,
      totalPurchases,
      totalCoinsSpent: Math.abs(purchaseSum._sum.amount || 0),
      categories: categories.reduce(
        (acc, curr) => {
          acc[curr.category] = curr._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  // Admin get all items with purchase count
  async adminGetItems() {
    return this.prisma.storeItem.findMany({
      include: {
        _count: {
          select: { inventoryItems: true },
        },
      },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  // Admin create item
  async adminCreateItem(dto: any) {
    const cost = Number(dto.costCoins);
    if (!dto.title || isNaN(cost) || cost < 1) {
      throw new BadRequestException(
        'Nomi va narxi (kamida 1 coin) toʻgʻri kiritilishi shart',
      );
    }

    return this.prisma.storeItem.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || '',
        category: dto.category || StoreItemCategory.DISCOUNT,
        costCoins: cost,
        icon: dto.icon || 'Sparkles',
        badge: dto.badge?.trim() || null,
        discountPercent: dto.discountPercent
          ? Number(dto.discountPercent)
          : null,
        durationDays: dto.durationDays ? Number(dto.durationDays) : null,
        actionKey: dto.actionKey?.trim() || null,
        isAvailable:
          dto.isAvailable !== undefined ? Boolean(dto.isAvailable) : true,
        order: dto.order ? Number(dto.order) : 0,
      },
    });
  }

  // Admin update item
  async adminUpdateItem(id: string, dto: any) {
    const existing = await this.prisma.storeItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.costCoins !== undefined) data.costCoins = Number(dto.costCoins);
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.badge !== undefined)
      data.badge = dto.badge ? dto.badge.trim() : null;
    if (dto.discountPercent !== undefined)
      data.discountPercent = dto.discountPercent
        ? Number(dto.discountPercent)
        : null;
    if (dto.durationDays !== undefined)
      data.durationDays = dto.durationDays ? Number(dto.durationDays) : null;
    if (dto.actionKey !== undefined)
      data.actionKey = dto.actionKey ? dto.actionKey.trim() : null;
    if (dto.isAvailable !== undefined)
      data.isAvailable = Boolean(dto.isAvailable);
    if (dto.order !== undefined) data.order = Number(dto.order);

    return this.prisma.storeItem.update({
      where: { id },
      data,
    });
  }

  // Admin delete item
  async adminDeleteItem(id: string) {
    const existing = await this.prisma.storeItem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Mahsulot topilmadi');
    }

    await this.prisma.storeItem.delete({ where: { id } });
    return { success: true, message: 'Mahsulot oʻchirildi' };
  }

  // Admin get recent purchases
  async adminGetPurchases() {
    return this.prisma.userInventoryItem.findMany({
      include: {
        item: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            coins: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
      take: 50,
    });
  }
}
