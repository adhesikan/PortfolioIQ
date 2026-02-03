export type PriceProvider = {
  getLatestPrices: (tickers: string[]) => Promise<Record<string, number>>;
  getHistory: (ticker: string, range: "1m" | "3m" | "1y") => Promise<number[]>;
};

export class MockPriceProvider implements PriceProvider {
  async getLatestPrices(tickers: string[]) {
    return tickers.reduce<Record<string, number>>((acc, ticker) => {
      acc[ticker] = 100 + ticker.length * 3;
      return acc;
    }, {});
  }

  async getHistory() {
    return [100, 98, 103, 101, 99, 105];
  }
}
