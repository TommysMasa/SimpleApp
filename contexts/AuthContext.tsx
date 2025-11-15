import {
    User,
    onAuthStateChanged as webOnAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { Platform } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
// Platform-specific Firebase imports via firebase.ts
import { auth, firestore } from '../firebase';
// Firebase Web SDK imports for iOS-specific operations
import { auth as webAuth, db as webFirestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string; // 追加
}

interface UserData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  membershipId: string;
  createdAt: string;
  updatedAt: string;
  isCheckedIn?: boolean;
  lastEntryTime?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: UserRegistrationData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserData: () => Promise<UserData | null>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Platform-specific auth state monitoring
    let unsubscribe: (() => void) | undefined;

    if (Platform.OS === 'ios') {
      // iOS: Firebase Web SDK
      unsubscribe = webOnAuthStateChanged(webAuth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
    } else {
      // Android: @react-native-firebase
      unsubscribe = auth().onAuthStateChanged((firebaseUser: any) => {
        // Convert to Firebase Web SDK User type for compatibility
        setUser(firebaseUser as any);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUp = async (userData: any) => {
    try {
      let currentUser: any;
      if (Platform.OS === 'ios') {
        // iOS: Firebase Web SDK
        currentUser = webAuth.currentUser;
      } else {
        // Android: @react-native-firebase
        currentUser = auth().currentUser;
      }

      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const userDoc = {
        membershipId: currentUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        phone: userData.phone,
        createdAt: Platform.OS === 'ios' ? serverTimestamp() : firestore.FieldValue.serverTimestamp(),
        updatedAt: Platform.OS === 'ios' ? serverTimestamp() : firestore.FieldValue.serverTimestamp(),
      };

      // Platform-specific Firestore operations
      if (Platform.OS === 'ios') {
        // iOS: Firebase Web SDK
        await setDoc(doc(webFirestore, 'users', currentUser.uid), userDoc);
      } else {
        // Android: @react-native-firebase
        await firestore().collection('users').doc(currentUser.uid).set(userDoc);
      }
    } catch (error) {
      // エラーログを削除（セキュリティ上の理由）
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(webAuth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Firebase Web SDK
        await webAuth.signOut();
      } else {
        // Android: @react-native-firebase
        await auth().signOut();
      }
    } catch (error) {
      // エラーログを削除（セキュリティ上の理由）
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(webAuth, email);
    } catch (error) {
      throw error;
    }
  };

  const getUserData = async (): Promise<UserData | null> => {
    // Platform-specific user retrieval
    let firebaseUser: any;
    if (Platform.OS === 'ios') {
      // iOS: Firebase Web SDK
      firebaseUser = webAuth.currentUser;
    } else {
      // Android: @react-native-firebase
      firebaseUser = auth().currentUser;
    }

    if (!firebaseUser) {
      return null;
    }

    try {
      // Platform-specific Firestore operations
      let userData: any;
      if (Platform.OS === 'ios') {
        // iOS: Firebase Web SDK
        const userDoc = await getDoc(doc(webFirestore, 'users', firebaseUser.uid));
        userData = userDoc.data();
      } else {
        // Android: @react-native-firebase
        const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
        userData = userDoc.data();
      }
      
      if (userData) {
        return userData as UserData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    // Platform-specific user retrieval
    let firebaseUser: any;
    if (Platform.OS === 'ios') {
      // iOS: Firebase Web SDK
      firebaseUser = webAuth.currentUser;
    } else {
      // Android: @react-native-firebase
      firebaseUser = auth().currentUser;
    }

    if (!firebaseUser) throw new Error('No user logged in');
    
    // Platform-specific Firestore operations
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (Platform.OS === 'ios') {
      // iOS: Firebase Web SDK
      await updateDoc(doc(webFirestore, 'users', firebaseUser.uid), updateData);
    } else {
      // Android: @react-native-firebase
      await firestore().collection('users').doc(firebaseUser.uid).update(updateData);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    resetPassword,
    getUserData,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 