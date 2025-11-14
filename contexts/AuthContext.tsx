import {
    User,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from 'firebase/auth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth as webAuth } from '../firebaseConfig';

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
    // @react-native-firebase/authの認証状態を監視
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      // Firebase Web SDKのUser型に変換（互換性のため）
      setUser(firebaseUser as any);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (userData: any) => {
    try {
      const currentUser = auth().currentUser;
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
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // @react-native-firebase/firestoreを使用
      await firestore().collection('users').doc(currentUser.uid).set(userDoc);
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
      await auth().signOut();
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
    // @react-native-firebase/authの現在のユーザーを直接取得
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) {
      return null;
    }

    try {
      // @react-native-firebase/firestoreを使用
      const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
      const userData = userDoc.data();
      
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
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) throw new Error('No user logged in');
    
    // @react-native-firebase/firestoreを使用
    await firestore().collection('users').doc(firebaseUser.uid).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
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