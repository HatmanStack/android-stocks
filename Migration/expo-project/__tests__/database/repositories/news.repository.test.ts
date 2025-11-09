import * as NewsRepository from '@/database/repositories/news.repository';
import { getDatabase } from '@/database/database';
import { NewsDetails } from '@/types/database.types';

jest.mock('@/database/database');

describe('NewsRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  const mockNews: Omit<NewsDetails, 'id'> = {
    date: '2025-01-15',
    ticker: 'AAPL',
    articleTickers: 'AAPL',
    title: 'Apple reports strong earnings',
    articleDate: '2025-01-15T10:00:00Z',
    articleUrl: 'https://example.com/news/1',
    publisher: 'Bloomberg',
    ampUrl: 'https://example.com/amp/news/1',
    articleDescription: 'Apple reported strong quarterly earnings.',
  };

  describe('findByTicker', () => {
    it('should return news articles for a ticker', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ ...mockNews, id: 1 }]);

      const result = await NewsRepository.findByTicker('AAPL');

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
    });

    it('should return empty array for no news', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await NewsRepository.findByTicker('INVALID');

      expect(result).toEqual([]);
    });
  });

  describe('findByTickerAndDateRange', () => {
    it('should return news within date range', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ ...mockNews, id: 1 }]);

      const result = await NewsRepository.findByTickerAndDateRange(
        'AAPL',
        '2025-01-01',
        '2025-01-31'
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('insert', () => {
    it('should insert a news article', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42 });

      const result = await NewsRepository.insert(mockNews);

      expect(result).toBe(42);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple news articles', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
      mockDb.withTransactionAsync.mockImplementation(async (callback: () => Promise<void>) => {
        await callback();
      });

      await NewsRepository.insertMany([mockNews, mockNews]);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
    });
  });

  describe('existsByUrl', () => {
    it('should return true if article exists', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 1 });

      const result = await NewsRepository.existsByUrl('https://example.com/news/1');

      expect(result).toBe(true);
    });

    it('should return false if article does not exist', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      const result = await NewsRepository.existsByUrl('https://example.com/news/999');

      expect(result).toBe(false);
    });
  });

  describe('deleteByTicker', () => {
    it('should delete news for a ticker', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 5 });

      await NewsRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('countByTicker', () => {
    it('should return count of news articles', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 10 });

      const result = await NewsRepository.countByTicker('AAPL');

      expect(result).toBe(10);
    });
  });
});
