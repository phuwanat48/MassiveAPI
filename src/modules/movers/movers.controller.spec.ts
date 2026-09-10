import { Test, TestingModule } from '@nestjs/testing';
import { CalculateMoversDto, MoverPeriod, MoverType } from './dto/calculate-movers.dto';
import { MoversController } from './movers.controller';
import { MoversService } from './movers.service';

describe('MoversController', () => {
  let controller: MoversController;
  let service: jest.Mocked<MoversService>;

  beforeEach(async () => {
    const mockService = {
      calculate: jest.fn().mockResolvedValue({
        period: '1D',
        type: 'gainer',
        data: [],
        total_results: 0,
        calculated_at: new Date().toISOString(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoversController],
      providers: [{ provide: MoversService, useValue: mockService }],
    }).compile();

    controller = module.get<MoversController>(MoversController);
    service = module.get(MoversService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call moversService.calculate with provided dto', async () => {
    const dto: CalculateMoversDto = {
      period: MoverPeriod.ONE_WEEK,
      type: MoverType.MOST_VOLATILE,
      limit: 5,
    };

    const response = await controller.calculate(dto);

    expect(service.calculate).toHaveBeenCalledWith(dto);
    expect(response).toHaveProperty('period', '1D');
  });
});