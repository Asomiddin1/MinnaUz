import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Admin - Raqamli Doʻkon Boshqaruvi')
@Controller('admin/shop')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Doʻkon umumiy statistikasi (jami sotuvlar, sarflangan tangalar)',
  })
  async getStats() {
    return this.shopService.adminGetStats();
  }

  @Get('items')
  @ApiOperation({ summary: 'Barcha doʻkon mahsulotlari roʻyxati' })
  async getItems() {
    return this.shopService.adminGetItems();
  }

  @Post('items')
  @ApiOperation({ summary: 'Yangi raqamli mahsulot qoʻshish' })
  async createItem(@Body() dto: any) {
    return this.shopService.adminCreateItem(dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Mahsulotni tahrirlash' })
  async updateItem(@Param('id') id: string, @Body() dto: any) {
    return this.shopService.adminUpdateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Mahsulotni oʻchirish' })
  async deleteItem(@Param('id') id: string) {
    return this.shopService.adminDeleteItem(id);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'Foydalanuvchilarning oxirgi xaridlari roʻyxati' })
  async getPurchases() {
    return this.shopService.adminGetPurchases();
  }
}
