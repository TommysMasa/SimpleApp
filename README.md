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
   # Firebase Client Configuration (These are safe to expose - they are public by design)
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   # EAS Build Configuration
   EAS_PROJECT_ID=your_eas_project_id
   ```
   
   **⚠️ Security Note**: The Firebase configuration values above are designed to be public and safe for client-side use. The actual security is enforced by Firestore Security Rules and Firebase Authentication. Never add truly sensitive information (like service account keys, admin SDK keys, or database passwords) to EXPO_PUBLIC_ variables.

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

- **Firebase Configuration**: Uses public environment variables (safe for client-side exposure)
- **Data Security**: Enforced through Firestore Security Rules and Firebase Authentication
- **Network Inspector**: Disabled in production builds for security
- **Debug Logs**: Removed from production code to prevent information leakage
- **Environment Variables**: Only use EXPO_PUBLIC_ prefix for values that are safe to expose
- **Version Control**: Never commit actual Firebase keys or sensitive data to version control
- **Client-Side Security**: Remember that all EXPO_PUBLIC_ variables are bundled with the app and visible to users

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
