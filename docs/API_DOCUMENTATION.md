# API Documentation

## Base URL
```
Development: https://dev.areyoutheone.app/api/1.1
Staging: https://staging.areyoutheone.app/api/1.1
Production: https://api.areyoutheone.app/api/1.1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "birthdate": "1995-06-15",
  "city": "New York"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "gender": "male",
    "tier": "free"
  },
  "tokens": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "tier": "free"
  },
  "tokens": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 3600
}
```

---

## User Profile

### GET /users/me
Get current user's profile.

**Response (200):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "male",
  "birthdate": "1995-06-15",
  "city": "New York",
  "bio": "Adventure seeker and coffee enthusiast",
  "interests": ["hiking", "photography", "cooking"],
  "height_in": 72,
  "tier": "plus",
  "primary_photo": "https://cdn.example.com/photos/user_123_primary.jpg",
  "photos": [
    {
      "id": "photo_1",
      "url": "https://cdn.example.com/photos/user_123_1.jpg",
      "is_primary": true
    }
  ],
  "preferences": {
    "min_age": 25,
    "max_age": 35,
    "distance_miles": 25,
    "looking_for": "relationship"
  },
  "settings": {
    "anim_enabled": true,
    "reduce_motion": false,
    "notifications_enabled": true
  }
}
```

### PATCH /users/me
Update current user's profile.

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "interests": ["hiking", "photography", "cooking", "travel"],
  "height_in": 72
}
```

**Response (200):**
```json
{
  "id": "user_123",
  "bio": "Updated bio text",
  "interests": ["hiking", "photography", "cooking", "travel"],
  "height_in": 72
}
```

### POST /users/me/photos
Upload a new photo.

**Request (multipart/form-data):**
```
photo: [binary file]
is_primary: false
```

**Response (201):**
```json
{
  "id": "photo_2",
  "url": "https://cdn.example.com/photos/user_123_2.jpg",
  "is_primary": false,
  "created_at": "2026-01-27T14:30:00Z"
}
```

### DELETE /users/me/photos/:photoId
Delete a photo.

**Response (204):** No content

---

## Discovery & Swiping

### GET /discovery/profiles
Get profiles to swipe on.

**Query Parameters:**
- `limit` (default: 10, max: 50)
- `offset` (default: 0)

**Response (200):**
```json
{
  "profiles": [
    {
      "id": "user_456",
      "first_name": "Jane",
      "age": 28,
      "city": "New York",
      "distance_miles": 5,
      "bio": "Love exploring new places",
      "interests": ["travel", "yoga", "art"],
      "primary_photo": "https://cdn.example.com/photos/user_456_primary.jpg",
      "photos": [
        {
          "url": "https://cdn.example.com/photos/user_456_1.jpg"
        }
      ],
      "compatibility_pct": 85
    }
  ],
  "has_more": true,
  "daily_reveals_remaining": 8
}
```

### POST /likes
Send a like (Rose or Kiss).

**Request Body:**
```json
{
  "to_user_id": "user_456",
  "type": "rose",
  "note": "Love your smile!"
}
```

**Response (201):**
```json
{
  "id": "like_789",
  "from_user_id": "user_123",
  "to_user_id": "user_456",
  "type": "rose",
  "note": "Love your smile!",
  "created_at": "2026-01-27T14:30:00Z",
  "is_mutual_match": false
}
```

**Response (201) - Mutual Match:**
```json
{
  "id": "like_789",
  "from_user_id": "user_123",
  "to_user_id": "user_456",
  "type": "rose",
  "is_mutual_match": true,
  "match": {
    "id": "match_999",
    "user_a": "user_123",
    "user_b": "user_456",
    "compatibility_pct": 85,
    "unlocked_stage": "text",
    "created_at": "2026-01-27T14:30:00Z"
  }
}
```

### POST /passes
Pass on a profile.

**Request Body:**
```json
{
  "user_id": "user_456"
}
```

**Response (201):**
```json
{
  "success": true
}
```

---

## Matches & Messaging

### GET /matches
Get all matches for current user.

**Query Parameters:**
- `status` (optional: matched, blocked, ended)
- `limit` (default: 20)
- `offset` (default: 0)

**Response (200):**
```json
{
  "matches": [
    {
      "id": "match_999",
      "matched_user": {
        "id": "user_456",
        "first_name": "Jane",
        "primary_photo": "https://cdn.example.com/photos/user_456_primary.jpg"
      },
      "compatibility_pct": 85,
      "unlocked_stage": "voice",
      "status": "matched",
      "last_message": {
        "content": "Hey! How are you?",
        "created_at": "2026-01-27T14:25:00Z",
        "from_user_id": "user_456"
      },
      "unread_count": 2,
      "created_at": "2026-01-27T14:00:00Z"
    }
  ],
  "total": 15
}
```

### GET /matches/:matchId/messages
Get messages for a match.

**Query Parameters:**
- `limit` (default: 50)
- `before` (message ID for pagination)

**Response (200):**
```json
{
  "messages": [
    {
      "id": "msg_1",
      "match_id": "match_999",
      "from_user_id": "user_456",
      "type": "text",
      "content": "Hey! How are you?",
      "created_at": "2026-01-27T14:25:00Z",
      "read": true
    },
    {
      "id": "msg_2",
      "match_id": "match_999",
      "from_user_id": "user_123",
      "type": "text",
      "content": "Great! How about you?",
      "created_at": "2026-01-27T14:26:00Z",
      "read": false
    }
  ],
  "has_more": false
}
```

### POST /matches/:matchId/messages
Send a message.

**Request Body:**
```json
{
  "type": "text",
  "content": "Looking forward to meeting you!"
}
```

**Response (201):**
```json
{
  "id": "msg_3",
  "match_id": "match_999",
  "from_user_id": "user_123",
  "type": "text",
  "content": "Looking forward to meeting you!",
  "created_at": "2026-01-27T14:30:00Z"
}
```

### POST /matches/:matchId/unlock
Attempt to unlock next communication stage.

**Response (200):**
```json
{
  "match_id": "match_999",
  "unlocked_stage": "voice",
  "message_count": 12,
  "can_unlock": true
}
```

**Response (403) - Cannot Unlock:**
```json
{
  "error": "unlock_requirements_not_met",
  "message": "You need 10 messages or Plus/Pro tier to unlock voice",
  "current_message_count": 8,
  "required_message_count": 10,
  "upgrade_available": true
}
```

---

## Safety Check-ins

### POST /safety/checkins
Start a safety check-in.

**Request Body:**
```json
{
  "meeting_with": "user_456",
  "expected_end": "2026-01-27T20:00:00Z",
  "auto_alert_minutes": 30,
  "emergency_contact_email": "friend@example.com"
}
```

**Response (201):**
```json
{
  "id": "checkin_111",
  "user_id": "user_123",
  "meeting_with": "user_456",
  "start_time": "2026-01-27T18:00:00Z",
  "expected_end": "2026-01-27T20:00:00Z",
  "auto_alert_minutes": 30,
  "status": "active"
}
```

### PATCH /safety/checkins/:checkinId/location
Update live location during check-in.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200):**
```json
{
  "id": "checkin_111",
  "live_lat": 40.7128,
  "live_lng": -74.0060,
  "updated_at": "2026-01-27T18:15:00Z"
}
```

### POST /safety/checkins/:checkinId/complete
Complete a check-in.

**Response (200):**
```json
{
  "id": "checkin_111",
  "status": "completed",
  "completed_at": "2026-01-27T19:30:00Z"
}
```

### POST /safety/checkins/:checkinId/sos
Trigger SOS alert.

**Response (200):**
```json
{
  "id": "checkin_111",
  "status": "escalated",
  "sos_triggered_at": "2026-01-27T18:45:00Z",
  "alerts_sent": ["friend@example.com"]
}
```

---

## Date Suggestions

### GET /dates/suggestions
Get date suggestions for user's city.

**Query Parameters:**
- `category` (optional: coffee, museum, park, dinner, all)
- `limit` (default: 10)

**Response (200):**
```json
{
  "suggestions": [
    {
      "id": "date_1",
      "name": "Blue Bottle Coffee",
      "category": "coffee",
      "city": "New York",
      "address": "450 W 15th St, New York, NY 10011",
      "avg_cost": "$5-10",
      "safety_rating": 4.8,
      "google_maps_url": "https://maps.google.com/?q=Blue+Bottle+Coffee+NYC"
    }
  ]
}
```

### POST /matches/:matchId/share-date
Share a date suggestion in chat.

**Request Body:**
```json
{
  "date_suggestion_id": "date_1"
}
```

**Response (201):**
```json
{
  "message_id": "msg_4",
  "type": "date_suggestion",
  "content": "How about Blue Bottle Coffee?"
}
```

---

## Reviews & Success Stories

### POST /reviews
Submit a review for a match.

**Request Body:**
```json
{
  "match_id": "match_999",
  "rating": 5,
  "headline": "Amazing connection!",
  "body": "We had such a great time on our first date. Highly recommend this app!"
}
```

**Response (201):**
```json
{
  "id": "review_1",
  "from_user_id": "user_123",
  "match_id": "match_999",
  "rating": 5,
  "headline": "Amazing connection!",
  "body": "We had such a great time on our first date. Highly recommend this app!",
  "approved": false,
  "created_at": "2026-01-27T14:30:00Z"
}
```

### GET /reviews
Get approved reviews (public).

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "review_1",
      "rating": 5,
      "headline": "Amazing connection!",
      "body": "We had such a great time...",
      "created_at": "2026-01-27T14:30:00Z"
    }
  ],
  "total": 150
}
```

---

## Subscriptions

### GET /subscriptions/plans
Get available subscription plans.

**Response (200):**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": {
        "daily_reveals": 10,
        "voice_unlock": "activity_based",
        "video_unlock": "activity_based"
      }
    },
    {
      "id": "plus",
      "name": "Plus",
      "price": 9.99,
      "price_id": "price_plus_monthly",
      "features": {
        "daily_reveals": 50,
        "voice_unlock": "immediate",
        "video_unlock": "activity_based",
        "daily_roses_kisses": 1
      }
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 19.99,
      "price_id": "price_pro_monthly",
      "features": {
        "daily_reveals": "unlimited",
        "voice_unlock": "immediate",
        "video_unlock": "immediate",
        "profile_boost": true
      }
    }
  ]
}
```

### POST /subscriptions/subscribe
Create a subscription.

**Request Body:**
```json
{
  "price_id": "price_plus_monthly",
  "payment_method_id": "pm_card_visa"
}
```

**Response (201):**
```json
{
  "subscription_id": "sub_123",
  "tier": "plus",
  "status": "active",
  "current_period_end": "2026-02-27T14:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {}
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions/tier)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Example Error Response
```json
{
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```
