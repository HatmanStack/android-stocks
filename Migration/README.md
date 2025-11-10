# Stock Insights - React Native App

Stock Insights is a modern React Native mobile application that provides real-time stock market data, news, sentiment analysis, and AI-powered predictions. This app is a complete migration from the original Android Kotlin app to React Native with Expo, bringing the same powerful features to both iOS and Android platforms.

## Features

### 📈 Real-Time Stock Data
- Live stock prices and historical data from Tiingo
- Interactive charts and price trends
- Volume analysis and market statistics
- Support for thousands of US stocks

### 📰 News & Sentiment Analysis
- Latest financial news from Polygon.io
- AI-powered sentiment analysis using FinBERT
- Sentiment scores and word count analytics
- Filter news by ticker and date range

### 🤖 AI Predictions
- Machine learning predictions for stock movements
- Next day, 2-week, and 1-month forecasts
- Logistic regression model trained on historical data
- Combines price, volume, and sentiment indicators

### 💼 Portfolio Management
- Track your favorite stocks
- Add and remove stocks from watchlist
- Quick access to portfolio performance
- Personalized stock insights

### 🎨 Modern UI/UX
- Material Design 3 components
- Smooth animations and transitions
- Dark/light theme support (coming soon)
- Responsive layout for all screen sizes

## Screenshots

_Screenshots coming soon - app in development_

## Installation

### For End Users

#### iOS (TestFlight)
_Coming soon - app pending App Store review_

#### Android (Google Play)
_Coming soon - app pending Play Store review_

### For Developers

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

Quick start:
```bash
cd Migration/expo-project
npm install
npx expo start
```

## API Keys

This app requires API keys for the following services:
- **Tiingo** - Stock price data
- **Polygon.io** - Financial news
- **Custom Microservices** - Sentiment analysis and predictions (deployed on Google Cloud Run)

See [API_KEYS.md](./API_KEYS.md) for detailed instructions on obtaining and configuring API keys.

## Technology Stack

### Frontend
- **React Native** with Expo SDK 51
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Paper** for UI components
- **React Query** for data fetching and caching

### Database
- **SQLite** (expo-sqlite) for local data storage
- Custom repositories for data access
- Optimized indexes for query performance

### Backend Services
- **Tiingo API** - Real-time and historical stock data
- **Polygon.io API** - Financial news and market data
- **FinBERT Microservice** - Deep learning sentiment analysis (Google Cloud Run)
- **Prediction Service** - Logistic regression predictions (Google Cloud Run)

### State Management
- React Context API for global state
- React Query for server state
- AsyncStorage for persistent settings

## Architecture

The app follows a clean architecture pattern with clear separation of concerns:

```
src/
├── components/        # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── services/         # API services and data sync
├── database/         # SQLite database and repositories
├── contexts/         # React contexts for state management
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

For detailed architecture documentation, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Performance

The app is optimized for performance with:
- Database indexes for fast queries
- FlatList virtualization for long lists
- React Query caching to minimize API calls
- Memoized components to prevent unnecessary re-renders
- Native animations using Animated API

Performance targets:
- **Frame Rate**: 60 FPS
- **Memory Usage**: < 200MB
- **Initial Load**: < 3s
- **Search Response**: < 300ms

See [src/utils/performance/README.md](./expo-project/src/utils/performance/README.md) for detailed performance documentation.

## Testing

The app has comprehensive test coverage:
- **Unit Tests**: 300+ tests for utils, services, and repositories
- **Integration Tests**: Data flow and navigation tests
- **Coverage**: >70% overall, >90% for critical paths

Run tests:
```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- --watch         # Run in watch mode
```

## Deployment

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

This project is part of a migration from Android Kotlin to React Native. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Original Android App**: Built with Kotlin, Room, Retrofit, and Material Design
- **Tiingo**: Stock market data API
- **Polygon.io**: Financial news API
- **FinBERT**: Financial sentiment analysis model
- **Expo Team**: For the amazing React Native development platform

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Roadmap

### Phase 1-6 (Completed)
- ✅ Project setup and navigation
- ✅ Stock data integration
- ✅ News and sentiment features
- ✅ Portfolio management
- ✅ UI/UX enhancements
- ✅ Performance optimizations

### Phase 7 (Current)
- ✅ Unit and integration tests
- ✅ CI/CD pipeline setup
- 🔄 Documentation
- 🔄 Production builds
- ⏳ App Store submission

### Future Enhancements
- 📊 Advanced charting with indicators
- 🌙 Dark mode support
- 🔔 Price alerts and notifications
- 📱 Widget support
- 🌐 Web version using React Native Web
- 🔐 User authentication and cloud sync

---

**Built with ❤️ using React Native and Expo**
