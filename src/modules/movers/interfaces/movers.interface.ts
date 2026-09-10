export interface PriceComparisonRow {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClosePrice: number;
  dailyClosesInRange: number[]; // used to compute volatility
}

export interface StockMoverItem {
  symbol: string;
  company_name: string;
  current_price: number;
  previous_close_price: number;
  change_amount: number;
  change_percent: number;
  volatility: number;
}

export interface TopMoversResponse {
  period: string;
  type: string;
  data: StockMoverItem[];
  total_results: number;
  calculated_at: string;
}

export interface MassiveApiPricePoint {
  symbol: string;
  companyName: string;
  priceDate: string; // 'YYYY-MM-DD'
  closePrice: number;
}
