-- Run this in pgAdmin (or psql) against your stockapi database
-- to test the happy path without a real Massive API connection.
-- Covers 1D, 1W and 1M so you can test any period value.

INSERT INTO stocks (symbol, company_name) VALUES
  ('AAPL', 'Apple Inc.'),
  ('TSLA', 'Tesla Inc.'),
  ('MSFT', 'Microsoft Corporation')
ON CONFLICT (symbol) DO NOTHING;

-- 35 days of daily closes per symbol, mildly randomised, so 1D/1W/1M all
-- have enough data points for both the completeness check and volatility.
INSERT INTO stock_prices (symbol, price_date, close_price)
SELECT
  s.symbol,
  (CURRENT_DATE - (d.n || ' days')::interval)::date,
  s.base_price + (random() - 0.5) * s.base_price * 0.05 * d.n / 35
FROM (
  VALUES ('AAPL', 195.0), ('TSLA', 250.0), ('MSFT', 410.0)
) AS s(symbol, base_price)
CROSS JOIN generate_series(0, 35) AS d(n)
ON CONFLICT (symbol, price_date) DO NOTHING;
