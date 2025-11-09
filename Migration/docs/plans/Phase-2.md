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
- [ ] Can fetch stock prices from Tiingo and store in database
- [ ] Can fetch news articles from Polygon and store in database
- [ ] Bag-of-words sentiment analysis produces correct counts
- [ ] AWS Lambda endpoints deployed and functional
- [ ] End-to-end data pipeline works: fetch news → analyze sentiment → store results
- [ ] All services handle errors gracefully with user-friendly messages

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

### Task 4: Deploy AWS Lambda Functions (FinBERT Sentiment & Predictions)

**Goal:** Deploy two AWS Lambda functions: one for FinBERT sentiment analysis, one for stock movement predictions. Alternatively, document how to set up local testing environment.

**Files to Create:**
- `Migration/aws-lambda/sentiment-finbert/` (Lambda function directory)
  - `handler.py` - Python handler for FinBERT
  - `requirements.txt` - Dependencies (transformers, torch)
  - `serverless.yml` or deployment config
- `Migration/aws-lambda/predictions/` (Lambda function directory)
  - `handler.py` - Prediction model handler
  - `requirements.txt`
- `Migration/expo-project/src/services/api/sentiment.service.ts` (client-side)
- `Migration/expo-project/src/services/api/prediction.service.ts` (client-side)

**Prerequisites:**
- AWS account with Lambda access (or use AWS Free Tier)
- Serverless Framework installed: `npm install -g serverless`
- Understanding of the existing microservice: `stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app`

**Implementation Steps:**

1. **Analyze the Android Microservice Integration**
   - Read `SetWordCountData.java`, find the microservice call (around line 200)
   - Note the request format:
     ```json
     {
       "text": "Article content here...",
       "ticker": "AAPL"
     }
     ```
   - Response format (from `JsonReturn.java`):
     ```json
     {
       "sentiment": "POS" | "NEUT" | "NEG",
       "score": 0.85
     }
     ```

2. **Option A: Deploy AWS Lambda (Production)**
   - Create `Migration/aws-lambda/sentiment-finbert/handler.py`:
     ```python
     import json
     from transformers import AutoTokenizer, AutoModelForSequenceClassification
     import torch

     model_name = "ProsusAI/finbert"
     tokenizer = AutoTokenizer.from_pretrained(model_name)
     model = AutoModelForSequenceClassification.from_pretrained(model_name)

     def lambda_handler(event, context):
         body = json.loads(event['body'])
         text = body.get('text', '')

         inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
         outputs = model(**inputs)
         probs = torch.nn.functional.softmax(outputs.logits, dim=-1)

         # FinBERT outputs: [negative, neutral, positive]
         sentiment_map = ['NEG', 'NEUT', 'POS']
         sentiment_idx = torch.argmax(probs).item()

         return {
             'statusCode': 200,
             'body': json.dumps({
                 'sentiment': sentiment_map[sentiment_idx],
                 'score': float(probs[0][sentiment_idx])
             })
         }
     ```

3. **Option B: Use Existing Microservice**
   - If the existing microservice is still available and accessible
   - Update the endpoint URL to point to it
   - Skip Lambda deployment entirely

4. **Option C: Local Development Environment**
   - Set up a local Flask or FastAPI server that mimics the microservice
   - Run locally during development: `python local_server.py`
   - Useful for testing without deploying to AWS

5. **Create Client-Side Service**
   - File: `src/services/api/sentiment.service.ts`
   - Implement function:
     ```typescript
     export async function analyzeSentiment(text: string, ticker: string): Promise<SentimentResult> {
       const response = await axios.post(LAMBDA_ENDPOINT, { text, ticker });
       return response.data;
     }
     ```

6. **Create Predictions Lambda Function**
   - Read `SetPortfolioData.java` to understand the prediction logic
   - The Android app sends stock price data + sentiment data to a microservice
   - Microservice runs multivariate logistic regression
   - Returns predictions for 1-day, 2-weeks, 1-month
   - Create similar Lambda function or reuse existing if available

7. **Handle Lambda Cold Starts**
   - Lambda functions have cold start latency (~1-5 seconds for Python with ML models)
   - Implement loading indicators in the UI (Phase 3+)
   - Consider Lambda provisioned concurrency for production (costs money)

8. **Set Up Environment Variables**
   - Store Lambda endpoint URLs in `.env` file:
     ```
     AWS_LAMBDA_SENTIMENT_ENDPOINT=https://xxxxx.lambda-url.us-east-1.on.aws/
     AWS_LAMBDA_PREDICTION_ENDPOINT=https://yyyyy.lambda-url.us-east-1.on.aws/
     ```
   - Use `@env` package to load variables

**Verification Checklist:**
- [ ] FinBERT Lambda function deploys successfully
- [ ] Can send test request and receive sentiment response
- [ ] Prediction Lambda function deploys successfully
- [ ] Client-side services can call Lambda endpoints
- [ ] Error handling works (timeout, 500 errors)

**Testing Instructions:**
- Test Lambda function locally with `serverless invoke local`
- Test with sample news article text
- Compare FinBERT results with bag-of-words sentiment (may differ, both valid)
- Integration test: Full pipeline (fetch news → FinBERT → store)

**Commit Message Template:**
```
feat(lambda): deploy AWS Lambda functions for FinBERT sentiment and predictions

- Created sentiment-finbert Lambda with ProsusAI/finbert model
- Created predictions Lambda with logistic regression model
- Deployed to AWS using Serverless Framework
- Added client-side services to call Lambda endpoints
- Configured environment variables for endpoint URLs
- Handles cold starts gracefully with retry logic
```

**Estimated Tokens:** ~18,000

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
