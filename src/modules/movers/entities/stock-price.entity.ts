import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'stock_prices' })
@Index(['symbol', 'priceDate'], { unique: true })
export class StockPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ name: 'price_date', type: 'date' })
  priceDate: string; // 'YYYY-MM-DD'

  @Column({ name: 'close_price', type: 'numeric', precision: 12, scale: 4 })
  closePrice: number;
}
