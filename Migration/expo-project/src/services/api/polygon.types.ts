/**
 * Polygon.io API Response Types
 * Documentation: https://polygon.io/docs/stocks/get_v2_reference_news
 */

export interface PolygonPublisher {
  name: string;
  homepage_url?: string;
  logo_url?: string;
  favicon_url?: string;
}

export interface PolygonNewsArticle {
  id: string;
  publisher: PolygonPublisher;
  title: string;
  author: string;
  published_utc: string; // ISO 8601 format "2025-01-15T10:30:00Z"
  article_url: string;
  tickers: string[];
  amp_url?: string;
  image_url?: string;
  description?: string;
  keywords?: string[];
}

export interface PolygonNewsResponse {
  results: PolygonNewsArticle[];
  status: string;
  request_id: string;
  count: number;
  next_url?: string; // Pagination URL
}

export interface PolygonApiConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}
