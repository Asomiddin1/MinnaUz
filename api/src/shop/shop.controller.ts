import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Raqamli Doʻkon va Tangalar (Shop & Coins)')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('items')
  @ApiOperation({ summary: 'Doʻkondagi barcha sotiladigan mahsulotlar' })
  async getItems() {
    return this.shopService.getItems();
  }

  @Get('inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining sotib olgan buyumlari (Inventar)',
  })
  async getInventory(@CurrentUser('id') userId: string) {
    return this.shopService.getUserInventory(userId);
  }

  @Post('purchase/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mahsulotni coin orqali xarid qilish' })
  async purchase(
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.purchaseItem(userId, itemId);
  }

  @Post('equip-frame')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Avatar ramkasini taqish yoki yechish' })
  async equipFrame(
    @Body('frameKey') frameKey: string | null,
    @CurrentUser('id') userId: string,
  ) {
    return this.shopService.equipFrame(userId, frameKey ?? null);
  }
}

@ApiTags('Foydalanuvchi Tangalari (User Coins)')
@Controller('coins')
export class CoinsController {
  constructor(private readonly shopService: ShopService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining joriy tanga balansi va streak holati',
  })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.shopService.getUserCoins(userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tangalar kirim-chiqim tranzaksiyalari tarixi' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.shopService.getCoinHistory(userId);
  }

  @Post('daily-checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kunlik faollik (Streak) tangalarini yigʻish' })
  async dailyCheckin(@CurrentUser('id') userId: string) {
    return this.shopService.dailyCheckin(userId);
  }
}
