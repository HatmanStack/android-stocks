# Changelog

All notable changes to the Stock Insights React Native app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Environment variable management using expo-constants for secure API key handling
- Sentry integration for production error monitoring and crash reporting
- Component tests for PortfolioScreen, SearchScreen, and PriceScreen
- Accessibility labels for search bar and interactive elements
- Concurrent portfolio refresh with 3-request concurrency limit for faster updates
- CHANGELOG.md for version tracking
- .env.example file with environment variable documentation

### Changed
- Optimized portfolio refresh to use concurrent fetching instead of sequential (3x faster for large portfolios)
- Updated API services (Tiingo, Polygon) to use centralized environment configuration
- Enhanced ErrorBoundary to automatically report errors to Sentry in production

### Security
- API keys now managed through secure environment variables instead of setter functions
- Implemented Sentry data filtering to prevent API key leakage in error reports

## [1.0.0] - 2025-01-10

### Added - Phase 1: Data Layer
- SQLite database initialization with 6 tables (stocks, symbols, news, word counts, combined words, portfolio)
- Repository pattern for all 6 entities with comprehensive CRUD operations
- Sentiment vocabulary extraction (1,347 words) from Android XML to JSON
- Mock data generators for development and testing
- Utility functions for date manipulation, validation, and formatting
- TypeScript strict mode with comprehensive type definitions

### Added - Phase 2: Core Data Processing
- Tiingo API integration for stock prices and company metadata
- Polygon.io API integration for financial news articles
- Sentiment analysis service integration (FinBERT microservice)
- Prediction service integration (logistic regression microservice)
- Bag-of-words sentiment analysis (local implementation)
- Data synchronization orchestrator with progress callbacks
- React Query hooks for data fetching and caching
- Comprehensive error handling with retry logic and exponential backoff

### Added - Phase 3: UI Foundation
- React Navigation hierarchy (root, tabs, nested tabs)
- Material Design 3 theme system
- 11 reusable common components (ErrorBoundary, LoadingIndicator, ErrorDisplay, etc.)
- StockContext and PortfolioContext for global state management
- Custom hooks for stock data, sentiment data, news data, and symbol search
- Navigation transitions and deep linking support
- Theme configuration with consistent colors and typography

### Added - Phase 4: Search & Portfolio Screens
- Search screen with debounced symbol search
- Date range picker for historical data selection
- Portfolio screen with stock watchlist
- Add/remove stocks from portfolio
- Swipe-to-delete with confirmation dialog
- Pull-to-refresh functionality
- Empty states and loading indicators

### Added - Phase 5: Stock Detail Screens
- Price screen with OHLCV data display
- Sentiment screen with aggregate and individual article views
- News screen with article links and browser integration
- Stock metadata card with company information
- Performance optimizations (FlatList virtualization, batch rendering)
- Proper date sorting and formatting

### Added - Phase 6: Animations & Polish
- Page transition animations
- Micro-interactions and success feedback
- App-wide error boundary with fallback UI
- Splash screen and app icon configuration
- Offline indicator for network status
- Safe area handling for notched devices

### Added - Phase 7: Testing & Deployment
- 23 comprehensive test suites with 300+ tests
- Unit tests for all repositories, services, and utilities
- Integration tests for data flow and navigation
- Jest configuration with React Native Testing Library
- EAS Build configuration for iOS and Android
- GitHub Actions CI/CD pipeline
- Comprehensive documentation (README, DEVELOPMENT, DEPLOYMENT, API_KEYS)

### Technical Details
- **Framework:** React Native with Expo SDK 51
- **Language:** TypeScript 5.6 (strict mode)
- **Database:** SQLite (expo-sqlite) with indexed queries
- **State Management:** React Context + React Query
- **Navigation:** React Navigation 7.x
- **UI Library:** React Native Paper (Material Design 3)
- **Testing:** Jest + React Native Testing Library
- **CI/CD:** GitHub Actions + EAS Build

### Performance
- Database queries optimized with composite indexes
- FlatList virtualization for large datasets
- React Query caching (5-minute stale time)
- Memoized components and callbacks
- Batch rendering for long lists

### Security
- Parameterized SQL queries (no injection vulnerabilities)
- Input validation on all user inputs
- Secure API key management
- HTTPS for all API communications
- No sensitive data logging in production

---

## Version History

### Version Numbering
- **Major version:** Breaking changes or complete feature overhauls
- **Minor version:** New features, backward-compatible changes
- **Patch version:** Bug fixes and minor improvements

### Release Types
- **Alpha:** Internal testing, unstable
- **Beta:** External testing, feature-complete but may have bugs
- **RC (Release Candidate):** Production-ready, final testing
- **Stable:** Production release

---

## Migration Notes

This is a complete migration from the Android Kotlin app to React Native. Feature parity has been achieved with the following enhancements:

**Maintained Features:**
- All 6 database tables and relationships
- Tiingo and Polygon.io API integrations
- Bag-of-words sentiment analysis
- FinBERT and prediction microservice integration
- Portfolio management
- Date range selection
- Search functionality

**Enhancements:**
- Cross-platform support (iOS + Android)
- TypeScript type safety
- React Query caching
- Better error handling
- Improved navigation
- Material Design 3 UI
- Comprehensive testing
- CI/CD automation

---

## Upcoming Features

### v1.1.0 (Planned)
- Dark mode support
- Advanced charting with Victory Native
- Performance monitoring dashboard
- Improved offline support with sync queue

### v1.2.0 (Planned)
- User authentication
- Cloud sync for portfolio
- Price alerts and push notifications
- Tablet optimization

### v2.0.0 (Future)
- On-device ML with ONNX Runtime
- Advanced technical indicators
- Real-time stock quotes
- Internationalization (i18n)

---

**For detailed migration documentation, see Migration/docs/plans/README.md**
