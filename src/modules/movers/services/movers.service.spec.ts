import { Test, TestingModule } from '@nestjs/testing';
import { MoverPeriod, MoverType } from '../dto/calculate-movers.dto';
import { MoversService } from '../movers.service';
import { MoversRepository } from '../repositories/movers.repository';
import { MoversMassiveApiService } from './movers-massive-api.service';

describe('MoversService', () => {
  let service: MoversService;
  let repo: any;
  let apiService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoversService,
        {
          provide: MoversRepository,
          useValue: {
            checkDataCompleteness: jest.fn(),
            upsertPrices: jest.fn(),
            getPriceComparisons: jest.fn(),
          },
        },
        {
          provide: MoversMassiveApiService,
          useValue: {
            fetchLatestPrices: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoversService>(MoversService);
    repo = module.get(MoversRepository);
    apiService = module.get(MoversMassiveApiService);
  });

  it('should trigger API fetch and upsert when DB data is incomplete', async () => {
    repo.checkDataCompleteness.mockResolvedValue(false);
    apiService.fetchLatestPrices.mockResolvedValue([
      { symbol: 'DIS', companyName: 'DIS', priceDate: '2026-09-09', closePrice: 100 },
    ]);
    repo.getPriceComparisons.mockResolvedValue([]);

    await service.calculate({
      period: MoverPeriod.ONE_DAY,
      type: MoverType.GAINER,
      limit: 10,
    });

    expect(repo.checkDataCompleteness).toHaveBeenCalledWith('1D');
    expect(apiService.fetchLatestPrices).toHaveBeenCalledWith('1D');
    expect(repo.upsertPrices).toHaveBeenCalled();
  });

  it('should correctly calculate and sort most_volatile items', async () => {
    repo.checkDataCompleteness.mockResolvedValue(true);
    repo.getPriceComparisons.mockResolvedValue([
      { symbol: 'DIS', currentPrice: 105, previousClosePrice: 100, companyName: 'DIS', dailyClosesInRange: [100, 105] },
      { symbol: 'AMZN', currentPrice: 80, previousClosePrice: 100, companyName: 'AMZN', dailyClosesInRange: [100, 80] },
    ]);

    const result = await service.calculate({
      period: MoverPeriod.ONE_DAY,
      type: MoverType.MOST_VOLATILE,
      limit: 10,
    });

    expect(result.data[0].symbol).toBe('AMZN');
    expect(result.data[0].volatility).toBe(20);
  });
});