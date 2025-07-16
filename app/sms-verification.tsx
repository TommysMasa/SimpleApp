import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import app from '../firebaseConfig';
import LoadingScreen from './LoadingScreen';

export default function SMSVerification() {
  const params = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = getAuth(app);
  const verificationId = params.verificationId as string;
  const phoneNumber = params.phoneNumber as string;
  const inputRef = useRef<TextInput>(null);
  const [countdown, setCountdown] = useState(24);
  const { getUserData, user } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [pendingCheck, setPendingCheck] = useState(false);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // 入力は数字のみ、最大6桁、順入力・順削除のみ
  const handleChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 6) cleaned = cleaned.slice(0, 6);
    setCode(cleaned);
    // 6桁入力時に自動遷移
    if (cleaned.length === 6 && !loading) {
      setTimeout(() => {
        handleVerify(cleaned); // ← ここで渡す
      }, 100); // 少し遅延を入れてキーボードイベントと競合しないように
    }
  };

  const handleVerify = async (inputCode?: string) => {
    const codeToVerify = inputCode ?? code;
    if (codeToVerify.length !== 6 || !verificationId) {
      showAlert('エラー', '認証コードを6桁入力してください');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const credential = PhoneAuthProvider.credential(verificationId, codeToVerify);
      await signInWithCredential(auth, credential);
      setShowLoading(true);
      setPendingCheck(true);
    } catch (err: any) {
      // Firebase error code for invalid verification code is 'auth/invalid-verification-code'
      let friendlyMessage = '';
      if (err.code === 'auth/invalid-verification-code' || (err.message && err.message.toLowerCase().includes('invalid verification code'))) {
        friendlyMessage = 'The verification code you entered is incorrect. Please try again.';
      } else if (err.code === 'auth/code-expired') {
        friendlyMessage = 'This verification code has expired. Please request a new one.';
      } else {
        friendlyMessage = 'An error occurred during verification. Please try again.';
      }
      setMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (pendingCheck && user) {
      (async () => {
        const cleanedPhone = phoneNumber.replace(/\s/g, ''); // keep '+' and digits
        const userData = await getUserData();
        setShowLoading(false);
        setPendingCheck(false);
        if (userData) {
          router.replace('/');
        } else {
          router.replace({ pathname: '/signup', params: { phone: cleanedPhone } } as any);
        }
      })();
    }
  }, [pendingCheck, user]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the code we’ve sent by text to{"\n"}
            <Text style={styles.phone}>{phoneNumber}</Text>.
          </Text>
          <TouchableOpacity onPress={() => {/* Change number logic */}}>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>
          <View style={styles.codeLabelRow}>
            <Text style={styles.codeLabel}>Code</Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.codeInputTouch}
          >
            <View style={styles.codeRow}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    code.length === i ? styles.codeBoxActive : null,
                  ]}
                >
                  <Text style={styles.codeText}>{code[i] || ''}</Text>
                </View>
            ))}
          </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              caretHidden={true}
              autoFocus
              selection={{ start: code.length, end: code.length }}
              contextMenuHidden={true}
              importantForAutofill="no"
              autoComplete="off"
              textContentType="oneTimeCode"
            />
          </TouchableOpacity>
          <Text style={styles.arrivalText}>This code should arrive within {countdown}s</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity
            style={[
              styles.sendButton,
              code.length === 6 && !loading ? styles.sendButtonActive : styles.sendButtonDisabled
            ]}
            onPress={() => handleVerify()}
            disabled={code.length !== 6 || loading}
          >
            <Ionicons name="arrow-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    position: 'relative', // Added for absolute positioning of send button
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  phone: {
    fontWeight: 'bold',
    color: '#111',
    fontSize: 18,
  },
  changeNumber: {
    color: '#111',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 24,
    marginTop: 4,
    fontSize: 16,
    textAlign: 'center',
  },
  codeLabelRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  codeLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  codeInputTouch: {
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#222',
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderColor: '#2563eb',
    backgroundColor: '#e0e7ff',
  },
  codeText: {
    fontSize: 28,
    color: '#111',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  arrivalText: {
    color: '#444',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#FF6B6B',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  sendButton: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#111',
  },
  sendButtonDisabled: {
    backgroundColor: '#bbb',
    opacity: 0.5,
  },
}); 