# Development Guide

This guide provides detailed information for developers working on the Stock Insights React Native app.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Database](#database)
- [API Services](#api-services)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or later)
- **npm** (v10 or later)
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** (macOS only, via Xcode)
- **Android Studio** (for Android emulator)
- **Git**

Optional but recommended:
- **VSCode** with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - React Native Tools

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/android-stocks.git
cd android-stocks/Migration/expo-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

See [API_KEYS.md](./API_KEYS.md) for detailed instructions on setting up API keys.

### 4. Start Development Server

```bash
npx expo start
```

This will open Expo Dev Tools in your browser. From there, you can:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
expo-project/
├── app.json                    # Expo configuration
├── App.tsx                     # App entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── babel.config.js            # Babel configuration
├── eas.json                   # EAS Build configuration
├── assets/                    # Images, fonts, etc.
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
├── src/
│   ├── components/            # Reusable components
│   │   ├── common/           # Common UI components
│   │   ├── stock/            # Stock-specific components
│   │   ├── news/             # News-specific components
│   │   └── portfolio/        # Portfolio components
│   ├── screens/              # Screen components
│   │   ├── SearchScreen.tsx
│   │   ├── StockDetailScreen.tsx
│   │   └── PortfolioScreen.tsx
│   ├── navigation/           # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── services/             # API services
│   │   ├── api/             # External API services
│   │   └── sync/            # Data sync services
│   ├── database/            # SQLite database
│   │   ├── database.ts      # Database initialization
│   │   └── repositories/    # Data repositories
│   ├── contexts/            # React contexts
│   │   ├── StockContext.tsx
│   │   └── PortfolioContext.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useStockData.ts
│   │   └── usePortfolio.ts
│   ├── utils/               # Utility functions
│   │   ├── formatting/
│   │   ├── validation/
│   │   ├── date/
│   │   └── errors/
│   ├── types/               # TypeScript types
│   │   ├── api.types.ts
│   │   └── database.types.ts
│   ├── constants/           # App constants
│   │   └── api.constants.ts
│   └── theme/               # Theme configuration
│       ├── theme.ts
│       └── colors.ts
├── __tests__/               # Tests
│   ├── components/
│   ├── services/
│   ├── database/
│   ├── utils/
│   └── integration/
└── docs/                    # Additional documentation
```

## Development Workflow

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
```

### TypeScript

All code should be written in TypeScript. Run type checking with:

```bash
npm run type-check
```

### Git Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub

### Commit Conventions

Use Conventional Commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `ci:` - CI/CD changes
- `build:` - Build system changes

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/services/api/tiingo.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should fetch stock prices"
```

### Writing Tests

We use Jest and React Native Testing Library for testing.

**Unit Test Example:**

```typescript
import { formatCurrency } from '@/utils/formatting/numberFormatting';

describe('formatCurrency', () => {
  it('should format positive numbers as currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1234.56');
    expect(formatCurrency(100)).toBe('$100.00');
  });
});
```

**Service Test Example:**

```typescript
import axios from 'axios';
import { getStockPrices } from '@/services/api/tiingo.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getStockPrices', () => {
  it('should fetch stock prices', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPrices });
    const result = await getStockPrices('AAPL', '2024-01-01', '2024-01-31');
    expect(result).toHaveLength(20);
  });
});
```

### Test Coverage Goals

- **Utils**: 90% coverage
- **Services**: 80% coverage
- **Repositories**: 85% coverage
- **Components**: 60% coverage (focus on critical paths)
- **Hooks**: 75% coverage

## Database

### Schema

The app uses SQLite with the following tables:
- `stock_details` - Stock price data
- `symbol_details` - Stock metadata
- `news_details` - News articles
- `word_count_details` - Sentiment word counts
- `combined_word_count_details` - Aggregated word counts
- `portfolio` - User portfolio

### Indexes

Performance-critical indexes are created automatically:
- `idx_stock_ticker`
- `idx_stock_date`
- `idx_stock_ticker_date`
- `idx_news_ticker_date`
- And more...

### Accessing the Database

Use repositories for database access:

```typescript
import { stockRepository } from '@/database/repositories/stock.repository';

// Fetch stock prices
const prices = await stockRepository.getStockPrices(
  'AAPL',
  '2024-01-01',
  '2024-01-31'
);

// Insert stock price
await stockRepository.insertStockPrice({
  ticker: 'AAPL',
  date: '2024-01-15',
  close: 185.92,
  volume: 50000000,
  // ... other fields
});
```

### Database Migrations

Currently, database migrations are handled by dropping and recreating the database on schema changes. For production, implement proper migrations using:
- Version tracking in database
- Migration scripts
- Rollback capabilities

## API Services

### Tiingo API

Stock price data from Tiingo:

```typescript
import { getStockPrices, getStockMetadata } from '@/services/api/tiingo.service';

const prices = await getStockPrices('AAPL', startDate, endDate);
const metadata = await getStockMetadata('AAPL');
```

### Polygon.io API

Financial news from Polygon:

```typescript
import { getStockNews } from '@/services/api/polygon.service';

const news = await getStockNews('AAPL', limit);
```

### Prediction Service

AI-powered predictions:

```typescript
import { getStockPredictions } from '@/services/api/prediction.service';

const predictions = await getStockPredictions(
  'AAPL',
  closePrices,
  volumes,
  positiveCounts,
  negativeCounts,
  sentimentScores
);
```

### Sentiment Service

Sentiment analysis using FinBERT:

```typescript
import { analyzeSentiment } from '@/services/api/sentiment.service';

const sentiment = await analyzeSentiment(articleText, hash);
```

## Common Tasks

### Adding a New Screen

1. Create screen component in `src/screens/`:
   ```typescript
   // src/screens/MyNewScreen.tsx
   export function MyNewScreen() {
     return (
       <View>
         <Text>New Screen</Text>
       </View>
     );
   }
   ```

2. Add route type in `src/navigation/types.ts`:
   ```typescript
   export type RootStackParamList = {
     // ... existing routes
     MyNew: undefined; // or { param: string } if needs params
   };
   ```

3. Add screen to navigator in `src/navigation/RootNavigator.tsx`:
   ```typescript
   <Stack.Screen name="MyNew" component={MyNewScreen} />
   ```

### Adding a New API Service

1. Create service file in `src/services/api/`:
   ```typescript
   // src/services/api/myapi.service.ts
   import axios from 'axios';

   export async function fetchData() {
     const response = await axios.get('https://api.example.com/data');
     return response.data;
   }
   ```

2. Create types in `src/types/api.types.ts`:
   ```typescript
   export interface MyApiResponse {
     data: string[];
   }
   ```

3. Add tests in `__tests__/services/api/myapi.service.test.ts`

### Adding a New Component

1. Create component in appropriate directory:
   ```typescript
   // src/components/common/MyComponent.tsx
   export function MyComponent({ title }: { title: string }) {
     return <Text>{title}</Text>;
   }
   ```

2. Add prop types using TypeScript interfaces

3. Add tests if component has complex logic

### Updating Database Schema

1. Update schema in `src/database/database.ts`
2. Update types in `src/types/database.types.ts`
3. Update repositories as needed
4. Test migrations thoroughly

## Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npx expo start --clear
```

**iOS simulator not opening:**
```bash
# Reset simulator
xcrun simctl erase all
```

**Android build fails:**
```bash
# Clean gradle cache
cd android && ./gradlew clean
```

**SQLite errors:**
- Check database schema matches types
- Ensure database is initialized before queries
- Check for SQL syntax errors in queries

**TypeScript errors:**
```bash
# Clear TypeScript cache
npx tsc --build --clean
```

### Debug Mode

Enable debug logging:

```typescript
// In App.tsx
if (__DEV__) {
  console.log('[DEBUG] App initialized');
}
```

### React Native Debugger

1. Install React Native Debugger
2. Enable Debug JS Remotely in app
3. Open debugger to inspect:
   - React component tree
   - Redux/Context state
   - Network requests
   - Console logs

### Performance Profiling

Use React DevTools Profiler:
1. Open app with `npx expo start`
2. Press `m` to open dev menu
3. Enable Performance Monitor
4. Identify slow renders and optimize

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Open an issue on GitHub
- Check existing issues and discussions
- Review the docs in this directory

---

Happy coding! 🚀
