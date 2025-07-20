import {
    ConfirmationResult,
    RecaptchaVerifier,
    User,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

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
  sendPhoneVerification: (phoneNumber: string) => Promise<ConfirmationResult>;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setUser(user);
      setLoading(false);

    });

    return unsubscribe;
  }, []);

  const sendPhoneVerification = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      // Create RecaptchaVerifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
        }
      });

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };

  const signUp = async (userData: UserRegistrationData) => {
    try {
      const { firstName, lastName, dateOfBirth, gender, email, phone } = userData;
      // phone は国番号込みの形式 (+81.. など) でそのまま保存する
      const cleanedPhone = phone.replace(/\s/g, '');

      console.log('🔄 サインアップ開始:', { email, firstName, lastName, dateOfBirth, gender });

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.phoneNumber) {
        throw new Error('Phone-based user not authenticated');
      }
      console.log('✅ Phone auth user authenticated');

      // Firestoreに保存するデータを準備
      const firestoreData = {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone: cleanedPhone, // 国番号込みで保存
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // uidをドキュメントIDとして使用
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, firestoreData);
      
      // membershipIdをドキュメントに追加（uidと同じ値）
      await updateDoc(docRef, { membershipId: currentUser.uid });
      

      
      console.log('✅ Firestore ユーザードキュメント作成成功 (membershipId:', currentUser.uid, ')');

    } catch (error) {
      console.error('❌ サインアップエラー詳細:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 ログアウト処理開始');
      await signOut(auth);
      console.log('✅ Firebase signOut 完了');
      // onAuthStateChangedが自動的にuserをnullに設定する
    } catch (error) {
      console.error('❌ ログアウトエラー:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const getUserData = async (): Promise<UserData | null> => {
    try {
      if (!user) {
        console.log('ℹ️ ユーザーがログインしていません');
        return null;
      }
      
      console.log('🔄 ユーザーデータ取得開始:', user.uid);
      
      // uidをドキュメントIDとして直接アクセス
      try {
        console.log('🔍 uidでドキュメントアクセス試行:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
          console.log('✅ uidからユーザーデータ取得成功:', data);
        return data;
      } else {
          console.log('⚠️ uidのドキュメントが存在しません - 新規ユーザーの可能性');
        return null;
        }
      } catch (error) {
        console.log('⚠️ uidでの取得に失敗:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('❌ ユーザーデータ取得エラー:', error);
      console.error('❌ エラー詳細:', {
        user: user?.uid,
        errorCode: (error as any)?.code,
        errorMessage: (error as any)?.message
      });
      throw error;
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    
    // uidをドキュメントIDとして直接使用
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
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
    sendPhoneVerification,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 