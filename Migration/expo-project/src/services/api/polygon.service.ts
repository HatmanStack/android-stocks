/**
 * Polygon.io API Service
 * Fetches news articles from Polygon.io API
 */

import axios, { AxiosInstance } from 'axios';
import { createHash } from 'crypto';
import type { PolygonNewsArticle, PolygonNewsResponse } from './polygon.types';
import type { NewsDetails } from '@/types/database.types';

// Polygon API configuration
const POLYGON_BASE_URL = 'https://api.polygon.io';
const POLYGON_TIMEOUT = 10000; // 10 seconds

// API key management
let polygonApiKey: string | null = null;

/**
 * Set the Polygon API key
 * @param apiKey - Polygon API key from https://polygon.io
 */
export function setPolygonApiKey(apiKey: string): void {
  polygonApiKey = apiKey;
}

/**
 * Get the configured API key
 * @throws Error if API key is not set
 */
function getApiKey(): string {
  if (!polygonApiKey) {
    throw new Error(
      'Polygon API key not configured. Call setPolygonApiKey() first or set POLYGON_API_KEY environment variable.'
    );
  }
  return polygonApiKey;
}

/**
 * Create axios instance for Polygon API
 */
function createPolygonClient(): AxiosInstance {
  return axios.create({
    baseURL: POLYGON_BASE_URL,
    timeout: POLYGON_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Generate MD5 hash for URL (used for deduplication)
 * @param url - Article URL
 * @returns MD5 hash string
 */
export function generateArticleHash(url: string): string {
  return createHash('md5').update(url).digest('hex');
}

/**
 * Fetch news articles from Polygon API
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format (optional)
 * @param limit - Maximum number of articles to fetch per request (default: 100)
 * @returns Array of news articles
 * @throws Error if API request fails
 */
export async function fetchNews(
  ticker: string,
  startDate: string,
  endDate?: string,
  limit: number = 100
): Promise<PolygonNewsArticle[]> {
  const apiKey = getApiKey();
  const client = createPolygonClient();
  const allArticles: PolygonNewsArticle[] = [];

  try {
    let nextUrl: string | undefined;
    let currentPage = 0;
    const maxPages = 10; // Safety limit to prevent infinite loops

    do {
      currentPage++;

      console.log(
        `[PolygonService] Fetching news for ${ticker} (page ${currentPage})`
      );

      // Build request URL
      let url: string;
      if (nextUrl) {
        // Use pagination URL (already includes API key)
        url = nextUrl.replace(POLYGON_BASE_URL, '');
      } else {
        // First request - build params
        const params: Record<string, string | number> = {
          ticker,
          limit,
          apiKey,
        };

        // Add date filters
        if (startDate) {
          params['published_utc.gte'] = startDate;
        }
        if (endDate) {
          params['published_utc.lte'] = endDate;
        }

        const queryString = new URLSearchParams(
          params as Record<string, string>
        ).toString();
        url = `/v2/reference/news?${queryString}`;
      }

      const response = await client.get<PolygonNewsResponse>(url);

      if (response.data.status !== 'OK') {
        console.error(
          '[PolygonService] API returned non-OK status:',
          response.data.status
        );
        break;
      }

      const articles = response.data.results || [];
      allArticles.push(...articles);

      console.log(
        `[PolygonService] Fetched ${articles.length} articles (total: ${allArticles.length})`
      );

      // Check for pagination
      nextUrl = response.data.next_url;

      // Safety check to prevent infinite loops
      if (currentPage >= maxPages) {
        console.warn(
          `[PolygonService] Reached maximum page limit (${maxPages})`
        );
        break;
      }

      // Rate limiting: Polygon free tier allows 5 requests/minute
      // Add a small delay between paginated requests
      if (nextUrl) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    } while (nextUrl);

    console.log(
      `[PolygonService] Completed fetching ${allArticles.length} articles for ${ticker}`
    );
    return allArticles;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 429) {
        throw new Error(
          'Rate limit exceeded. Polygon free tier allows 5 requests/minute. Please try again later.'
        );
      }

      if (status === 401 || status === 403) {
        throw new Error('Invalid API key. Please check your Polygon API key.');
      }

      if (status === 404) {
        console.warn(`[PolygonService] No news found for ticker ${ticker}`);
        return []; // Return empty array instead of error
      }
    }

    console.error('[PolygonService] Error fetching news:', error);
    throw new Error(`Failed to fetch news for ${ticker}: ${error}`);
  }
}

/**
 * Transform Polygon article to NewsDetails database format
 * @param article - Polygon news article
 * @param ticker - Stock ticker symbol
 * @returns NewsDetails object ready for database insertion
 */
export function transformPolygonToNewsDetails(
  article: PolygonNewsArticle,
  ticker: string
): NewsDetails {
  // Extract date from published_utc (YYYY-MM-DD)
  const date = article.published_utc.split('T')[0];

  return {
    date,
    ticker,
    articleTickers: article.tickers.join(','), // Convert array to comma-separated string
    title: article.title,
    articleDate: date,
    articleUrl: article.article_url,
    publisher: article.publisher.name,
    ampUrl: article.amp_url || '',
    articleDescription: article.description || '',
  };
}
