import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'stocks' })
export class Stock {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  symbol: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;
}
