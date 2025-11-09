# Phase 1: Project Setup & Data Layer

**Estimated Tokens:** ~95,000
**Dependencies:** Phase 0 (Foundation)
**Goal:** Initialize Expo project, set up SQLite database, extract sentiment vocabulary data, and establish the data access layer.

---

## Phase Goal

Create a fully functional data layer that mirrors the Android app's Room database architecture. By the end of this phase, you'll have:

1. A working Expo project with TypeScript and essential dependencies
2. SQLite database with all 6 tables from the Android Room schema
3. Sentiment vocabulary words extracted from XML and available as JSON
4. Repository pattern for data access (CRUD operations)
5. Mock data generators for testing
6. Unit tests for database operations

**Success Criteria:**
- [ ] `npx expo start` runs without errors
- [ ] Database initializes with correct schema
- [ ] All repositories pass unit tests
- [ ] Sentiment words JSON file loads successfully
- [ ] Mock data can populate all 6 tables

---

## Prerequisites

### External Dependencies
- Node.js 20.x or later
- npm 10.x or yarn 1.22.x
- Expo CLI installed globally: `npm install -g expo-cli`
- Git configured and working
- Code editor (VS Code recommended with ESLint/Prettier extensions)

### Required Knowledge
- TypeScript basics (interfaces, async/await)
- React Native fundamentals
- SQL and relational databases
- Git branching and commits

### Android Source Files to Reference
You'll read these files to understand the original schema:
- `app/src/main/java/gemenielabs/sentiment/Room/StockDatabase.java` (database version, entities)
- `app/src/main/java/gemenielabs/sentiment/Room/StockDetails.java` (table structure)
- `app/src/main/java/gemenielabs/sentiment/Room/SymbolDetails.java`
- `app/src/main/java/gemenielabs/sentiment/Room/NewsDetails.java`
- `app/src/main/java/gemenielabs/sentiment/Room/WordCountDetails.java`
- `app/src/main/java/gemenielabs/sentiment/Room/CombinedWordDetails.java`
- `app/src/main/java/gemenielabs/sentiment/Room/PortfolioDetails.java`
- `app/src/main/res/values/array.xml` (sentiment vocabulary)

---

## Tasks

### Task 1: Initialize Expo Project

**Goal:** Create a new Expo project with TypeScript in the `Migration/` directory and install all core dependencies.

**Files to Create:**
- `Migration/expo-project/` (root directory)
- `Migration/expo-project/app.json` - Expo configuration
- `Migration/expo-project/tsconfig.json` - TypeScript configuration
- `Migration/expo-project/.eslintrc.js` - Linting rules
- `Migration/expo-project/.prettierrc` - Code formatting
- `Migration/expo-project/.gitignore` - Git ignore patterns
- `Migration/expo-project/package.json` - Dependencies

**Prerequisites:**
- None (this is the first task)

**Implementation Steps:**

1. **Navigate to Migration Directory**
   - Change directory to `Migration/`
   - Run Expo initialization command for TypeScript project
   - Name the project appropriately (e.g., "StockSentiment" or "android-stocks-rn")

2. **Install Core Dependencies**
   - Install navigation libraries: React Navigation 7.x (native, bottom-tabs, stack, material-top-tabs)
   - Install UI libraries: React Native Paper, Reanimated, Gesture Handler
   - Install data libraries: expo-sqlite, @tanstack/react-query, date-fns
   - Install API libraries: axios
   - Install storage libraries: expo-secure-store, async-storage
   - Install utilities: expo-vector-icons, expo-status-bar

3. **Install Development Dependencies**
   - TypeScript type definitions: @types/react, @types/react-native
   - Testing: @testing-library/react-native, @testing-library/jest-native, jest
   - Linting: eslint, prettier, husky (for git hooks)
   - Refer to Phase-0.md "Tech Stack" section for exact package names and versions

4. **Configure TypeScript**
   - Enable strict mode
   - Set up path aliases (e.g., `@/components` maps to `src/components`)
   - Configure JSX for React Native

5. **Configure Linting and Formatting**
   - Set up ESLint with React Native and TypeScript rules
   - Configure Prettier for consistent code formatting
   - Set up Husky pre-commit hooks to run linting automatically

6. **Create Basic Directory Structure**
   - Follow the structure defined in Phase-0.md "Shared Patterns & Conventions"
   - Create empty directories: `src/`, `assets/`, `__tests__/`
   - Create subdirectories: `components/`, `screens/`, `services/`, `database/`, `data/`, `hooks/`, `contexts/`, `utils/`, `types/`, `constants/`, `theme/`

7. **Create a Simple App Entry Point**
   - Create `App.tsx` with a basic "Hello World" component
   - Ensure the app builds and runs: `npx expo start`
   - Test on at least one platform (web, iOS simulator, or Android emulator)

**Verification Checklist:**
- [ ] `npx expo start` runs without errors
- [ ] App displays on at least one platform (web/iOS/Android)
- [ ] `npm run lint` (or `yarn lint`) executes without errors
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Directory structure matches Phase-0.md specification

**Testing Instructions:**
- Run `npm test` to verify Jest is configured correctly (even with no tests yet)
- Commit should build successfully (Husky pre-commit hook runs)

**Commit Message Template:**
```
feat(init): initialize Expo project with TypeScript and core dependencies

- Created new Expo project in Migration/expo-project
- Installed React Navigation, React Native Paper, expo-sqlite
- Configured TypeScript with strict mode and path aliases
- Set up ESLint, Prettier, and Husky git hooks
- Created directory structure following architecture guidelines
```

**Estimated Tokens:** ~12,000

---

### Task 2: Extract Sentiment Vocabulary from XML to JSON

**Goal:** Convert the sentiment word arrays from `app/src/main/res/values/array.xml` to a structured JSON file for use in React Native.

**Files to Create:**
- `Migration/expo-project/src/data/sentiment-words.json` - Vocabulary data
- `Migration/expo-project/scripts/extractSentimentWords.ts` - Extraction script (optional, if you automate)

**Prerequisites:**
- Task 1 must be complete (project initialized)

**Implementation Steps:**

1. **Read the Source XML File**
   - Read the file at `app/src/main/res/values/array.xml` (relative to repo root)
   - Identify all `positive_words_*` and `negative_words_*` string arrays

2. **Parse the XML Structure**
   - Extract all words from each letter-based array (a-z for both positive and negative)
   - Understand the pattern: `positive_words_a` contains all positive words starting with 'a'
   - Note: Some arrays may be empty (e.g., `positive_words_k`, `negative_words_z`)

3. **Create JSON Structure**
   - Follow the structure defined in Phase-0.md ADR-007
   - Format:
     ```json
     {
       "positive": {
         "a": ["word1", "word2", ...],
         "b": [...],
         ...
         "z": [...]
       },
       "negative": {
         "a": ["word1", "word2", ...],
         ...
         "z": []
       }
     }
     ```

4. **Write JSON File**
   - Save to `src/data/sentiment-words.json`
   - Ensure proper formatting (use 2-space indentation for readability)
   - Verify file size (should be ~25-35KB)

5. **Create TypeScript Typings**
   - Create `src/types/sentiment.types.ts`
   - Define interfaces for sentiment data:
     ```typescript
     export type SentimentType = 'positive' | 'negative';
     export type SentimentWords = Record<string, string[]>;
     export interface VocabularyData {
       positive: SentimentWords;
       negative: SentimentWords;
     }
     ```

6. **Create Utility Function to Load Words**
   - Create `src/utils/sentiment/vocabularyLoader.ts`
   - Export a function to load and access sentiment words
   - Implement the letter-based lookup pattern from the Java code
   - Handle edge cases: empty arrays, non-alphabetic characters

**Verification Checklist:**
- [ ] JSON file exists at `src/data/sentiment-words.json`
- [ ] File contains all positive word arrays (a-z, 26 total)
- [ ] File contains all negative word arrays (a-z, 26 total)
- [ ] Total word count matches Android app (~1000+ positive, ~200+ negative)
- [ ] vocabularyLoader successfully imports and parses the JSON

**Testing Instructions:**
- Write a unit test in `__tests__/utils/sentiment/vocabularyLoader.test.ts`
- Test: Loading the JSON doesn't throw errors
- Test: Lookup for known word returns true (e.g., "happy" is positive)
- Test: Lookup for unknown word returns false
- Test: Handles edge cases (empty string, numbers, special characters)

**Commit Message Template:**
```
feat(data): extract sentiment vocabulary from Android XML to JSON

- Converted 52 string arrays (26 positive, 26 negative) from array.xml
- Created structured JSON with letter-based indexing for O(1) lookups
- Added TypeScript types for vocabulary data
- Implemented vocabularyLoader utility with word lookup function
- Total: ~1200 sentiment words extracted
```

**Estimated Tokens:** ~8,000

---

### Task 3: Define Database Schema and TypeScript Interfaces

**Goal:** Create TypeScript interfaces for all 6 database entities and define the SQL schema for SQLite initialization.

**Files to Create:**
- `Migration/expo-project/src/types/database.types.ts` - TypeScript interfaces for all entities
- `Migration/expo-project/src/database/schema.ts` - SQL CREATE TABLE statements
- `Migration/expo-project/src/constants/database.constants.ts` - Database name, version, table names

**Prerequisites:**
- Task 1 complete (project initialized)
- Access to Android Room entity files (to understand schema)

**Implementation Steps:**

1. **Read Android Room Entity Files**
   - Review all 6 entity files in `app/src/main/java/gemenielabs/sentiment/Room/`
   - For each entity, note:
     - Table name (from `@Entity(tableName = "...")`)
     - Primary key (from `@PrimaryKey`)
     - Column names and types (from `@ColumnInfo`)
     - Nullable vs. non-nullable fields

2. **Create TypeScript Interfaces**
   - Create `src/types/database.types.ts`
   - Define one interface per entity, matching field names and types exactly
   - Use appropriate TypeScript types:
     - Java `String` → TypeScript `string`
     - Java `int`, `long` → TypeScript `number`
     - Java `double`, `float` → TypeScript `number`
     - Java `boolean` → TypeScript `boolean`
   - Mark optional fields with `?` for nullable columns
   - Add JSDoc comments explaining each interface

3. **Map Entity Structures**
   Based on the Android source:

   - **StockDetails**: ticker, date, open, close, high, low, volume, adjusted values, dividend cash, split factor, market cap, PE ratio
   - **SymbolDetails**: ticker, name, exchange code, start date, end date, long description
   - **NewsDetails**: hash (unique ID), ticker, article URL, publisher, article date, title, description
   - **WordCountDetails**: id, ticker, date, hash, positive/negative counts, sentiment, sentiment score, 3 prediction fields
   - **CombinedWordDetails**: id, ticker, date, combined positive/negative counts, sentiment, sentiment score, 3 prediction fields
   - **PortfolioDetails**: id, ticker, name, 3 prediction fields

4. **Define SQL Schema**
   - Create `src/database/schema.ts`
   - Write CREATE TABLE statement for each entity
   - Include appropriate data types (INTEGER, TEXT, REAL)
   - Set PRIMARY KEY, NOT NULL, and UNIQUE constraints where needed
   - Add indexes for frequently queried columns (ticker, date)
   - Reference the Android schema exactly to ensure data compatibility

5. **Create Database Constants**
   - Create `src/constants/database.constants.ts`
   - Define:
     ```typescript
     export const DB_NAME = 'stock_sentiment.db';
     export const DB_VERSION = 1;
     export const TABLE_NAMES = {
       STOCK_DETAILS: 'stock_details',
       SYMBOL_DETAILS: 'symbol_details',
       // ... etc
     };
     ```

**Verification Checklist:**
- [ ] All 6 TypeScript interfaces defined with correct field names and types
- [ ] All 6 SQL CREATE TABLE statements written
- [ ] Primary keys and indexes defined appropriately
- [ ] Column types match Android Room schema
- [ ] Database constants file exists with all table names

**Testing Instructions:**
- No runtime tests yet (will test in Task 4)
- Verify TypeScript compilation: `npx tsc --noEmit`
- Manually review each interface against Android entity file

**Commit Message Template:**
```
feat(database): define database schema and TypeScript interfaces

- Created TypeScript interfaces for all 6 Room entities
- Defined SQL CREATE TABLE statements mirroring Android schema
- Added indexes for ticker and date columns (frequently queried)
- Created database constants (DB name, version, table names)
- Ensures type safety for database operations
```

**Estimated Tokens:** ~10,000

---

### Task 4: Initialize SQLite Database

**Goal:** Create a database initialization module that creates tables and provides a singleton database connection.

**Files to Create:**
- `Migration/expo-project/src/database/database.ts` - Database initialization and connection
- `Migration/expo-project/src/database/migrations/001_initial.sql` - Initial schema migration (optional organization)

**Prerequisites:**
- Task 1 complete (expo-sqlite installed)
- Task 3 complete (schema defined)

**Implementation Steps:**

1. **Create Database Module**
   - Create `src/database/database.ts`
   - Import `expo-sqlite` and schema from Task 3
   - Implement a singleton pattern to ensure only one database connection exists

2. **Write Initialization Function**
   - Create `initializeDatabase()` async function
   - Open/create the database using `SQLite.openDatabaseAsync(DB_NAME)`
   - Check if tables exist (query `sqlite_master`)
   - If tables don't exist, execute all CREATE TABLE statements from schema
   - Handle migration logic for future schema changes (check `DB_VERSION`)

3. **Implement Database Connection Getter**
   - Export a `getDatabase()` function that returns the initialized database
   - Ensure initialization happens before returning the connection
   - Handle errors gracefully (log and re-throw with context)

4. **Add Database Reset Function (for Development)**
   - Create `resetDatabase()` function for testing/development
   - Drops all tables and recreates schema
   - Only enable in `__DEV__` mode

5. **Implement Error Handling**
   - Catch SQLite errors and provide meaningful messages
   - Log errors with context (e.g., "Failed to create table: stock_details")
   - Don't swallow errors; propagate them for debugging

6. **Test Database Initialization**
   - Call `initializeDatabase()` in a test script
   - Verify all tables are created
   - Verify indexes are created
   - Use SQL query to check table structure: `PRAGMA table_info(table_name);`

**Verification Checklist:**
- [ ] Database file is created on first app launch
- [ ] All 6 tables exist in the database
- [ ] Indexes are created correctly
- [ ] `getDatabase()` returns a valid SQLite connection
- [ ] No errors logged during initialization

**Testing Instructions:**
- Create `__tests__/database/database.test.ts`
- Test: Database initializes without errors
- Test: All tables exist after initialization
- Test: `resetDatabase()` drops and recreates tables
- Test: Calling `getDatabase()` multiple times returns the same instance (singleton)

**Commit Message Template:**
```
feat(database): implement SQLite database initialization

- Created database module with singleton pattern
- Implemented initializeDatabase() with schema creation
- Added table existence checks and migration support
- Created resetDatabase() function for testing
- All 6 tables (StockDetails, NewsDetails, etc.) created successfully
```

**Estimated Tokens:** ~12,000

---

### Task 5: Implement Repository Pattern for Data Access

**Goal:** Create repository classes for each entity, providing clean CRUD operations that abstract SQLite queries.

**Files to Create:**
- `Migration/expo-project/src/database/repositories/stock.repository.ts`
- `Migration/expo-project/src/database/repositories/symbol.repository.ts`
- `Migration/expo-project/src/database/repositories/news.repository.ts`
- `Migration/expo-project/src/database/repositories/wordCount.repository.ts`
- `Migration/expo-project/src/database/repositories/combinedWord.repository.ts`
- `Migration/expo-project/src/database/repositories/portfolio.repository.ts`
- `Migration/expo-project/src/database/repositories/index.ts` - Central export

**Prerequisites:**
- Task 3 complete (TypeScript interfaces defined)
- Task 4 complete (database initialized)

**Implementation Steps:**

1. **Understand the Repository Pattern**
   - Repositories encapsulate data access logic
   - Each repository handles one entity (one-to-one with Room DAOs)
   - Provide methods like: `findByTicker()`, `insert()`, `update()`, `delete()`, `findAll()`
   - Return TypeScript-typed results (not raw SQL rows)

2. **Review Android DAO Methods**
   - Read `app/src/main/java/gemenielabs/sentiment/Room/StockDao.java`
   - Note all query methods and their parameters
   - Port the same methods to TypeScript repositories
   - Focus on methods actually used in the Android app (don't over-engineer)

3. **Create StockRepository**
   - File: `src/database/repositories/stock.repository.ts`
   - Implement methods:
     - `findByTicker(ticker: string): Promise<StockDetails[]>`
     - `findByTickerAndDateRange(ticker: string, startDate: string, endDate: string): Promise<StockDetails[]>`
     - `insert(stock: Omit<StockDetails, 'id'>): Promise<number>` (returns new ID)
     - `insertMany(stocks: Omit<StockDetails, 'id'>[]): Promise<void>`
     - `deleteByTicker(ticker: string): Promise<void>`
   - Use parameterized queries to prevent SQL injection
   - Return typed results (use `as StockDetails[]`)

4. **Create Remaining Repositories**
   - Repeat step 3 for the other 5 entities
   - Each repository should have entity-specific methods:
     - **SymbolRepository**: `findByTicker()`, `insert()`, `update()`
     - **NewsRepository**: `findByTicker()`, `findByTickerAndDateRange()`, `insert()`, `checkExistsByHash()`
     - **WordCountRepository**: `findByTicker()`, `findByTickerAndDate()`, `insert()`
     - **CombinedWordRepository**: `findByTicker()`, `findByTickerAndDateRange()`, `insert()`, `deleteByTickerAndDate()`
     - **PortfolioRepository**: `findAll()`, `findByTicker()`, `insert()`, `delete()`

5. **Add Helper Methods**
   - Create utility methods for common patterns:
     - `executeQuery<T>(sql: string, params?: any[]): Promise<T[]>`
     - `executeNonQuery(sql: string, params?: any[]): Promise<void>`
   - Consider creating a base repository class with shared methods

6. **Handle Date Formatting**
   - SQLite stores dates as TEXT in ISO 8601 format (`YYYY-MM-DD`)
   - Ensure all date parameters are formatted correctly using `date-fns`
   - Add validation for date strings

7. **Create Index Exports**
   - Create `src/database/repositories/index.ts`
   - Export all repositories:
     ```typescript
     export * from './stock.repository';
     export * from './symbol.repository';
     // ... etc
     ```

**Verification Checklist:**
- [ ] All 6 repositories created
- [ ] Each repository has appropriate CRUD methods
- [ ] Methods return correct TypeScript types
- [ ] Parameterized queries used (no string concatenation)
- [ ] Date handling is consistent

**Testing Instructions:**
- Create test files for each repository in `__tests__/database/repositories/`
- For each repository, test:
  - Insert operation (single and bulk)
  - Query by ticker
  - Query by date range
  - Delete operation
  - Edge cases (empty results, invalid ticker)
- Use in-memory SQLite for fast test execution
- Mock data generators can be used (Task 6)

**Commit Message Template:**
```
feat(database): implement repository pattern for all 6 entities

- Created StockRepository with findByTicker, insert, delete methods
- Created SymbolRepository, NewsRepository, WordCountRepository
- Created CombinedWordRepository, PortfolioRepository
- All repositories use parameterized queries for SQL injection protection
- Added date formatting utilities for consistent ISO 8601 handling
- Exported all repositories from central index file
```

**Estimated Tokens:** ~25,000

---

### Task 6: Create Mock Data Generators

**Goal:** Create utilities to generate realistic mock data for all 6 database entities, enabling testing without API calls.

**Files to Create:**
- `Migration/expo-project/src/utils/mockData/stockMock.ts`
- `Migration/expo-project/src/utils/mockData/newsMock.ts`
- `Migration/expo-project/src/utils/mockData/sentimentMock.ts`
- `Migration/expo-project/src/utils/mockData/portfolioMock.ts`
- `Migration/expo-project/src/utils/mockData/index.ts` - Central export

**Prerequisites:**
- Task 3 complete (TypeScript interfaces defined)
- Task 5 complete (repositories available for testing)

**Implementation Steps:**

1. **Install Faker Library (Optional)**
   - Consider using `@faker-js/faker` for generating realistic data
   - Alternatively, create simple helper functions for random data

2. **Create Stock Price Mock Generator**
   - File: `src/utils/mockData/stockMock.ts`
   - Function: `generateMockStockPrices(ticker: string, startDate: string, endDate: string, options?: {...})`
   - Generate OHLCV data with realistic price movements:
     - Random walk algorithm (price changes by ±1-3%)
     - Ensure: `low <= open, close <= high`
     - Volume: random between 1M-100M shares
   - Include adjusted values (same as regular for simplicity)
   - Support options: starting price, volatility

3. **Create Symbol Details Mock Generator**
   - File: `src/utils/mockData/stockMock.ts` (can be in same file)
   - Function: `generateMockSymbol(ticker: string)`
   - Generate company metadata:
     - Name: Map common tickers (AAPL → "Apple Inc.") or use generic names
     - Exchange: "NASDAQ", "NYSE", etc.
     - Description: Realistic company description (or placeholder)

4. **Create News Mock Generator**
   - File: `src/utils/mockData/newsMock.ts`
   - Function: `generateMockNews(ticker: string, count: number)`
   - Generate news articles:
     - Titles: Use sentiment words to create realistic headlines (e.g., "Stock shows strong growth" or "Company faces challenges")
     - Publisher: Random from list ("Bloomberg", "Reuters", "WSJ", etc.)
     - Date: Random recent dates
     - URL: Generate fake URLs
     - Hash: Use `ticker + date + title` hash for uniqueness

5. **Create Sentiment Analysis Mock Generator**
   - File: `src/utils/mockData/sentimentMock.ts`
   - Function: `generateMockWordCount(ticker: string, date: string, hash: string)`
   - Generate word counts and sentiment:
     - Positive count: random 0-50
     - Negative count: random 0-30
     - Sentiment: "POS" if positive > negative, "NEG" if negative > positive, "NEUT" otherwise
     - Sentiment score: (positive - negative) / (positive + negative)
     - Predictions: random percentages between -10% and +15%

6. **Create Combined Sentiment Mock Generator**
   - Function: `generateMockCombinedWordCount(ticker: string, date: string, articleCount: number)`
   - Aggregate multiple WordCount entries into one CombinedWordCount
   - Average sentiment scores and predictions

7. **Create Portfolio Mock Generator**
   - File: `src/utils/mockData/portfolioMock.ts`
   - Function: `generateMockPortfolio(tickers: string[])`
   - Generate portfolio entries for given tickers
   - Include predictions for each stock

8. **Create Helper Function to Populate Database**
   - Function: `populateWithMockData(tickers: string[], days: number = 30)`
   - Generates and inserts mock data for all entities
   - Useful for development and demos

**Verification Checklist:**
- [ ] Mock generators produce valid data (matches TypeScript interfaces)
- [ ] Generated stock prices are realistic (high >= low, etc.)
- [ ] News articles have unique hashes
- [ ] Sentiment calculations are correct (POS/NEG/NEUT logic)
- [ ] Can populate database with mock data in < 1 second

**Testing Instructions:**
- Create `__tests__/utils/mockData/` tests
- Test: Generated data matches interface types
- Test: Price constraints are valid (low <= high, etc.)
- Test: Sentiment label matches word counts
- Test: Hash generation is unique for different articles
- Integration test: Populate database and query data successfully

**Commit Message Template:**
```
feat(mock-data): create mock data generators for all entities

- Created generateMockStockPrices with realistic OHLCV simulation
- Created generateMockNews with realistic headlines and publishers
- Created generateMockWordCount and generateMockCombinedWordCount
- Created generateMockPortfolio for user watchlist
- Added populateWithMockData helper for quick database population
- Enables development and testing without external API dependencies
```

**Estimated Tokens:** ~15,000

---

### Task 7: Create Utility Functions for Common Operations

**Goal:** Build utility functions for date handling, validation, formatting, and other common operations used throughout the app.

**Files to Create:**
- `Migration/expo-project/src/utils/date/dateUtils.ts`
- `Migration/expo-project/src/utils/validation/inputValidation.ts`
- `Migration/expo-project/src/utils/formatting/numberFormatting.ts`
- `Migration/expo-project/src/utils/formatting/dateFormatting.ts`

**Prerequisites:**
- Task 1 complete (date-fns installed)

**Implementation Steps:**

1. **Create Date Utilities**
   - File: `src/utils/date/dateUtils.ts`
   - Functions:
     - `formatDateForDB(date: Date): string` - Converts to ISO 8601 (YYYY-MM-DD)
     - `parseDateFromDB(dateString: string): Date` - Parses ISO 8601 to Date object
     - `getDateRangeFromSelection(days: number): { startDate: string, endDate: string }` - Returns date range (e.g., last 30 days)
     - `isValidDateString(dateString: string): boolean` - Validates ISO 8601 format
     - `formatDisplayDate(date: Date | string, format?: string): string` - User-friendly display (e.g., "Jan 15, 2025")
   - Use `date-fns` library for all operations

2. **Create Input Validation Utilities**
   - File: `src/utils/validation/inputValidation.ts`
   - Functions:
     - `isValidTicker(ticker: string): boolean` - Validates stock ticker format (1-5 uppercase letters)
     - `sanitizeTicker(ticker: string): string` - Converts to uppercase, trims whitespace
     - `isValidDateRange(startDate: string, endDate: string): boolean` - Ensures start < end
     - `validateArticleURL(url: string): boolean` - Validates URL format

3. **Create Number Formatting Utilities**
   - File: `src/utils/formatting/numberFormatting.ts`
   - Functions:
     - `formatCurrency(value: number, decimals: number = 2): string` - Formats as currency ($123.45)
     - `formatPercentage(value: number, decimals: number = 2): string` - Formats as percentage (12.34%)
     - `formatVolume(volume: number): string` - Formats large numbers (1.5M, 23.4K)
     - `formatMarketCap(value: number): string` - Formats market cap (e.g., "$1.2T", "$500B")
     - `roundToDecimals(value: number, decimals: number): number` - Rounds to specified decimals

4. **Create Date Formatting Utilities**
   - File: `src/utils/formatting/dateFormatting.ts`
   - Functions:
     - `formatShortDate(date: Date | string): string` - "Jan 15" format
     - `formatLongDate(date: Date | string): string` - "January 15, 2025" format
     - `formatRelativeDate(date: Date | string): string` - "2 days ago", "Yesterday", etc.
     - `formatNewsDate(date: Date | string): string` - Consistent format for news articles

5. **Add Error Handling**
   - All functions should handle invalid inputs gracefully
   - Return default values or throw descriptive errors
   - Add JSDoc comments for all functions

**Verification Checklist:**
- [ ] All utility functions have TypeScript types
- [ ] JSDoc comments explain parameters and return values
- [ ] Functions handle edge cases (null, undefined, invalid formats)
- [ ] Date formatting is consistent across utilities

**Testing Instructions:**
- Create test files for each utility module
- Test valid inputs produce expected outputs
- Test invalid inputs are handled (throw error or return default)
- Test edge cases:
  - `formatCurrency(0)` → "$0.00"
  - `isValidTicker("")` → false
  - `formatVolume(1234567)` → "1.2M"
  - `formatPercentage(-0.0523)` → "-5.23%"

**Commit Message Template:**
```
feat(utils): create utility functions for date, validation, and formatting

- Added date utilities with ISO 8601 formatting for database storage
- Created input validation for tickers, URLs, and date ranges
- Implemented number formatting (currency, percentage, volume, market cap)
- Added date formatting utilities for user-friendly display
- All functions include JSDoc comments and error handling
```

**Estimated Tokens:** ~13,000

---

## Phase Verification

### Complete Phase Checklist

- [ ] Expo project builds successfully on web, iOS, and Android
- [ ] SQLite database initializes with all 6 tables
- [ ] Sentiment vocabulary JSON contains 1200+ words
- [ ] All 6 repositories implement CRUD operations
- [ ] Mock data generators can populate database
- [ ] All utility functions pass unit tests
- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint passes with no warnings
- [ ] Code coverage for utils/database is >80%

### Integration Tests

Run these manual tests to verify the phase:

1. **Database Population Test:**
   ```typescript
   import { populateWithMockData } from '@/utils/mockData';
   import { StockRepository } from '@/database/repositories';

   await populateWithMockData(['AAPL', 'GOOGL', 'MSFT'], 30);
   const stocks = await StockRepository.findByTicker('AAPL');
   console.log(`Found ${stocks.length} stock entries for AAPL`);
   // Expected: 30 entries (30 days of data)
   ```

2. **Sentiment Word Lookup Test:**
   ```typescript
   import { loadVocabulary, isPositiveWord } from '@/utils/sentiment/vocabularyLoader';

   const vocab = loadVocabulary();
   console.log(isPositiveWord('happy'));    // true
   console.log(isPositiveWord('terrible')); // false
   ```

3. **Repository CRUD Test:**
   ```typescript
   import { PortfolioRepository } from '@/database/repositories';

   await PortfolioRepository.insert({ ticker: 'AAPL', name: 'Apple Inc.', ... });
   const portfolio = await PortfolioRepository.findAll();
   console.log(`Portfolio contains ${portfolio.length} stocks`);
   await PortfolioRepository.delete('AAPL');
   ```

### Known Limitations

- No API integration yet (coming in Phase 2)
- No UI (coming in Phase 3+)
- Sentiment analysis is not yet implemented (Phase 2)
- Database migrations beyond v1 not implemented (add in future phases as needed)

---

## Next Steps

After completing Phase 1:
1. Commit all changes with descriptive commit messages (use conventional commits format)
2. Push to your feature branch
3. Verify all tests pass in CI/CD (if configured)
4. Proceed to **Phase 2: Core Data Processing** to implement API integrations and sentiment analysis logic
