# Push Notifications Configuration Guide

The app is already configured with `expo-notifications`. To enable real push notifications on physical devices (TestFlight / Play Store), you must complete the following configuration steps.

## 1. Expo Dashboard Setup
1. Go to [expo.dev](https://expo.dev) and log in.
2. Select your project: `are-you-the-one`.
3. Go to **Credentials** in the left sidebar.

## 2. iOS (Apple) Configuration
1. Under **iOS**, click "Add a new credential" or edit existing.
2. You need to provide an **Apple Push Notifications service (APNs) Key**:
   - Go to [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**.
   - Select **Keys** and click the **+** (plus) button.
   - Name it "Push Key" and enable **Apple Push Notifications service (APNs)**.
   - Download the `.p8` file.
   - Note your **Key ID** and **Team ID**.
3. Upload the `.p8` file, Key ID, and Team ID to the Expo Dashboard under **Push Key**.

## 3. Android (Google) Configuration
1. Go to the [Firebase Protocol](https://console.firebase.google.com/).
2. Create or select your project.
3. Go to **Project Settings** → **Cloud Messaging**.
4. Enable the **Cloud Messaging API (Legacy)** if required, or set up **Firebase Cloud Messaging API (V1)**.
5. Generate a **Service Account Key** (JSON file).
6. Upload this JSON file to the Expo Dashboard under **Android** → **Google Service Account Key**.

## 4. Triggering Notifications
The app sends the FCM/APNs token to Supabase during login. To actually send messages, you can use:
1. **Supabase Edge Functions**: Trigger an HTTP call to Expo's push URL (`https://exp.host/--/api/v2/push/send`) when a new row is added to the `messages` table.
2. **External Server**: Use your Laravel API to send notifications using the tokens stored in the `user_settings` table.

## 5. Testing
- Use the [Expo Push Tool](https://expo.dev/notifications) to send test notifications to your device.
- You will need your Expo Push Token (printed in the console or stored in the `user_settings` table in Supabase).
