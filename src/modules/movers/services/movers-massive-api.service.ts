import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { MassiveApiPricePoint } from '../interfaces/movers.interface';

@Injectable()
export class MoversMassiveApiService {
  private readonly logger = new Logger(MoversMassiveApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'MASSIVE_API_BASE_URL',
      'https://api.polygon.io',
    );
    this.apiKey = this.configService.get<string>('MASSIVE_API_KEY', '');
  }

  private async fetchGroupedDaily(dateStr: string): Promise<MassiveApiPricePoint[]> {
    try {
      const url = `${this.baseUrl}/v2/aggs/grouped/locale/us/market/stocks/${dateStr}`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          params: { adjusted: true, apiKey: this.apiKey },
        }),
      );

      const results = response.data?.results || [];
      return results.map((item: any) => ({
        symbol: item.T,
        companyName: item.T,
        priceDate: dateStr,
        closePrice: Number(item.c || 0),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch for date ${dateStr}: ${error.message}`);
      return [];
    }
  }

  async fetchLatestPrices(period: string = '1D'): Promise<MassiveApiPricePoint[]> {
    this.logger.log(`Fetching multi-date prices from API for period: ${period}`);

    const now = new Date();

    // กำหนดจำนวนวันย้อนหลังให้รองรับ 1D, 1W และ 1M
    let daysBack = 1; // Default สำหรับ 1D (ย้อนหลัง 1 วัน)
    if (period === '1W') daysBack = 7; // 1W (ย้อนหลัง 7 วัน)
    if (period === '1M') daysBack = 30; // 1M (ย้อนหลัง 30 วัน)

    const dateLatest = new Date(now);
    dateLatest.setDate(now.getDate() - 1);
    const latestDateStr = dateLatest.toISOString().split('T')[0];

    const datePrevious = new Date(now);
    datePrevious.setDate(now.getDate() - (1 + daysBack));
    const previousDateStr = datePrevious.toISOString().split('T')[0];

    this.logger.log(
      `API Fetching dates: latest=${latestDateStr}, previous=${previousDateStr}`,
    );

    // ดึงราคาจาก API พร้อมกันทั้ง 2 วัน
    const [latestPrices, previousPrices] = await Promise.all([
      this.fetchGroupedDaily(latestDateStr),
      this.fetchGroupedDaily(previousDateStr),
    ]);

    return [...latestPrices, ...previousPrices];
  }
}