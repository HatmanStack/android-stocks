/**
 * Environment Configuration
 * Centralized access to environment variables using expo-constants
 */

import Constants from 'expo-constants';

/**
 * Environment variables type definition
 */
interface EnvironmentConfig {
  tiingoApiKey: string;
  polygonApiKey: string;
  sentimentApiUrl: string;
  predictionApiUrl: string;
  sentryDsn: string;
  useMockData: boolean;
  enableDebugLogs: boolean;
}

/**
 * Get environment configuration from expo-constants
 * In production, these should be set via EAS Secrets
 * In development, these can be set via .env file or app.json extra field
 *
 * Handles multiple sources for compatibility with different build types:
 * - expoConfig.extra: Development and EAS builds
 * - manifest.extra: Classic updates
 * - manifest2.extra: EAS Update
 */
function getEnvironmentConfig(): EnvironmentConfig {
  // Try multiple sources for maximum compatibility
  const extra = Constants.expoConfig?.extra ||
                Constants.manifest?.extra ||
                (Constants.manifest2?.extra as any)?.expoClient?.extra ||
                {};

  return {
    tiingoApiKey: extra.tiingoApiKey || '',
    polygonApiKey: extra.polygonApiKey || '',
    sentimentApiUrl:
      extra.sentimentApiUrl ||
      'https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app',
    predictionApiUrl:
      extra.predictionApiUrl || 'https://stocks-f3jmjyxrpq-uc.a.run.app',
    sentryDsn: extra.sentryDsn || '',
    useMockData: extra.useMockData === 'true' || extra.useMockData === true,
    enableDebugLogs:
      extra.enableDebugLogs === 'true' || extra.enableDebugLogs === true || __DEV__,
  };
}

/**
 * Environment configuration singleton
 */
export const env = getEnvironmentConfig();

/**
 * Validate that required environment variables are set
 * Call this during app initialization
 */
export function validateEnvironmentConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!env.tiingoApiKey && !env.useMockData) {
    errors.push(
      'TIINGO_API_KEY is not configured. Set it in app.json extra field or EAS Secrets.'
    );
  }

  if (!env.polygonApiKey && !env.useMockData) {
    errors.push(
      'POLYGON_API_KEY is not configured. Set it in app.json extra field or EAS Secrets.'
    );
  }

  if (!env.sentimentApiUrl) {
    errors.push('SENTIMENT_API_URL is not configured.');
  }

  if (!env.predictionApiUrl) {
    errors.push('PREDICTION_API_URL is not configured.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log environment configuration status (for debugging)
 */
export function logEnvironmentStatus(): void {
  if (!env.enableDebugLogs) return;

  console.log('[ENV] Environment Configuration:');
  console.log(`  - Tiingo API Key: ${env.tiingoApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`  - Polygon API Key: ${env.polygonApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`  - Sentiment API URL: ${env.sentimentApiUrl}`);
  console.log(`  - Prediction API URL: ${env.predictionApiUrl}`);
  console.log(`  - Sentry DSN: ${env.sentryDsn ? '✓ Set' : '✗ Not set'}`);
  console.log(`  - Use Mock Data: ${env.useMockData}`);
  console.log(`  - Debug Logs: ${env.enableDebugLogs}`);
}
