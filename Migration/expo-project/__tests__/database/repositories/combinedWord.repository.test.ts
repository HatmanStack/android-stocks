import * as CombinedWordRepository from '@/database/repositories/combinedWord.repository';
import { getDatabase } from '@/database/database';
import { CombinedWordDetails } from '@/types/database.types';

jest.mock('@/database/database');

describe('CombinedWordRepository', () => {
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

  const mockCombinedWord: CombinedWordDetails = {
    date: '2025-01-15',
    ticker: 'AAPL',
    positive: 120,
    negative: 45,
    sentimentNumber: 0.625,
    sentiment: 'POS',
    nextDay: 0.03,
    twoWks: 0.06,
    oneMnth: 0.09,
    updateDate: '2025-01-15T12:00:00Z',
  };

  describe('findByTicker', () => {
    it('should return combined word counts for a ticker', async () => {
      mockDb.getAllAsync.mockResolvedValue([mockCombinedWord]);

      const result = await CombinedWordRepository.findByTicker('AAPL');

      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
    });
  });

  describe('findByTickerAndDateRange', () => {
    it('should return combined word counts within date range', async () => {
      mockDb.getAllAsync.mockResolvedValue([mockCombinedWord]);

      const result = await CombinedWordRepository.findByTickerAndDateRange(
        'AAPL',
        '2025-01-01',
        '2025-01-31'
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('findByDate', () => {
    it('should return combined word count for a date', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockCombinedWord);

      const result = await CombinedWordRepository.findByDate('2025-01-15');

      expect(result).toEqual(mockCombinedWord);
    });

    it('should return null if not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await CombinedWordRepository.findByDate('2025-12-31');

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert or update combined word count', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await CombinedWordRepository.upsert(mockCombinedWord);

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteByTickerAndDate', () => {
    it('should delete combined word count for ticker and date', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await CombinedWordRepository.deleteByTickerAndDate('AAPL', '2025-01-15');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteByTicker', () => {
    it('should delete all combined word counts for ticker', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 30 });

      await CombinedWordRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });
});
