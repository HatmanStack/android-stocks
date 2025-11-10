# API Keys Setup Guide

This guide explains how to obtain and configure API keys for the Stock Insights app.

## Required API Keys

The app requires the following API keys:

1. **Tiingo API** - Stock price data
2. **Polygon.io API** - Financial news
3. **Custom Microservices** - Sentiment analysis and predictions (optional for development)

## 1. Tiingo API Key

### Obtaining the Key

1. Go to [tiingo.com](https://www.tiingo.com/)
2. Click "Sign Up" (free tier available)
3. Verify your email address
4. Log in and navigate to [Account Settings](https://www.tiingo.com/account/api/token)
5. Copy your API token

### Features Available

- **Free Tier**:
  - End-of-day stock prices
  - Up to 500 unique symbols per month
  - Up to 1,000 API requests per hour
  - Historical data going back years

- **Paid Tiers**:
  - Real-time data
  - More symbols and requests
  - Additional data points

### Configuration

Add your Tiingo API key to the constants file:

```typescript
// src/constants/api.constants.ts
export const API_KEYS = {
  TIINGO: 'your_tiingo_api_key_here',
  // ... other keys
};
```

Or use environment variables (recommended for production):

```typescript
// src/constants/api.constants.ts
export const API_KEYS = {
  TIINGO: process.env.EXPO_PUBLIC_TIINGO_API_KEY || '',
  // ... other keys
};
```

Create `.env` file:
```
EXPO_PUBLIC_TIINGO_API_KEY=your_tiingo_api_key_here
```

## 2. Polygon.io API Key

### Obtaining the Key

1. Go to [polygon.io](https://polygon.io/)
2. Click "Get your Free API Key"
3. Sign up for an account
4. Verify your email
5. Navigate to [Dashboard](https://polygon.io/dashboard/api-keys)
6. Copy your API key

### Features Available

- **Free Tier**:
  - Up to 5 API calls per minute
  - Historical stock data
  - News articles (limited)
  - Basic market data

- **Paid Tiers**:
  - Higher rate limits
  - Real-time data
  - More news articles
  - WebSocket streams
  - Advanced analytics

### Configuration

Add your Polygon.io API key:

```typescript
// src/constants/api.constants.ts
export const API_KEYS = {
  TIINGO: '...',
  POLYGON: 'your_polygon_api_key_here',
};
```

Or use environment variables:

```
EXPO_PUBLIC_POLYGON_API_KEY=your_polygon_api_key_here
```

## 3. Custom Microservices (Optional)

The app uses two custom microservices deployed on Google Cloud Run:

1. **Sentiment Analysis Service** - FinBERT sentiment analysis
2. **Prediction Service** - Logistic regression stock predictions

### For Development

For local development, you can:
- Use mock data (recommended for testing)
- Deploy your own microservices
- Use the demo endpoints (rate-limited)

### Mock Data Configuration

To use mock data instead of real microservices:

```typescript
// src/constants/api.constants.ts
export const USE_MOCK_DATA = __DEV__; // Use mocks in development

// In your service files
if (USE_MOCK_DATA) {
  return getMockSentimentData();
}
```

### Deploying Your Own Microservices

If you want to deploy your own microservices:

#### Sentiment Analysis Service

The sentiment analysis service uses FinBERT model. You'll need:

1. Python 3.9+
2. transformers library
3. PyTorch
4. Flask or FastAPI

Deploy to Google Cloud Run:

```bash
# Install gcloud CLI
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy sentiment service
cd sentiment-service
gcloud run deploy sentiment-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Get service URL
gcloud run services describe sentiment-service \
  --region us-central1 \
  --format 'value(status.url)'
```

#### Prediction Service

The prediction service uses scikit-learn. Similar deployment process:

```bash
cd prediction-service
gcloud run deploy prediction-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Configuration

Add your microservice URLs:

```typescript
// src/constants/api.constants.ts
export const API_ENDPOINTS = {
  TIINGO_BASE: 'https://api.tiingo.com',
  POLYGON_BASE: 'https://api.polygon.io',
  SENTIMENT_ANALYSIS: process.env.EXPO_PUBLIC_SENTIMENT_URL || 'https://your-sentiment-service.run.app',
  STOCK_PREDICTION: process.env.EXPO_PUBLIC_PREDICTION_URL || 'https://your-prediction-service.run.app',
};
```

Environment variables:
```
EXPO_PUBLIC_SENTIMENT_URL=https://your-sentiment-service.run.app
EXPO_PUBLIC_PREDICTION_URL=https://your-prediction-service.run.app
```

## Environment Variables

### Local Development

Create a `.env` file in the `expo-project` directory:

```env
# API Keys
EXPO_PUBLIC_TIINGO_API_KEY=your_tiingo_key
EXPO_PUBLIC_POLYGON_API_KEY=your_polygon_key

# Microservice URLs (optional)
EXPO_PUBLIC_SENTIMENT_URL=https://sentiment-service.run.app
EXPO_PUBLIC_PREDICTION_URL=https://prediction-service.run.app
```

**Important**: Add `.env` to `.gitignore` to avoid committing secrets!

### EAS Build (Production)

For production builds with EAS, store secrets using EAS Secrets:

```bash
# Add secrets to EAS
eas secret:create --scope project --name EXPO_PUBLIC_TIINGO_API_KEY --value your_key
eas secret:create --scope project --name EXPO_PUBLIC_POLYGON_API_KEY --value your_key
eas secret:create --scope project --name EXPO_PUBLIC_SENTIMENT_URL --value your_url
eas secret:create --scope project --name EXPO_PUBLIC_PREDICTION_URL --value your_url

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name SECRET_NAME
```

## Security Best Practices

### Do's ✅

- Use environment variables for all API keys
- Add `.env` to `.gitignore`
- Use EAS Secrets for production builds
- Rotate keys periodically
- Use different keys for development and production
- Implement rate limiting in your backend

### Don'ts ❌

- Never commit API keys to git
- Don't hardcode keys in source code
- Don't share keys publicly
- Don't use production keys in development
- Don't log API keys in console

## Rate Limiting

Be aware of API rate limits:

### Tiingo
- Free tier: 500 requests/hour
- Add delays between requests if needed:
  ```typescript
  await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  ```

### Polygon.io
- Free tier: 5 requests/minute
- Implement request queuing for bulk operations

### Custom Microservices
- Depends on your Cloud Run configuration
- Consider implementing caching to reduce calls

## Testing Without API Keys

For testing or development without API keys:

1. Use mock data:
   ```typescript
   // src/utils/mockData/index.ts
   export const getMockStockPrices = () => [...];
   ```

2. Use test mode:
   ```typescript
   export const TEST_MODE = __DEV__ && !process.env.EXPO_PUBLIC_TIINGO_API_KEY;
   ```

3. Implement offline mode with cached data

## Troubleshooting

### "Invalid API Key" Error

- Verify key is correctly copied (no extra spaces)
- Check if key is activated
- Ensure account is verified
- Try regenerating the key

### Rate Limit Errors

- Check your usage in API dashboard
- Implement request throttling
- Consider upgrading to paid tier
- Cache responses locally

### CORS Errors (Web Development)

- API keys should be used server-side only
- For web, implement a backend proxy
- Or use Expo's native modules (mobile only)

## Support

For API-specific issues:
- **Tiingo**: [support@tiingo.com](mailto:support@tiingo.com)
- **Polygon.io**: [support@polygon.io](mailto:support@polygon.io)
- **App Issues**: Open an issue on GitHub

---

Once you have all API keys configured, you're ready to start development! See [DEVELOPMENT.md](./DEVELOPMENT.md) for next steps.
