export default {
  "expo": {
    "name": "Are You The One",
    "slug": "are-you-the-one",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B1538"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.areyoutheone.app",
      "buildNumber": "5",
      "infoPlist": {
        "NSCameraUsageDescription": "We need camera access for profile photos and video intros.",
        "NSMicrophoneUsageDescription": "We need microphone access for voice and video calls.",
        "NSPhotoLibraryUsageDescription": "We need photo library access to upload profile pictures.",
        "NSLocationWhenInUseUsageDescription": "We need your location for safety check-ins during dates.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location for safety check-ins during dates.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.areyoutheone.app",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-camera",
      "expo-location"
    ],
    "extra": {
      "eas": {
        "projectId": "f49f0d5b-5ee7-4f0e-ac2b-ae5ebc11f9c5"
      },
      "supabaseUrl": "https://jaspfotwnmjqqwoujnfm.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphc3Bmb3R3bm1qcXF3b3VqbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDM3NjMsImV4cCI6MjA1NjA3OTc2M30.JVwCGHVDdGTUKgZMqYCVlXwwzJjXWkMWbPQGQXLTMpg"
    }
  }
};
