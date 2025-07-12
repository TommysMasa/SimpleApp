import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Welcome() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🔄 Welcome useEffect:', { user: user?.uid || 'null', loading });
    if (!loading && user) {
      // ユーザーがログイン済みの場合はメニュー画面へ
      console.log('✅ Welcome: ログイン済みユーザーをメニューにリダイレクト');
      router.replace('/');
    }
  }, [user, loading]);
  const handleLoginPress = () => {
    router.push('/login');
  };

  const handleSignUpPress = () => {
    router.push('/signup-phone');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <View style={styles.logoSection}>
          <Text style={styles.title}>Manga Lounge</Text>
          <Text style={styles.subtitle}>マンガを楽しむための会員アプリ</Text>
        </View>

        {/* Illustration or Icon */}
        <View style={styles.illustrationSection}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationIcon}>📚</Text>
            <Text style={styles.illustrationText}>読書体験をもっと便利に</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLoginPress}>
            <Text style={styles.primaryButtonText}>ログイン</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignUpPress}>
            <Text style={styles.secondaryButtonText}>新規登録</Text>
          </TouchableOpacity>
        </View>

        {/* Debug button removed */}
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator}>
        <View style={styles.homeIndicatorBar} />
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
    padding: 32,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  illustrationPlaceholder: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    minWidth: 200,
  },
  illustrationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  illustrationText: {
    fontSize: 16,
    color: '#3AABD2',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonSection: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#3AABD2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3AABD2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3AABD2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeIndicator: {
    alignItems: 'center',
    paddingBottom: 21,
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 100,
  },
}); 