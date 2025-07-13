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
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = getAuth(app);
  const verificationId = params.verificationId as string;
  const phoneNumber = params.phoneNumber as string;
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [countdown, setCountdown] = useState(24);
  const { getUserData, user } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const [pendingCheck, setPendingCheck] = useState(false);

  React.useEffect(() => {
    // カウントダウンタイマー
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

  const handleCodeChange = (text: string, idx: number) => {
    if (!/^[0-9]?$/.test(text)) return; // 1桁数字のみ
    const newCode = [...code];
    newCode[idx] = text;
    setCode(newCode);
    if (text && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (text === '' && idx > 0) {
      // バックスペースで前に戻る
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[idx] === '' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6 || !verificationId) {
      showAlert('エラー', '認証コードを6桁入力してください');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const credential = PhoneAuthProvider.credential(verificationId, codeStr);
      await signInWithCredential(auth, credential);
      setShowLoading(true);
      setPendingCheck(true);
    } catch (err: any) {
      setMessage(`エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // userがセットされたタイミングでFirestore検索＆遷移
  React.useEffect(() => {
    if (pendingCheck && user) {
      (async () => {
        const phone10 = phoneNumber.replace(/[^0-9]/g, '').slice(-10);
        const userData = await getUserData();
        setShowLoading(false);
        setPendingCheck(false);
        if (userData) {
          router.replace('/');
        } else {
          router.replace({ pathname: '/signup', params: { phone: phone10 } } as any);
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inner}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the code we’ve sent by text to{"\n"}
            <Text style={styles.phone}>{phoneNumber}</Text>.
          </Text>
          <TouchableOpacity>
            <Text style={styles.changeNumber}>Change number</Text>
          </TouchableOpacity>
          <View style={styles.codeLabelRow}>
            <Text style={styles.codeLabel}>Code</Text>
          </View>
          <View style={styles.codeInputRow}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                style={[styles.codeInput, digit ? styles.codeInputFilled : null, inputRefs.current[idx]?.isFocused() ? styles.codeInputActive : null]}
                value={digit}
                onChangeText={text => handleCodeChange(text, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={idx === 0}
                returnKeyType="done"
              />
            ))}
          </View>
          <Text style={styles.arrivalText}>This code should arrive within {countdown}s</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity
            style={[styles.sendButton, code.join('').length === 6 && !loading ? styles.sendButtonActive : styles.sendButtonDisabled]}
            onPress={handleVerify}
            disabled={code.join('').length !== 6 || loading}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontWeight: 'bold',
    color: '#111',
  },
  changeNumber: {
    color: '#111',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 24,
    marginTop: 4,
    fontSize: 16,
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
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginHorizontal: 2,
  },
  codeInputFilled: {
    borderColor: '#111',
    backgroundColor: '#f3f3f3',
  },
  codeInputActive: {
    borderColor: '#222',
    backgroundColor: '#e0e7ff',
  },
  arrivalText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 32,
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
  },
  message: {
    color: '#3AABD2',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
}); 