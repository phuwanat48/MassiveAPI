import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoverResult } from './entities/mover-result.entity';
import { StockPrice } from './entities/stock-price.entity';
import { Stock } from './entities/stock.entity';
import { MoversController } from './movers.controller';
import { MoversService } from './movers.service';
import { MoversRepository } from './repositories/movers.repository';
import { MoversMassiveApiService } from './services/movers-massive-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockPrice, MoverResult]),
    HttpModule,
    ConfigModule, // 👈 เพิ่ม ConfigModule เพื่อดึงค่า MASSIVE_API_KEY
  ],
  controllers: [MoversController],
  providers: [MoversService, MoversRepository, MoversMassiveApiService],
  exports: [MoversService],
})
export class MoversModule {}