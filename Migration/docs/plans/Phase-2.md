# Phase 2: Core Data Processing & API Integration

**Estimated Tokens:** ~98,000
**Dependencies:** Phase 1 (Data Layer complete)
**Goal:** Implement all API integrations (Tiingo, Polygon, AWS Lambda), port sentiment analysis logic from Java, and create the data processing pipeline.

---

## Phase Goal

Build the complete data processing engine that powers the app. By the end of this phase, you'll have:

1. Service layer for all 3 external APIs (Tiingo, Polygon, AWS Lambda)
2. Bag-of-words sentiment analysis (ported from Java)
3. AWS Lambda functions for FinBERT sentiment and predictions
4. Data synchronization logic (fetch → analyze → store)
5. Error handling and retry logic for API calls
6. React Query hooks for data fetching and caching

**Success Criteria:**
- [x] Can fetch stock prices from Tiingo and store in database
- [x] Can fetch news articles from Polygon and store in database
- [x] Bag-of-words sentiment analysis produces correct counts
- [x] Python microservice integration works (sentiment + predictions)
- [x] End-to-end data pipeline works: fetch news → analyze sentiment → store results
- [x] All services handle errors gracefully with user-friendly messages

## Review Feedback (Code Review - Phase 2)

### ✅ Implementation Quality: Excellent

**Verified with tools:**
- ✅ **Tests Pass**: `npm test` shows 92 tests passing across 9 suites
- ✅ **TypeScript Compiles**: `npm run type-check` succeeds with zero errors
- ✅ **ESLint Works**: `npm run lint` runs successfully (only warnings, no errors)
- ✅ **Git Commits**: Perfect conventional commits format across all 11 Phase 2 commits
- ✅ **Phase 1 Issues Fixed**: All critical issues from previous review addressed
  - babel.config.js created
  - ESLint configuration fixed
  - All 6 repository tests implemented

### ✅ All 7 Tasks Completed

| Task | Status | Evidence |
|------|--------|----------|
| Task 1: Tiingo API | ✅ Complete | `tiingo.service.ts` (256 lines), `tiingo.types.ts`, 33 tests |
| Task 2: Polygon API | ✅ Complete | `polygon.service.ts` (207 lines), `polygon.types.ts` |
| Task 3: Bag-of-words | ✅ Complete | `wordCounter.ts`, `sentimentCalculator.ts`, `textProcessor.ts` |
| Task 4: Microservices | ✅ Complete | `sentiment.service.ts`, `prediction.service.ts`, API constants |
| Task 5: Sync Pipeline | ✅ Complete | `syncOrchestrator.ts`, 3 sync modules (stock, news, sentiment) |
| Task 6: React Query | ✅ Complete | 5 hooks: `useStockData`, `useNewsData`, `useSentimentData`, `usePortfolio`, `useSymbolSearch` |
| Task 7: Error Handling | ✅ Complete | `APIError.ts`, `errorHandler.ts`, `errorMessages.ts` (comprehensive error classes) |

### ⚠️ Critical Test Coverage Gaps

> **Consider:** Task 2 (Polygon API) testing instructions at line 260 state: "Unit tests for transformation logic" and "Test pagination" and "Test hash generation". Have you created `__tests__/services/api/polygon.service.test.ts` with these tests?
>
> **Reflect:** When you run `find __tests__ -name "polygon*"`, what do you find? How can the Polygon service be considered tested without these unit tests?

> **Think about:** Task 3 (Bag-of-words sentiment) testing instructions at line 370 specify testing `countSentimentWords` with known examples like "happy great wonderful" → positive: 3, negative: 0. Have you created `__tests__/utils/sentiment/sentimentCalculator.test.ts` or `__tests__/utils/sentiment/wordCounter.test.ts`?
>
> **Consider:** The `vocabularyLoader.test.ts` exists (145 lines), but does it test the actual word counting logic? What about `textProcessor.ts` sentence splitting?

> **Reflect:** You have comprehensive tests for Tiingo service (33 tests, 273 lines). Why does Polygon service have zero tests? Both are critical API integrations with similar complexity.

### 📊 Test Coverage Analysis

**Current Test Files:**
```
✅ __tests__/database/ (7 files - Phase 1)
   - database.test.ts
   - repositories/ (6 files for all repositories)
✅ __tests__/services/api/
   - tiingo.service.test.ts (33 tests) ✅
   - polygon.service.test.ts ❌ MISSING
✅ __tests__/utils/sentiment/
   - vocabularyLoader.test.ts ✅
   - wordCounter.test.ts ❌ MISSING
   - sentimentCalculator.test.ts ❌ MISSING
```

**Missing Tests (Per Plan Specifications):**
1. ❌ Polygon service tests (Task 2, line 260)
2. ❌ Bag-of-words sentiment logic tests (Task 3, line 370)
3. ℹ️  Sync orchestrator tests (not explicitly required in plan)
4. ℹ️  React Query hooks tests (not explicitly required in plan)

### 🎯 Recommendation

**Status:** ⚠️ **NEEDS IMPROVEMENT** - Add missing tests before proceeding to Phase 3.

**Required Fixes:**
1. Create `__tests__/services/api/polygon.service.test.ts` with tests for:
   - News fetching with pagination
   - Hash generation (deduplication)
   - Error handling (rate limits, invalid tickers)
   - Response transformation to `NewsDetails`

2. Create `__tests__/utils/sentiment/wordCounter.test.ts` with tests for:
   - Known text examples: "happy great wonderful" → positive: 3
   - Mixed sentiment: "happy terrible" → positive: 1, negative: 1
   - Edge cases: empty text, numbers/percentages removed

**Optional (but recommended):**
3. Add integration tests for sync orchestrator
4. Add tests for React Query hooks (using React Testing Library)

**Estimated Fix Time:** 2-3 hours

Once these tests are added, Phase 2 will be **production-ready** for Phase 3.

---

## Prerequisites

### External Dependencies
- Phase 1 must be 100% complete (database, repositories, mock data)
- API keys for Tiingo and Polygon.io (get free tier keys if needed)
- AWS account with Lambda access (or local testing environment)
- Python 3.9+ (for AWS Lambda development if deploying FinBERT)

### Required Knowledge
- REST API integration with axios
- Async/await patterns in TypeScript
- AWS Lambda basics (deployment, environment variables)
- React Query (TanStack Query) fundamentals

### Android Source Files to Reference
- `app/src/main/java/gemenielabs/sentiment/DataProcessing/SetStockPriceData.java` (Tiingo integration)
- `app/src/main/java/gemenielabs/sentiment/DataProcessing/SetNewsData.java` (Polygon integration)
- `app/src/main/java/gemenielabs/sentiment/DataProcessing/SetWordCountData.java` (sentiment analysis)
- `app/src/main/java/gemenielabs/sentiment/DataProcessing/SetCombineWordCountData.java` (aggregation)
- `app/src/main/java/gemenielabs/sentiment/DataProcessing/SetPortfolioData.java` (predictions)

---

## Tasks

### Task 1: Implement Tiingo API Service (Stock Prices & Company Metadata)

**Goal:** Create a service to fetch stock prices and company metadata from the Tiingo API, matching the Android app's functionality.

**Files to Create:**
- `Migration/expo-project/src/services/api/tiingo.service.ts`
- `Migration/expo-project/src/services/api/tiingo.types.ts` (API response types)
- `Migration/expo-project/src/services/__mocks__/tiingo.mock.ts` (mock responses)

**Prerequisites:**
- Task 1.1 complete (API service structure exists)
- Tiingo API key available (free tier: https://api.tiingo.com/)

**Implementation Steps:**

1. **Study the Android Implementation**
   - Read `SetStockPriceData.java` carefully
   - Note the API endpoints used:
     - Stock prices: `https://api.tiingo.com/tiingo/daily/{ticker}/prices`
     - Company metadata: `https://api.tiingo.com/tiingo/daily/{ticker}`
   - Understand query parameters: `startDate`, `endDate`, `token` (API key)

2. **Create API Response Types**
   - File: `src/services/api/tiingo.types.ts`
   - Define interfaces for Tiingo API responses:
     ```typescript
     export interface TiingoStockPrice {
       date: string;            // "2025-01-15T00:00:00.000Z"
       open: number;
       high: number;
       low: number;
       close: number;
       volume: number;
       adjOpen: number;
       adjHigh: number;
       adjLow: number;
       adjClose: number;
       adjVolume: number;
       divCash: number;
       splitFactor: number;
     }

     export interface TiingoSymbolMetadata {
       ticker: string;
       name: string;
       exchangeCode: string;
       startDate: string;
       endDate: string;
       description: string;
     }
     ```

3. **Create Tiingo Service**
   - File: `src/services/api/tiingo.service.ts`
   - Create an axios instance with base configuration:
     ```typescript
     const tiingoClient = axios.create({
       baseURL: 'https://api.tiingo.com',
       timeout: 10000,
     });
     ```
   - Implement functions:
     - `fetchStockPrices(ticker: string, startDate: string, endDate: string): Promise<TiingoStockPrice[]>`
     - `fetchSymbolMetadata(ticker: string): Promise<TiingoSymbolMetadata>`

4. **Implement API Key Management**
   - Store API key in environment variables (`.env` file for development)
   - Use `expo-secure-store` for production storage
   - Append `?token={API_KEY}` to all Tiingo requests
   - Handle missing API key gracefully (throw descriptive error)

5. **Add Error Handling**
   - Handle rate limiting (HTTP 429): retry with exponential backoff
   - Handle invalid ticker (HTTP 404): throw `TickerNotFoundError`
   - Handle network errors: retry up to 3 times
   - Log errors with context (ticker, date range)

6. **Transform API Response to Database Format**
   - Create a transformer function: `transformTiingoToStockDetails(response: TiingoStockPrice, ticker: string): StockDetails`
   - Convert date format from ISO 8601 with time to `YYYY-MM-DD`
   - Map all fields to match `StockDetails` interface from Phase 1
   - Handle missing fields (set defaults or mark as null)

7. **Create Mock Implementation**
   - File: `src/services/__mocks__/tiingo.mock.ts`
   - Export mocked versions of `fetchStockPrices` and `fetchSymbolMetadata`
   - Use mock data generators from Phase 1
   - Enable switching between real and mock via environment variable

**Verification Checklist:**
- [ ] Can fetch stock prices for valid ticker (e.g., AAPL)
- [ ] Handles invalid ticker gracefully (404 error)
- [ ] Respects date range parameters
- [ ] Transforms API response to StockDetails format
- [ ] Retry logic works for transient errors
- [ ] Mock service returns realistic data

**Testing Instructions:**
- Write unit tests in `__tests__/services/api/tiingo.service.test.ts`
- Test with mocked axios responses (use `jest.mock('axios')`)
- Test success case: valid ticker returns data
- Test error cases: invalid ticker, rate limiting, network error
- Test transformation: Tiingo response correctly maps to StockDetails
- Integration test: fetch real data from Tiingo (use a valid test API key)

**Commit Message Template:**
```
feat(api): implement Tiingo API service for stock prices and metadata

- Created tiingo.service with fetchStockPrices and fetchSymbolMetadata
- Added API response types matching Tiingo's JSON structure
- Implemented transformer to convert Tiingo data to StockDetails format
- Added retry logic with exponential backoff for rate limiting
- Created mock service for development/testing without API calls
- Handles errors gracefully (404, 429, network failures)
```

**Estimated Tokens:** ~15,000

---

### Task 2: Implement Polygon.io API Service (News Articles)

**Goal:** Create a service to fetch news articles from Polygon.io, matching the Android app's news fetching functionality.

**Files to Create:**
- `Migration/expo-project/src/services/api/polygon.service.ts`
- `Migration/expo-project/src/services/api/polygon.types.ts`
- `Migration/expo-project/src/services/__mocks__/polygon.mock.ts`

**Prerequisites:**
- Task 2.1 complete (Tiingo service as reference pattern)
- Polygon.io API key (free tier: https://polygon.io/)

**Implementation Steps:**

1. **Study the Android Implementation**
   - Read `SetNewsData.java`
   - Note the API endpoint: `https://api.polygon.io/v2/reference/news`
   - Query parameters: `ticker`, `published_utc.gte` (start date), `published_utc.lte` (end date), `apiKey`
   - Response structure: array of news articles with title, url, publisher, date, description

2. **Create API Response Types**
   - File: `src/services/api/polygon.types.ts`
   - Define interface:
     ```typescript
     export interface PolygonNewsArticle {
       id: string;
       title: string;
       author: string;
       published_utc: string;  // "2025-01-15T10:30:00Z"
       article_url: string;
       tickers: string[];
       description: string;
       image_url?: string;
       publisher: {
         name: string;
         homepage_url: string;
       };
     }

     export interface PolygonNewsResponse {
       results: PolygonNewsArticle[];
       count: number;
       next_url?: string;  // Pagination
     }
     ```

3. **Create Polygon Service**
   - File: `src/services/api/polygon.service.ts`
   - Implement function:
     - `fetchNews(ticker: string, startDate: string, endDate: string, limit: number = 100): Promise<PolygonNewsArticle[]>`
   - Handle pagination if `next_url` is present (fetch all results)
   - API key management similar to Tiingo

4. **Transform Response to Database Format**
   - Create transformer: `transformPolygonToNewsDetails(article: PolygonNewsArticle, ticker: string): NewsDetails`
   - Generate hash: `createHash('md5').update(article.article_url).digest('hex')` (for deduplication)
   - Convert date format to `YYYY-MM-DD`
   - Handle missing fields (e.g., description might be null)

5. **Add Duplicate Detection**
   - Before inserting news to database, check if hash already exists
   - Use `NewsRepository.checkExistsByHash(hash)` from Phase 1
   - Skip duplicates to avoid redundant storage

6. **Implement Rate Limiting Handling**
   - Polygon free tier: 5 requests/minute
   - Implement request queuing or throttling
   - Add delay between requests if needed

7. **Create Mock Implementation**
   - File: `src/services/__mocks__/polygon.mock.ts`
   - Generate mock news articles using sentiment words for realistic headlines

**Verification Checklist:**
- [ ] Can fetch news for valid ticker
- [ ] Pagination works (fetches all results across multiple pages)
- [ ] Hash generation is consistent
- [ ] Duplicates are not inserted
- [ ] Rate limiting is respected

**Testing Instructions:**
- Unit tests for transformation logic
- Test pagination (mock response with `next_url`)
- Test hash generation (same URL → same hash)
- Integration test with real Polygon API

**Commit Message Template:**
```
feat(api): implement Polygon.io API service for news articles

- Created polygon.service with fetchNews and pagination support
- Added API response types for Polygon's news structure
- Implemented transformer to convert Polygon data to NewsDetails format
- Added hash-based deduplication to prevent duplicate articles
- Implemented rate limiting awareness (5 req/min for free tier)
- Created mock service with realistic news headlines
```

**Estimated Tokens:** ~12,000

---

### Task 3: Port Sentiment Analysis Logic (Bag-of-Words)

**Goal:** Port the Java sentiment analysis logic that counts positive/negative words in news articles, producing word counts and sentiment labels.

**Files to Create:**
- `Migration/expo-project/src/utils/sentiment/wordCounter.ts`
- `Migration/expo-project/src/utils/sentiment/textProcessor.ts`
- `Migration/expo-project/src/utils/sentiment/sentimentCalculator.ts`

**Prerequisites:**
- Phase 1 Task 2 complete (sentiment vocabulary JSON)
- Task 2.2 complete (news articles available)

**Implementation Steps:**

1. **Study the Android Implementation**
   - Read `SetWordCountData.java` carefully, especially:
     - `recordWordCounts()` method (lines ~100-150): loops through words and counts matches
     - `removeNumbersAndPercents()` method: cleans text before analysis
     - Sentiment calculation logic

2. **Create Text Processor**
   - File: `src/utils/sentiment/textProcessor.ts`
   - Implement functions:
     - `removeNumbersAndPercents(text: string): string` - Port from Java
     - `splitIntoSentences(text: string): string[]` - Split by `.`, `!`, `?`
     - `tokenizeText(text: string): string[]` - Split into words, lowercase, remove punctuation
     - `cleanWord(word: string): string` - Remove non-alphabetic characters

3. **Create Word Counter**
   - File: `src/utils/sentiment/wordCounter.ts`
   - Implement the core counting logic:
     ```typescript
     export interface WordCounts {
       positive: number;
       negative: number;
     }

     export function countSentimentWords(text: string): WordCounts {
       // 1. Clean text (remove numbers, percents)
       // 2. Tokenize into words
       // 3. For each word:
       //    - Get first letter
       //    - Lookup in sentimentWords.positive[letter]
       //    - Lookup in sentimentWords.negative[letter]
       //    - Increment counters
       // 4. Return counts
     }
     ```

4. **Create Sentiment Calculator**
   - File: `src/utils/sentiment/sentimentCalculator.ts`
   - Implement functions:
     ```typescript
     export type SentimentLabel = 'POS' | 'NEUT' | 'NEG';

     export function calculateSentiment(positive: number, negative: number): SentimentLabel {
       if (positive > negative) return 'POS';
       if (negative > positive) return 'NEG';
       return 'NEUT';
     }

     export function calculateSentimentScore(positive: number, negative: number): number {
       const total = positive + negative;
       if (total === 0) return 0;
       return (positive - negative) / total; // Range: -1 to +1
     }
     ```

5. **Test with Real News Articles**
   - Fetch a few real news articles from Polygon
   - Run sentiment analysis
   - Compare results with expected behavior (articles with words like "growth", "success" should be POS)

6. **Optimize Performance**
   - Ensure lookup is efficient (O(1) letter lookup + O(n) array search where n is small)
   - Consider caching sentiment words in memory on app start
   - Profile performance with long articles (1000+ words)

**Verification Checklist:**
- [ ] Text processor correctly removes numbers and percents
- [ ] Word counter produces accurate positive/negative counts
- [ ] Sentiment label calculation is correct (POS/NEG/NEUT)
- [ ] Sentiment score is in range [-1, 1]
- [ ] Performance is acceptable (<100ms for typical article)

**Testing Instructions:**
- Write unit tests in `__tests__/utils/sentiment/`
- Test word counter with known text:
   - "happy great wonderful" → positive: 3, negative: 0, sentiment: POS
   - "terrible awful bad" → positive: 0, negative: 3, sentiment: NEG
   - "happy terrible" → positive: 1, negative: 1, sentiment: NEUT
- Test text processor:
   - "Stock up 25% today!" → "Stock up  today" (numbers removed)
   - "The company... is good." → ["The company", "is good"] (split sentences)
- Test edge cases: empty text, special characters, very long text

**Commit Message Template:**
```
feat(sentiment): port bag-of-words sentiment analysis from Java

- Created textProcessor with removeNumbersAndPercents and tokenization
- Implemented wordCounter using letter-based vocabulary lookup (O(1) + O(n))
- Added sentimentCalculator for POS/NEG/NEUT label and score (-1 to +1)
- Matches Android app logic exactly for consistent results
- Performance: <100ms for typical 500-word article
```

**Estimated Tokens:** ~14,000

---

### Task 4: Integrate with Existing Python Microservices

**Goal:** Create client-side services to call the existing deployed Python microservices for sentiment analysis and stock predictions.

**Rationale:** The original Android app uses two Python microservices deployed on Google Cloud Run. For Phases 1-7, we'll continue using these **existing, functional services** rather than migrating them to AWS Lambda. This allows us to:
- Focus entirely on the React Native client migration
- Validate the client works with proven, battle-tested ML models
- Deliver value faster (no backend migration needed for MVP)
- Defer complex backend migration to Phase 8+

**Files to Create:**
- `src/services/api/sentiment.service.ts` - Client for FinBERT sentiment analysis
- `src/services/api/prediction.service.ts` - Client for logistic regression predictions
- `src/types/api.types.ts` - TypeScript interfaces for API requests/responses
- `src/constants/api.constants.ts` - API endpoint URLs and configuration

**Prerequisites:**
- Task 1-3 complete (Tiingo, Polygon, bag-of-words implemented)
- Understanding of the existing microservice contracts (see below)

**Implementation Steps:**

1. **Understand the Existing Microservice Contracts**

   **Service 1: Sentiment Analysis (FinBERT)**
   - **URL**: `https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app`
   - **Method**: POST
   - **Request** (from `SetWordCountData.java` line 285-286):
     ```typescript
     {
       text: string[],  // Array of sentences from news article
       hash: string     // Hash of the article body
     }
     ```
   - **Response** (from `JsonReturn.java`):
     ```typescript
     {
       positive: [string, string],  // [count, confidence_score]
       neutral: [string, string],
       negative: [string, string],
       hash: string
     }
     ```
   - **Example**:
     ```
     Request: { "text": ["Stock prices rising.", "Market optimistic."], "hash": "12345" }
     Response: { "positive": ["2", "0.85"], "neutral": ["0", "0.0"], "negative": ["0", "0.0"], "hash": "12345" }
     ```

   **Service 2: Stock Predictions (Logistic Regression)**
   - **URL**: `https://stocks-f3jmjyxrpq-uc.a.run.app`
   - **Method**: POST
   - **Request** (from `SetPortfolioData.java` line 133):
     ```typescript
     {
       close: number[],      // Closing prices
       volume: number[],     // Trading volumes
       positive: number[],   // Positive word counts
       negative: number[],   // Negative word counts
       sentiment: number[], // Sentiment scores
       ticker: string
     }
     ```
   - **Response**:
     ```typescript
     {
       next: string,   // 1-day prediction
       week: string,   // 2-week prediction
       month: string,  // 1-month prediction
       ticker: string
     }
     ```

2. **Create TypeScript Types**

   File: `src/types/api.types.ts`
   ```typescript
   export interface SentimentAnalysisRequest {
     text: string[];
     hash: string;
   }

   export interface SentimentAnalysisResponse {
     positive: [string, string];
     neutral: [string, string];
     negative: [string, string];
     hash: string;
   }

   export interface StockPredictionRequest {
     close: number[];
     volume: number[];
     positive: number[];
     negative: number[];
     sentiment: number[];
     ticker: string;
   }

   export interface StockPredictionResponse {
     next: string;
     week: string;
     month: string;
     ticker: string;
   }
   ```

3. **Create Service Configuration**

   File: `src/constants/api.constants.ts`
   ```typescript
   export const API_ENDPOINTS = {
     SENTIMENT_ANALYSIS: 'https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app',
     STOCK_PREDICTION: 'https://stocks-f3jmjyxrpq-uc.a.run.app',
     TIINGO_BASE: 'https://api.tiingo.com',
     POLYGON_BASE: 'https://api.polygon.io',
   } as const;

   export const API_TIMEOUTS = {
     SENTIMENT: 30000,  // 30s (FinBERT can be slow on cold start)
     PREDICTION: 15000, // 15s
     TIINGO: 10000,
     POLYGON: 10000,
   } as const;
   ```

4. **Implement Sentiment Analysis Service**

   File: `src/services/api/sentiment.service.ts`
   ```typescript
   import axios from 'axios';
   import { API_ENDPOINTS, API_TIMEOUTS } from '@/constants/api.constants';
   import type { SentimentAnalysisRequest, SentimentAnalysisResponse } from '@/types/api.types';

   export async function analyzeSentiment(
     articleText: string,
     hash: string
   ): Promise<SentimentAnalysisResponse> {
     // Split article into sentences (matches Android logic)
     const sentences = articleText
       .replace(/["',]/g, '')  // Remove quotes and commas
       .split(/(?<=[.?])\s+/);  // Split on sentence boundaries

     const request: SentimentAnalysisRequest = {
       text: sentences,
       hash: hash,
     };

     try {
       const response = await axios.post<SentimentAnalysisResponse>(
         API_ENDPOINTS.SENTIMENT_ANALYSIS,
         request,
         {
           timeout: API_TIMEOUTS.SENTIMENT,
           headers: { 'Content-Type': 'application/json' },
         }
       );

       return response.data;
     } catch (error) {
       console.error('[SentimentService] Error analyzing sentiment:', error);

       // Handle cold start timeouts gracefully
       if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
         throw new Error('Sentiment analysis timed out (service cold start). Please try again.');
       }

       throw new Error(`Sentiment analysis failed: ${error}`);
     }
   }

   /**
    * Convert sentiment response to simplified format
    */
   export function parseSentimentResult(response: SentimentAnalysisResponse): {
     sentiment: 'POS' | 'NEUT' | 'NEG';
     score: number;
   } {
     const posCount = parseInt(response.positive[0]);
     const neutCount = parseInt(response.neutral[0]);
     const negCount = parseInt(response.negative[0]);

     let sentiment: 'POS' | 'NEUT' | 'NEG';
     let score: number;

     if (posCount > neutCount && posCount > negCount) {
       sentiment = 'POS';
       score = parseFloat(response.positive[1]);
     } else if (negCount > neutCount) {
       sentiment = 'NEG';
       score = parseFloat(response.negative[1]);
     } else {
       sentiment = 'NEUT';
       score = parseFloat(response.neutral[1]);
     }

     return { sentiment, score };
   }
   ```

5. **Implement Stock Prediction Service**

   File: `src/services/api/prediction.service.ts`
   ```typescript
   import axios from 'axios';
   import { API_ENDPOINTS, API_TIMEOUTS } from '@/constants/api.constants';
   import type { StockPredictionRequest, StockPredictionResponse } from '@/types/api.types';

   export async function getStockPredictions(
     ticker: string,
     closePrices: number[],
     volumes: number[],
     positiveCounts: number[],
     negativeCounts: number[],
     sentimentScores: number[]
   ): Promise<StockPredictionResponse> {
     const request: StockPredictionRequest = {
       ticker,
       close: closePrices,
       volume: volumes,
       positive: positiveCounts,
       negative: negativeCounts,
       sentiment: sentimentScores,
     };

     try {
       const response = await axios.post<StockPredictionResponse>(
         API_ENDPOINTS.STOCK_PREDICTION,
         request,
         {
           timeout: API_TIMEOUTS.PREDICTION,
           headers: { 'Content-Type': 'application/json' },
         }
       );

       return response.data;
     } catch (error) {
       console.error('[PredictionService] Error getting predictions:', error);
       throw new Error(`Stock prediction failed: ${error}`);
     }
   }
   ```

6. **Add Error Handling and Retry Logic**

   - Implement exponential backoff for cold start timeouts
   - Add circuit breaker pattern if services are frequently down
   - Provide fallback to bag-of-words sentiment if FinBERT service fails
   - Cache successful responses to reduce API calls

7. **Test Integration with Real Services**

   - Use curl or Postman to verify endpoints are accessible:
     ```bash
     curl -X POST https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app \
       -H "Content-Type: application/json" \
       -d '{"text":["Stock prices rising."],"hash":"12345"}'
     ```
   - Verify responses match expected format
   - Test with various article lengths to understand latency
   - Note: First request may be slow (cold start ~3-5 seconds)

**Verification Checklist:**
- [ ] TypeScript types created for both API contracts
- [ ] API endpoints configured in constants
- [ ] Sentiment analysis service implemented with timeout handling
- [ ] Prediction service implemented with error handling
- [ ] Successfully tested both endpoints with curl/Postman
- [ ] Services return data in expected format
- [ ] Cold start timeout handled gracefully (30s timeout)

**Testing Instructions:**

1. **Test Sentiment Service (curl)**:
   ```bash
   curl -X POST https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app \
     -H "Content-Type: application/json" \
     -d '{"text":["Apple stock rises on positive earnings.","Investors optimistic about growth."],"hash":"test123"}'
   ```
   Expected: `{ "positive": ["2", "0.87"], "neutral": ["0", "0.0"], "negative": ["0", "0.0"], "hash": "test123" }`

2. **Test Prediction Service (curl)**:
   ```bash
   curl -X POST https://stocks-f3jmjyxrpq-uc.a.run.app \
     -H "Content-Type: application/json" \
     -d '{"ticker":"AAPL","close":[150,152,151],"volume":[1000000,1100000,1050000],"positive":[5,3,7],"negative":[2,1,1],"sentiment":[0.8,0.75,0.85]}'
   ```
   Expected: `{ "next": "0.02", "week": "0.05", "month": "0.10", "ticker": "AAPL" }`

3. **Integration Test**:
   - Call services from React Native app (Phase 3+)
   - Verify responses are parsed correctly
   - Test with actual news articles and stock data
   - Confirm cold start delay is acceptable (~3-5 seconds first call)

**Commit Message Template:**
```
feat(services): integrate with existing Python microservices for sentiment and predictions

- Created sentiment.service.ts to call FinBERT microservice on Google Cloud Run
- Created prediction.service.ts to call logistic regression microservice
- Added TypeScript interfaces for API request/response contracts
- Implemented error handling for cold starts and timeouts (30s for sentiment, 15s for prediction)
- Added sentence splitting logic matching Android implementation
- Configured API endpoints in constants for easy switching to Lambda in Phase 8
- Services ready for integration in data sync pipeline (Task 5)
```

**Estimated Tokens:** ~15,000

---

**Important Notes:**

⚠️ **Service Availability**: The existing Python microservices are deployed on Google Cloud Run. If these services become unavailable:
1. Use the bag-of-words sentiment analysis (Task 3) as fallback
2. Return default prediction values (0.0 for all timeframes)
3. Log errors for debugging
4. Consider deploying your own instances (Phase 8)

🔒 **Security**: For MVP, calling services directly from the client is acceptable. For production (before public release), consider:
1. Creating a thin API proxy (Cloudflare Worker or simple Express.js server)
2. Hiding the microservice URLs
3. Adding rate limiting
4. Implementing API key rotation

**Phase 8+ Migration Path**: When migrating these services to AWS Lambda, only the `API_ENDPOINTS` constants need to change. All service logic remains identical.

---

### Task 5: Create Data Synchronization Pipeline

**Goal:** Build the orchestration logic that coordinates fetching data from APIs, analyzing sentiment, and storing results in the database.

**Files to Create:**
- `Migration/expo-project/src/services/sync/stockDataSync.ts`
- `Migration/expo-project/src/services/sync/newsDataSync.ts`
- `Migration/expo-project/src/services/sync/sentimentDataSync.ts`
- `Migration/expo-project/src/services/sync/syncOrchestrator.ts`

**Prerequisites:**
- All API services complete (Tasks 2.1, 2.2, 2.4)
- Sentiment analysis complete (Task 2.3)
- Repositories functional (Phase 1)

**Implementation Steps:**

1. **Study the Android Data Flow**
   - The Android app triggers data fetching when user selects a ticker/date
   - Order: Fetch stock prices → Fetch news → Analyze sentiment → Aggregate
   - Each step checks database first (cache), then fetches if missing

2. **Create Stock Data Sync**
   - File: `src/services/sync/stockDataSync.ts`
   - Function: `syncStockData(ticker: string, startDate: string, endDate: string): Promise<void>`
   - Logic:
     1. Check if data exists in database for date range
     2. If missing, fetch from Tiingo
     3. Transform and insert into StockDetails table
     4. Fetch symbol metadata if not exists
     5. Insert into SymbolDetails table

3. **Create News Data Sync**
   - File: `src/services/sync/newsDataSync.ts`
   - Function: `syncNewsData(ticker: string, startDate: string, endDate: string): Promise<void>`
   - Logic:
     1. Fetch news from Polygon for date range
     2. For each article:
        - Generate hash
        - Check if exists in database
        - If new, insert into NewsDetails table

4. **Create Sentiment Data Sync**
   - File: `src/services/sync/sentimentDataSync.ts`
   - Function: `syncSentimentData(ticker: string, date: string): Promise<void>`
   - Logic:
     1. Get all news articles for ticker and date from database
     2. For each article:
        - Check if WordCountDetails exists (by hash)
        - If not, fetch article text (from URL or use description)
        - Run bag-of-words sentiment analysis
        - Optionally call FinBERT Lambda (if enabled)
        - Calculate predictions (or call predictions Lambda)
        - Insert into WordCountDetails table
     3. After all articles processed, aggregate into CombinedWordDetails:
        - Sum positive/negative counts
        - Average sentiment scores
        - Determine dominant sentiment
        - Insert into CombinedWordDetails table

5. **Create Sync Orchestrator**
   - File: `src/services/sync/syncOrchestrator.ts`
   - Function: `syncAllData(ticker: string, days: number = 30): Promise<void>`
   - Orchestrates the full pipeline:
     ```typescript
     export async function syncAllData(ticker: string, days: number = 30) {
       const endDate = formatDateForDB(new Date());
       const startDate = formatDateForDB(subDays(new Date(), days));

       // Step 1: Sync stock prices
       await syncStockData(ticker, startDate, endDate);

       // Step 2: Sync news articles
       await syncNewsData(ticker, startDate, endDate);

       // Step 3: Sync sentiment for each date
       const dates = getDatesInRange(startDate, endDate);
       for (const date of dates) {
         await syncSentimentData(ticker, date);
       }

       console.log(`Sync complete for ${ticker}`);
     }
     ```

6. **Add Progress Tracking**
   - Emit events or use callbacks to report progress (e.g., "Fetching prices...", "Analyzing sentiment...")
   - UI can display progress bar (Phase 3+)

7. **Handle Errors Gracefully**
   - If Tiingo fails, don't crash—show error and allow retry
   - If one news article fails sentiment analysis, continue with others
   - Log all errors with context for debugging

**Verification Checklist:**
- [ ] Can sync complete data for a ticker (e.g., AAPL)
- [ ] Database contains stock prices, news, word counts, combined words
- [ ] Errors in one step don't crash the entire pipeline
- [ ] Duplicate data is not inserted (idempotent operations)

**Testing Instructions:**
- Integration test: Full sync for AAPL, 30 days
- Verify database has expected data:
  - 30 StockDetails entries (one per day)
  - N NewsDetails entries (varies by news volume)
  - N WordCountDetails entries (one per article)
  - 30 CombinedWordDetails entries (one per day)
- Test error scenarios: invalid ticker, API down, rate limited

**Commit Message Template:**
```
feat(sync): create data synchronization pipeline for end-to-end data flow

- Created stockDataSync to fetch and store stock prices from Tiingo
- Created newsDataSync to fetch and store news from Polygon
- Created sentimentDataSync to analyze articles and aggregate daily sentiment
- Created syncOrchestrator to coordinate full pipeline (prices → news → sentiment)
- Added progress tracking for UI feedback
- Handles errors gracefully without crashing entire sync process
```

**Estimated Tokens:** ~16,000

---

### Task 6: Create React Query Hooks for Data Fetching

**Goal:** Create custom React hooks using React Query (TanStack Query) that components will use to fetch and cache data.

**Files to Create:**
- `Migration/expo-project/src/hooks/useStockData.ts`
- `Migration/expo-project/src/hooks/useNewsData.ts`
- `Migration/expo-project/src/hooks/useSentimentData.ts`
- `Migration/expo-project/src/hooks/usePortfolio.ts`
- `Migration/expo-project/src/hooks/useSymbolSearch.ts`

**Prerequisites:**
- Task 2.5 complete (sync pipeline functional)
- React Query installed (Phase 1)

**Implementation Steps:**

1. **Set Up React Query Provider**
   - In `App.tsx`, wrap app with `QueryClientProvider`:
     ```typescript
     import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

     const queryClient = new QueryClient({
       defaultOptions: {
         queries: {
           staleTime: 1000 * 60 * 5, // 5 minutes
           cacheTime: 1000 * 60 * 30, // 30 minutes
         },
       },
     });

     export default function App() {
       return (
         <QueryClientProvider client={queryClient}>
           {/* App content */}
         </QueryClientProvider>
       );
     }
     ```

2. **Create useStockData Hook**
   - File: `src/hooks/useStockData.ts`
   - Hook that fetches stock prices from database (or triggers sync if missing):
     ```typescript
     export function useStockData(ticker: string, days: number = 30) {
       return useQuery({
         queryKey: ['stockData', ticker, days],
         queryFn: async () => {
           const endDate = formatDateForDB(new Date());
           const startDate = formatDateForDB(subDays(new Date(), days));

           // Try to get from database first
           let data = await StockRepository.findByTickerAndDateRange(ticker, startDate, endDate);

           // If missing, trigger sync
           if (data.length === 0) {
             await syncStockData(ticker, startDate, endDate);
             data = await StockRepository.findByTickerAndDateRange(ticker, startDate, endDate);
           }

           return data;
         },
         enabled: !!ticker, // Only run if ticker is provided
       });
     }
     ```

3. **Create useNewsData Hook**
   - Similar pattern to useStockData
   - Fetches from NewsRepository, triggers sync if missing

4. **Create useSentimentData Hook**
   - Fetches both WordCountDetails (individual articles) and CombinedWordDetails (daily aggregates)
   - Returns both datasets for display in UI

5. **Create usePortfolio Hook**
   - Fetches user's portfolio from PortfolioRepository
   - Includes mutations for add/remove operations:
     ```typescript
     export function usePortfolio() {
       const queryClient = useQueryClient();

       const { data, isLoading, error } = useQuery({
         queryKey: ['portfolio'],
         queryFn: () => PortfolioRepository.findAll(),
       });

       const addToPortfolio = useMutation({
         mutationFn: (stock: PortfolioDetails) => PortfolioRepository.insert(stock),
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['portfolio'] });
         },
       });

       const removeFromPortfolio = useMutation({
         mutationFn: (ticker: string) => PortfolioRepository.delete(ticker),
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ['portfolio'] });
         },
       });

       return { portfolio: data, isLoading, error, addToPortfolio, removeFromPortfolio };
     }
     ```

6. **Create useSymbolSearch Hook**
   - Allows searching for stock symbols (for the search screen)
   - Uses Tiingo search API or filters local SymbolDetails

7. **Add Loading and Error States**
   - All hooks return `{ data, isLoading, error, refetch }`
   - Components can show loading spinners or error messages

**Verification Checklist:**
- [ ] useStockData returns stock prices for a ticker
- [ ] useNewsData returns news articles
- [ ] useSentimentData returns word counts and combined sentiment
- [ ] usePortfolio returns user's portfolio and add/remove functions work
- [ ] React Query caching works (subsequent calls don't re-fetch)

**Testing Instructions:**
- Create a test component that uses each hook
- Verify data is fetched and displayed
- Test cache behavior (change ticker, go back—should use cache)
- Test mutations (add to portfolio, verify query invalidation)

**Commit Message Template:**
```
feat(hooks): create React Query hooks for data fetching and mutations

- Created useStockData hook with automatic sync triggering
- Created useNewsData and useSentimentData hooks
- Created usePortfolio hook with add/remove mutations
- Created useSymbolSearch hook for ticker search functionality
- Configured React Query with 5-minute stale time, 30-minute cache
- All hooks include loading, error, and refetch states
```

**Estimated Tokens:** ~13,000

---

### Task 7: Add Error Handling and User Feedback

**Goal:** Implement comprehensive error handling across all services and create user-friendly error messages.

**Files to Create:**
- `Migration/expo-project/src/utils/errors/APIError.ts`
- `Migration/expo-project/src/utils/errors/errorHandler.ts`
- `Migration/expo-project/src/utils/errors/errorMessages.ts`

**Prerequisites:**
- All API services complete

**Implementation Steps:**

1. **Create Custom Error Classes**
   - File: `src/utils/errors/APIError.ts`
   - Define error types:
     ```typescript
     export class APIError extends Error {
       constructor(message: string, public statusCode?: number, public endpoint?: string) {
         super(message);
         this.name = 'APIError';
       }
     }

     export class NetworkError extends Error {
       constructor(message: string = 'Network connection failed') {
         super(message);
         this.name = 'NetworkError';
       }
     }

     export class RateLimitError extends APIError {
       constructor(endpoint: string) {
         super(`Rate limit exceeded for ${endpoint}`, 429, endpoint);
         this.name = 'RateLimitError';
       }
     }

     export class TickerNotFoundError extends APIError {
       constructor(ticker: string) {
         super(`Ticker '${ticker}' not found`, 404);
         this.name = 'TickerNotFoundError';
       }
     }
     ```

2. **Create Error Handler**
   - File: `src/utils/errors/errorHandler.ts`
   - Centralized error handling logic:
     ```typescript
     export function handleAPIError(error: any): string {
       if (error instanceof TickerNotFoundError) {
         return `The ticker symbol '${error.message}' was not found. Please check and try again.`;
       }
       if (error instanceof RateLimitError) {
         return 'Too many requests. Please wait a moment and try again.';
       }
       if (error instanceof NetworkError) {
         return 'Unable to connect to the internet. Please check your connection.';
       }
       if (axios.isAxiosError(error)) {
         if (error.code === 'ECONNABORTED') {
           return 'Request timed out. Please try again.';
         }
         if (error.response?.status === 500) {
           return 'Server error. Please try again later.';
         }
       }
       return 'An unexpected error occurred. Please try again.';
     }
     ```

3. **Add Error Logging**
   - In production, send errors to Sentry or similar service
   - In development, log to console with full context
   - Include: ticker, date range, API endpoint, stack trace

4. **Add Retry Logic to API Services**
   - Update all API services to use retry with exponential backoff
   - Max 3 retries, delays: 2s, 4s, 8s
   - Only retry on transient errors (network, timeout, 500, 429)
   - Don't retry on 400, 404 (client errors)

5. **Create User-Friendly Error Messages**
   - File: `src/utils/errors/errorMessages.ts`
   - Map error types to user-facing messages
   - Provide actionable guidance:
     - "Please check your internet connection and try again."
     - "Invalid ticker symbol. Examples: AAPL, GOOGL, MSFT."

6. **Test Error Scenarios**
   - Manually test each error type:
     - Disconnect network → NetworkError
     - Use invalid ticker → TickerNotFoundError
     - Trigger rate limit (make many rapid requests) → RateLimitError
   - Verify user sees appropriate message

**Verification Checklist:**
- [ ] Custom error classes defined
- [ ] Error handler returns user-friendly messages
- [ ] Retry logic works (transient errors retried, permanent errors not)
- [ ] Errors logged with context (ticker, endpoint, etc.)

**Testing Instructions:**
- Unit tests for error handler (pass different error types, check messages)
- Integration test: trigger each error type and verify handling
- Test retry logic with mocked axios (fail first 2 calls, succeed on 3rd)

**Commit Message Template:**
```
feat(errors): implement comprehensive error handling and user feedback

- Created custom error classes (APIError, NetworkError, RateLimitError, etc.)
- Implemented centralized error handler with user-friendly messages
- Added retry logic with exponential backoff for transient errors
- Configured error logging (console in dev, Sentry in production)
- All API services now provide actionable error messages to users
```

**Estimated Tokens:** ~10,000

---

## Phase Verification

### Complete Phase Checklist

- [ ] Tiingo service fetches stock prices successfully
- [ ] Polygon service fetches news articles successfully
- [ ] Bag-of-words sentiment analysis produces correct counts
- [ ] AWS Lambda functions deployed and callable (or local alternative working)
- [ ] Full data sync pipeline works end-to-end
- [ ] React Query hooks fetch and cache data correctly
- [ ] Errors handled gracefully with user-friendly messages
- [ ] All tests pass (unit and integration)

### Integration Tests

Run this end-to-end test:

```typescript
// Full pipeline test
import { syncAllData } from '@/services/sync/syncOrchestrator';
import { useStockData, useNewsData, useSentimentData } from '@/hooks';

// Sync data for AAPL (last 30 days)
await syncAllData('AAPL', 30);

// Verify data in hooks
const { data: stockData } = useStockData('AAPL', 30);
const { data: newsData } = useNewsData('AAPL', 30);
const { data: sentimentData } = useSentimentData('AAPL', 30);

console.log(`Stock prices: ${stockData.length}`);        // Expected: 30 (weekdays + weekends)
console.log(`News articles: ${newsData.length}`);        // Expected: varies (10-100+)
console.log(`Sentiment data: ${sentimentData.length}`);  // Expected: 30 (daily aggregates)
```

### Performance Benchmarks

- Stock price fetch (30 days): < 2 seconds
- News fetch (30 days): < 5 seconds (depends on Polygon rate limiting)
- Sentiment analysis (per article): < 100ms (bag-of-words), < 3s (FinBERT)
- Full sync (30 days): < 60 seconds (without FinBERT), < 5 minutes (with FinBERT)

### Known Limitations

- FinBERT Lambda has cold start latency (~3-5 seconds)
- Polygon free tier limited to 5 req/min (may need to slow down fetching)
- No offline sync (requires internet connection)
- No background sync (coming in Phase 6 as enhancement)

---

## Next Steps

After completing Phase 2:
1. Commit all changes with descriptive messages
2. Test the full data pipeline with at least 3 tickers (e.g., AAPL, GOOGL, TSLA)
3. Verify all data is correctly stored in the database
4. Proceed to **Phase 3: UI Foundation & Navigation** to build the user interface
