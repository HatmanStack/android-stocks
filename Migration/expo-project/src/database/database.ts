/**
 * Database initialization and connection management
 * Singleton pattern ensures only one database instance exists
 */

import * as SQLite from 'expo-sqlite';
import { DB_NAME, DB_VERSION } from '@/constants/database.constants';
import { ALL_TABLES, CREATE_INDEXES, DROP_ALL_TABLES } from './schema';

// Singleton database instance
let database: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

/**
 * Initialize the SQLite database
 * Creates all tables and indexes if they don't exist
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log(`[Database] Initializing database: ${DB_NAME}`);

    // Open or create the database
    database = await SQLite.openDatabaseAsync(DB_NAME);

    // Check if tables exist
    const tablesExist = await checkTablesExist();

    if (!tablesExist) {
      console.log('[Database] Tables do not exist, creating schema...');
      await createTables();
    } else {
      console.log('[Database] Tables already exist');
    }

    // Check version for migrations (future use)
    const currentVersion = await getDatabaseVersion();
    if (currentVersion !== DB_VERSION) {
      console.log(`[Database] Version mismatch: ${currentVersion} -> ${DB_VERSION}`);
      // Future: Add migration logic here
    }

    isInitialized = true;
    console.log('[Database] Initialization complete');
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

/**
 * Get the database instance
 * Initializes if not already initialized
 * @returns The SQLite database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!isInitialized || !database) {
    await initializeDatabase();
  }

  if (!database) {
    throw new Error('Database is not initialized');
  }

  return database;
}

/**
 * Create all database tables and indexes
 */
async function createTables(): Promise<void> {
  if (!database) {
    throw new Error('Database is not initialized');
  }

  try {
    // Create all tables
    for (const tableSQL of ALL_TABLES) {
      console.log('[Database] Creating table...');
      await database.execAsync(tableSQL);
    }

    // Create indexes
    console.log('[Database] Creating indexes...');
    await database.execAsync(CREATE_INDEXES);

    console.log('[Database] All tables and indexes created successfully');
  } catch (error) {
    console.error('[Database] Error creating tables:', error);
    throw new Error(`Failed to create tables: ${error}`);
  }
}

/**
 * Check if tables exist in the database
 * @returns true if at least one table exists
 */
async function checkTablesExist(): Promise<boolean> {
  if (!database) {
    return false;
  }

  try {
    const result = await database.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='stock_details'`
    );
    return result.length > 0;
  } catch (error) {
    console.error('[Database] Error checking tables:', error);
    return false;
  }
}

/**
 * Get the current database version
 * Uses PRAGMA user_version
 * @returns The database version number
 */
async function getDatabaseVersion(): Promise<number> {
  if (!database) {
    return 0;
  }

  try {
    const result = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version'
    );
    return result?.user_version || 0;
  } catch (error) {
    console.error('[Database] Error getting version:', error);
    return 0;
  }
}

/**
 * Set the database version
 * Uses PRAGMA user_version
 * @param version - The version number to set
 */
async function setDatabaseVersion(version: number): Promise<void> {
  if (!database) {
    throw new Error('Database is not initialized');
  }

  try {
    await database.execAsync(`PRAGMA user_version = ${version}`);
  } catch (error) {
    console.error('[Database] Error setting version:', error);
    throw new Error(`Failed to set database version: ${error}`);
  }
}

/**
 * Reset the database (drops all tables and recreates)
 * USE WITH CAUTION - This deletes all data
 * Only available in development mode
 */
export async function resetDatabase(): Promise<void> {
  if (!__DEV__) {
    throw new Error('resetDatabase() is only available in development mode');
  }

  try {
    console.log('[Database] Resetting database...');

    if (!database) {
      database = await SQLite.openDatabaseAsync(DB_NAME);
    }

    // Drop all tables
    await database.execAsync(DROP_ALL_TABLES);
    console.log('[Database] All tables dropped');

    // Recreate tables
    await createTables();

    // Reset version
    await setDatabaseVersion(DB_VERSION);

    console.log('[Database] Database reset complete');
  } catch (error) {
    console.error('[Database] Error resetting database:', error);
    throw new Error(`Failed to reset database: ${error}`);
  }
}

/**
 * Close the database connection
 * USE WITH CAUTION - This should only be called when the app is shutting down
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    try {
      await database.closeAsync();
      database = null;
      isInitialized = false;
      console.log('[Database] Database connection closed');
    } catch (error) {
      console.error('[Database] Error closing database:', error);
      throw new Error(`Failed to close database: ${error}`);
    }
  }
}
