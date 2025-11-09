/**
 * Mock data generator for news articles
 */

import { NewsDetails } from '@/types/database.types';
import { formatDateForDB } from '@/utils/date/dateUtils';

const sampleTitles = [
  '{TICKER} reports strong quarterly earnings',
  '{TICKER} announces new product launch',
  'Analysts upgrade {TICKER} stock rating',
  '{TICKER} faces regulatory scrutiny',
  'Market volatility affects {TICKER} shares',
  '{TICKER} expands into new markets',
  'CEO discusses {TICKER} future strategy',
  '{TICKER} stock reaches new high',
];

const publishers = ['Bloomberg', 'Reuters', 'CNBC', 'Wall Street Journal', 'Financial Times'];

/**
 * Generate mock news articles for a ticker
 * @param ticker - Stock ticker symbol
 * @param count - Number of articles to generate
 * @returns Array of mock news details
 */
export function generateMockNews(ticker: string, count: number = 10): Omit<NewsDetails, 'id'>[] {
  const articles: Omit<NewsDetails, 'id'>[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30); // Random within last 30 days
    const articleDate = new Date(today);
    articleDate.setDate(articleDate.getDate() - daysAgo);

    const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)].replace(
      '{TICKER}',
      ticker
    );
    const publisher = publishers[Math.floor(Math.random() * publishers.length)];

    articles.push({
      date: formatDateForDB(articleDate),
      ticker,
      articleTickers: ticker,
      title,
      articleDate: articleDate.toISOString(),
      articleUrl: `https://example.com/news/${ticker.toLowerCase()}-${i}`,
      publisher,
      ampUrl: `https://example.com/amp/news/${ticker.toLowerCase()}-${i}`,
      articleDescription: `Mock article about ${ticker} from ${publisher}.`,
    });
  }

  return articles;
}
