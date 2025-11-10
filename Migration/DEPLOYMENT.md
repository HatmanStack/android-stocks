# Deployment Guide

This guide explains how to build and deploy the Stock Insights app to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [EAS Build Setup](#eas-build-setup)
- [Building for iOS](#building-for-ios)
- [Building for Android](#building-for-android)
- [App Store Submission](#app-store-submission)
- [Over-the-Air Updates](#over-the-air-updates)
- [Environment Configuration](#environment-configuration)
- [CI/CD](#cicd)

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed development and testing
- ✅ All tests passing (`npm test`)
- ✅ No TypeScript errors (`npm run type-check`)
- ✅ No linting errors (`npm run lint`)
- ✅ API keys configured (see [API_KEYS.md](./API_KEYS.md))
- ✅ Expo account created
- ✅ EAS CLI installed (`npm install -g eas-cli`)

## EAS Build Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS Build

The project already includes `eas.json` configuration. Review and update if needed:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 4. Configure app.json

Update version and build numbers in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

## Building for iOS

### Prerequisites

- Apple Developer Account ($99/year)
- macOS computer (for local builds) or use EAS Build (cloud)
- Xcode installed (for local builds)

### 1. Create App on App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - Platform: iOS
   - Name: Stock Insights
   - Primary Language: English
   - Bundle ID: `com.stockinsights.app`
   - SKU: `stock-insights-001`

### 2. Update app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.stockinsights.app",
      "buildNumber": "1",
      "supportsTablet": true
    }
  }
}
```

### 3. Build for iOS

#### Production Build

```bash
eas build --platform ios --profile production
```

#### Preview Build (TestFlight)

```bash
eas build --platform ios --profile preview
```

#### Development Build

```bash
eas build --platform ios --profile development
```

### 4. Submit to App Store

After build completes:

```bash
eas submit --platform ios
```

Or manually:
1. Download `.ipa` from EAS Build dashboard
2. Use Transporter app to upload to App Store Connect
3. Create new version in App Store Connect
4. Fill in app metadata, screenshots, description
5. Submit for review

## Building for Android

### Prerequisites

- Google Play Developer Account ($25 one-time)
- Android signing keys

### 1. Create App on Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - Name: Stock Insights
   - Default language: English
   - App or game: App
   - Free or paid: Free

### 2. Generate Signing Keys

EAS can generate and manage signing keys automatically:

```bash
eas credentials
```

Or generate manually:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore stockinsights.keystore -alias stockinsights -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Update app.json

```json
{
  "expo": {
    "android": {
      "package": "com.stockinsights.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1976D2"
      }
    }
  }
}
```

### 4. Build for Android

#### Production Build (AAB)

```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (`.aab`) for Play Store.

#### Preview Build (APK)

```bash
eas build --platform android --profile preview
```

This creates an APK for testing.

### 5. Submit to Google Play

```bash
eas submit --platform android
```

Or manually:
1. Download `.aab` from EAS Build dashboard
2. Go to Google Play Console
3. Navigate to "Production" → "Create new release"
4. Upload AAB file
5. Fill in release notes
6. Review and rollout

## App Store Submission

### iOS App Store

#### Required Assets

1. **App Icon** (1024x1024px)
   - Already in `assets/icon.png`

2. **Screenshots** (various sizes):
   - 6.5" Display (1284 x 2778)
   - 5.5" Display (1242 x 2208)
   - iPad Pro (2048 x 2732)

3. **App Preview Video** (optional but recommended)

#### App Information

- **Name**: Stock Insights
- **Subtitle**: Real-time stock data, news, and AI predictions
- **Category**: Finance
- **Description**: [Write compelling description]
- **Keywords**: stocks, finance, market, news, predictions, portfolio
- **Support URL**: Your support website
- **Privacy Policy URL**: Required for App Store

#### App Review Information

- **Demo Account**: Provide test credentials if needed
- **Notes**: Explain API key requirements
- **Attachments**: Include screenshots of key features

### Google Play Store

#### Store Listing

1. **App Details**:
   - Title: Stock Insights
   - Short description: Track stocks with AI-powered predictions
   - Full description: [Write detailed description]

2. **Graphics**:
   - App icon: 512x512px
   - Feature graphic: 1024x500px
   - Screenshots: At least 2, up to 8

3. **Categorization**:
   - Application: Finance
   - Content rating: Everyone

4. **Contact Details**:
   - Website
   - Email
   - Privacy policy (required)

## Over-the-Air Updates

EAS Update allows you to push JavaScript and asset updates without going through app store review.

### 1. Configure EAS Update

```bash
eas update:configure
```

### 2. Publish Update

```bash
# Production update
eas update --branch production --message "Bug fixes and improvements"

# Staging update
eas update --branch staging --message "Testing new features"
```

### 3. Update Channels

Configure update channels in `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Limitations

- Cannot update native code (Swift, Kotlin)
- Cannot update app.json configuration
- Cannot update dependencies that require native changes
- For these changes, submit new app version

## Environment Configuration

### Production Environment Variables

Store production secrets in EAS:

```bash
# Add secrets
eas secret:create --scope project --name EXPO_PUBLIC_TIINGO_API_KEY --value prod_key
eas secret:create --scope project --name EXPO_PUBLIC_POLYGON_API_KEY --value prod_key

# Update secret
eas secret:delete --name EXPO_PUBLIC_TIINGO_API_KEY
eas secret:create --scope project --name EXPO_PUBLIC_TIINGO_API_KEY --value new_prod_key
```

### Build Profiles

Different profiles for different environments:

```json
{
  "build": {
    "development": {
      "env": {
        "APP_ENV": "development"
      }
    },
    "staging": {
      "env": {
        "APP_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "APP_ENV": "production"
      }
    }
  }
}
```

## CI/CD

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Runs tests on every push
2. Checks TypeScript types
3. Runs linter
4. Generates coverage reports

### Automated Builds

To trigger EAS builds from CI:

```bash
# In GitHub Actions workflow
- name: Build iOS
  run: eas build --platform ios --profile production --non-interactive

- name: Build Android
  run: eas build --platform android --profile production --non-interactive
```

Requires:
- `EXPO_TOKEN` secret in GitHub
- EAS Build configured

### Automated Submissions

```bash
# In GitHub Actions workflow
- name: Submit to App Store
  run: eas submit --platform ios --latest --non-interactive

- name: Submit to Play Store
  run: eas submit --platform android --latest --non-interactive
```

## Version Bumping

### Semantic Versioning

Follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Bump Version

Update in `app.json`:

```json
{
  "expo": {
    "version": "1.1.0",  // User-facing version
    "ios": {
      "buildNumber": "2"  // Increment for each build
    },
    "android": {
      "versionCode": 2  // Increment for each build
    }
  }
}
```

### Automated Version Bumping

Use npm version:

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Release Checklist

### Pre-Release

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] API keys configured for production
- [ ] Version numbers updated
- [ ] Release notes written
- [ ] Screenshots updated
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

### Build

- [ ] Production build successful for iOS
- [ ] Production build successful for Android
- [ ] Build tested on physical devices
- [ ] Performance verified
- [ ] No crashes or critical bugs

### Submission

- [ ] App metadata complete
- [ ] Screenshots uploaded
- [ ] Description reviewed
- [ ] Keywords optimized
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Age rating set

### Post-Release

- [ ] Monitor crash reports
- [ ] Monitor user reviews
- [ ] Track analytics
- [ ] Prepare hotfix process
- [ ] Plan next release

## Troubleshooting

### Build Failures

**iOS build fails:**
- Check bundle identifier matches App Store Connect
- Verify signing certificate is valid
- Check for native module compatibility

**Android build fails:**
- Verify package name is unique
- Check signing key configuration
- Review gradle build logs

### App Store Rejection

Common reasons:
- Missing privacy policy
- Crashes on launch
- Missing app functionality
- Guideline violations

Always read rejection notes carefully and address all points.

### EAS Build Issues

```bash
# Clear EAS cache
eas build:cancel

# View build logs
eas build:view [build-id]

# Check credentials
eas credentials
```

## Support

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

## Next Steps

After successful deployment:

1. Monitor app performance and crashes
2. Collect user feedback
3. Plan feature updates
4. Optimize based on analytics
5. Prepare maintenance releases

---

Good luck with your app launch! 🚀
