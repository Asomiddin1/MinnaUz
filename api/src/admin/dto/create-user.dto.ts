import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Foydalanuvchi emaili',
  })
  @IsEmail({}, { message: "To'g'ri email manzil kiriting" })
  @IsNotEmpty({ message: 'Email kiritilishi shart' })
  email: string;

  @ApiPropertyOptional({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchi toʻliq ismi',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.USER,
    description: 'Foydalanuvchi roli',
  })
  @IsOptional()
  @IsEnum(Role, { message: "Noto'g'ri rol tanlandi" })
  role?: Role;

  @ApiPropertyOptional({ default: false, description: 'Email tasdiqlanganmi' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
