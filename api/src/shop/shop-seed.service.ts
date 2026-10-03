import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreItemCategory } from '@prisma/client';

@Injectable()
export class ShopSeedService implements OnModuleInit {
  private readonly logger = new Logger(ShopSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedStoreItems();
  }

  async seedStoreItems() {
    const count = await this.prisma.storeItem.count();
    if (count > 0) {
      this.logger.log(`Doʻkon mahsulotlari allaqachon mavjud (${count} ta).`);
      return;
    }

    this.logger.log(
      'Doʻkon mahsulotlarini bazaga kiritish (seeding) boshlandi...',
    );

    const items = [
      // ==========================================
      // A. CHEGIRMALAR VA OBUNA (DISCOUNT)
      // ==========================================
      {
        title: '10% Pro Chegirma Vaucheri',
        description:
          'Oylik Pro obunasini 49 000 soʻm oʻrniga 10% chegirma bilan xarid qilish vaucheri.',
        category: StoreItemCategory.DISCOUNT,
        costCoins: 150,
        icon: 'Percent',
        badge: '-10%',
        discountPercent: 10,
        actionKey: 'PRO_DISCOUNT_10',
        order: 1,
      },
      {
        title: '25% Pro Chegirma Vaucheri',
        description: 'Oylik Pro obunasi uchun 25% li maxsus vaucher kodi.',
        category: StoreItemCategory.DISCOUNT,
        costCoins: 300,
        icon: 'Percent',
        badge: '-25%',
        discountPercent: 25,
        actionKey: 'PRO_DISCOUNT_25',
        order: 2,
      },
      {
        title: '50% Katta Pro Chegirma',
        description:
          'Oylik Pro obunasini yarim narxiga (50% chegirma) qoʻlga kiritish uchun super vaucher.',
        category: StoreItemCategory.DISCOUNT,
        costCoins: 500,
        icon: 'Crown',
        badge: '-50% Super',
        discountPercent: 50,
        actionKey: 'PRO_DISCOUNT_50',
        order: 3,
      },
      {
        title: '3 Kunlik Bepul Pro Sinov (Trial)',
        description:
          'Barcha JLPT N5-N3 kurslari, video darslar va mock imtihonlarni 3 kunga bepul ochish kaliti.',
        category: StoreItemCategory.DISCOUNT,
        costCoins: 250,
        icon: 'Sparkles',
        badge: 'Sinov',
        durationDays: 3,
        actionKey: 'PRO_TRIAL_3D',
        order: 4,
      },
      {
        title: '7 Kunlik Bepul Pro Sinov',
        description:
          '1 hafta davomida platformadagi barcha premium imkoniyatlardan cheklovlarsiz foydalanish.',
        category: StoreItemCategory.DISCOUNT,
        costCoins: 500,
        icon: 'Sparkles',
        badge: 'VIP Hafta',
        durationDays: 7,
        actionKey: 'PRO_TRIAL_7D',
        order: 5,
      },

      // ==========================================
      // B. STREAK VA KUCHAYTIRGICHLAR (POWERUP)
      // ==========================================
      {
        title: 'Streak Muzlatgich (Streak Freeze ❄️)',
        description:
          'Ertaga dars qila olmasangiz ham, koʻp kunlik uzluksiz oʻrganish streakingiz kuyib ketmaydi.',
        category: StoreItemCategory.POWERUP,
        costCoins: 80,
        icon: 'Shield',
        badge: 'Eng mashhur',
        actionKey: 'STREAK_FREEZE',
        order: 6,
      },
      {
        title: 'Streak Tiklagich (Streak Repair 🩹)',
        description:
          'Kecha tasodifan uzilib qolgan streakingizni tiklab, qayta davom ettirish vositasi.',
        category: StoreItemCategory.POWERUP,
        costCoins: 120,
        icon: 'RotateCcw',
        badge: 'Tiklash',
        actionKey: 'STREAK_REPAIR',
        order: 7,
      },
      {
        title: '2x Double Coin Booster (24 soat ⚡️)',
        description:
          'Keyingi 24 soat ichida dars va testlardan 2 barobar koʻproq coin ishlash imkoniyati.',
        category: StoreItemCategory.POWERUP,
        costCoins: 100,
        icon: 'Zap',
        badge: '2x Tanga',
        durationDays: 1,
        actionKey: 'DOUBLE_COINS_24H',
        order: 8,
      },

      // ==========================================
      // C. AI SENSEI & IMTIHONLAR (AI_PERK)
      // ==========================================
      {
        title: 'AI Sensei Cheksiz Suhbat (1 hafta 💬)',
        description:
          'Yapon tili repetitori (AI Sensei) bilan cheksiz audio suhbatlashish va xatolarni toʻgʻrilash.',
        category: StoreItemCategory.AI_PERK,
        costCoins: 200,
        icon: 'Bot',
        badge: 'AI Kaiwa',
        durationDays: 7,
        actionKey: 'AI_KAIWA_WEEK',
        order: 9,
      },
      {
        title: 'VIP Mock Imtihon Chiptasi (🎟️)',
        description:
          'Eksklyuziv yopiq JLPT mock imtihonini ochish va batafsil tahliliy xulosa olish.',
        category: StoreItemCategory.AI_PERK,
        costCoins: 150,
        icon: 'FileCheck2',
        badge: 'Eksklyuziv',
        actionKey: 'VIP_MOCK_TICKET',
        order: 10,
      },
      {
        title: 'Xatolar Chuqur Tahlili (AI Diagnostics 📊)',
        description:
          'Barcha testlardagi zaif tomonlaringizni AI orqali toʻliq tahlil qilib beruvchi shaxsiy hisobot.',
        category: StoreItemCategory.AI_PERK,
        costCoins: 100,
        icon: 'BarChart3',
        badge: 'Tahlil',
        actionKey: 'AI_ERROR_REPORT',
        order: 11,
      },

      // ==========================================
      // D. PROFIL BEZAKLARI (COSMETIC)
      // ==========================================
      {
        title: 'Sakura Profil Ramkasi 🌸',
        description:
          'Profilingiz avatari uchun goʻzal yapon bahori va sakura gulbarglari ramkasi.',
        category: StoreItemCategory.COSMETIC,
        costCoins: 150,
        icon: 'Palette',
        badge: 'Yaponcha',
        actionKey: 'FRAME_SAKURA',
        order: 12,
      },
      {
        title: 'Samuray Qilich Ramkasi ⚔️',
        description:
          'Kuch va intizom ramzi boʻlgan oltin metall samuray qilichi tasvirlangan VIP ramka.',
        category: StoreItemCategory.COSMETIC,
        costCoins: 250,
        icon: 'Sword',
        badge: 'Noyob',
        actionKey: 'FRAME_SAMURAI',
        order: 13,
      },
      {
        title: 'Shogun Imperator Toji 🏯',
        description:
          'Platformada oʻz mavqeyingizni koʻrsatuvchi eng yuqori darajadagi Shogun toji bezagi.',
        category: StoreItemCategory.COSMETIC,
        costCoins: 400,
        icon: 'Crown',
        badge: 'Afsonaviy',
        actionKey: 'FRAME_SHOGUN',
        order: 14,
      },
    ];

    for (const item of items) {
      await this.prisma.storeItem.create({
        data: item,
      });
    }

    this.logger.log(
      `Doʻkonga ${items.length} ta raqamli mahsulot muvaffaqiyatli kiritildi!`,
    );
  }
}
