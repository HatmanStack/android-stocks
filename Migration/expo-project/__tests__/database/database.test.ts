import { initializeDatabase, getDatabase, resetDatabase, closeDatabase } from '@/database/database';
import * as SQLite from 'expo-sqlite';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('Database', () => {
  let mockDatabase: any;

  beforeEach(() => {
    // Create mock database instance
    mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([{ name: 'stock_details' }]),
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
      closeAsync: jest.fn().mockResolvedValue(undefined),
    };

    // Mock openDatabaseAsync to return our mock database
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeDatabase', () => {
    it('should initialize database without errors', async () => {
      await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should open database with correct name', async () => {
      await initializeDatabase();
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('stock_sentiment.db');
    });

    it('should check if tables exist', async () => {
      await initializeDatabase();
      expect(mockDatabase.getAllAsync).toHaveBeenCalled();
    });
  });

  describe('getDatabase', () => {
    it('should return a database instance', async () => {
      const db = await getDatabase();
      expect(db).toBeDefined();
      expect(db).toBe(mockDatabase);
    });

    it('should initialize database if not already initialized', async () => {
      const db = await getDatabase();
      expect(SQLite.openDatabaseAsync).toHaveBeenCalled();
      expect(db).toBe(mockDatabase);
    });

    it('should return same instance on multiple calls (singleton)', async () => {
      const db1 = await getDatabase();
      const db2 = await getDatabase();
      expect(db1).toBe(db2);
      // openDatabaseAsync should only be called once
      expect(SQLite.openDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      await getDatabase();
      await closeDatabase();
      expect(mockDatabase.closeAsync).toHaveBeenCalled();
    });

    it('should allow re-initialization after close', async () => {
      await getDatabase();
      await closeDatabase();

      // Reset mock
      jest.clearAllMocks();
      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);

      await getDatabase();
      expect(SQLite.openDatabaseAsync).toHaveBeenCalled();
    });
  });

  describe('resetDatabase', () => {
    it('should drop and recreate tables in development mode', async () => {
      // Ensure __DEV__ is true
      (global as any).__DEV__ = true;

      await resetDatabase();

      // Should execute DROP statements and CREATE statements
      expect(mockDatabase.execAsync).toHaveBeenCalled();
    });
  });
});
