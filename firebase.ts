// firebase.ts
// Platform-specific Firebase SDK exports
// iOS: Firebase Web SDK (firebaseConfig.js)
// Android: @react-native-firebase

import { Platform } from 'react-native';

// Import both SDKs at top level (only the one for current platform will be used)
// iOS imports
import { auth as iosAuth, db as iosFirestore, app as iosApp } from './firebaseConfig';
import type { User as IOSUser } from 'firebase/auth';

// Android imports (only loaded on Android due to conditional require)
let androidAuth: any;
let androidFirestore: any;
let AndroidFirebaseAuthTypes: any;

if (Platform.OS !== 'ios') {
  // Android: @react-native-firebase (existing implementation - DO NOT CHANGE)
  require('@react-native-firebase/app');
  androidAuth = require('@react-native-firebase/auth').default;
  androidFirestore = require('@react-native-firebase/firestore').default;
  AndroidFirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
}

// Platform-specific exports
export const auth = Platform.OS === 'ios' ? iosAuth : androidAuth;
export const firestore = Platform.OS === 'ios' ? iosFirestore : androidFirestore;
export const app = Platform.OS === 'ios' ? iosApp : undefined;

// Type exports - unified User type for cross-platform compatibility
// Both iOS (Firebase Web SDK) and Android (@react-native-firebase) User types
// are compatible enough to use Firebase Web SDK's User type as the base
export type { User as FirebaseAuthTypes } from 'firebase/auth';

// Re-export Firebase Web SDK User type for consistency
// Android users will be cast to this type for compatibility
export type { User } from 'firebase/auth';

