/**
 * Mock Polygon API Service for Development/Testing
 * Returns realistic mock news articles without making actual API calls
 */

import type { PolygonNewsArticle } from '../api/polygon.types';
import { getDatesInRange } from '@/utils/date/dateUtils';
import { loadVocabulary } from '@/utils/sentiment/vocabularyLoader';

/**
 * Generate realistic news headlines using sentiment vocabulary
 */
function generateMockHeadlines(ticker: string, count: number): string[] {
  const vocab = loadVocabulary();
  const headlines: string[] = [];

  // Mix of positive and negative headlines
  const positiveTemplates = [
    `${ticker} stock soars on strong earnings report`,
    `Investors bullish on ${ticker} after CEO announcement`,
    `${ticker} beats expectations with record revenue`,
    `Analysts upgrade ${ticker} citing growth potential`,
    `${ticker} launches innovative new product line`,
  ];

  const negativeTemplates = [
    `${ticker} shares decline amid market uncertainty`,
    `${ticker} faces regulatory challenges in key markets`,
    `Analysts downgrade ${ticker} on weak guidance`,
    `${ticker} reports disappointing quarterly results`,
    `${ticker} stock drops as CEO announces resignation`,
  ];

  const neutralTemplates = [
    `${ticker} announces quarterly dividend`,
    `${ticker} to hold investor conference next week`,
    `${ticker} releases corporate sustainability report`,
    `${ticker} appoints new board member`,
    `Market watch: ${ticker} trading update`,
  ];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let headline: string;

    if (rand < 0.4) {
      headline = positiveTemplates[i % positiveTemplates.length];
    } else if (rand < 0.7) {
      headline = neutralTemplates[i % neutralTemplates.length];
    } else {
      headline = negativeTemplates[i % negativeTemplates.length];
    }

    headlines.push(headline);
  }

  return headlines;
}

/**
 * Generate mock article description
 */
function generateMockDescription(headline: string): string {
  return `${headline}. This is a detailed article about the recent developments and their impact on the market. Analysts are closely watching the situation as it unfolds.`;
}

/**
 * Mock implementation of fetchNews
 * Generates realistic news articles for testing
 */
export async function fetchNews(
  ticker: string,
  startDate: string,
  endDate?: string,
  limit: number = 100
): Promise<PolygonNewsArticle[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const end = endDate || new Date().toISOString().substring(0, 10);
  const dates = getDatesInRange(startDate, end);

  // Generate 2-5 articles per day
  const articlesPerDay = Math.floor(Math.random() * 4) + 2;
  const totalArticles = Math.min(dates.length * articlesPerDay, limit);

  const headlines = generateMockHeadlines(ticker, totalArticles);
  const mockArticles: PolygonNewsArticle[] = [];

  for (let i = 0; i < totalArticles; i++) {
    const dateIndex = Math.floor(i / articlesPerDay);
    const date = dates[dateIndex] || dates[dates.length - 1];
    const headline = headlines[i];

    const publishers = [
      'Reuters',
      'Bloomberg',
      'Financial Times',
      'CNBC',
      'MarketWatch',
      'The Wall Street Journal',
    ];

    const authors = [
      'John Smith',
      'Sarah Johnson',
      'Michael Chen',
      'Emily Davis',
      'Robert Martinez',
    ];

    const article: PolygonNewsArticle = {
      id: `mock-article-${ticker}-${i}`,
      publisher: {
        name: publishers[i % publishers.length],
        homepage_url: `https://www.${publishers[i % publishers.length].toLowerCase().replace(/\s/g, '')}.com`,
      },
      title: headline,
      author: authors[i % authors.length],
      published_utc: `${date}T${String(9 + (i % 8)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00Z`,
      article_url: `https://www.example.com/article/${ticker.toLowerCase()}-${date}-${i}`,
      tickers: [ticker],
      amp_url: `https://www.example.com/amp/article/${ticker.toLowerCase()}-${date}-${i}`,
      image_url: `https://www.example.com/images/${ticker.toLowerCase()}-${i}.jpg`,
      description: generateMockDescription(headline),
      keywords: ['stocks', 'finance', ticker.toLowerCase(), 'market'],
    };

    mockArticles.push(article);
  }

  console.log(
    `[MockPolygonService] Generated ${mockArticles.length} mock articles for ${ticker}`
  );
  return mockArticles;
}

/**
 * Mock implementation of setPolygonApiKey
 * No-op for mock service
 */
export function setPolygonApiKey(apiKey: string): void {
  console.log('[MockPolygonService] API key set (mock mode)');
}

/**
 * Mock implementation of generateArticleHash
 * Uses same logic as real service for consistency
 */
export function generateArticleHash(url: string): string {
  // Simple hash for mock (in real service this uses crypto.createHash)
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}
