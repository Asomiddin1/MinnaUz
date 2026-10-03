import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchi toʻliq ismi',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Foydalanuvchi roli' })
  @IsOptional()
  @IsEnum(Role, { message: "Noto'g'ri rol tanlandi" })
  role?: Role;

  @ApiPropertyOptional({ description: 'Email tasdiqlanganmi' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Avatar rasm havolasi' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
