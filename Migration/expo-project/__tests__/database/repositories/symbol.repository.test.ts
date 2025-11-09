import * as SymbolRepository from '@/database/repositories/symbol.repository';
import { getDatabase } from '@/database/database';
import { SymbolDetails } from '@/types/database.types';

jest.mock('@/database/database');

describe('SymbolRepository', () => {
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

  describe('findByTicker', () => {
    it('should return symbol details for a valid ticker', async () => {
      const mockSymbol: SymbolDetails = {
        id: 1,
        longDescription: 'Apple Inc. is a technology company',
        exchangeCode: 'NASDAQ',
        name: 'Apple Inc.',
        startDate: '2015-01-01',
        ticker: 'AAPL',
        endDate: '2026-01-01',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockSymbol);

      const result = await SymbolRepository.findByTicker('AAPL');

      expect(result).toEqual(mockSymbol);
    });

    it('should return null for non-existent ticker', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await SymbolRepository.findByTicker('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all symbols', async () => {
      const mockSymbols: SymbolDetails[] = [
        {
          id: 1,
          ticker: 'AAPL',
          name: 'Apple Inc.',
          exchangeCode: 'NASDAQ',
          longDescription: 'Technology company',
          startDate: '2015-01-01',
          endDate: '2026-01-01',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockSymbols);

      const result = await SymbolRepository.findAll();

      expect(result).toEqual(mockSymbols);
    });
  });

  describe('insert', () => {
    it('should insert a symbol record', async () => {
      const symbolData: Omit<SymbolDetails, 'id'> = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        exchangeCode: 'NASDAQ',
        longDescription: 'Technology company',
        startDate: '2015-01-01',
        endDate: '2026-01-01',
      };

      mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 42 });

      const result = await SymbolRepository.insert(symbolData);

      expect(result).toBe(42);
    });
  });

  describe('update', () => {
    it('should update a symbol record', async () => {
      const symbolData: Omit<SymbolDetails, 'id'> = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        exchangeCode: 'NASDAQ',
        longDescription: 'Updated description',
        startDate: '2015-01-01',
        endDate: '2026-01-01',
      };

      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await SymbolRepository.update('AAPL', symbolData);

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteByTicker', () => {
    it('should delete a symbol', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await SymbolRepository.deleteByTicker('AAPL');

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('existsByTicker', () => {
    it('should return true if symbol exists', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 1 });

      const result = await SymbolRepository.existsByTicker('AAPL');

      expect(result).toBe(true);
    });

    it('should return false if symbol does not exist', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ count: 0 });

      const result = await SymbolRepository.existsByTicker('INVALID');

      expect(result).toBe(false);
    });
  });
});
