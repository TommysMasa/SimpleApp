import { router, useLocalSearchParams } from 'expo-router';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import app from '../firebaseConfig';

export default function SignUpCode() {
  const params = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = getAuth(app);
  const verificationId = params.verificationId as string;
  const phone = params.phone as string;

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleVerify = async () => {
    if (!code || !verificationId) {
      showAlert('エラー', '認証コードを入力してください');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      setMessage('認証に成功しました');
      // Firestore検索は不要なので削除
      // 認証後、プロフィール入力画面にphoneを渡して遷移
      const phone10 = phone.replace(/[^0-9]/g, '').slice(-10);
      router.replace({ pathname: '/signup', params: { phone: phone10 } } as any);
    } catch (err: any) {
      setMessage(`エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* ホームに戻るボタン */}
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/')}> 
        <Text style={styles.homeButtonText}>ホームに戻る</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>認証コード入力</Text>
        <Text style={styles.subtitle}>SMSで届いた6桁の認証コードを入力してください</Text>
        <TextInput
          style={styles.input}
          placeholder="認証コード"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>認証</Text>
        </TouchableOpacity>
        {message ? <Text style={{ color: '#3AABD2', marginTop: 16 }}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#3AABD2',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#3AABD2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#3AABD2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 