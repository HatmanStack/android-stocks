import * as WordCountRepository from '@/database/repositories/wordCount.repository';
import { getDatabase } from '@/database/database';
import { WordCountDetails } from '@/types/database.types';

jest.mock('@/database/database');

describe('WordCountRepository', () => {
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

  const mockWordCount: Omit<WordCountDetails, 'id'> = {
    date: '2025-01-15',
    hash: 12345,
    ticker: 'AAPL',
    positive: 25,
    negative: 10,
    nextDay: 0.025,
    twoWks: 0.05,
    oneMnth: 0.08,
    body: 'Article content here',
    sentiment: 'POS',
    sentimentNumber: 0.6,
  };

  describe('findByTicker', () => {
    it('should return word counts for a ticker', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ ...mockWordCount, id: 1 }]);

      const result = await WordCountRepository.findByTicker('AAPL');

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
    });
  });

  describe('findByTickerAndDate', () => {
    it('should return word counts for ticker and date', async () => {
      mockDb.getAllAsync.mockResolvedValue([{ ...mockWordCount, id: 1 }]);

      const result = await WordCountRepository.findByTickerAndDate('AAPL', '2025-01-15');

      expect(result).toHaveLength(1);
    });
  });

  describe('insert', () => {
    it('should insert a word count record', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42 });

      const result = await WordCountRepository.insert(mockWordCount);

      expect(result).toBe(42);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple word count records', async () => {
      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
      mockDb.withTransactionAsync.mockImplementation(async (callback: () => Promise<void>) => {
        await callback();
      });

      await WordCountRepository.insertMany([mockWordCount, mockWordCount]);

      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
    });
  });

  describe('existsByHash', () => {
    it('should return true if word count exists', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 1 });

      const result = await WordCountRepository.existsByHash(12345);

      expect(result).toBe(true);
    });

    it('should return false if word count does not exist', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      const result = await WordCountRepository.existsByHash(99999);

      expect(result).toBe(false);
    });
  });

  describe('deleteByTicker', () => {
    it('should delete word counts for a ticker', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 10 });

      await WordCountRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });
});
