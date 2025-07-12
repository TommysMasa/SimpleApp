import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signIn } = useAuth();

  useEffect(() => {
    // すでにログインしている場合はメニュー画面へ
    if (user) {
      router.replace('/');
    }
  }, [user]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('エラー', '有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    
    try {
      await signIn(email, password);
      console.log('✅ ログイン成功');
      
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      
      const authError = error as any;
      let errorMessage = 'ログインに失敗しました';
      
      // Firebase Auth v9+ のエラーコード
      if (authError.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスで登録されたアカウントが見つかりません';
      } else if (authError.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (authError.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効化されています';
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく時間をおいてから再試行してください';
      } else if (authError.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーです。インターネット接続を確認してください';
      } else if (authError.code === 'auth/invalid-credential') {
        errorMessage = 'メールアドレスまたはパスワードが間違っています';
      }
      
      showAlert('ログインエラー', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpNavigation = () => {
    router.push('/signup');
  };

  // すでにログインしている場合
  if (user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AABD2" />
        <Text style={styles.loadingText}>メニューに移動中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Manga Lounge</Text>
        <Text style={styles.subtitle}>ログイン</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleSignUpNavigation}
          >
            <Text style={styles.linkText}>アカウントをお持ちでない方はこちら</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
    color: '#3AABD2',
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#3AABD2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#3AABD2',
    fontSize: 14,
  },
}); 