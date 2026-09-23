import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'mover_results' })
export class MoverResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 4 })
  period: string; // 1D | 1W | 1M

  @Column({ type: 'varchar', length: 20 })
  type: string; // gainers | losers| most_volatile

  @Column({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ name: 'current_price', type: 'numeric', precision: 12, scale: 4 })
  currentPrice: number;

  @Column({
    name: 'previous_close_price',
    type: 'numeric',
    precision: 12,
    scale: 4,
  })
  previousClosePrice: number;

  @Column({ name: 'change_amount', type: 'numeric', precision: 12, scale: 4 })
  changeAmount: number;

  @Column({ name: 'change_percent', type: 'numeric', precision: 8, scale: 4 })
  changePercent: number;

  @Column({ type: 'numeric', precision: 8, scale: 4 })
  volatility: number;

  @Column({ name: 'calculated_at', type: 'timestamptz' })
  calculatedAt: Date;
}
