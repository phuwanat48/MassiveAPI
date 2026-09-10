import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoversTables1730000000000 implements MigrationInterface {
  name = 'CreateMoversTables1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        symbol VARCHAR(10) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_prices (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol),
        price_date DATE NOT NULL,
        close_price NUMERIC(12,4) NOT NULL,
        UNIQUE(symbol, price_date)
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date
      ON stock_prices(symbol, price_date DESC);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mover_results (
        id SERIAL PRIMARY KEY,
        period VARCHAR(4) NOT NULL,
        type VARCHAR(10) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        current_price NUMERIC(12,4),
        previous_close_price NUMERIC(12,4),
        change_amount NUMERIC(12,4),
        change_percent NUMERIC(8,4),
        volatility NUMERIC(8,4),
        calculated_at TIMESTAMPTZ NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS mover_results;`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_prices;`);
    await queryRunner.query(`DROP TABLE IF EXISTS stocks;`);
  }
}
