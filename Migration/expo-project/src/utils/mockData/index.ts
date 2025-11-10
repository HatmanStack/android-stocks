/**
 * Central export for mock data generators
 * Also includes helper to populate database with mock data
 */

export * from './stockMock';
export * from './newsMock';
export * from './sentimentMock';
export * from './portfolioMock';

import { generateMockStockPrices, generateMockSymbol } from './stockMock';
import { generateMockNews } from './newsMock';
import { generateMockWordCount, generateMockCombinedWordCount } from './sentimentMock';
import { generateMockPortfolio } from './portfolioMock';
import { StockRepository, SymbolRepository, NewsRepository, WordCountRepository, CombinedWordRepository, PortfolioRepository } from '@/database/repositories';
import { getDateRangeFromSelection } from '@/utils/date/dateUtils';

/**
 * Populate database with mock data for testing and development
 * Generates and inserts mock data for all entities
 * @param tickers - Array of ticker symbols to populate
 * @param days - Number of days of historical data (default: 30)
 */
export async function populateWithMockData(tickers: string[], days: number = 30): Promise<void> {
  console.log(`[MockData] Populating database with mock data for ${tickers.length} tickers...`);

  const { startDate, endDate } = getDateRangeFromSelection(days);

  for (const ticker of tickers) {
    console.log(`[MockData] Generating data for ${ticker}...`);

    // 1. Generate and insert symbol details
    const symbol = generateMockSymbol(ticker);
    await SymbolRepository.insert(symbol);

    // 2. Generate and insert stock prices
    const stocks = generateMockStockPrices(ticker, startDate, endDate);
    await StockRepository.insertMany(stocks);

    // 3. Generate and insert news articles
    const newsArticles = generateMockNews(ticker, 10);
    await NewsRepository.insertMany(newsArticles);

    // 4. Generate and insert word counts (per-article sentiment)
    for (let i = 0; i < 10; i++) {
      const wordCount = generateMockWordCount(ticker, startDate, i);
      await WordCountRepository.insert(wordCount);
    }

    // 5. Generate and insert combined word counts (daily sentiment)
    const combinedWord = generateMockCombinedWordCount(ticker, startDate);
    await CombinedWordRepository.upsert(combinedWord);
  }

  // 6. Generate and insert portfolio entries
  const portfolio = generateMockPortfolio(tickers);
  for (const entry of portfolio) {
    await PortfolioRepository.upsert(entry);
  }

  console.log(`[MockData] Mock data population complete!`);
}
