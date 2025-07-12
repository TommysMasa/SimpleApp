import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  phone: string; // 追加
}

interface UserData {
  firstName: string;
  lastName: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  membershipId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: UserRegistrationData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserData: () => Promise<UserData | null>;
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

  // membershipIDの重複チェック関数
  const checkMembershipIdExists = async (membershipId: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'users'), where('membershipId', '==', membershipId));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ membershipID重複チェックエラー:', error);
      return false; // エラーの場合は重複なしとして処理を続行
    }
  };

  // ユニークなmembershipIDを生成する関数
  const generateUniqueMembershipId = async (): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 10; // 最大試行回数を増やす
    
    while (attempts < maxAttempts) {
      // シンプルにランダムな10桁の数字を生成
      const randomNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      const membershipId = randomNumber;
      
      // 重複チェック
      const exists = await checkMembershipIdExists(membershipId);
      if (!exists) {
        console.log('✅ ユニークなmembershipID生成成功:', membershipId);
        return membershipId;
      }
      
      attempts++;
      console.log(`⚠️ membershipID重複検出 (試行 ${attempts}/${maxAttempts}):`, membershipId);
    }
    
    // 最大試行回数に達した場合、フォールバック
    throw new Error('ユニークなmembershipIDの生成に失敗しました');
  };

  const signUp = async (userData: UserRegistrationData) => {
    try {
      const { firstName, lastName, dateOfBirth, gender, email, password, phone } = userData;
      const displayName = `${firstName} ${lastName}`;

      console.log('🔄 サインアップ開始:', { email, firstName, lastName, dateOfBirth, gender });
      // Firebase Authenticationでユーザー作成
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase Auth ユーザー作成成功:', user.uid);

      // Update user profile with display name
      await updateProfile(user, { displayName });
      console.log('✅ ユーザープロフィール更新成功');

      // 完全にユニークなmembershipID生成（重複チェック付き）
      const membershipId = await generateUniqueMembershipId();

      // Firestoreに保存するデータを準備
      const firestoreData = {
        firstName,
        lastName,
        displayName,
        dateOfBirth,
        gender,
        email,
        phone, // 再び送信する
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipId,
        isActive: true,
      };

      // Create user document in Firestore with all user data
      await setDoc(doc(db, 'users', user.uid), firestoreData);
      console.log('✅ Firestore ユーザードキュメント作成成功');

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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        console.log('✅ ユーザーデータ取得成功:', data);
        return data;
      } else {
        console.log('⚠️ ユーザードキュメントが見つかりません');
        return null;
      }
    } catch (error) {
      console.error('❌ ユーザーデータ取得エラー:', error);
      throw error;
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 