/**
 * Sentry Error Monitoring Configuration
 * Integrates Sentry for production error tracking and monitoring
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { env } from './env';

/**
 * Initialize Sentry error monitoring
 * Call this during app initialization (in App.tsx)
 */
export function initializeSentry(): void {
  // Only initialize Sentry in production builds
  if (__DEV__) {
    console.log('[Sentry] Skipping initialization in development mode');
    return;
  }

  if (!env.sentryDsn) {
    console.warn(
      '[Sentry] DSN not configured. Error monitoring is disabled. Set SENTRY_DSN in app.json extra field or EAS Secrets.'
    );
    return;
  }

  try {
    Sentry.init({
      dsn: env.sentryDsn,

      // Set environment
      environment: __DEV__ ? 'development' : 'production',

      // Release tracking
      release: `stock-insights@${Constants.expoConfig?.version || '1.0.0'}`,
      dist: Constants.expoConfig?.android?.versionCode?.toString() || '1',

      // Enable tracing
      enableTracing: true,
      tracesSampleRate: 1.0, // Adjust in production (0.2 = 20% of transactions)

      // Enable automatic breadcrumbs
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,

      // Attach stack traces
      attachStacktrace: true,

      // Enable native crash reporting
      enableNative: true,
      enableNativeCrashHandling: true,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Filter out API keys from error messages
        if (event.message) {
          event.message = event.message.replace(/[a-f0-9]{32,}/gi, '[REDACTED]');
        }

        // Remove API keys from request data
        if (event.request?.data) {
          const data = event.request.data;
          if (typeof data === 'string') {
            event.request.data = data.replace(/[a-f0-9]{32,}/gi, '[REDACTED]');
          }
        }

        return event;
      },

      // Ignore common errors
      ignoreErrors: [
        // Network errors that are expected
        'Network request failed',
        'Network Error',
        'Failed to fetch',

        // User cancellations
        'User cancelled',
        'Aborted',

        // Development warnings
        'Warning:',
      ],
    });

    console.log('[Sentry] Error monitoring initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setSentryUser(userId: string, email?: string): void {
  if (__DEV__) return;

  Sentry.setUser({
    id: userId,
    email: email,
  });
}

/**
 * Clear user context
 * Call this on user logout
 */
export function clearSentryUser(): void {
  if (__DEV__) return;

  Sentry.setUser(null);
}

/**
 * Add custom breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
): void {
  if (__DEV__) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception manually
 * Use for caught errors that should be reported
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (__DEV__) {
    console.error('[Sentry] Exception captured:', error, context);
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture message manually
 * Use for important events or warnings
 */
export function captureMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info'
): void {
  if (__DEV__) {
    console.log(`[Sentry] Message captured (${level}):`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set custom tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  if (__DEV__) return;

  Sentry.setTag(key, value);
}

/**
 * Set custom context for additional debugging info
 */
export function setContext(name: string, context: Record<string, any>): void {
  if (__DEV__) return;

  Sentry.setContext(name, context);
}

/**
 * Start a performance transaction
 * Use for tracking slow operations
 */
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (__DEV__) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Example usage in API calls:
 *
 * try {
 *   const transaction = startTransaction('fetch-stock-prices', 'api.request');
 *   const data = await fetchStockPrices(ticker);
 *   transaction?.finish();
 *   return data;
 * } catch (error) {
 *   captureException(error, { ticker, operation: 'fetchStockPrices' });
 *   throw error;
 * }
 */
