/**
 * Synchronization Orchestrator
 * Coordinates the full data pipeline: stock prices → news → sentiment analysis
 */

import { syncStockData } from './stockDataSync';
import { syncNewsData } from './newsDataSync';
import { syncSentimentData } from './sentimentDataSync';
import { formatDateForDB } from '@/utils/date/dateUtils';
import { getDatesInRange } from '@/utils/date/dateUtils';
import { subDays } from 'date-fns';

/**
 * Progress callback for UI feedback
 */
export type SyncProgressCallback = (status: {
  step: string;
  progress: number;
  total: number;
  message: string;
}) => void;

/**
 * Sync result with statistics
 */
export interface SyncResult {
  ticker: string;
  stockRecords: number;
  newsArticles: number;
  sentimentAnalyses: number;
  daysProcessed: number;
  errors: string[];
}

/**
 * Sync all data for a ticker (prices, news, sentiment)
 * @param ticker - Stock ticker symbol
 * @param days - Number of days to sync (default: 30)
 * @param onProgress - Optional progress callback for UI updates
 * @returns Sync result with statistics
 */
export async function syncAllData(
  ticker: string,
  days: number = 30,
  onProgress?: SyncProgressCallback
): Promise<SyncResult> {
  const result: SyncResult = {
    ticker,
    stockRecords: 0,
    newsArticles: 0,
    sentimentAnalyses: 0,
    daysProcessed: 0,
    errors: [],
  };

  try {
    console.log(`[SyncOrchestrator] Starting full sync for ${ticker} (${days} days)`);

    // Calculate date range
    const endDate = formatDateForDB(new Date());
    const startDate = formatDateForDB(subDays(new Date(), days));

    // Step 1: Sync stock prices
    onProgress?.({
      step: 'stock',
      progress: 0,
      total: 3,
      message: `Fetching stock prices for ${ticker}...`,
    });

    try {
      result.stockRecords = await syncStockData(ticker, startDate, endDate);
      console.log(`[SyncOrchestrator] Stock sync complete: ${result.stockRecords} records`);
    } catch (error) {
      const errorMsg = `Stock sync failed: ${error}`;
      console.error(`[SyncOrchestrator] ${errorMsg}`);
      result.errors.push(errorMsg);
      // Continue with other steps even if stock sync fails
    }

    // Step 2: Sync news articles
    onProgress?.({
      step: 'news',
      progress: 1,
      total: 3,
      message: `Fetching news articles for ${ticker}...`,
    });

    try {
      result.newsArticles = await syncNewsData(ticker, startDate, endDate);
      console.log(`[SyncOrchestrator] News sync complete: ${result.newsArticles} articles`);
    } catch (error) {
      const errorMsg = `News sync failed: ${error}`;
      console.error(`[SyncOrchestrator] ${errorMsg}`);
      result.errors.push(errorMsg);
      // Continue to sentiment analysis even if news sync fails
    }

    // Step 3: Sync sentiment for each date
    onProgress?.({
      step: 'sentiment',
      progress: 2,
      total: 3,
      message: `Analyzing sentiment for ${ticker}...`,
    });

    try {
      const dates = getDatesInRange(startDate, endDate);
      let totalAnalyses = 0;

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];

        try {
          const analyzed = await syncSentimentData(ticker, date);
          totalAnalyses += analyzed;

          // Update progress for each date
          onProgress?.({
            step: 'sentiment',
            progress: 2 + (i / dates.length),
            total: 3,
            message: `Analyzing sentiment: ${i + 1}/${dates.length} days...`,
          });
        } catch (error) {
          console.error(
            `[SyncOrchestrator] Sentiment sync failed for ${ticker} on ${date}:`,
            error
          );
          result.errors.push(`Sentiment analysis failed for ${date}: ${error}`);
          // Continue with next date
        }
      }

      result.sentimentAnalyses = totalAnalyses;
      result.daysProcessed = dates.length;

      console.log(
        `[SyncOrchestrator] Sentiment sync complete: ${result.sentimentAnalyses} analyses across ${result.daysProcessed} days`
      );
    } catch (error) {
      const errorMsg = `Sentiment sync failed: ${error}`;
      console.error(`[SyncOrchestrator] ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    // Complete
    onProgress?.({
      step: 'complete',
      progress: 3,
      total: 3,
      message: `Sync complete for ${ticker}`,
    });

    console.log(
      `[SyncOrchestrator] Full sync complete for ${ticker}:`,
      JSON.stringify(result, null, 2)
    );

    return result;
  } catch (error) {
    console.error(`[SyncOrchestrator] Fatal error during sync for ${ticker}:`, error);
    result.errors.push(`Fatal sync error: ${error}`);
    throw new Error(`Sync failed for ${ticker}: ${error}`);
  }
}

/**
 * Sync multiple tickers sequentially
 * @param tickers - Array of ticker symbols
 * @param days - Number of days to sync for each ticker
 * @param onProgress - Optional progress callback
 * @returns Map of ticker to sync result
 */
export async function syncMultipleTickers(
  tickers: string[],
  days: number = 30,
  onProgress?: SyncProgressCallback
): Promise<Map<string, SyncResult>> {
  const results = new Map<string, SyncResult>();

  console.log(`[SyncOrchestrator] Syncing ${tickers.length} tickers: ${tickers.join(', ')}`);

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i];

    try {
      onProgress?.({
        step: 'ticker',
        progress: i,
        total: tickers.length,
        message: `Syncing ${ticker} (${i + 1}/${tickers.length})...`,
      });

      const result = await syncAllData(ticker, days, onProgress);
      results.set(ticker, result);
    } catch (error) {
      console.error(`[SyncOrchestrator] Failed to sync ${ticker}:`, error);
      results.set(ticker, {
        ticker,
        stockRecords: 0,
        newsArticles: 0,
        sentimentAnalyses: 0,
        daysProcessed: 0,
        errors: [`Failed to sync: ${error}`],
      });
    }
  }

  return results;
}
