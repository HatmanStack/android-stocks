/**
 * Stock Repository
 * Data access layer for StockDetails entity
 */

import { getDatabase } from '../database';
import { StockDetails } from '@/types/database.types';
import { TABLE_NAMES } from '@/constants/database.constants';

/**
 * Find all stock records for a given ticker
 * @param ticker - Stock ticker symbol
 * @returns Array of stock details
 */
export async function findByTicker(ticker: string): Promise<StockDetails[]> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.STOCK_DETAILS} WHERE ticker = ? ORDER BY date DESC`;

  try {
    const results = await db.getAllAsync<StockDetails>(sql, [ticker]);
    return results;
  } catch (error) {
    console.error('[StockRepository] Error finding by ticker:', error);
    throw new Error(`Failed to find stocks for ticker ${ticker}: ${error}`);
  }
}

/**
 * Find stock records for a ticker within a date range
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date (ISO 8601 format)
 * @param endDate - End date (ISO 8601 format)
 * @returns Array of stock details
 */
export async function findByTickerAndDateRange(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<StockDetails[]> {
  const db = await getDatabase();
  const sql = `
    SELECT * FROM ${TABLE_NAMES.STOCK_DETAILS}
    WHERE ticker = ? AND date >= ? AND date <= ?
    ORDER BY date DESC
  `;

  try {
    const results = await db.getAllAsync<StockDetails>(sql, [ticker, startDate, endDate]);
    return results;
  } catch (error) {
    console.error('[StockRepository] Error finding by ticker and date range:', error);
    throw new Error(`Failed to find stocks for ticker ${ticker} in date range: ${error}`);
  }
}

/**
 * Insert a single stock record
 * @param stock - Stock details (id will be auto-generated)
 * @returns The ID of the inserted record
 */
export async function insert(stock: Omit<StockDetails, 'id'>): Promise<number> {
  const db = await getDatabase();
  const sql = `
    INSERT INTO ${TABLE_NAMES.STOCK_DETAILS} (
      hash, date, ticker, close, high, low, open, volume,
      adjClose, adjHigh, adjLow, adjOpen, adjVolume,
      divCash, splitFactor, marketCap, enterpriseVal,
      peRatio, pbRatio, trailingPEG1Y
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await db.runAsync(sql, [
      stock.hash,
      stock.date,
      stock.ticker,
      stock.close,
      stock.high,
      stock.low,
      stock.open,
      stock.volume,
      stock.adjClose,
      stock.adjHigh,
      stock.adjLow,
      stock.adjOpen,
      stock.adjVolume,
      stock.divCash,
      stock.splitFactor,
      stock.marketCap,
      stock.enterpriseVal,
      stock.peRatio,
      stock.pbRatio,
      stock.trailingPEG1Y,
    ]);

    return result.lastInsertRowId;
  } catch (error) {
    console.error('[StockRepository] Error inserting stock:', error);
    throw new Error(`Failed to insert stock: ${error}`);
  }
}

/**
 * Insert multiple stock records in a transaction
 * @param stocks - Array of stock details
 */
export async function insertMany(stocks: Omit<StockDetails, 'id'>[]): Promise<void> {
  const db = await getDatabase();

  try {
    await db.withTransactionAsync(async () => {
      for (const stock of stocks) {
        await insert(stock);
      }
    });
  } catch (error) {
    console.error('[StockRepository] Error inserting multiple stocks:', error);
    throw new Error(`Failed to insert stocks: ${error}`);
  }
}

/**
 * Delete all stock records for a given ticker
 * @param ticker - Stock ticker symbol
 */
export async function deleteByTicker(ticker: string): Promise<void> {
  const db = await getDatabase();
  const sql = `DELETE FROM ${TABLE_NAMES.STOCK_DETAILS} WHERE ticker = ?`;

  try {
    await db.runAsync(sql, [ticker]);
  } catch (error) {
    console.error('[StockRepository] Error deleting by ticker:', error);
    throw new Error(`Failed to delete stocks for ticker ${ticker}: ${error}`);
  }
}

/**
 * Count total stock records for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Number of records
 */
export async function countByTicker(ticker: string): Promise<number> {
  const db = await getDatabase();
  const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAMES.STOCK_DETAILS} WHERE ticker = ?`;

  try {
    const result = await db.getFirstAsync<{ count: number }>(sql, [ticker]);
    return result?.count || 0;
  } catch (error) {
    console.error('[StockRepository] Error counting by ticker:', error);
    return 0;
  }
}

/**
 * Get the latest stock record for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Latest stock details or null if not found
 */
export async function findLatestByTicker(ticker: string): Promise<StockDetails | null> {
  const db = await getDatabase();
  const sql = `
    SELECT * FROM ${TABLE_NAMES.STOCK_DETAILS}
    WHERE ticker = ?
    ORDER BY date DESC
    LIMIT 1
  `;

  try {
    const result = await db.getFirstAsync<StockDetails>(sql, [ticker]);
    return result || null;
  } catch (error) {
    console.error('[StockRepository] Error finding latest by ticker:', error);
    return null;
  }
}
