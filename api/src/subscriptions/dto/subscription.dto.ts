import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { SubscriptionTier, PaymentProvider } from '@prisma/client';

export class CheckoutSubscriptionDto {
  @IsEnum(SubscriptionTier, { message: "Noto'g'ri tarif tanlandi" })
  tier: SubscriptionTier;

  @IsEnum(PaymentProvider, { message: "Noto'g'ri to'lov tizimi tanlandi" })
  provider: PaymentProvider;

  @IsOptional()
  @IsString()
  promoCode?: string; // Discount code from store or coupon
}

export class ValidateCodeDto {
  @IsString({ message: 'Promokod kiritilishi shart' })
  code: string;

  @IsEnum(SubscriptionTier, { message: "Noto'g'ri tarif tanlandi" })
  tier: SubscriptionTier;
}

export class SimulatePaymentDto {
  @IsString({ message: 'Tranzaksiya ID kiritilishi shart' })
  transactionId: string;
}

export class GrantSubscriptionDto {
  @IsString({ message: 'Foydalanuvchi ID kiritilishi shart' })
  userId: string;

  @IsEnum(SubscriptionTier, { message: "Noto'g'ri tarif tanlandi" })
  tier: SubscriptionTier;

  @IsNumber({}, { message: "Kunlar soni to'g'ri bo'lishi kerak" })
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePlanDto {
  @IsEnum(SubscriptionTier, { message: "Noto'g'ri tarif tanlandi" })
  tier: SubscriptionTier;

  @IsString({ message: 'Tarif nomi kiritilishi shart' })
  name: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsNumber({}, { message: "Narx raqam bo'lishi kerak" })
  @Min(0)
  priceUzs: number;

  @IsNumber({}, { message: "Davomiylik kunlari raqam bo'lishi kerak" })
  @Min(1)
  durationDays: number;

  @IsOptional()
  features?: string[];

  @IsOptional()
  popular?: boolean;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsOptional()
  @IsNumber()
  priceUzs?: number;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  features?: string[];

  @IsOptional()
  popular?: boolean;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserSubscriptionDto {
  @IsOptional()
  status?: any; // ACTIVE, CANCELED, EXPIRED, PAST_DUE

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SubscriptionTier)
  tier?: SubscriptionTier;

  @IsOptional()
  @IsString()
  notes?: string;
}
