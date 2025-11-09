/**
 * News Data Synchronization Service
 * Fetches news articles from Polygon.io and stores in database
 */

import {
  fetchNews,
  transformPolygonToNewsDetails,
  generateArticleHash,
} from '@/services/api/polygon.service';
import * as NewsRepository from '@/database/repositories/news.repository';

/**
 * Sync news articles for a ticker and date range
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Number of new articles inserted
 */
export async function syncNewsData(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    console.log(
      `[NewsDataSync] Syncing news for ${ticker} from ${startDate} to ${endDate}`
    );

    // Fetch news from Polygon
    const polygonArticles = await fetchNews(ticker, startDate, endDate);

    if (polygonArticles.length === 0) {
      console.warn(`[NewsDataSync] No news articles found for ${ticker}`);
      return 0;
    }

    console.log(
      `[NewsDataSync] Fetched ${polygonArticles.length} articles from Polygon`
    );

    // Transform articles and check for duplicates
    let newArticlesCount = 0;

    for (const article of polygonArticles) {
      // Generate hash for deduplication
      const hash = generateArticleHash(article.article_url);

      // Check if article already exists
      const exists = await NewsRepository.existsByUrl(article.article_url);

      if (exists) {
        continue; // Skip duplicate
      }

      // Transform and insert
      const newsDetails = transformPolygonToNewsDetails(article, ticker);
      await NewsRepository.insert(newsDetails);

      newArticlesCount++;
    }

    console.log(
      `[NewsDataSync] Inserted ${newArticlesCount} new articles for ${ticker} (${polygonArticles.length - newArticlesCount} duplicates skipped)`
    );

    return newArticlesCount;
  } catch (error) {
    console.error(`[NewsDataSync] Error syncing news for ${ticker}:`, error);
    throw new Error(`Failed to sync news for ${ticker}: ${error}`);
  }
}
