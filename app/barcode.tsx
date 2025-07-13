import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#6B4E3D',
  secondary: '#5A8A7A',
  accent: '#8B7355',
  background: '#F7F5F3',
  surface: '#ffffff',
  text: '#2D1B14',
  textSecondary: '#64748b',
  success: '#5A8A7A',
  warning: '#D4A574',
  error: '#C4756B',
  shadow: 'rgba(45, 27, 20, 0.15)',
  cardBackground: '#4A6FA5',
  qrBackground: '#ffffff',
};

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

export default function Barcode() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, getUserData, loading: authLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [qrScaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        router.replace('/welcome');
        return;
      }

      try {
        setLoading(true);
        const data = await getUserData();
        if (data) {
          setUserData(data);
          // アニメーション開始
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 800,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            }),
          ]).start();
          
          // QRコードのスケールアニメーション
          setTimeout(() => {
            Animated.spring(qrScaleAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }, 400);
        }
      } catch (error) {
        console.error('❌ User data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, getUserData, authLoading]);

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading membership data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          </View>
          <Text style={styles.errorText}>Failed to load membership data</Text>
          <Text style={styles.errorSubText}>Please try logging out and logging back in</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.replace('/')}>
            <Ionicons name="arrow-back" size={20} color={COLORS.surface} />
            <Text style={styles.errorButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
            accessibilityLabel="Back to Menu"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Manga Lounge</Text>
            <Text style={styles.subtitle}>Membership Card</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.welcomeText}>
            {userData.displayName}'s
          </Text>
          <Text style={styles.membershipText}>
            Membership Card
          </Text>
        </View>

        {/* QR Code Container */}
        <Animated.View 
          style={[
            styles.qrContainer,
            {
              transform: [{ scale: qrScaleAnim }],
            }
          ]}
        >
          <QRCode
            value={userData.membershipId}
            size={160}
            color={COLORS.text}
            backgroundColor={COLORS.qrBackground}
            logo={undefined}
            logoSize={30}
            logoBackgroundColor="transparent"
          />
        </Animated.View>

        {/* Membership Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailValue}>{userData.membershipId}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Member since:</Text>
            <Text style={styles.detailValue}>
              {new Date(userData.createdAt).toLocaleDateString('en-US')}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: COLORS.success }]}>Active</Text>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.mainBackButton} 
          onPress={() => router.replace('/')}
          accessibilityLabel="Back to Menu"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.surface} />
          <Text style={styles.mainBackButtonText}>Back to Menu</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  userInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  membershipText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.qrBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignSelf: 'center',
  },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  mainBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 40,
  },
  mainBackButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
}); 