// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Note: Analytics is not always supported in Expo environments

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E",
  authDomain: "simpleapp-5c1c6.firebaseapp.com",
  projectId: "simpleapp-5c1c6",
  storageBucket: "simpleapp-5c1c6.firebasestorage.app",
  messagingSenderId: "640646199364",
  appId: "1:640646199364:web:ecaf77c3a4a88e08fca411",
  measurementId: "G-883DCFY09G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore with long-polling (bypass WebChannel issues)
export const db = getFirestore(app);

// Firebase接続テスト
console.log('🔄 Firebase初期化完了');
console.log('📱 Firebase Auth Domain:', firebaseConfig.authDomain);
console.log('🗄️ Firebase Project ID:', firebaseConfig.projectId);

export default app;
