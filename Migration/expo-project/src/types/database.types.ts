/**
 * TypeScript interfaces for all database entities
 * Mapped from Android Room entities
 */

/**
 * StockDetails - Historical stock price data (OHLCV)
 * Maps to: stock_details table
 * Android: StockDetails.java
 */
export interface StockDetails {
  id?: number; // Primary key, auto-generated
  hash: number;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  ticker: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  adjClose: number;
  adjHigh: number;
  adjLow: number;
  adjOpen: number;
  adjVolume: number;
  divCash: number;
  splitFactor: number;
  marketCap: number;
  enterpriseVal: number;
  peRatio: number;
  pbRatio: number;
  trailingPEG1Y: number;
}

/**
 * SymbolDetails - Company metadata and symbol information
 * Maps to: symbol_details table
 * Android: SymbolDetails.java
 */
export interface SymbolDetails {
  id?: number; // Primary key, auto-generated
  longDescription: string;
  exchangeCode: string;
  name: string;
  startDate: string;
  ticker: string;
  endDate: string;
}

/**
 * NewsDetails - News articles for stocks
 * Maps to: news_details table
 * Android: NewsDetails.java
 */
export interface NewsDetails {
  id?: number; // Primary key, auto-generated
  date: string; // ISO 8601 format (YYYY-MM-DD)
  ticker: string;
  articleTickers: string;
  title: string;
  articleDate: string;
  articleUrl: string;
  publisher: string;
  ampUrl: string;
  articleDescription: string;
}

/**
 * WordCountDetails - Individual article sentiment analysis
 * Maps to: word_count_details table
 * Android: WordCountDetails.java
 */
export interface WordCountDetails {
  id?: number; // Primary key, auto-generated
  date: string; // ISO 8601 format (YYYY-MM-DD)
  hash: number; // Unique identifier for the article
  ticker: string;
  positive: number; // Positive word count
  negative: number; // Negative word count
  nextDay: number; // 1-day prediction
  twoWks: number; // 2-week prediction
  oneMnth: number; // 1-month prediction
  body: string; // Article content
  sentiment: string; // 'POS', 'NEG', or 'NEUT'
  sentimentNumber: number; // Sentiment score
}

/**
 * CombinedWordDetails - Daily aggregated sentiment analysis
 * Maps to: combined_word_count_details table
 * Android: CombinedWordDetails.java
 */
export interface CombinedWordDetails {
  date: string; // Primary key, ISO 8601 format (YYYY-MM-DD)
  ticker: string;
  positive: number; // Total positive words for the day
  negative: number; // Total negative words for the day
  sentimentNumber: number; // Aggregated sentiment score
  sentiment: string; // 'POS', 'NEG', or 'NEUT'
  nextDay: number; // 1-day prediction
  twoWks: number; // 2-week prediction
  oneMnth: number; // 1-month prediction
  updateDate: string; // Last update timestamp
}

/**
 * PortfolioDetails - User's portfolio/watchlist stocks
 * Maps to: portfolio_details table
 * Android: PortfolioDetails.java
 */
export interface PortfolioDetails {
  ticker: string; // Primary key
  next: string; // 1-day prediction (formatted string)
  name: string; // Company name
  wks: string; // 2-week prediction (formatted string)
  mnth: string; // 1-month prediction (formatted string)
}
