/**
 * CombinedWord Repository
 * Data access layer for CombinedWordDetails entity (daily aggregated sentiment)
 */

import { getDatabase } from '../database';
import { CombinedWordDetails } from '@/types/database.types';
import { TABLE_NAMES } from '@/constants/database.constants';

/**
 * Find all combined word count records for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Array of combined word details
 */
export async function findByTicker(ticker: string): Promise<CombinedWordDetails[]> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.COMBINED_WORD_DETAILS} WHERE ticker = ? ORDER BY date DESC`;

  try {
    const results = await db.getAllAsync<CombinedWordDetails>(sql, [ticker]);
    return results;
  } catch (error) {
    console.error('[CombinedWordRepository] Error finding by ticker:', error);
    return [];
  }
}

/**
 * Find combined word count records for a ticker within a date range
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of combined word details
 */
export async function findByTickerAndDateRange(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<CombinedWordDetails[]> {
  const db = await getDatabase();
  const sql = `
    SELECT * FROM ${TABLE_NAMES.COMBINED_WORD_DETAILS}
    WHERE ticker = ? AND date >= ? AND date <= ?
    ORDER BY date DESC
  `;

  try {
    const results = await db.getAllAsync<CombinedWordDetails>(sql, [ticker, startDate, endDate]);
    return results;
  } catch (error) {
    console.error('[CombinedWordRepository] Error finding by ticker and date range:', error);
    return [];
  }
}

/**
 * Find combined word count for a specific date (primary key)
 * @param date - Date string
 * @returns Combined word details or null
 */
export async function findByDate(date: string): Promise<CombinedWordDetails | null> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.COMBINED_WORD_DETAILS} WHERE date = ?`;

  try {
    const result = await db.getFirstAsync<CombinedWordDetails>(sql, [date]);
    return result || null;
  } catch (error) {
    console.error('[CombinedWordRepository] Error finding by date:', error);
    return null;
  }
}

/**
 * Insert or update a combined word count record
 * Uses INSERT OR REPLACE since date is the primary key
 * @param combinedWord - Combined word details
 */
export async function upsert(combinedWord: CombinedWordDetails): Promise<void> {
  const db = await getDatabase();
  const sql = `
    INSERT OR REPLACE INTO ${TABLE_NAMES.COMBINED_WORD_DETAILS} (
      date, ticker, positive, negative, sentimentNumber,
      sentiment, nextDay, twoWks, oneMnth, updateDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.runAsync(sql, [
      combinedWord.date,
      combinedWord.ticker,
      combinedWord.positive,
      combinedWord.negative,
      combinedWord.sentimentNumber,
      combinedWord.sentiment,
      combinedWord.nextDay,
      combinedWord.twoWks,
      combinedWord.oneMnth,
      combinedWord.updateDate,
    ]);
  } catch (error) {
    console.error('[CombinedWordRepository] Error upserting combined word:', error);
    throw new Error(`Failed to upsert combined word: ${error}`);
  }
}

/**
 * Delete combined word records by ticker and date
 * @param ticker - Stock ticker symbol
 * @param date - Date string
 */
export async function deleteByTickerAndDate(ticker: string, date: string): Promise<void> {
  const db = await getDatabase();
  const sql = `DELETE FROM ${TABLE_NAMES.COMBINED_WORD_DETAILS} WHERE ticker = ? AND date = ?`;

  try {
    await db.runAsync(sql, [ticker, date]);
  } catch (error) {
    console.error('[CombinedWordRepository] Error deleting by ticker and date:', error);
    throw new Error(`Failed to delete combined word for ticker ${ticker} on ${date}: ${error}`);
  }
}

/**
 * Delete all combined word records for a ticker
 * @param ticker - Stock ticker symbol
 */
export async function deleteByTicker(ticker: string): Promise<void> {
  const db = await getDatabase();
  const sql = `DELETE FROM ${TABLE_NAMES.COMBINED_WORD_DETAILS} WHERE ticker = ?`;

  try {
    await db.runAsync(sql, [ticker]);
  } catch (error) {
    console.error('[CombinedWordRepository] Error deleting by ticker:', error);
    throw new Error(`Failed to delete combined words for ticker ${ticker}: ${error}`);
  }
}
