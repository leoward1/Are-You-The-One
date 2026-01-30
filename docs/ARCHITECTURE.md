# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │  Components  │  │  Navigation  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              State Management (Zustand)             │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │                 Services Layer                       │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │    │
│  │  │ API  │ │Stripe│ │ Push │ │ Maps │ │WebRTC│     │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │    │
│  └──────┬──────────────────────────────────────────────┘    │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ HTTPS/WSS
          │
┌─────────▼───────────────────────────────────────────────────┐
│                    Backend (Bubble.io)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │  WebSockets  │  │  Workflows   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              Database (PostgreSQL)               │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          │
          │ API Calls
          │
┌─────────▼───────────────────────────────────────────────────┐
│                   Third-Party Services                       │
├─────────────────────────────────────────────────────────────┤
│  Stripe  │  Firebase  │  SendGrid  │  Twilio  │  Google Maps│
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Layer Structure

#### 1. Presentation Layer (Screens & Components)
- **Screens**: Full-page views (Auth, Profile, Swipe, Chat, etc.)
- **Components**: Reusable UI elements (Button, Card, Avatar, etc.)
- **Navigation**: React Navigation stack and tab navigators

#### 2. State Management Layer (Zustand)
- **User Store**: Authentication state, user profile
- **Match Store**: Matches, likes, discovery profiles
- **Chat Store**: Messages, conversations
- **Safety Store**: Active check-ins, SOS state
- **Subscription Store**: Current tier, feature flags

#### 3. Service Layer
- **API Service**: HTTP client with interceptors
- **Auth Service**: Login, signup, token refresh
- **Stripe Service**: Payment processing
- **Push Service**: Notification handling
- **Location Service**: Geolocation tracking
- **WebRTC Service**: Voice/video calls (Phase 2)

#### 4. Utilities & Helpers
- **Validators**: Form validation
- **Formatters**: Date, currency, distance
- **Constants**: Colors, sizes, API endpoints
- **Hooks**: Custom React hooks

## Data Flow

### Authentication Flow
```
1. User enters credentials
2. Screen calls authService.login()
3. Service makes API request
4. On success, store tokens in secure storage
5. Update user store with user data
6. Navigate to main app
7. API interceptor adds token to all requests
8. On 401, attempt token refresh
9. On refresh failure, logout user
```

### Swipe Flow
```
1. Discovery screen loads profiles from API
2. Profiles stored in match store
3. User swipes left (pass) or right (like)
4. Lottie animation plays
5. API call to create like/pass
6. If mutual match:
   - Show confetti animation
   - Display match popup
   - Add to matches list
   - Navigate to chat (optional)
7. Load next profile
```

### Chat Flow
```
1. User opens match from list
2. Load messages from API
3. Subscribe to WebSocket for real-time updates
4. User types message
5. Optimistic UI update (show immediately)
6. Send to API
7. On success, update with server ID
8. On failure, show retry option
9. New messages arrive via WebSocket
10. Update chat store and UI
```

### Safety Check-in Flow
```
1. User starts check-in before date
2. Request location permission
3. Create check-in via API
4. Start location tracking (every 5 min)
5. Send location updates to API
6. Background timer for auto-alert
7. If not completed by expected_end + auto_alert_minutes:
   - Send alert to emergency contact
   - Update status to escalated
8. User can complete or trigger SOS manually
```

## State Management (Zustand)

### Store Structure

```typescript
// User Store
{
  user: User | null,
  isAuthenticated: boolean,
  tokens: { access: string, refresh: string },
  login: (credentials) => Promise<void>,
  logout: () => void,
  updateProfile: (data) => Promise<void>
}

// Match Store
{
  discoveryProfiles: Profile[],
  matches: Match[],
  currentProfile: Profile | null,
  dailyRevealsRemaining: number,
  loadProfiles: () => Promise<void>,
  sendLike: (userId, type) => Promise<Match | null>,
  sendPass: (userId) => Promise<void>
}

// Chat Store
{
  conversations: { [matchId]: Message[] },
  unreadCounts: { [matchId]: number },
  loadMessages: (matchId) => Promise<void>,
  sendMessage: (matchId, message) => Promise<void>,
  markAsRead: (matchId) => void
}

// Safety Store
{
  activeCheckin: SafetyCheckin | null,
  startCheckin: (data) => Promise<void>,
  updateLocation: (coords) => Promise<void>,
  completeCheckin: () => Promise<void>,
  triggerSOS: () => Promise<void>
}

// Subscription Store
{
  currentTier: 'free' | 'plus' | 'pro',
  features: FeatureFlags,
  plans: SubscriptionPlan[],
  subscribe: (planId) => Promise<void>,
  canAccessFeature: (feature) => boolean
}
```

## Navigation Structure

```
Root Navigator (Stack)
├── Auth Stack
│   ├── Welcome
│   ├── Login
│   ├── Signup
│   └── OnboardingFlow
│       ├── ProfileSetup
│       ├── PhotoUpload
│       ├── Preferences
│       └── Complete
│
└── Main Tab Navigator
    ├── Discovery Tab (Stack)
    │   ├── SwipeDeck
    │   └── ProfileDetail
    │
    ├── Matches Tab (Stack)
    │   ├── MatchList
    │   └── ChatScreen
    │
    ├── Dates Tab (Stack)
    │   ├── DateSuggestions
    │   └── DateDetail
    │
    ├── Safety Tab (Stack)
    │   ├── SafetyDashboard
    │   ├── ActiveCheckin
    │   └── CheckinHistory
    │
    └── Profile Tab (Stack)
        ├── MyProfile
        ├── EditProfile
        ├── Settings
        ├── Subscription
        └── Reviews
```

## API Integration

### HTTP Client Configuration

```typescript
// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } else {
        // Logout user
        await logout();
      }
    }
    return Promise.reject(error);
  }
);
```

### WebSocket Connection

```typescript
// Real-time updates for chat
const chatSocket = new WebSocket(WS_URL);

chatSocket.onopen = () => {
  // Authenticate
  chatSocket.send(JSON.stringify({
    type: 'auth',
    token: accessToken
  }));
};

chatSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'new_message':
      updateChatStore(data.message);
      showNotification(data.message);
      break;
    case 'match_created':
      updateMatchStore(data.match);
      showMatchPopup(data.match);
      break;
  }
};
```

## Security Considerations

### Token Management
- Access tokens stored in memory (Zustand)
- Refresh tokens in secure storage (expo-secure-store)
- Automatic token refresh on 401
- Token expiry handled gracefully

### Data Encryption
- All API calls over HTTPS
- Sensitive data encrypted in local storage
- No passwords stored locally
- Biometric authentication (future)

### Privacy
- Location only tracked during active check-ins
- User consent required for all permissions
- Data minimization principle
- GDPR/CCPA compliance

## Performance Optimization

### Image Handling
- Progressive loading with blur placeholder
- Lazy loading for off-screen images
- Image caching with expo-image
- Optimized sizes (thumbnail, medium, full)

### List Rendering
- FlatList with virtualization
- Optimized keyExtractor
- Memoized list items
- Pagination for large datasets

### Bundle Optimization
- Code splitting by route
- Tree shaking unused code
- Minification in production
- Asset optimization (images, fonts)

### Caching Strategy
- API responses cached (5 min TTL)
- Profile images cached locally
- Offline support for viewed profiles
- Background sync when online

## Error Handling

### Error Boundaries
- Top-level error boundary
- Screen-level error boundaries
- Fallback UI for crashes
- Error reporting to Sentry

### Network Errors
- Retry logic with exponential backoff
- Offline detection
- Queue actions for later
- User-friendly error messages

### Validation
- Client-side validation before API calls
- Server-side validation errors displayed
- Form-level and field-level errors
- Real-time validation feedback

## Testing Strategy

### Unit Tests (Jest)
- Utility functions
- Validators and formatters
- Store actions and selectors
- Service layer methods

### Component Tests (React Native Testing Library)
- Component rendering
- User interactions
- Props and state changes
- Accessibility

### Integration Tests
- Navigation flows
- API integration
- State management
- Authentication flow

### E2E Tests (Detox)
- Critical user journeys
- Sign up → Profile → Swipe → Match → Chat
- Payment flow
- Safety check-in

## Deployment Pipeline

### Development
```
1. Local development with Expo Go
2. Hot reload for rapid iteration
3. Dev API endpoint
4. Mock data for offline development
```

### Staging
```
1. EAS Build (internal distribution)
2. TestFlight (iOS) / Internal Testing (Android)
3. Staging API endpoint
4. Beta tester feedback
```

### Production
```
1. EAS Build (production)
2. App Store / Google Play submission
3. Production API endpoint
4. Phased rollout (10% → 50% → 100%)
5. Monitoring and analytics
```

## Monitoring & Observability

### Application Monitoring
- Crash reporting (Sentry)
- Performance monitoring (Firebase)
- User analytics (Segment/GA4)
- Custom events tracking

### Metrics Dashboard
- Active users (DAU/MAU)
- Swipe metrics (left/right ratio)
- Match rate
- Message engagement
- Subscription conversion
- Retention rates

### Alerts
- Crash rate > 1%
- API error rate > 5%
- Payment failures
- Safety alerts triggered
