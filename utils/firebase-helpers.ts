// firebase-helpers.ts
// Platform-specific Firebase helper functions
// Provides unified API for iOS (Firebase Web SDK) and Android (@react-native-firebase)

import { Platform } from 'react-native';
import { auth, firestore } from '../firebase';
import { auth as webAuth, db as webFirestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

/**
 * Get current authenticated user
 * Works on both iOS (Firebase Web SDK) and Android (@react-native-firebase)
 */
export const getCurrentUser = (): User | null => {
  if (Platform.OS === 'ios') {
    // iOS: Firebase Web SDK
    return webAuth.currentUser;
  } else {
    // Android: @react-native-firebase
    // Cast to Firebase Web SDK User type for compatibility
    return auth().currentUser as any as User | null;
  }
};

/**
 * Get server timestamp for Firestore
 * Works on both iOS (Firebase Web SDK) and Android (@react-native-firebase)
 */
export const getServerTimestamp = () => {
  if (Platform.OS === 'ios') {
    // iOS: Firebase Web SDK
    return serverTimestamp();
  } else {
    // Android: @react-native-firebase
    return firestore.FieldValue.serverTimestamp();
  }
};

/**
 * Get user document from Firestore
 * Works on both iOS (Firebase Web SDK) and Android (@react-native-firebase)
 */
export const getUserDocument = async (userId: string) => {
  if (Platform.OS === 'ios') {
    // iOS: Firebase Web SDK
    const userDoc = await getDoc(doc(webFirestore, 'users', userId));
    return userDoc.data();
  } else {
    // Android: @react-native-firebase
    const userDoc = await firestore().collection('users').doc(userId).get();
    return userDoc.data();
  }
};

/**
 * Set user document in Firestore
 * Works on both iOS (Firebase Web SDK) and Android (@react-native-firebase)
 */
export const setUserDocument = async (userId: string, data: any) => {
  if (Platform.OS === 'ios') {
    // iOS: Firebase Web SDK
    await setDoc(doc(webFirestore, 'users', userId), data);
  } else {
    // Android: @react-native-firebase
    await firestore().collection('users').doc(userId).set(data);
  }
};

/**
 * Update user document in Firestore
 * Works on both iOS (Firebase Web SDK) and Android (@react-native-firebase)
 */
export const updateUserDocument = async (userId: string, data: any) => {
  if (Platform.OS === 'ios') {
    // iOS: Firebase Web SDK
    await updateDoc(doc(webFirestore, 'users', userId), data);
  } else {
    // Android: @react-native-firebase
    await firestore().collection('users').doc(userId).update(data);
  }
};

