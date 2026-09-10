import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockPrice } from '../entities/stock-price.entity';
import { MassiveApiPricePoint, PriceComparisonRow } from '../interfaces/movers.interface';

export const TARGET_SYMBOLS = [
  'MSFT', 'NVDA', 'LLY', 'JNJ', 'JPM',
  'V', 'AMZN', 'DIS', 'XOM', 'CVX',
];

@Injectable()
export class MoversRepository {
  private readonly logger = new Logger(MoversRepository.name);

  constructor(
    @InjectRepository(StockPrice)
    private readonly priceRepo: Repository<StockPrice>,
  ) {}

  /**
   * ตรวจสอบว่ามีจำนวนวันที่ (Distinct Dates) เพียงพอตาม period หรือไม่
   */
  async checkDataCompleteness(period: string): Promise<boolean> {
    const result = await this.priceRepo
      .createQueryBuilder('sp')
      .select('COUNT(DISTINCT sp.priceDate)', 'count')
      .getRawOne();

    const distinctDatesCount = Number(result?.count || 0);

    // กำหนดจำนวนวันขั้นต่ำตาม period
    let minRequiredDates = 2; // สำหรับ 1D
    if (period === '1W') minRequiredDates = 3; // สำหรับ 1W
    if (period === '1M') minRequiredDates = 5; // สำหรับ 1M

    this.logger.log(
      `Distinct dates in DB: ${distinctDatesCount} (Required: ${minRequiredDates} for ${period})`,
    );

    return distinctDatesCount >= minRequiredDates;
  }

  /**
   * Upsert ข้อมูลราคา
   */
  async upsertPrices(prices: MassiveApiPricePoint[]): Promise<void> {
    if (!prices || prices.length === 0) return;

    const targetPrices = prices.filter((item) => TARGET_SYMBOLS.includes(item.symbol));
    if (targetPrices.length === 0) return;

    const cleanData = targetPrices.map((item) => ({
      symbol: item.symbol,
      priceDate: item.priceDate,
      closePrice: Number(item.closePrice) || 0,
    }));

    await this.priceRepo.upsert(cleanData as any, ['symbol', 'priceDate']);
  }

  /**
   * ดึงราคาเปรียบเทียบตามช่วงเวลา (1D, 1W, 1M)
   */
  async getPriceComparisons(period: string): Promise<PriceComparisonRow[]> {
    const rawDates = await this.priceRepo
      .createQueryBuilder('sp')
      .select('sp.priceDate', 'priceDate')
      .groupBy('sp.priceDate')
      .orderBy('sp.priceDate', 'DESC')
      .getRawMany();

    if (!rawDates || rawDates.length < 2) {
      this.logger.warn(`Not enough dates found in DB. Count: ${rawDates?.length || 0}`);
      return [];
    }

    const dates = rawDates.map((r) => r.priceDate || r.pricedate || Object.values(r)[0]);
    const latestDate = dates[0];

    let compareIndex = 1; // Default 1D
    if (period === '1W') compareIndex = Math.min(2, dates.length - 1);
    if (period === '1M') compareIndex = dates.length - 1;

    const previousDate = dates[compareIndex];

    this.logger.log(`Comparing Date: latest=${latestDate} vs previous=${previousDate}`);

    const latestPrices = await this.priceRepo
      .createQueryBuilder('sp')
      .where('sp.priceDate = :latestDate', { latestDate })
      .andWhere('sp.symbol IN (:...symbols)', { symbols: TARGET_SYMBOLS })
      .getMany();

    const previousPrices = await this.priceRepo
      .createQueryBuilder('sp')
      .where('sp.priceDate = :previousDate', { previousDate })
      .andWhere('sp.symbol IN (:...symbols)', { symbols: TARGET_SYMBOLS })
      .getMany();

    this.logger.log(
      `Found records - Latest: ${latestPrices.length}, Previous: ${previousPrices.length}`,
    );

    const prevPriceMap = new Map<string, number>();
    for (const item of previousPrices) {
      prevPriceMap.set(item.symbol, Number(item.closePrice));
    }

    const comparisons: PriceComparisonRow[] = [];
    for (const curr of latestPrices) {
      const prevPrice = prevPriceMap.get(curr.symbol);
      const currObj = curr as any;

      if (prevPrice !== undefined && prevPrice > 0) {
        comparisons.push({
          symbol: curr.symbol,
          companyName: currObj.companyName || currObj.company_name || curr.symbol,
          currentPrice: Number(curr.closePrice),
          previousClosePrice: prevPrice,
          dailyClosesInRange: [prevPrice, Number(curr.closePrice)],
        });
      }
    }

    return comparisons;
  }
}