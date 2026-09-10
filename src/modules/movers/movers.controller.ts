import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CalculateMoversDto } from './dto/calculate-movers.dto';
import { MoversService } from './movers.service';

@Controller('movers')
export class MoversController {
  constructor(private readonly moversService: MoversService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculate(@Body() dto: CalculateMoversDto) {
    return this.moversService.calculate(dto);
  }
}