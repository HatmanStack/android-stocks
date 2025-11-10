/**
 * News Repository
 * Data access layer for NewsDetails entity
 */

import { getDatabase } from '../database';
import { NewsDetails } from '@/types/database.types';
import { TABLE_NAMES } from '@/constants/database.constants';

/**
 * Find all news articles for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Array of news articles
 */
export async function findByTicker(ticker: string): Promise<NewsDetails[]> {
  const db = await getDatabase();
  const sql = `SELECT * FROM ${TABLE_NAMES.NEWS_DETAILS} WHERE ticker = ? ORDER BY articleDate DESC`;

  try {
    const results = await db.getAllAsync<NewsDetails>(sql, [ticker]);
    return results;
  } catch (error) {
    console.error('[NewsRepository] Error finding by ticker:', error);
    return [];
  }
}

/**
 * Find news articles for a ticker within a date range
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of news articles
 */
export async function findByTickerAndDateRange(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<NewsDetails[]> {
  const db = await getDatabase();
  const sql = `
    SELECT * FROM ${TABLE_NAMES.NEWS_DETAILS}
    WHERE ticker = ? AND date >= ? AND date <= ?
    ORDER BY articleDate DESC
  `;

  try {
    const results = await db.getAllAsync<NewsDetails>(sql, [ticker, startDate, endDate]);
    return results;
  } catch (error) {
    console.error('[NewsRepository] Error finding by ticker and date range:', error);
    return [];
  }
}

/**
 * Insert a news article
 * @param news - News details
 * @returns The ID of the inserted record
 */
export async function insert(news: Omit<NewsDetails, 'id'>): Promise<number> {
  const db = await getDatabase();
  const sql = `
    INSERT INTO ${TABLE_NAMES.NEWS_DETAILS} (
      date, ticker, articleTickers, title, articleDate,
      articleUrl, publisher, ampUrl, articleDescription
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const result = await db.runAsync(sql, [
      news.date,
      news.ticker,
      news.articleTickers,
      news.title,
      news.articleDate,
      news.articleUrl,
      news.publisher,
      news.ampUrl,
      news.articleDescription,
    ]);

    return result.lastInsertRowId;
  } catch (error) {
    console.error('[NewsRepository] Error inserting news:', error);
    throw new Error(`Failed to insert news: ${error}`);
  }
}

/**
 * Insert multiple news articles in a transaction
 * @param newsArticles - Array of news details
 */
export async function insertMany(newsArticles: Omit<NewsDetails, 'id'>[]): Promise<void> {
  const db = await getDatabase();

  try {
    await db.withTransactionAsync(async () => {
      for (const news of newsArticles) {
        await insert(news);
      }
    });
  } catch (error) {
    console.error('[NewsRepository] Error inserting multiple news articles:', error);
    throw new Error(`Failed to insert news articles: ${error}`);
  }
}

/**
 * Check if a news article exists by URL
 * @param articleUrl - Article URL
 * @returns true if article exists
 */
export async function existsByUrl(articleUrl: string): Promise<boolean> {
  const db = await getDatabase();
  const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAMES.NEWS_DETAILS} WHERE articleUrl = ?`;

  try {
    const result = await db.getFirstAsync<{ count: number }>(sql, [articleUrl]);
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('[NewsRepository] Error checking existence by URL:', error);
    return false;
  }
}

/**
 * Delete all news articles for a ticker
 * @param ticker - Stock ticker symbol
 */
export async function deleteByTicker(ticker: string): Promise<void> {
  const db = await getDatabase();
  const sql = `DELETE FROM ${TABLE_NAMES.NEWS_DETAILS} WHERE ticker = ?`;

  try {
    await db.runAsync(sql, [ticker]);
  } catch (error) {
    console.error('[NewsRepository] Error deleting news by ticker:', error);
    throw new Error(`Failed to delete news for ticker ${ticker}: ${error}`);
  }
}

/**
 * Count news articles for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Number of articles
 */
export async function countByTicker(ticker: string): Promise<number> {
  const db = await getDatabase();
  const sql = `SELECT COUNT(*) as count FROM ${TABLE_NAMES.NEWS_DETAILS} WHERE ticker = ?`;

  try {
    const result = await db.getFirstAsync<{ count: number }>(sql, [ticker]);
    return result?.count || 0;
  } catch (error) {
    console.error('[NewsRepository] Error counting news by ticker:', error);
    return 0;
  }
}
