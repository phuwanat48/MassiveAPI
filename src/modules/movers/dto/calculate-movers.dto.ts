import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum MoverPeriod {
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
  ONE_MONTH = '1M',
}

export enum MoverType {
  GAINER = 'gainer',
  LOSER = 'loser',
  MOST_VOLATILE = 'most_volatile',
}

export class CalculateMoversDto {
  @ApiPropertyOptional({
    enum: MoverPeriod,
    default: MoverPeriod.ONE_DAY,
    description: 'ช่วงเวลาที่ต้องการคำนวณ (1D, 1W, 1M)',
    example: MoverPeriod.ONE_DAY,
  })
  @IsOptional()
  @IsEnum(MoverPeriod, { message: 'period ต้องเป็น 1D, 1W หรือ 1M เท่านั้น' })
  period?: MoverPeriod;

  @ApiPropertyOptional({
    enum: MoverType,
    default: MoverType.GAINER,
    description: 'ประเภทหุ้น (gainer, loser, most_volatile)',
    example: MoverType.MOST_VOLATILE,
  })
  @IsOptional()
  @IsEnum(MoverType, { message: 'type ต้องเป็น gainer, loser หรือ most_volatile เท่านั้น' })
  type?: MoverType;

  @ApiPropertyOptional({
    type: Number,
    default: 10,
    description: 'จำนวนรายการหุ้นที่ต้องการดึง',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit ต้องเป็นตัวเลขเท่านั้น' })
  @Min(1, { message: 'limit ต้องมีค่าอย่างน้อย 1' })
  limit?: number;
}