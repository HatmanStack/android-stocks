# Phase 0: Foundation & Architecture

**Status:** Foundation (applies to all phases)
**Purpose:** Establish architectural decisions, design patterns, and shared conventions that will guide the entire migration.

---

## Overview

This phase establishes the architectural foundation for migrating the Android Stock Sentiment Analysis app to React Native with Expo. All subsequent phases will reference and build upon the decisions documented here.

---

## Architecture Decision Records (ADRs)

### ADR-001: React Native with Expo Framework

**Decision:** Use Expo (managed workflow with custom development builds) as the React Native framework.

**Rationale:**
- **Rapid Development**: Expo provides out-of-the-box support for common features (navigation, SQLite, file system, async storage)
- **Over-the-Air Updates**: EAS Update allows deploying fixes without app store approval
- **Build System**: EAS Build handles iOS and Android builds in the cloud
- **Custom Natives**: Expo Development Builds allow custom native modules when needed (for ONNX Runtime if we pursue on-device ML)
- **Web Support**: Expo web support enables potential web deployment

**Constraints:**
- Must use Expo SDK 52 or later (as of 2025)
- Requires EAS (Expo Application Services) for builds and updates
- Cannot use Expo Go for development if we add custom native modules

**Alternatives Considered:**
- Bare React Native: More control but significantly more configuration overhead
- Flutter: Different language (Dart), team lacks expertise

---

### ADR-002: Data Storage Strategy

**Decision:** Use `expo-sqlite` (SQLite) for local data persistence, mirroring the Android Room database structure.

**Rationale:**
- **Feature Parity**: Original Android app uses Room (SQLite wrapper), allowing direct schema migration
- **Offline-First**: Stock data, news, and sentiment analysis can be cached locally
- **Complex Queries**: Supports joins, aggregations, and date-based filtering needed for sentiment analysis
- **Performance**: SQLite handles thousands of records (stock prices, news articles) efficiently
- **Expo Integration**: `expo-sqlite` provides a Promise-based API compatible with React/AsyncStorage patterns

**Schema Design:**
Port the 6 Room entities directly to SQLite tables:
1. `StockDetails` - OHLCV daily price data
2. `SymbolDetails` - Company metadata (ticker, name, description)
3. `NewsDetails` - News articles with metadata
4. `WordCountDetails` - Individual article sentiment analysis
5. `CombinedWordDetails` - Daily aggregated sentiment
6. `PortfolioDetails` - User's stock watchlist

**Migration Scripts:**
Create SQL initialization scripts in `/src/database/migrations/` to set up tables with appropriate indexes.

**Alternatives Considered:**
- **AsyncStorage**: Not suitable for relational data or complex queries
- **Realm**: Good performance but adds dependency complexity and different query syntax
- **Cloud-Only (Firebase)**: Requires connectivity; violates offline-first principle

---

### ADR-003: Sentiment Analysis & ML Backend Strategy

**Decision:** Dual-path approach with AWS Lambda as primary, on-device ML as future optimization.

**Primary Approach: AWS Lambda Functions**
- **FinBERT Sentiment Analysis**: Deploy existing microservice logic to AWS Lambda
- **Prediction Model**: Port logistic regression model to AWS Lambda
- **Benefits**:
  - Reliable, proven architecture (existing microservices work)
  - Offloads computation from mobile device
  - Easier model updates without app releases
  - Consistent results across platforms

**API Gateway Setup:**
```
POST /sentiment-analysis
  Body: { text: string, ticker: string }
  Returns: { sentiment: "POS" | "NEUT" | "NEG", score: number }

POST /predict-movement
  Body: { ticker: string, stockData: [...], sentimentData: [...] }
  Returns: { predictions: { oneDay: number, twoWeeks: number, oneMonth: number } }
```

**Future Optimization: On-Device ML (Phase 8+)**
- Convert FinBERT to ONNX format
- Use `onnxruntime-react-native` (requires custom development build)
- Provides offline capability and reduces API costs
- **Complexity**: Requires model quantization (4-bit), bundle size management (~50-100MB)

**Development/Testing:**
- Mock data generators for unit tests
- Local bag-of-words sentiment (using vocabulary arrays) as fallback
- API mocking with MSW (Mock Service Worker) for integration tests

**Alternatives Considered:**
- **TensorFlow.js**: Poor React Native support, limited BERT model compatibility
- **Transformers.js**: Excellent for web, but limited React Native integration (react-native-transformers deprecated July 2025)
- **Cloud-only (no on-device)**: Acceptable MVP approach, limits offline functionality

---

### ADR-004: State Management

**Decision:** Use React Context API + Custom Hooks for global state, with React Query for server state.

**Rationale:**
- **React Context**: Sufficient for app-wide state (selected ticker, date range, portfolio)
- **React Query (TanStack Query)**:
  - Handles API caching, refetching, and synchronization
  - Perfect for stock prices, news, sentiment data
  - Built-in loading/error states
  - Optimistic updates for portfolio management
- **Simplicity**: Avoids Redux boilerplate for this app's complexity level
- **Performance**: Context optimizations (separate contexts for different domains) prevent unnecessary re-renders

**State Organization:**
```
StockContext: selectedTicker, selectedDate
PortfolioContext: portfolioStocks, addStock(), removeStock()
ThemeContext: colorScheme, animations
```

**React Query Keys:**
```javascript
['stockPrice', ticker, dateRange]
['news', ticker, dateRange]
['sentiment', ticker, dateRange]
['predictions', ticker]
```

**Alternatives Considered:**
- **Redux Toolkit**: Overkill for this app size; adds boilerplate
- **Zustand**: Lighter than Redux but Context + React Query already covers needs
- **MobX**: Excellent but team prefers React's ecosystem conventions

---

### ADR-005: API Integration Layer

**Decision:** Create abstraction layer for external APIs with retry logic, caching, and mock support.

**API Services:**
1. **Tiingo API** (Stock prices, company metadata)
   - Endpoint: `https://api.tiingo.com/`
   - Rate limits: 500 requests/hour (free tier)
   - Caching strategy: Cache daily prices indefinitely (historical data doesn't change)

2. **Polygon.io API** (News articles)
   - Endpoint: `https://api.polygon.io/`
   - Rate limits: 5 requests/minute (free tier)
   - Caching strategy: Cache news for 24 hours

3. **AWS Lambda** (Sentiment + Predictions)
   - Custom endpoints to be deployed
   - No rate limits (controlled by AWS Lambda concurrency)

**Service Structure:**
```
/src/services/
  api/
    tiingo.service.ts       - Stock price fetching
    polygon.service.ts      - News fetching
    sentiment.service.ts    - AWS Lambda sentiment
    prediction.service.ts   - AWS Lambda predictions
  __mocks__/
    tiingo.mock.ts
    polygon.mock.ts
```

**Features:**
- **Exponential Backoff**: Retry failed requests (3 attempts, 2s → 4s → 8s delays)
- **Environment Variables**: `TIINGO_API_KEY`, `POLYGON_API_KEY`, `AWS_LAMBDA_ENDPOINT`
- **Mock Mode**: `__DEV__` flag switches to mock data for development
- **Error Handling**: Standardized error responses with user-friendly messages

**Alternatives Considered:**
- **Direct API calls in components**: Violates separation of concerns, hard to test
- **GraphQL wrapper**: Overengineered for this use case

---

### ADR-006: Navigation Structure

**Decision:** Use React Navigation 7.x with nested navigators (Tab + Stack).

**Navigation Hierarchy:**
```
Root Stack Navigator
  └─ Main Tab Navigator
      ├─ Search Tab (Stack Navigator)
      │   ├─ Search Screen (with calendar)
      │   └─ [Future: Symbol Details Modal]
      ├─ Stock Details Tab (Stack Navigator)
      │   └─ Stock Details Screen
      │       └─ Nested Tab Navigator
      │           ├─ Price Tab
      │           ├─ Sentiment Tab
      │           └─ News Tab
      └─ Portfolio Tab (Stack Navigator)
          └─ Portfolio Screen
```

**Rationale:**
- **React Navigation**: Industry standard, excellent Expo integration
- **Tab Navigator**: Matches Android ViewPager pattern (3 main tabs)
- **Nested Tabs**: Stock details has 3 sub-tabs (Price, Sentiment, News)
- **Deep Linking**: Supports URLs like `app://stock/AAPL` for portfolio notifications

**State Persistence:**
- Use `@react-navigation/native-async-storage` to persist navigation state
- Restore last viewed ticker and tab on app restart

**Alternatives Considered:**
- **Expo Router (file-based)**: Excellent for web-like apps, but overkill and less flexible for this tab-heavy structure
- **React Navigation 6.x**: Use 7.x for latest features and type safety improvements

---

### ADR-007: Vocabulary Data Format

**Decision:** Convert XML string arrays to flat JSON structure with letter-based indexing.

**Original Structure (Android):**
```xml
<string-array name="positive_words_a">
  <item>acceptance</item>
  <item>able</item>
  ...
</string-array>
```

**New Structure (JSON):**
```json
{
  "positive": {
    "a": ["acceptance", "able", "accept", ...],
    "b": ["beatify", "beneficial", ...],
    ...
    "z": ["zealous", "zeal", ...]
  },
  "negative": {
    "a": ["abysmal", "adverse", ...],
    ...
    "z": []
  }
}
```

**File Location:** `/src/data/sentiment-words.json`

**Lookup Pattern (same as Java):**
```javascript
function countSentimentWords(text, sentiment = 'positive') {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;

  words.forEach(word => {
    const firstLetter = word[0];
    if (sentimentWords[sentiment][firstLetter]?.includes(word)) {
      count++;
    }
  });

  return count;
}
```

**Benefits:**
- **Performance**: O(1) letter lookup + O(n) array search (small n per letter)
- **Bundle Size**: ~30KB JSON file (negligible)
- **Maintainability**: Easy to add/remove words without code changes

---

## Tech Stack

### Core Framework
- **React Native**: 0.76.x (latest stable as of Expo SDK 52)
- **Expo SDK**: 52.x
- **TypeScript**: 5.6.x (strict mode enabled)

### UI & Styling
- **React Native Paper**: Material Design 3 components
- **React Native Reanimated**: High-performance animations
- **React Native Gesture Handler**: Touch interactions
- **Expo Vector Icons**: Icons (@expo/vector-icons)

### Data & State
- **expo-sqlite**: Local database (SQLite)
- **@tanstack/react-query**: Server state management
- **React Context API**: Global app state
- **date-fns**: Date manipulation (replacing Java's LocalDate)

### Navigation
- **@react-navigation/native**: 7.x
- **@react-navigation/bottom-tabs**: Main tab navigator
- **@react-navigation/stack**: Stack navigation within tabs
- **@react-navigation/material-top-tabs**: Stock detail sub-tabs

### API & Networking
- **axios**: HTTP client with interceptors
- **expo-secure-store**: API key storage (encrypted)
- **@react-native-async-storage/async-storage**: Non-sensitive caching

### Testing
- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Detox**: E2E testing (optional, Phase 7)

### Development Tools
- **ESLint**: Code linting (Airbnb config + React Native)
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit linting
- **TypeScript**: Static type checking

### Build & Deployment
- **EAS Build**: Cloud-based builds for iOS/Android
- **EAS Update**: Over-the-air updates
- **Sentry**: Error tracking (production)

---

## Shared Patterns & Conventions

### 1. File Organization

```
Migration/expo-project/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (Button, Card, etc.)
│   │   ├── stock/           # Stock-specific components
│   │   └── sentiment/       # Sentiment-specific components
│   ├── screens/             # Screen components (one per route)
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API services
│   │   ├── api/             # External API integrations
│   │   └── __mocks__/       # Mock data for testing
│   ├── database/            # SQLite schema and queries
│   │   ├── migrations/      # SQL initialization scripts
│   │   ├── models/          # TypeScript interfaces for DB entities
│   │   └── repositories/    # Data access layer (CRUD operations)
│   ├── data/                # Static data (sentiment words)
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React Context providers
│   ├── utils/               # Utility functions
│   │   ├── sentiment/       # Sentiment analysis logic
│   │   ├── date/            # Date helpers
│   │   └── validation/      # Input validation
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # App-wide constants
│   └── theme/               # Theming configuration
├── assets/                  # Images, fonts, etc.
├── __tests__/               # Test files (mirrors src/ structure)
└── app.json                 # Expo configuration
```

### 2. Naming Conventions

**Components:**
- PascalCase for components: `StockPriceCard.tsx`
- Props interface: `StockPriceCardProps`
- Styles: `const styles = StyleSheet.create({...})`

**Services:**
- camelCase + `.service.ts` suffix: `tiingo.service.ts`
- Export named functions: `export const fetchStockPrices = async (...) => {...}`

**Hooks:**
- Prefix with `use`: `useStockData.ts`, `usePortfolio.ts`
- Return object with clear names: `{ data, isLoading, error, refetch }`

**Database:**
- Tables: snake_case (e.g., `stock_details`, `combined_word_details`)
- Columns: snake_case (e.g., `ticker_symbol`, `article_date`)
- TypeScript interfaces: PascalCase (e.g., `StockDetails`, `NewsArticle`)

**Constants:**
- UPPER_SNAKE_CASE: `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`

### 3. Component Patterns

**Functional Components (Always):**
```typescript
interface Props {
  ticker: string;
  onPress: () => void;
}

export const StockCard: React.FC<Props> = ({ ticker, onPress }) => {
  // Component logic
  return <View>...</View>;
};
```

**Custom Hooks for Logic Extraction:**
```typescript
// useStockPrice.ts
export const useStockPrice = (ticker: string, dateRange: DateRange) => {
  return useQuery({
    queryKey: ['stockPrice', ticker, dateRange],
    queryFn: () => fetchStockPrices(ticker, dateRange),
    staleTime: Infinity, // Historical data never changes
  });
};

// In component:
const { data, isLoading, error } = useStockPrice(ticker, dateRange);
```

**Repository Pattern for Database:**
```typescript
// repositories/stock.repository.ts
export const StockRepository = {
  async getStocksByTicker(ticker: string): Promise<StockDetails[]> {
    const db = await getDatabase();
    return db.getAllAsync('SELECT * FROM stock_details WHERE ticker = ?', [ticker]);
  },

  async insertStock(stock: StockDetails): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO stock_details (...) VALUES (...)',
      [/* values */]
    );
  },
};
```

### 4. Error Handling

**API Errors:**
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage:
try {
  const data = await fetchStockPrices(ticker);
} catch (error) {
  if (error instanceof APIError) {
    // Show user-friendly error
    Alert.alert('Error', `Failed to fetch stock data: ${error.message}`);
  }
}
```

**User-Facing Error Messages:**
- Network errors: "Unable to connect. Please check your internet."
- API errors: "Stock data temporarily unavailable. Please try again."
- Validation errors: "Please enter a valid ticker symbol (e.g., AAPL)."

### 5. TypeScript Guidelines

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Type Definitions:**
```typescript
// types/stock.types.ts
export interface StockDetails {
  id: number;
  ticker: string;
  date: string; // ISO 8601 format: "2025-01-15"
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  adjustedOpen: number;
  adjustedClose: number;
  adjustedHigh: number;
  adjustedLow: number;
  adjustedVolume: number;
  divCash: number;
  splitFactor: number;
}

export type SentimentLabel = 'POS' | 'NEUT' | 'NEG';

export interface WordCountDetails {
  id: number;
  ticker: string;
  date: string;
  hash: string; // Unique article identifier
  positiveCount: number;
  negativeCount: number;
  sentiment: SentimentLabel;
  sentimentScore: number;
  predictionOneDay: number;
  predictionTwoWeeks: number;
  predictionOneMonth: number;
}
```

### 6. Testing Strategy

**Unit Tests (Jest + React Native Testing Library):**
- Test pure functions (sentiment analysis, date utils, validation)
- Test custom hooks with `@testing-library/react-hooks`
- Test components with user interactions
- Coverage target: 80% for utils/services, 60% for components

**Integration Tests:**
- Test API services with mocked responses (MSW)
- Test database repositories with in-memory SQLite
- Test navigation flows

**E2E Tests (Detox - Optional):**
- Critical user flows: Search → View Stock → Add to Portfolio
- Run on CI/CD pipeline before releases

**Test File Naming:**
```
src/utils/sentiment/wordCounter.ts
__tests__/utils/sentiment/wordCounter.test.ts
```

---

## Common Pitfalls to Avoid

### 1. **Overuse of `useEffect`**
❌ **Bad:**
```typescript
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData);
}, []);
```

✅ **Good:**
```typescript
const { data } = useQuery(['data'], fetchData);
```

### 2. **Prop Drilling**
❌ **Bad:** Passing `ticker` through 5 levels of components

✅ **Good:** Use Context or React Query's shared cache

### 3. **Direct Database Calls in Components**
❌ **Bad:**
```typescript
const MyComponent = () => {
  const db = useSQLiteContext();
  const data = db.getAllAsync('SELECT...');
  // ...
};
```

✅ **Good:**
```typescript
const MyComponent = () => {
  const { data } = useStockData(ticker); // Hook wraps repository
};
```

### 4. **Hardcoded API Keys**
❌ **Bad:** `const API_KEY = 'abc123'` in code

✅ **Good:** Use `expo-secure-store` and environment variables

### 5. **Ignoring Android/iOS Platform Differences**
- Always test animations on both platforms
- Use `Platform.select()` for platform-specific styles
- Test SQLite queries on both (date formatting can differ)

### 6. **Blocking the UI Thread**
❌ **Bad:** Running heavy sentiment analysis on UI thread

✅ **Good:** Use background processing or AWS Lambda for heavy computation

### 7. **Not Handling Offline State**
- Always check network connectivity before API calls
- Show cached data when offline
- Queue actions (like adding to portfolio) for later sync

---

## Design Principles

### 1. **Offline-First**
- App should work without internet (using cached data)
- Sync when connection is restored
- Show clear indicators when data is stale

### 2. **Performance**
- Lazy load screens (React.lazy() for heavy components)
- Virtualized lists (FlatList) for long data sets (stock prices, news)
- Memoize expensive calculations (React.useMemo, React.memo)

### 3. **Accessibility**
- All interactive elements must have `accessibilityLabel`
- Support screen readers
- Minimum touch target size: 44x44 points

### 4. **Security**
- API keys stored in Secure Store (not AsyncStorage)
- HTTPS for all API calls
- Validate all user inputs
- No sensitive data in logs (production)

### 5. **Maintainability**
- DRY: Extract reusable logic to hooks/utils
- YAGNI: Don't build features not in the spec
- Clear separation: UI components should not contain business logic

---

## Development Workflow

### 1. **Branch Strategy**
- `main`: Production-ready code
- `develop`: Integration branch
- Feature branches: `feature/phase-N-task-description`

### 2. **Commit Message Format (Conventional Commits)**
```
type(scope): brief description

- Detail 1
- Detail 2

Types: feat, fix, refactor, test, docs, chore
Scopes: database, api, ui, navigation, sentiment, etc.

Examples:
feat(database): add StockDetails repository with CRUD operations
fix(api): handle Tiingo rate limit errors with exponential backoff
refactor(sentiment): extract word counting logic to utility function
```

### 3. **Code Review Checklist**
- [ ] TypeScript types defined (no `any`)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Tests written (unit tests at minimum)
- [ ] No hardcoded strings (use i18n or constants)
- [ ] Accessibility labels added
- [ ] Runs on both iOS and Android

### 4. **CI/CD Pipeline (EAS)**
```yaml
# Automated checks on every commit:
1. Linting (ESLint)
2. Type checking (TypeScript)
3. Unit tests (Jest)
4. Build verification (EAS Build --no-publish)

# On merge to develop:
5. Integration tests
6. E2E tests (optional)
7. Deploy to staging via EAS Update

# On merge to main:
8. Deploy to production via EAS Update
9. Create production build (EAS Build)
```

---

## Environment Configuration

### Development
```bash
TIINGO_API_KEY=your_dev_key
POLYGON_API_KEY=your_dev_key
AWS_LAMBDA_ENDPOINT=http://localhost:3000  # Local mock server
USE_MOCK_DATA=true
ENABLE_DEBUG_LOGS=true
```

### Production
```bash
TIINGO_API_KEY=*** (stored in EAS Secrets)
POLYGON_API_KEY=*** (stored in EAS Secrets)
AWS_LAMBDA_ENDPOINT=https://your-lambda.amazonaws.com
USE_MOCK_DATA=false
ENABLE_DEBUG_LOGS=false
SENTRY_DSN=***
```

---

## Next Steps

All subsequent phases (1-7) will build upon this foundation. Refer back to this document when making architectural decisions.

**Key Takeaway:** Prioritize getting a functional MVP (Phase 1-5) before optimizing with on-device ML (Phase 8+).
