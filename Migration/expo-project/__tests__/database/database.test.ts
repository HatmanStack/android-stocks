import { initializeDatabase, getDatabase, resetDatabase, closeDatabase } from '@/database/database';
import * as SQLite from 'expo-sqlite';

describe('Database', () => {
  let mockDatabase: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock database instance with all required methods
    mockDatabase = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([{ name: 'stock_details' }]),
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 1 }),
      closeAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
      withTransactionAsync: jest.fn((callback) => callback()),
    };

    // Configure the global mock from __mocks__/expo-sqlite.ts
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);
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
      expect(db).toHaveProperty('execAsync');
      expect(db).toHaveProperty('getAllAsync');
    });

    it('should initialize database if not already initialized', async () => {
      const db = await getDatabase();
      expect(db).toBeDefined();
      expect(db).toHaveProperty('getFirstAsync');
      expect(db).toHaveProperty('closeAsync');
    });

    it('should return same instance on multiple calls (singleton)', async () => {
      const db1 = await getDatabase();
      const db2 = await getDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection without errors', async () => {
      await getDatabase();
      await expect(closeDatabase()).resolves.not.toThrow();
    });

    it('should allow re-initialization after close', async () => {
      await getDatabase();
      await closeDatabase();

      // Re-configure mock for new connection
      (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);

      const db = await getDatabase();
      expect(db).toBeDefined();
    });
  });

  describe('resetDatabase', () => {
    it('should reset database in development mode without errors', async () => {
      // Ensure __DEV__ is true
      (global as any).__DEV__ = true;

      await expect(resetDatabase()).resolves.not.toThrow();
    });
  });
});
