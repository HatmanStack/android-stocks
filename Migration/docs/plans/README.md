# Android Stock Sentiment App → React Native Migration Plan

**Migration Goal:** Port the full-stack Android Stock Sentiment Analysis application (client + backend microservices) to React Native + AWS Lambda architecture.

**Migration Strategy:** **Client-first approach** - Migrate the Android app to React Native (Phases 1-7) using existing Python microservices, then migrate backend to AWS Lambda (Phase 8+).

---

## Overview

This is a comprehensive migration plan for a stock sentiment analysis application consisting of an Android client and Python backend microservices. The app analyzes news articles using NLP and machine learning to predict stock movements.

### Current Architecture (Android + Python)

**Client: Android App (Java)**
- 5 screens: Search, Price History, Sentiment Analysis, News, Portfolio
- Local SQLite database with 6 entities (Room ORM)
- Fetches stock prices (Tiingo API) and news (Polygon.io API)
- Calls Python microservices for ML predictions

**Backend: Python Microservices (Google Cloud Run)**
1. **Sentiment Analysis Service** - FinBERT-based NLP for financial text
   - URL: `https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app`
   - Technology: Python + Hugging Face FinBERT
2. **Prediction Service** - Multivariate logistic regression
   - URL: `https://stocks-f3jmjyxrpq-uc.a.run.app`
   - Technology: Python + Scikit-learn

### Target Architecture (React Native + AWS Lambda)

**Phases 1-7: Client Migration (Use Existing Backend)**
- **Client**: React Native (Expo) with TypeScript
- **Local Storage**: SQLite (expo-sqlite) matching Android Room schema
- **Backend**: Continue using deployed Python microservices (no changes)
- **APIs**: Direct integration with Tiingo, Polygon.io, and existing ML services

**Phase 8+: Backend Migration (Future)**
- **Backend**: Migrate Python microservices to AWS Lambda
- **API Gateway**: AWS API Gateway for unified endpoint
- **Client**: Update endpoint URLs only (minimal code changes)
- **Benefits**: Better control, rate limiting, API key protection

---

## Prerequisites

Before starting implementation:

### Required Tools & Accounts
- Node.js 20.x or later
- npm 10.x or yarn 1.22.x
- Expo CLI: `npm install -g expo-cli`
- Git configured
- Code editor (VS Code recommended)

### API Keys (Free Tier)
- **Tiingo API**: https://api.tiingo.com/ (500 req/hour)
- **Polygon.io API**: https://polygon.io/ (5 req/min)
- **Note**: AWS Account not required until Phase 8 (backend migration)

### Knowledge Requirements
- TypeScript fundamentals
- React & React Native basics
- React Hooks and Context API
- SQL and relational databases
- REST API integration
- Git workflows

---

## Phase Summary

### Client Migration (Phases 1-7)

| Phase | Goal | Estimated Tokens | Key Deliverables |
|-------|------|-----------------|------------------|
| **Phase 0** | Foundation & Architecture | N/A | ADRs, tech stack, patterns, conventions, migration strategy |
| **Phase 1** | Project Setup & Data Layer | ~95,000 | Expo project, SQLite database, repositories, mock data |
| **Phase 2** | Core Data Processing | ~98,000 | API services (Tiingo, Polygon), integrate existing microservices, sync pipeline |
| **Phase 3** | UI Foundation & Navigation | ~92,000 | Navigation, theme, shared components, contexts |
| **Phase 4** | Search & Portfolio Screens | ~45,000 | Search functionality, portfolio management |
| **Phase 5** | Stock Detail Screens | ~60,000 | Price, Sentiment, News tabs with full data display |
| **Phase 6** | Animations & Polish | ~35,000 | Transitions, micro-interactions, accessibility, performance |
| **Phase 7** | Testing & Deployment | ~45,000 | Tests, CI/CD, production builds, documentation |
| **Client Total** | | **~470,000** | **Fully functional React Native app** |

### Backend Migration (Phase 8+ - Future)

| Phase | Goal | Estimated Tokens | Key Deliverables |
|-------|------|-----------------|------------------|
| **Phase 8** | Backend Migration to AWS Lambda | TBD | Sentiment Lambda, Prediction Lambda, API Gateway, client endpoint updates |
| **Phase 9** | Advanced Features (Optional) | TBD | On-device ML (ONNX), charts, push notifications, dark mode |

---

## Phase Details

### Phase 0: Foundation & Architecture

**Purpose:** Establish architectural decisions that guide all implementation phases.

**Key Decisions:**
- Framework: Expo with custom development builds
- Data Storage: `expo-sqlite` (mirrors Room database)
- Sentiment Strategy: AWS Lambda (primary), on-device ML (future)
- State Management: React Context + React Query
- Navigation: React Navigation 7.x (nested tabs)

**Important Files:**
- [Phase-0.md](./Phase-0.md) - Complete architecture reference

---

### Phase 1: Project Setup & Data Layer

**Goal:** Initialize project and build the complete data layer.

**Tasks:**
1. Initialize Expo project with TypeScript
2. Extract sentiment vocabulary from XML to JSON
3. Define database schema and TypeScript interfaces
4. Initialize SQLite database
5. Implement repository pattern for all 6 entities
6. Create mock data generators
7. Build utility functions (date, validation, formatting)

**Deliverables:**
- Working Expo project
- SQLite database with 6 tables
- Sentiment vocabulary JSON (~1200 words)
- Complete repository layer
- Mock data system

**Key Files:**
- [Phase-1.md](./Phase-1.md) - Detailed implementation guide

---

### Phase 2: Core Data Processing

**Goal:** Implement all API integrations and sentiment analysis logic.

**Tasks:**
1. Implement Tiingo API service (stock prices, company metadata)
2. Implement Polygon.io API service (news articles)
3. Port bag-of-words sentiment analysis from Java
4. Deploy AWS Lambda functions (FinBERT + predictions)
5. Create data synchronization pipeline
6. Build React Query hooks for data fetching
7. Add comprehensive error handling

**Deliverables:**
- Complete API integration layer
- Sentiment analysis engine
- AWS Lambda endpoints
- Full data sync pipeline
- React Query hooks

**Key Files:**
- [Phase-2.md](./Phase-2.md) - API and data processing guide

---

### Phase 3: UI Foundation & Navigation

**Goal:** Build navigation structure, theme system, and shared components.

**Tasks:**
1. Set up navigation infrastructure (bottom tabs + stack + top tabs)
2. Implement Material Design 3 theme system
3. Build shared component library
4. Create context providers for global state
5. Create screen skeletons
6. Implement loading and error states
7. Add calendar date picker

**Deliverables:**
- Complete navigation hierarchy
- Theme system
- Reusable component library
- Global state management
- Screen templates

**Key Files:**
- [Phase-3.md](./Phase-3.md) - UI foundation guide

---

### Phase 4: Search & Portfolio Screens

**Goal:** Fully implement Search and Portfolio functionality.

**Tasks:**
1. Implement stock symbol search with calendar
2. Implement portfolio screen with add/remove
3. Add stock detail header with portfolio actions
4. Handle data loading and offline states

**Deliverables:**
- Functional search screen
- Functional portfolio screen
- Add/remove from portfolio
- Data sync integration

**Key Files:**
- [Phase-4.md](./Phase-4.md) - Search and Portfolio implementation

---

### Phase 5: Stock Detail Screens

**Goal:** Implement Price, Sentiment, and News tabs with full data display.

**Tasks:**
1. Implement Price screen (OHLCV data with color coding)
2. Implement Sentiment screen (aggregate and individual views)
3. Implement News screen (articles with links)
4. Add charts/visualizations (optional)
5. Optimize list performance

**Deliverables:**
- Complete Price tab
- Complete Sentiment tab with toggle
- Complete News tab
- Optimized list rendering

**Key Files:**
- [Phase-5.md](./Phase-5.md) - Stock detail screens guide

---

### Phase 6: Animations & Polish

**Goal:** Add animations, polish UX, and optimize performance.

**Tasks:**
1. Add page transition animations
2. Add micro-interactions and feedback
3. Improve accessibility
4. Optimize app performance
5. Add final polish (splash screen, app icon, error boundary)

**Deliverables:**
- Smooth animations
- Enhanced UX
- Accessibility improvements
- Performance optimizations
- Production-ready polish

**Key Files:**
- [Phase-6.md](./Phase-6.md) - Animations and polish guide

---

### Phase 7: Testing & Deployment

**Goal:** Add comprehensive testing and prepare for production release.

**Tasks:**
1. Write unit tests (>70% coverage)
2. Write integration tests
3. Write E2E tests (optional)
4. Set up CI/CD pipeline
5. Create production builds
6. Write documentation

**Deliverables:**
- Comprehensive test suite
- CI/CD pipeline
- Production builds (iOS + Android)
- Complete documentation

**Key Files:**
- [Phase-7.md](./Phase-7.md) - Testing and deployment guide

---

## Implementation Guidelines

### Development Principles

1. **DRY (Don't Repeat Yourself)**
   - Extract reusable logic to hooks and utilities
   - Build shared components for common UI patterns

2. **YAGNI (You Aren't Gonna Need It)**
   - Don't build features not in the spec
   - Focus on feature parity first, optimizations later

3. **TDD (Test-Driven Development)**
   - Write tests for critical business logic
   - Target 70%+ coverage for important code

4. **Atomic Commits**
   - Commit frequently with clear messages
   - Use conventional commits format

### Commit Message Format

```
type(scope): brief description

- Detail 1
- Detail 2

Types: feat, fix, refactor, test, docs, chore, perf
Scopes: database, api, ui, navigation, sentiment, etc.
```

**Examples:**
```
feat(database): implement StockRepository with CRUD operations
fix(api): handle Tiingo rate limit with exponential backoff
refactor(sentiment): extract word counting to utility function
test(repository): add tests for portfolio operations
docs(readme): add API key setup instructions
perf(lists): optimize FlatList rendering with memoization
```

---

## Architecture Highlights

### Data Flow

```
User Action
    ↓
React Component
    ↓
React Query Hook (useStockData, useNewsData, etc.)
    ↓
Sync Service (checks cache, triggers sync if needed)
    ↓
API Service (Tiingo, Polygon, AWS Lambda)
    ↓
Data Transform
    ↓
Repository (Database CRUD)
    ↓
SQLite Database
    ↓
Repository Query
    ↓
React Query Cache
    ↓
Component Re-render
```

### Key Patterns

1. **Repository Pattern**
   - Abstracts database access
   - Provides clean CRUD interface
   - Enables easy testing with mocks

2. **Service Layer**
   - Encapsulates API logic
   - Handles retries and errors
   - Transforms external data to internal format

3. **Hooks for State**
   - Custom hooks wrap React Query
   - Components use hooks, not direct services
   - Automatic caching and refetching

4. **Context for Global State**
   - Selected ticker, date range
   - Portfolio data (via PortfolioContext)
   - Theme preferences

---

## Testing Strategy

### Unit Tests (Jest + React Native Testing Library)
- **Utils:** 90% coverage - sentiment analysis, date utils, validation
- **Services:** 80% coverage - API services with mocked responses
- **Repositories:** 85% coverage - database operations
- **Components:** 60% coverage - rendering and interactions
- **Hooks:** 75% coverage - data fetching logic

### Integration Tests
- Data flow: API → Transform → Database → Hook → Component
- Navigation: Screen transitions and deep linking
- Context: Global state updates and subscribers

### E2E Tests (Detox - Optional)
- Critical user flows
- Search → View Details → Add to Portfolio
- Remove from Portfolio

### Manual Testing
- Test on physical devices (iOS and Android)
- Test on different screen sizes
- Test network conditions (offline, slow)
- Test edge cases (invalid ticker, API errors)

---

## Production Deployment

### Build Process

1. **Configure App**
   - Update `app.json` (version, build number, permissions)
   - Set bundle identifiers
   - Configure environment variables in EAS Secrets

2. **Build iOS**
   ```bash
   eas build --platform ios --profile production
   ```
   - Submit to TestFlight for beta testing
   - Then submit to App Store

3. **Build Android**
   ```bash
   eas build --platform android --profile production
   ```
   - Upload to Google Play (internal testing track)
   - Then promote to production

4. **OTA Updates (EAS Update)**
   ```bash
   eas update --branch production --message "Bug fixes"
   ```
   - Deploy hotfixes without app store review

### Environment Variables

**Development (.env):**
```bash
TIINGO_API_KEY=your_dev_key
POLYGON_API_KEY=your_dev_key
AWS_LAMBDA_ENDPOINT=http://localhost:3000
USE_MOCK_DATA=true
ENABLE_DEBUG_LOGS=true
```

**Production (EAS Secrets):**
```bash
eas secret:create --name TIINGO_API_KEY --value ***
eas secret:create --name POLYGON_API_KEY --value ***
eas secret:create --name AWS_LAMBDA_ENDPOINT --value https://your-lambda.amazonaws.com
```

---

## Troubleshooting

### Common Issues

**Database not initializing:**
- Check `getDatabase()` is called before any queries
- Verify SQLite tables exist: `PRAGMA table_info(table_name)`

**API calls failing:**
- Verify API keys are correctly set in environment variables
- Check network connectivity
- Check API rate limits (Tiingo: 500/hr, Polygon: 5/min)

**React Query not refetching:**
- Check `staleTime` configuration (default: 5 minutes)
- Manually invalidate queries: `queryClient.invalidateQueries(['key'])`

**Performance issues:**
- Profile with React DevTools
- Check for unnecessary re-renders (use React.memo)
- Optimize FlatList with `removeClippedSubviews`, `maxToRenderPerBatch`

**Navigation not working:**
- Verify navigation types are correct
- Check navigator hierarchy matches structure
- Ensure screens are registered in navigator

**Metro bundler won't start:**
- Clear cache: `npx expo start -c` or `npx expo start --clear`
- Delete `node_modules/` and reinstall: `rm -rf node_modules && npm install`
- Clear watchman cache: `watchman watch-del-all` (if watchman is installed)

**Expo Go vs Development Build confusion:**
- **Expo Go**: Use for basic development without custom native modules
- **Development Build**: Required if using custom native modules (e.g., ONNX Runtime)
- If you get "Unable to resolve module" errors, you may need a development build
- Create development build: `eas build --profile development --platform ios`

**iOS Simulator not working:**
- Ensure Xcode Command Line Tools installed: `xcode-select --install`
- Open Xcode and accept license agreement
- Launch simulator manually: `open -a Simulator`

**Android Emulator setup:**
- Install Android Studio: https://developer.android.com/studio
- Configure Android SDK and emulator through Android Studio
- Ensure `ANDROID_HOME` environment variable is set
- Start emulator: `~/Android/Sdk/emulator/emulator -avd Pixel_5_API_31`

**SQLite not working on web:**
- expo-sqlite doesn't work in web browser
- Use mock data for web development or skip web platform
- Focus on iOS/Android for this app

**Environment variables not loading:**
- Ensure `.env` file exists in `Migration/expo-project/`
- Install: `npm install react-native-dotenv`
- Configure babel.config.js to include the plugin
- Restart metro bundler after changes

---

## Future Enhancements (Phase 8+)

After completing Phases 0-7, consider these enhancements:

### Phase 8: On-Device ML with ONNX Runtime
- Convert FinBERT model to ONNX format
- Integrate `onnxruntime-react-native`
- Enables offline sentiment analysis
- Reduces API costs

### Phase 9: Advanced Charts
- Price charts with candlestick visualization
- Sentiment trend charts
- Interactive chart library (Victory Native or Recharts)

### Phase 10: Push Notifications
- Price alerts for portfolio stocks
- Daily sentiment summaries
- Breaking news notifications

### Phase 11: Dark Mode
- Implement dark theme
- Automatic switching based on system preference
- User toggle in settings

### Phase 12: Tablet Optimization
- Responsive layouts for iPad and Android tablets
- Multi-column layouts
- Split-screen views

---

## Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [React Native Paper](https://reactnativepaper.com/)
- [Tiingo API Docs](https://api.tiingo.com/documentation)
- [Polygon.io API Docs](https://polygon.io/docs)

### Android Source Code Reference
All original Java files are located in `../app/src/main/java/gemenielabs/sentiment/`:
- Room entities: `Room/*.java`
- Data processing: `DataProcessing/*.java`
- Fragments: `Fragments/*.java`
- Recycler adapters: `Recycler/*.java`
- Sentiment vocabulary: `../app/src/main/res/values/array.xml`

---

## Getting Started

1. **Review Phase 0** - Understand architecture decisions
2. **Set up environment** - Install prerequisites
3. **Get API keys** - Tiingo and Polygon.io
4. **Start Phase 1** - Follow [Phase-1.md](./Phase-1.md)
5. **Work sequentially** - Complete each phase before moving to next
6. **Commit frequently** - Use conventional commits
7. **Test thoroughly** - Write tests as you go

---

## Support & Questions

If you need clarification during implementation:
- Re-read the relevant Phase document
- Check Phase-0.md for architecture guidance
- Review Android source code for original behavior
- Consult official documentation for libraries

---

## Project Status

This is a **planning document**. Implementation will proceed phase by phase.

**Current Status:** ✅ Planning Complete - Ready for Implementation

---

## License

This migration plan follows the licensing of the original Android application.

---

## Acknowledgments

- Original Android app architecture by HatmanStack
- Migration plan designed for full feature parity
- Built with React Native and Expo for cross-platform deployment

---

**Ready to begin?** Start with [Phase-0.md](./Phase-0.md) to understand the architectural foundation, then proceed to [Phase-1.md](./Phase-1.md) for implementation.
