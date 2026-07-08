export interface MarketRate {
  price: number;
  buybackPrice?: number; // representing buyback price (harga jual kembali)
  change: number; // Percentage change (e.g. 0.48 for +0.48%, -0.23 for -0.23%)
  status: "up" | "down" | "stable";
  updated_at: string;
}

export interface IMarketProvider {
  name: string;
  fetchRate(): Promise<MarketRate | null>;
}
