import {
    ConfirmationResult,
    EmailAuthProvider,
    RecaptchaVerifier,
    User,
    createUserWithEmailAndPassword,
    linkWithCredential,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber,
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
      const { firstName, lastName, dateOfBirth, gender, email, password, phone } = userData;
      // phoneは10桁数字だけで保存する（+1など国番号は除去）
      const phone10 = phone.replace(/[^0-9]/g, '').slice(-10);
      const displayName = `${firstName} ${lastName}`;

      console.log('🔄 サインアップ開始:', { email, firstName, lastName, dateOfBirth, gender });

      let currentUser = auth.currentUser;
      if (currentUser && currentUser.phoneNumber) {
        // 電話番号認証済みユーザーが存在する場合はメール認証をリンク
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(currentUser, credential);
        await updateProfile(currentUser, { displayName });
        console.log('✅ 電話番号ユーザーにメール認証をリンク');
      } else {
        // 通常のメールアドレス新規登録
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName });
        currentUser = user;
        console.log('✅ Firebase Auth ユーザー作成成功:', user.uid);
      }

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
        phone: phone10, // 10桁数字だけで保存
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        membershipId,
        isActive: true,
      };

      // Create user document in Firestore with all user data
      await setDoc(doc(db, 'users', currentUser.uid), firestoreData);
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

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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