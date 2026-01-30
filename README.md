# Are You The One - Dating App

A mobile dating app focused on safety, pacing, and playful matching with unique Rose 🌹 and Kiss 💋 mechanics.

## Features

- **Unique Matching**: Men send Roses 🌹, Women send Kisses 💋
- **Progressive Communication**: Text → Voice → Video unlock system
- **Safety First**: Check-in system with SOS alerts and live location
- **Date Suggestions**: Curated local date ideas
- **Success Stories**: User reviews and testimonials
- **Subscription Tiers**: Free, Plus, and Pro with progressive features

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Payments**: Stripe
- **Animations**: Lottie
- **Backend**: (To be integrated - Bubble/Custom API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for emulators)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API keys

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── assets/          # Images, fonts, Lottie animations
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # Screen components
├── services/        # API services and integrations
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and constants
```

## Development Milestones

### Milestone 1 - App Skeleton (Current)
- [x] Project setup and configuration
- [ ] Navigation structure
- [ ] Basic screens (Auth, Profile, Swipe, Chat, Settings)
- [ ] Data models and types
- [ ] Stripe integration setup

### Milestone 2 - Core Logic
- [ ] Rose/Kiss swipe mechanics
- [ ] Mutual match detection
- [ ] Progressive unlock system
- [ ] Safety check-in feature

### Milestone 3 - Polish & Native
- [ ] Lottie animations
- [ ] Sound effects
- [ ] Push notifications
- [ ] App store submission

## Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [TECHNICAL_SPECS.md](./docs/TECHNICAL_SPECS.md) - Technical Specifications
- [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - API Documentation
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture Overview

## License

Proprietary - All rights reserved
