import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius } from '../utils/responsive';

export default function SMSVerification() {
  const params = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const verificationId = params.verificationId as string;
  const phoneNumber = params.phoneNumber as string;
  const inputRef = useRef<TextInput>(null);
  const [countdown, setCountdown] = useState(24);
  const [showLoading, setShowLoading] = useState(false);
  const [pendingCheck, setPendingCheck] = useState(false);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 認証成功後、認証状態が更新されたらユーザーデータをチェック
  React.useEffect(() => {
    if (pendingCheck) {
      const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          const cleanedPhone = phoneNumber.replace(/\s/g, '');
          try {
            const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
            const userData = userDoc.data();
            setShowLoading(false);
            setPendingCheck(false);
            if (userData) {
              // 既存ユーザー: ホーム画面に遷移
              router.replace('/');
            } else {
              // 新規ユーザー: 会員登録画面に遷移
              router.replace({ pathname: '/signup', params: { phone: cleanedPhone } } as any);
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            setShowLoading(false);
            setPendingCheck(false);
            setMessage('Error loading user data. Please try again.');
          }
        }
      });
      return () => unsubscribe();
    }
  }, [pendingCheck, phoneNumber]);

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
      const credential = auth.PhoneAuthProvider.credential(verificationId, codeToVerify);
      await auth().signInWithCredential(credential);
      // @react-native-firebase/authでサインイン成功
      // 認証状態の更新を待つため、pendingCheckを設定
      setShowLoading(true);
      setPendingCheck(true);
    } catch (err: any) {
      console.error('SMS verification error:', err);
      // Firebase error code for invalid verification code is 'auth/invalid-verification-code'
      let friendlyMessage = '';
      if (err.code === 'auth/invalid-verification-code' || (err.message && err.message.toLowerCase().includes('invalid verification code'))) {
        friendlyMessage = 'The verification code you entered is incorrect. Please try again.';
      } else if (err.code === 'auth/code-expired') {
        friendlyMessage = 'This verification code has expired. Please request a new one.';
      } else {
        friendlyMessage = err.message || 'An error occurred during verification. Please try again.';
      }
      setMessage(friendlyMessage);
      setShowLoading(false);
    } finally {
      setLoading(false);
    }
  };


  if (showLoading) {
    return <LoadingScreen />;
  }

  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: responsivePadding.horizontal,
              paddingTop: Math.max(insets.top, scaleSpacing(20)),
              paddingBottom: Math.max(insets.bottom, scaleSpacing(100)),
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <Text style={[styles.title, { fontSize: scaleFontSize(32), marginBottom: scaleSpacing(12) }]}>Verify your number</Text>
            <Text style={[styles.subtitle, { fontSize: scaleFontSize(16), marginBottom: scaleSpacing(8), lineHeight: scaleFontSize(22) }]}>
              Enter the code we've sent by text to{"\n"}
              <Text style={[styles.phone, { fontSize: scaleFontSize(18) }]}>{phoneNumber}</Text>.
            </Text>
            <TouchableOpacity onPress={() => {/* Change number logic */}}>
              <Text style={[styles.changeNumber, { marginBottom: responsiveMargin.large, marginTop: scaleSpacing(4), fontSize: scaleFontSize(16) }]}>Change number</Text>
            </TouchableOpacity>
            <View style={[styles.codeLabelRow, { marginBottom: scaleSpacing(8) }]}>
              <Text style={[styles.codeLabel, { fontSize: scaleFontSize(16) }]}>Code</Text>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={[styles.codeInputTouch, { marginBottom: responsiveMargin.large }]}
            >
              <View style={[styles.codeRow, { gap: scaleSpacing(12), marginBottom: scaleSpacing(8) }]}>
                {[...Array(6)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.codeBox,
                      code.length === i ? styles.codeBoxActive : null,
                      {
                        width: scaleSpacing(48),
                        height: scaleSpacing(56),
                        borderRadius: responsiveBorderRadius.small,
                      }
                    ]}
                  >
                    <Text style={[styles.codeText, { fontSize: scaleFontSize(28) }]}>{code[i] || ''}</Text>
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
            <Text style={[styles.arrivalText, { fontSize: scaleFontSize(15), marginBottom: scaleSpacing(8) }]}>This code should arrive within {countdown}s</Text>
            {message ? <Text style={[styles.message, { fontSize: scaleFontSize(15), marginBottom: scaleSpacing(8) }]}>{message}</Text> : null}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.sendButton,
            code.length === 6 && !loading ? styles.sendButtonActive : styles.sendButtonDisabled,
            {
              right: responsivePadding.horizontal,
              bottom: Math.max(insets.bottom, scaleSpacing(20)),
              width: scaleSpacing(56),
              height: scaleSpacing(56),
              borderRadius: scaleSpacing(28),
            }
          ]}
          onPress={() => handleVerify()}
          disabled={code.length !== 6 || loading}
        >
          <Ionicons name="arrow-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    color: '#222',
    textAlign: 'center',
  },
  phone: {
    fontWeight: 'bold',
    color: '#111',
  },
  changeNumber: {
    color: '#111',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  codeLabelRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  codeLabel: {
    color: '#222',
    fontWeight: '500',
  },
  codeInputTouch: {
    width: '100%',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  codeBox: {
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
    textAlign: 'center',
  },
  message: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  sendButton: {
    position: 'absolute',
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