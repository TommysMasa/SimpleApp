import {
    ConfirmationResult,
    RecaptchaVerifier,
    User,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    updateProfile
} from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
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
  displayName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  membershipId: string;
  uid: string; // Firebase Authのuid
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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
  const [userDocId, setUserDocId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      setUser(user);
      setLoading(false);
      // ユーザーがログアウトした場合、ドキュメントIDもクリア
      if (!user) {
        setUserDocId(null);
      }
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
      const displayName = `${firstName} ${lastName}`;

      console.log('🔄 サインアップ開始:', { email, firstName, lastName, dateOfBirth, gender });

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.phoneNumber) {
        throw new Error('Phone-based user not authenticated');
      }
      // Update displayName only
      await updateProfile(currentUser, { displayName });
      console.log('✅ Phone auth user profile updated');

      // Firestoreに保存するデータを準備
      const firestoreData = {
        firstName,
        lastName,
        displayName,
        dateOfBirth,
        gender,
        email,
        phone: cleanedPhone, // 国番号込みで保存
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uid: currentUser.uid, // Firebase Authのuid
        isActive: true,
      };

      // Firestoreが自動生成するドキュメントIDをmembershipIdとして使用
      const docRef = await addDoc(collection(db, 'users'), firestoreData);
      const membershipId = docRef.id;
      
      // membershipIdをドキュメントに追加
      await updateDoc(docRef, { membershipId });
      
      // ドキュメントIDを保存
      setUserDocId(membershipId);
      
      console.log('✅ Firestore ユーザードキュメント作成成功 (membershipId:', membershipId, ')');

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
      console.log('📋 保存されたドキュメントID:', userDocId);
      
      // 保存されたドキュメントIDがある場合は直接使用
      if (userDocId) {
        try {
          console.log('🔍 保存されたドキュメントIDでアクセス試行:', userDocId);
          const userDoc = await getDoc(doc(db, 'users', userDocId));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            console.log('✅ 保存されたドキュメントIDからユーザーデータ取得成功:', data);
            return data;
          } else {
            console.log('⚠️ 保存されたドキュメントIDのドキュメントが存在しません');
          }
        } catch (error) {
          console.log('⚠️ 保存されたドキュメントIDでの取得に失敗:', error);
        }
      }
      
      // ドキュメントIDが見つからない場合、uidでクエリを実行
      console.log('🔍 uidでクエリ実行試行:', user.uid);
      try {
        const uidQuery = query(
          collection(db, 'users'), 
          where('uid', '==', user.uid),
          limit(1)  // 明示的にlimitを設定
        );
        const uidQuerySnapshot = await getDocs(uidQuery);
        
        if (uidQuerySnapshot.empty) {
          console.log('⚠️ uidでドキュメントが見つかりません - 新規ユーザーの可能性');
          return null;
        }
        
        // ドキュメントを取得
        const userDoc = uidQuerySnapshot.docs[0];
        const data = userDoc.data() as UserData;
        
        // ドキュメントIDを保存
        setUserDocId(userDoc.id);
        
        console.log('✅ クエリからユーザーデータ取得成功:', data);
        return data;
      } catch (queryError: any) {
        if (queryError.code === 'permission-denied') {
          console.log('⚠️ 権限エラー - 新規ユーザーの可能性');
          return null;
        }
        throw queryError;
      }
      
    } catch (error) {
      console.error('❌ ユーザーデータ取得エラー:', error);
      console.error('❌ エラー詳細:', {
        user: user?.uid,
        userDocId,
        errorCode: (error as any)?.code,
        errorMessage: (error as any)?.message
      });
      throw error;
    }
  };

  // ユーザーがログインした時にドキュメントIDを取得する関数
  const fetchUserDocId = async (uid: string) => {
    try {
      console.log('🔍 ユーザーログイン時のドキュメントID取得開始:', uid);
      const uidQuery = query(
        collection(db, 'users'), 
        where('uid', '==', uid),
        limit(1)  // 明示的にlimitを設定
      );
      const uidQuerySnapshot = await getDocs(uidQuery);
      
      if (!uidQuerySnapshot.empty) {
        const docId = uidQuerySnapshot.docs[0].id;
        setUserDocId(docId);
        console.log('✅ ドキュメントID取得成功:', docId);
        return docId;
      } else {
        console.log('⚠️ ユーザーのドキュメントが見つかりません - 新規ユーザーの可能性');
        return null;
      }
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.log('⚠️ 権限エラー - 新規ユーザーの可能性');
        return null;
      }
      console.error('❌ ドキュメントID取得エラー:', error);
      return null;
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    
    let docId = userDocId;
    
    // 保存されたドキュメントIDがない場合、uidでクエリを実行
    if (!docId) {
      const uidQuery = query(
        collection(db, 'users'), 
        where('uid', '==', user.uid),
        limit(1)  // 明示的にlimitを設定
      );
      const uidQuerySnapshot = await getDocs(uidQuery);
      
      if (uidQuerySnapshot.empty) {
        throw new Error('User document not found');
      }
      
      docId = uidQuerySnapshot.docs[0].id;
      setUserDocId(docId);
    }
    
    // ドキュメントを更新
    const userRef = doc(db, 'users', docId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    if (updates.firstName || updates.lastName) {
      const displayName = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
      if (displayName) {
        await updateProfile(user, { displayName });
      }
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
    sendPhoneVerification,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 