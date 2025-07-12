import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    console.log('🔄 Index useEffect:', { user: user?.uid || 'null', loading });
    if (!loading && !user) {
      // ユーザーがログインしていない場合はウェルカム画面へ
      console.log('✅ Index: 未ログインユーザーをwelcomeにリダイレクト');
      router.replace('/welcome');
    }
  }, [user, loading]);

  const handleMembershipPress = () => {
    router.push('/barcode');
  };

  const handleContactPress = () => {
    // TODO: Implement contact functionality
    console.log('Contact pressed');
  };

  const showAlert = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}: ${message}`);
      if (confirmed) {
        onConfirm();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'OK', onPress: onConfirm }
        ]
      );
    }
  };

  const handleLogout = async () => {
    console.log('🔄 ログアウトボタンが押されました');
    
    showAlert('確認', 'ログアウトしますか？', async () => {
      try {
        console.log('🔄 ログアウト処理開始');
        await logout();
        console.log('✅ ログアウト成功');
        // ログアウト後の遷移はuseEffectに任せる（明示的なリダイレクトを削除）
      } catch (error) {
        console.error('❌ ログアウトエラー:', error);
        if (Platform.OS === 'web') {
          window.alert('ログアウトに失敗しました');
        } else {
          Alert.alert('エラー', 'ログアウトに失敗しました');
        }
      }
    });
  };

  // 認証状態をチェック中の場合
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AABD2" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </SafeAreaView>
    );
  }

  // ユーザーがログインしていない場合（一瞬表示される可能性があるため）
  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>リダイレクト中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manga Lounge</Text>
        <Text style={styles.welcomeText}>ようこそ、{user.displayName || user.email}さん</Text>
        
        {/* ログアウトボタン */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Membership Barcode Section */}
        <TouchableOpacity style={styles.menuCard} onPress={handleMembershipPress}>
          <View style={styles.cardContent}>
            <Image 
              source={require('../assets/images/license-icon.png')} 
              style={styles.cardIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardTitle}>Membership Barcode</Text>
        </TouchableOpacity>

        {/* Contact Section */}
        <TouchableOpacity style={styles.menuCard} onPress={handleContactPress}>
          <View style={styles.cardContent}>
            <Image 
              source={require('../assets/images/mail-icon.png')} 
              style={styles.cardIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.cardTitle}>Contact</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: -0.24,
    color: '#000000',
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#3AABD2',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 86,
    paddingTop: 56,
    gap: 30,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'rgba(176, 176, 176, 0.5)',
    borderRadius: 20,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    width: 65,
    height: 65,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#3AABD2',
    textAlign: 'center',
    position: 'absolute',
    bottom: 12,
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
