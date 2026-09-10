import { Injectable, Logger } from '@nestjs/common';
import { PriceComparisonRow } from './interfaces/movers.interface';
import { MoversRepository } from './repositories/movers.repository';
import { MoversMassiveApiService } from './services/movers-massive-api.service';

@Injectable()
export class MoversService {
  private readonly logger = new Logger(MoversService.name);

  constructor(
    private readonly repository: MoversRepository,
    private readonly massiveApi: MoversMassiveApiService,
  ) {}

  async calculate(dto: { period?: string; type?: string; limit?: number }) {
    const period = dto.period || '1D';
    const type = dto.type || 'gainer';
    const limit = dto.limit || 10;

    // 1. ตรวจสอบข้อมูลใน DB
    const isDataComplete = await this.repository.checkDataCompleteness(period);

    if (!isDataComplete) {
      this.logger.log(`Data incomplete for period=${period}, fetching from Massive API...`);
      const fetched = await this.massiveApi.fetchLatestPrices(period);

      if (fetched && fetched.length > 0) {
        // ส่งเฉพาะ fetched (1 argument) ตรงตาม Signature ของ MoversRepository
        await this.repository.upsertPrices(fetched);
      }
    }

    // 2. ดึงราคามาเปรียบเทียบ
    const comparisons = await this.repository.getPriceComparisons(period);

    // 3. คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง และ Volatility
    const calculated = comparisons.map((item: PriceComparisonRow) => {
      const changeAmount = item.currentPrice - item.previousClosePrice;
      const changePercent =
        item.previousClosePrice > 0
          ? (changeAmount / item.previousClosePrice) * 100
          : 0;

      const volatility = Math.abs(changePercent);

      return {
        symbol: item.symbol,
        company_name: item.companyName,
        current_price: Number(item.currentPrice.toFixed(2)),
        previous_close_price: Number(item.previousClosePrice.toFixed(2)),
        change_amount: Number(changeAmount.toFixed(2)),
        change_percent: Number(changePercent.toFixed(2)),
        volatility: Number(volatility.toFixed(2)),
      };
    });

    // 4. กรอง และ เรียงลำดับตาม type
    let filtered = calculated;
    if (type === 'gainer') {
      filtered = calculated
        .filter((item: any) => item.change_percent > 0)
        .sort((a: any, b: any) => b.change_percent - a.change_percent);
    } else if (type === 'loser') {
      filtered = calculated
        .filter((item: any) => item.change_percent < 0)
        .sort((a: any, b: any) => a.change_percent - b.change_percent);
    } else if (type === 'most_volatile') {
      filtered = calculated
        .sort((a: any, b: any) => b.volatility - a.volatility);
    }

    const data = filtered.slice(0, limit);

    return {
      period,
      type,
      data,
      total_results: data.length,
      calculated_at: new Date().toISOString(),
    };
  }
}