import * as PortfolioRepository from '@/database/repositories/portfolio.repository';
import { getDatabase } from '@/database/database';
import { PortfolioDetails } from '@/types/database.types';

jest.mock('@/database/database');

describe('PortfolioRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  const mockPortfolioEntry: PortfolioDetails = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    next: '+2.5%',
    wks: '+5.2%',
    mnth: '+8.1%',
  };

  describe('findAll', () => {
    it('should return all portfolio entries', async () => {
      mockDb.getAllAsync.mockResolvedValue([mockPortfolioEntry]);

      const result = await PortfolioRepository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
    });

    it('should return empty array for empty portfolio', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await PortfolioRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByTicker', () => {
    it('should return portfolio entry for ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockPortfolioEntry);

      const result = await PortfolioRepository.findByTicker('AAPL');

      expect(result).toEqual(mockPortfolioEntry);
    });

    it('should return null for non-existent ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await PortfolioRepository.findByTicker('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert or update portfolio entry', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await PortfolioRepository.upsert(mockPortfolioEntry);

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteByTicker', () => {
    it('should delete portfolio entry', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await PortfolioRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('existsByTicker', () => {
    it('should return true if ticker is in portfolio', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 1 });

      const result = await PortfolioRepository.existsByTicker('AAPL');

      expect(result).toBe(true);
    });

    it('should return false if ticker is not in portfolio', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      const result = await PortfolioRepository.existsByTicker('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total portfolio entries', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 5 });

      const result = await PortfolioRepository.count();

      expect(result).toBe(5);
    });
  });

  describe('deleteAll', () => {
    it('should delete all portfolio entries', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 5 });

      await PortfolioRepository.deleteAll();

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });
});
