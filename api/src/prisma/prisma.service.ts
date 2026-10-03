import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Maʼlumotlar bazasiga muvaffaqiyatli ulandi (Prisma)');
    } catch (error: any) {
      console.warn('⚠️ Maʼlumotlar bazasiga ulanishda xatolik:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
