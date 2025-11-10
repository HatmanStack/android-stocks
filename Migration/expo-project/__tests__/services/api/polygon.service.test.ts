/**
 * Polygon.io API Service Tests
 * Tests for news article fetching, pagination, and hash generation
 */

import axios from 'axios';
import {
  setPolygonApiKey,
  fetchNews,
  generateArticleHash,
  transformPolygonToNewsDetails,
} from '@/services/api/polygon.service';
import type { PolygonNewsArticle } from '@/services/api/polygon.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Polygon Service', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock axios.isAxiosError
    (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn((error: any) => {
      return error && error.isAxiosError === true;
    });

    // Set API key for tests
    setPolygonApiKey('test-polygon-api-key');
  });

  describe('fetchNews', () => {
    it('should fetch news articles for valid ticker', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [
            {
              id: 'article-1',
              title: 'Apple announces new iPhone',
              author: 'John Doe',
              published_utc: '2025-01-15T10:30:00Z',
              article_url: 'https://example.com/article-1',
              tickers: ['AAPL', 'NASDAQ:AAPL'],
              description: 'Apple Inc. announced a new iPhone model today.',
              image_url: 'https://example.com/image.jpg',
              publisher: {
                name: 'TechNews',
                homepage_url: 'https://technews.com',
                logo_url: 'https://technews.com/logo.png',
                favicon_url: 'https://technews.com/favicon.ico',
              },
              amp_url: 'https://example.com/article-1/amp',
            },
            {
              id: 'article-2',
              title: 'Apple stock surges',
              author: 'Jane Smith',
              published_utc: '2025-01-15T14:00:00Z',
              article_url: 'https://example.com/article-2',
              tickers: ['AAPL'],
              description: 'Apple stock price increased by 5% today.',
              publisher: {
                name: 'FinanceDaily',
                homepage_url: 'https://financedaily.com',
              },
            },
          ],
          count: 2,
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const articles = await fetchNews('AAPL', '2025-01-01', '2025-01-15');

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe('Apple announces new iPhone');
      expect(articles[0].tickers).toContain('AAPL');
      expect(articles[1].title).toBe('Apple stock surges');

      // Verify API was called correctly (URL includes query params as string)
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('/v2/reference/news?')
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('ticker=AAPL')
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('published_utc.gte=2025-01-01')
      );
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('published_utc.lte=2025-01-15')
      );
    });

    it('should handle pagination and fetch multiple pages', async () => {
      // First page response
      const firstPageResponse = {
        data: {
          status: 'OK',
          results: [
            {
              id: 'article-1',
              title: 'Article 1',
              author: 'Author 1',
              published_utc: '2025-01-15T10:00:00Z',
              article_url: 'https://example.com/article-1',
              tickers: ['AAPL'],
              description: 'First article',
              publisher: { name: 'Publisher 1' },
            },
          ],
          count: 1,
          next_url: 'https://api.polygon.io/v2/reference/news?cursor=page2&apiKey=test-key',
        },
      };

      // Second page response
      const secondPageResponse = {
        data: {
          status: 'OK',
          results: [
            {
              id: 'article-2',
              title: 'Article 2',
              author: 'Author 2',
              published_utc: '2025-01-15T11:00:00Z',
              article_url: 'https://example.com/article-2',
              tickers: ['AAPL'],
              description: 'Second article',
              publisher: { name: 'Publisher 2' },
            },
          ],
          count: 1,
        },
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce(firstPageResponse)
        .mockResolvedValueOnce(secondPageResponse);

      const articles = await fetchNews('AAPL', '2025-01-01', '2025-01-15');

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe('Article 1');
      expect(articles[1].title).toBe('Article 2');

      // Verify two API calls were made
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limit errors (429)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
        message: 'Request failed with status code 429',
      };

      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(fetchNews('AAPL', '2025-01-01')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle invalid API key (401)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: 'Invalid API key' },
        },
        message: 'Request failed with status code 401',
      };

      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(fetchNews('AAPL', '2025-01-01')).rejects.toThrow(
        'Invalid API key'
      );
    });

    it('should return empty array for ticker not found (404)', async () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { error: 'Ticker not found' },
        },
        message: 'Request failed with status code 404',
      };

      mockAxiosInstance.get.mockRejectedValueOnce(error);

      // 404 returns empty array instead of throwing
      const articles = await fetchNews('INVALID', '2025-01-01');
      expect(articles).toEqual([]);
    });

    it('should respect page limit to prevent infinite loops', async () => {
      // Mock response that always has next_url (would cause infinite loop)
      const infiniteResponse = {
        data: {
          status: 'OK',
          results: [
            {
              id: 'article-1',
              title: 'Article',
              author: 'Author',
              published_utc: '2025-01-15T10:00:00Z',
              article_url: 'https://example.com/article',
              tickers: ['AAPL'],
              description: 'Description',
              publisher: { name: 'Publisher' },
            },
          ],
          count: 1,
          next_url: 'https://api.polygon.io/v2/reference/news?cursor=next',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(infiniteResponse);

      const articles = await fetchNews('AAPL', '2025-01-01');

      // Should stop at max pages (10)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(10);
      expect(articles.length).toBeGreaterThan(0);
    }, 15000); // 15 second timeout due to 1-second delays between pages

    it('should not include endDate param when not provided', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          results: [],
          count: 0,
        },
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      await fetchNews('AAPL', '2025-01-01');

      // Verify endDate param is not in the URL
      const callArg = mockAxiosInstance.get.mock.calls[0][0];
      expect(callArg).not.toContain('published_utc.lte');
      expect(callArg).toContain('published_utc.gte=2025-01-01');
    });
  });

  describe('generateArticleHash', () => {
    it('should generate consistent MD5 hash for same URL', () => {
      const url = 'https://example.com/article-1';

      const hash1 = generateArticleHash(url);
      const hash2 = generateArticleHash(url);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32); // MD5 hash is 32 hex characters
    });

    it('should generate different hashes for different URLs', () => {
      const url1 = 'https://example.com/article-1';
      const url2 = 'https://example.com/article-2';

      const hash1 = generateArticleHash(url1);
      const hash2 = generateArticleHash(url2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate hash for empty string', () => {
      const hash = generateArticleHash('');

      expect(hash).toHaveLength(32);
      expect(hash).toBe('d41d8cd98f00b204e9800998ecf8427e'); // MD5 of empty string
    });
  });

  describe('transformPolygonToNewsDetails', () => {
    it('should transform Polygon article to NewsDetails format', () => {
      const polygonArticle: PolygonNewsArticle = {
        id: 'article-1',
        title: 'Apple announces new product',
        author: 'John Doe',
        published_utc: '2025-01-15T10:30:00Z',
        article_url: 'https://example.com/article',
        tickers: ['AAPL', 'NASDAQ:AAPL'],
        description: 'Apple Inc. announced a new product today.',
        image_url: 'https://example.com/image.jpg',
        publisher: {
          name: 'TechNews',
          homepage_url: 'https://technews.com',
          logo_url: 'https://technews.com/logo.png',
          favicon_url: 'https://technews.com/favicon.ico',
        },
        amp_url: 'https://example.com/article/amp',
      };

      const newsDetails = transformPolygonToNewsDetails(polygonArticle, 'AAPL');

      expect(newsDetails.ticker).toBe('AAPL');
      expect(newsDetails.title).toBe('Apple announces new product');
      expect(newsDetails.articleUrl).toBe('https://example.com/article');
      expect(newsDetails.publisher).toBe('TechNews');
      expect(newsDetails.articleDescription).toBe('Apple Inc. announced a new product today.');
      expect(newsDetails.ampUrl).toBe('https://example.com/article/amp');
      expect(newsDetails.articleTickers).toBe('AAPL,NASDAQ:AAPL');
      expect(newsDetails.date).toBe('2025-01-15'); // YYYY-MM-DD format
      expect(newsDetails.articleDate).toBe('2025-01-15');
    });

    it('should handle missing optional fields', () => {
      const polygonArticle: PolygonNewsArticle = {
        id: 'article-2',
        title: 'News article',
        author: 'Jane Smith',
        published_utc: '2025-01-15T14:00:00Z',
        article_url: 'https://example.com/article-2',
        tickers: ['AAPL'],
        publisher: {
          name: 'NewsOrg',
        },
      };

      const newsDetails = transformPolygonToNewsDetails(polygonArticle, 'AAPL');

      expect(newsDetails.articleDescription).toBe('');
      expect(newsDetails.ampUrl).toBe('');
    });

    it('should extract date correctly from ISO timestamp', () => {
      const polygonArticle: PolygonNewsArticle = {
        id: 'article-3',
        title: 'Test article',
        author: 'Test Author',
        published_utc: '2025-12-31T23:59:59Z',
        article_url: 'https://example.com/test',
        tickers: ['AAPL'],
        publisher: { name: 'Test Publisher' },
      };

      const newsDetails = transformPolygonToNewsDetails(polygonArticle, 'AAPL');

      expect(newsDetails.date).toBe('2025-12-31');
      expect(newsDetails.articleDate).toBe('2025-12-31');
    });

    it('should join multiple tickers with comma', () => {
      const polygonArticle: PolygonNewsArticle = {
        id: 'article-4',
        title: 'Tech giants news',
        author: 'Reporter',
        published_utc: '2025-01-15T10:00:00Z',
        article_url: 'https://example.com/tech',
        tickers: ['AAPL', 'GOOGL', 'MSFT'],
        publisher: { name: 'TechDaily' },
      };

      const newsDetails = transformPolygonToNewsDetails(polygonArticle, 'AAPL');

      expect(newsDetails.articleTickers).toBe('AAPL,GOOGL,MSFT');
    });
  });
});
