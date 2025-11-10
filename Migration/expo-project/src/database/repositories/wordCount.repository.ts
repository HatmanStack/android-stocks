/**
 * WordCount Repository
 * Data access layer for WordCountDetails entity (per-article sentiment)
 */

import { getDatabase } from '../database';
import { WordCountDetails } from '@/types/database.types';
import { TABLE_NAMES } from '@/constants/database.constants';

/**
 * Find all word count records for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Array of word count details
 */
export async function findByTicker(ticker: string): Promise<WordCountDetails[]> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.WORD_COUNT_DETAILS} WHERE ticker = ? ORDER BY date DESC`;

  try {
    const results = await db.getAllAsync<WordCountDetails>(sql, [ticker]);
    return results;
  } catch (error) {
    console.error('[WordCountRepository] Error finding by ticker:', error);
    return [];
  }
}

/**
 * Find word count records for a specific ticker and date
 * @param ticker - Stock ticker symbol
 * @param date - Date string
 * @returns Array of word count details for that date
 */
export async function findByTickerAndDate(ticker: string, date: string): Promise<WordCountDetails[]> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.WORD_COUNT_DETAILS} WHERE ticker = ? AND date = ?`;

  try {
    const results = await db.getAllAsync<WordCountDetails>(sql, [ticker, date]);
    return results;
  } catch (error) {
    console.error('[WordCountRepository] Error finding by ticker and date:', error);
    return [];
  }
}

/**
 * Insert a word count record
 * @param wordCount - Word count details
 * @returns The ID of the inserted record
 */
export async function insert(wordCount: Omit<WordCountDetails, 'id'>): Promise<number> {
  const db = await getDatabase();
  const sql = `
    INSERT INTO ${TABLE_NAMES.WORD_COUNT_DETAILS} (
      date, hash, ticker, positive, negative, nextDay,
      twoWks, oneMnth, body, sentiment, sentimentNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await db.runAsync(sql, [
      wordCount.date,
      wordCount.hash,
      wordCount.ticker,
      wordCount.positive,
      wordCount.negative,
      wordCount.nextDay,
      wordCount.twoWks,
      wordCount.oneMnth,
      wordCount.body,
      wordCount.sentiment,
      wordCount.sentimentNumber,
    ]);

    return result.lastInsertRowId;
  } catch (error) {
    console.error('[WordCountRepository] Error inserting word count:', error);
    throw new Error(`Failed to insert word count: ${error}`);
  }
}

/**
 * Insert multiple word count records in a transaction
 * @param wordCounts - Array of word count details
 */
export async function insertMany(wordCounts: Omit<WordCountDetails, 'id'>[]): Promise<void> {
  const db = await getDatabase();

  try {
    await db.withTransactionAsync(async () => {
      for (const wordCount of wordCounts) {
        await insert(wordCount);
      }
    });
  } catch (error) {
    console.error('[WordCountRepository] Error inserting multiple word counts:', error);
    throw new Error(`Failed to insert word counts: ${error}`);
  }
}

/**
 * Check if a word count exists by hash
 * @param hash - Article hash
 * @returns true if word count exists
 */
export async function existsByHash(hash: number): Promise<boolean> {
  const db = await getDatabase();
  const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAMES.WORD_COUNT_DETAILS} WHERE hash = ?`;

  try {
    const result = await db.getFirstAsync<{ count: number }>(sql, [hash]);
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('[WordCountRepository] Error checking existence by hash:', error);
    return false;
  }
}

/**
 * Delete all word count records for a ticker
 * @param ticker - Stock ticker symbol
 */
export async function deleteByTicker(ticker: string): Promise<void> {
  const db = await getDatabase();
  const sql = `DELETE FROM ${TABLE_NAMES.WORD_COUNT_DETAILS} WHERE ticker = ?`;

  try {
    await db.runAsync(sql, [ticker]);
  } catch (error) {
    console.error('[WordCountRepository] Error deleting by ticker:', error);
    throw new Error(`Failed to delete word counts for ticker ${ticker}: ${error}`);
  }
}
