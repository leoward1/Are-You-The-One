# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm (or yarn)
- **Git**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Development** (Mac only):
  - Xcode 14+
  - iOS Simulator
- **Android Development**:
  - Android Studio
  - Android SDK
  - Android Emulator or physical device

## Installation Steps

### 1. Clone and Install Dependencies

```bash
cd "C:/Users/SULATECH/Desktop/Are you the On App"

# Install dependencies
npm install

# Install additional required packages
npm install babel-plugin-module-resolver @types/node --save-dev
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
```

Required environment variables:
- `API_BASE_URL` - Your backend API URL
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `FIREBASE_API_KEY` - Firebase configuration

### 3. Start Development Server

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS Simulator (Mac only)
npm run android  # Android Emulator
npm run web      # Web browser
```

### 4. Running on Physical Devices

**iOS (requires Mac):**
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. App will load on your device

**Android:**
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. App will load on your device

## Project Structure

```
Are you the On App/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
├── .env                   # Environment variables (create from .env.example)
│
├── docs/                  # Documentation
│   ├── PRD.md
│   ├── TECHNICAL_SPECS.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── SETUP_GUIDE.md
│
└── src/
    ├── assets/           # Images, fonts, animations
    ├── components/       # Reusable UI components
    ├── hooks/           # Custom React hooks
    ├── navigation/      # Navigation configuration
    ├── screens/         # Screen components
    ├── services/        # API services
    ├── store/           # State management (Zustand)
    ├── types/           # TypeScript definitions
    └── utils/           # Helper functions
```

## Development Workflow

### 1. Type Checking

```bash
npm run type-check
```

### 2. Linting

```bash
npm run lint
```

### 3. Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Backend Setup (Bubble.io)

### 1. Create Bubble App

1. Go to bubble.io and create a new app
2. Set up the data types as defined in PRD.md
3. Configure API endpoints
4. Set up privacy rules

### 2. Configure CORS

In Bubble settings:
- Enable API
- Add your app domain to allowed origins
- Enable CORS for development: `http://localhost:19000`

### 3. API Authentication

- Enable JWT authentication in Bubble
- Configure token expiration (3600 seconds recommended)
- Set up refresh token endpoint

## Third-Party Service Setup

### Stripe

1. Create account at stripe.com
2. Get publishable key from Dashboard
3. Create products for Free/Plus/Pro tiers
4. Add webhook endpoint for subscription events
5. Add key to `.env`

### Firebase (Push Notifications)

1. Create project at console.firebase.google.com
2. Add iOS and Android apps
3. Download configuration files
4. Add credentials to `.env`
5. Enable Cloud Messaging

### Google Maps

1. Go to console.cloud.google.com
2. Enable Maps SDK for iOS and Android
3. Create API key
4. Restrict key to your app bundle IDs
5. Add key to `.env`

### SendGrid (Email)

1. Create account at sendgrid.com
2. Verify sender email
3. Create API key
4. Set up email templates
5. Add key to backend environment

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests (Detox)

```bash
# Install Detox CLI
npm install -g detox-cli

# Build for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start -c
```

**iOS build fails:**
```bash
cd ios
pod install
cd ..
```

**Android build fails:**
```bash
cd android
./gradlew clean
cd ..
```

**TypeScript errors:**
```bash
npm run type-check
# Fix errors, then restart
```

**Module resolution errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

## Deployment

### iOS App Store

1. Build with EAS: `eas build --platform ios`
2. Download IPA file
3. Upload to App Store Connect
4. Fill in app metadata
5. Submit for review

### Google Play Store

1. Build with EAS: `eas build --platform android`
2. Download AAB file
3. Upload to Google Play Console
4. Fill in app metadata
5. Submit for review

## Monitoring & Analytics

### Sentry (Error Tracking)

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

### Firebase Analytics

Already included with Firebase setup for push notifications.

## Support

For issues or questions:
- Check documentation in `/docs`
- Review PRD.md for feature specifications
- Check ARCHITECTURE.md for system design
- Review API_DOCUMENTATION.md for API details

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure environment variables
3. ✅ Set up backend (Bubble.io)
4. ✅ Configure third-party services
5. ✅ Start development server: `npm start`
6. 🚧 Begin Milestone 1 development
7. 🚧 Test on iOS and Android
8. 🚧 Deploy to TestFlight/Internal Testing
