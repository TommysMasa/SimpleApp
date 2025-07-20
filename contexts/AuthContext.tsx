import {
    ConfirmationResult,
    RecaptchaVerifier,
    User,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const signUp = async (userData: any) => {
    try {
      const currentUser = auth.currentUser;
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', currentUser.uid), userDoc);
    } catch (error) {
      console.error('Signup error:', error);
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
      await auth.signOut();
    } catch (error) {
      console.error('Signout error:', error);
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
    if (!user) {
      return null;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
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