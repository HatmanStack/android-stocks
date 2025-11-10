import * as StockRepository from '@/database/repositories/stock.repository';
import { getDatabase } from '@/database/database';
import { StockDetails } from '@/types/database.types';

// Mock the database module
jest.mock('@/database/database');

describe('StockRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a fresh mock database for each test
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
    };

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('findByTicker', () => {
    it('should return stock details for a valid ticker', async () => {
      const mockStocks: StockDetails[] = [
        {
          id: 1,
          hash: 1,
          date: '2025-01-15',
          ticker: 'AAPL',
          close: 150.5,
          high: 152.0,
          low: 149.0,
          open: 150.0,
          volume: 50000000,
          adjClose: 150.5,
          adjHigh: 152.0,
          adjLow: 149.0,
          adjOpen: 150.0,
          adjVolume: 50000000,
          divCash: 0,
          splitFactor: 1,
          marketCap: 2500000000,
          enterpriseVal: 2600000000,
          peRatio: 25.5,
          pbRatio: 5.2,
          trailingPEG1Y: 1.5,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockStocks);

      const result = await StockRepository.findByTicker('AAPL');

      expect(result).toEqual(mockStocks);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM stock_details WHERE ticker = ?'),
        ['AAPL']
      );
    });

    it('should return empty array for non-existent ticker', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await StockRepository.findByTicker('INVALID');

      expect(result).toEqual([]);
    });
  });

  describe('findByTickerAndDateRange', () => {
    it('should return stocks within date range', async () => {
      const mockStocks: StockDetails[] = [
        {
          id: 1,
          hash: 1,
          date: '2025-01-10',
          ticker: 'AAPL',
          close: 150.0,
          high: 151.0,
          low: 149.0,
          open: 150.0,
          volume: 50000000,
          adjClose: 150.0,
          adjHigh: 151.0,
          adjLow: 149.0,
          adjOpen: 150.0,
          adjVolume: 50000000,
          divCash: 0,
          splitFactor: 1,
          marketCap: 2500000000,
          enterpriseVal: 2600000000,
          peRatio: 25.5,
          pbRatio: 5.2,
          trailingPEG1Y: 1.5,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockStocks);

      const result = await StockRepository.findByTickerAndDateRange(
        'AAPL',
        '2025-01-01',
        '2025-01-15'
      );

      expect(result).toEqual(mockStocks);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ticker = ? AND date >= ? AND date <= ?'),
        ['AAPL', '2025-01-01', '2025-01-15']
      );
    });
  });

  describe('insert', () => {
    it('should insert a single stock record', async () => {
      const stockData: Omit<StockDetails, 'id'> = {
        hash: 1,
        date: '2025-01-15',
        ticker: 'AAPL',
        close: 150.5,
        high: 152.0,
        low: 149.0,
        open: 150.0,
        volume: 50000000,
        adjClose: 150.5,
        adjHigh: 152.0,
        adjLow: 149.0,
        adjOpen: 150.0,
        adjVolume: 50000000,
        divCash: 0,
        splitFactor: 1,
        marketCap: 2500000000,
        enterpriseVal: 2600000000,
        peRatio: 25.5,
        pbRatio: 5.2,
        trailingPEG1Y: 1.5,
      };

      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42 });

      const result = await StockRepository.insert(stockData);

      expect(result).toBe(42);
      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('insertMany', () => {
    it('should insert multiple stock records in a transaction', async () => {
      const stocks: Omit<StockDetails, 'id'>[] = [
        {
          hash: 1,
          date: '2025-01-15',
          ticker: 'AAPL',
          close: 150.5,
          high: 152.0,
          low: 149.0,
          open: 150.0,
          volume: 50000000,
          adjClose: 150.5,
          adjHigh: 152.0,
          adjLow: 149.0,
          adjOpen: 150.0,
          adjVolume: 50000000,
          divCash: 0,
          splitFactor: 1,
          marketCap: 2500000000,
          enterpriseVal: 2600000000,
          peRatio: 25.5,
          pbRatio: 5.2,
          trailingPEG1Y: 1.5,
        },
        {
          hash: 2,
          date: '2025-01-16',
          ticker: 'AAPL',
          close: 151.0,
          high: 153.0,
          low: 150.0,
          open: 151.0,
          volume: 55000000,
          adjClose: 151.0,
          adjHigh: 153.0,
          adjLow: 150.0,
          adjOpen: 151.0,
          adjVolume: 55000000,
          divCash: 0,
          splitFactor: 1,
          marketCap: 2550000000,
          enterpriseVal: 2650000000,
          peRatio: 25.8,
          pbRatio: 5.3,
          trailingPEG1Y: 1.6,
        },
      ];

      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
      mockDb.withTransactionAsync.mockImplementation(async (callback: () => Promise<void>) => {
        await callback();
      });

      await StockRepository.insertMany(stocks);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
    });
  });

  describe('deleteByTicker', () => {
    it('should delete all stocks for a ticker', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 5 });

      await StockRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM stock_details WHERE ticker = ?'),
        ['AAPL']
      );
    });
  });

  describe('countByTicker', () => {
    it('should return count of stocks for a ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 30 });

      const result = await StockRepository.countByTicker('AAPL');

      expect(result).toBe(30);
    });

    it('should return 0 for non-existent ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await StockRepository.countByTicker('INVALID');

      expect(result).toBe(0);
    });
  });

  describe('findLatestByTicker', () => {
    it('should return the most recent stock record', async () => {
      const mockStock: StockDetails = {
        id: 1,
        hash: 1,
        date: '2025-01-15',
        ticker: 'AAPL',
        close: 150.5,
        high: 152.0,
        low: 149.0,
        open: 150.0,
        volume: 50000000,
        adjClose: 150.5,
        adjHigh: 152.0,
        adjLow: 149.0,
        adjOpen: 150.0,
        adjVolume: 50000000,
        divCash: 0,
        splitFactor: 1,
        marketCap: 2500000000,
        enterpriseVal: 2600000000,
        peRatio: 25.5,
        pbRatio: 5.2,
        trailingPEG1Y: 1.5,
      };

      mockDb.getFirstAsync.mockResolvedValue(mockStock);

      const result = await StockRepository.findLatestByTicker('AAPL');

      expect(result).toEqual(mockStock);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date DESC'),
        ['AAPL']
      );
    });

    it('should return null for non-existent ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await StockRepository.findLatestByTicker('INVALID');

      expect(result).toBeNull();
    });
  });
});
