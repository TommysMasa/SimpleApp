# Manga Lounge App

A React Native app built with Expo and Firebase for manga lounge membership management.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   Create a `.env` file with your Firebase configuration:
   ```bash
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   EAS_PROJECT_ID=your_eas_project_id
   ```

3. Start the app

   ```bash
   npx expo start
   ```

## Build Configuration

### Development
- Network inspector enabled for debugging
- Development client enabled
- Internal distribution

### Production
- Network inspector disabled for security
- No development client
- App Store distribution

### Build Commands
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

## Security

- Firebase configuration uses public environment variables (safe for client-side)
- Security is enforced through Firestore Security Rules
- Network inspector is disabled in production builds
- Debug logs are removed from production code
- **Never commit your actual Firebase keys to version control**

## Features

- Phone number authentication
- Membership management
- QR code generation
- Real-time status updates
- Contact form
- Profile management

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Firebase documentation](https://firebase.google.com/docs)
- [React Native documentation](https://reactnative.dev/)
