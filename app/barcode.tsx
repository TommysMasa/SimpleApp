import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius } from '../utils/responsive';

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
  dateOfBirth: string;
  gender: string;
  email: string;
  membershipId: string;
  createdAt: string;
  updatedAt: string;
  isCheckedIn?: boolean;
  lastEntryTime?: any;
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
        // エラーログを削除（セキュリティ上の理由）
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, getUserData, authLoading]);

  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const insets = useSafeAreaInsets();

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { marginTop: scaleSpacing(20), fontSize: scaleFontSize(16) }]}>Loading membership data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.errorContainer, { paddingHorizontal: responsivePadding.horizontal }]}>
          <View style={[styles.errorIcon, { marginBottom: scaleSpacing(20) }]}>
            <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          </View>
          <Text style={[styles.errorText, { fontSize: scaleFontSize(18), marginBottom: scaleSpacing(12) }]}>Failed to load membership data</Text>
          <Text style={[styles.errorSubText, { fontSize: scaleFontSize(14), marginBottom: responsiveMargin.large, lineHeight: scaleFontSize(20) }]}>Please try logging out and logging back in</Text>
          <TouchableOpacity 
            style={[
              styles.errorButton, 
              {
                paddingHorizontal: responsiveMargin.large,
                paddingVertical: scaleSpacing(12),
                borderRadius: responsiveBorderRadius.medium,
                gap: scaleSpacing(8),
              }
            ]} 
            onPress={() => router.replace('/')}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.surface} />
            <Text style={[styles.errorButtonText, { fontSize: scaleFontSize(16) }]}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: responsivePadding.horizontal,
            paddingTop: Math.max(insets.top, responsiveMargin.medium),
            paddingBottom: Math.max(insets.bottom, responsiveMargin.large),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={[styles.header, { marginTop: 0, marginBottom: responsiveMargin.large }]}>
          <TouchableOpacity
            style={[styles.backButton, { padding: scaleSpacing(12) }]}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <View style={[styles.backButtonCircle, { borderRadius: scaleSpacing(20), width: scaleSpacing(40), height: scaleSpacing(40) }]}>
              <Ionicons name="arrow-back" size={24} color="#222" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTop}>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { fontSize: scaleFontSize(24) }]}>Manga Lounge</Text>
            <Text style={[styles.subtitle, { fontSize: scaleFontSize(14), marginTop: scaleSpacing(2) }]}>Membership Card</Text>
            </View>
          </View>
          <View style={[styles.headerSpacer, { width: scaleSpacing(40) }]} />
        </View>

        {/* User Info Card */}
        <View style={[
          styles.userInfoCard,
          {
            borderRadius: responsiveBorderRadius.large,
            padding: responsivePadding.horizontal,
            marginBottom: responsiveMargin.medium,
          }
        ]}>
          <View style={[styles.userIcon, { width: scaleSpacing(48), height: scaleSpacing(48), borderRadius: scaleSpacing(24), marginBottom: scaleSpacing(12) }]}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <Text style={[styles.welcomeText, { fontSize: scaleFontSize(18), marginBottom: scaleSpacing(4) }]}>
            {`${userData.firstName} ${userData.lastName}`.trim()}'s
          </Text>
          <Text style={[styles.membershipText, { fontSize: scaleFontSize(16) }]}>
            Membership Card
          </Text>
        </View>

        {/* QR Code Container */}
        <Animated.View 
          style={[
            styles.qrContainer,
            {
              transform: [{ scale: qrScaleAnim }],
              borderRadius: responsiveBorderRadius.large,
              padding: responsiveMargin.large,
              marginBottom: responsiveMargin.large,
            }
          ]}
        >
          <QRCode
            value={userData.membershipId}
            size={scaleSpacing(160)}
            color={COLORS.text}
            backgroundColor={COLORS.qrBackground}
            logo={undefined}
            logoSize={30}
            logoBackgroundColor="transparent"
          />
        </Animated.View>

        {/* Membership Details */}
        <View style={[
          styles.detailsContainer, 
          { 
            gap: responsiveMargin.medium,
            borderRadius: responsiveBorderRadius.large,
            padding: responsivePadding.horizontal,
            marginBottom: responsiveMargin.large,
          }
        ]}>
          <View style={[styles.detailItem, { gap: scaleSpacing(12) }]}>
            <Ionicons name={userData.isCheckedIn ? 'walk' : 'walk-outline'} size={18} color={userData.isCheckedIn ? COLORS.success : COLORS.textSecondary} />
            <Text style={[styles.detailLabel, { fontSize: scaleFontSize(14), minWidth: scaleSpacing(80) }]}>Status:</Text>
            <Text style={[styles.detailValue, { fontSize: scaleFontSize(14), color: userData.isCheckedIn ? COLORS.success : COLORS.textSecondary }]}> {userData.isCheckedIn ? 'Checked In' : 'Checked Out'} </Text>
          </View>
          <View style={[styles.detailItem, { gap: scaleSpacing(12) }]}>
            <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
            <Text style={[styles.detailLabel, { fontSize: scaleFontSize(14), minWidth: scaleSpacing(80) }]}>Entry Time:</Text>
            <Text style={[styles.detailValue, { fontSize: scaleFontSize(14) }]}>
              {userData.isCheckedIn && userData.lastEntryTime
                ? (() => {
                    let dateObj;
                    if (userData.lastEntryTime && typeof userData.lastEntryTime === 'object' && typeof userData.lastEntryTime.toDate === 'function') {
                      dateObj = userData.lastEntryTime.toDate();
                    } else {
                      dateObj = new Date(userData.lastEntryTime);
                    }
                    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()
                : '-'}
            </Text>
          </View>
        </View>
        </Animated.View>
      </ScrollView>
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
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
  },
  errorButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backButtonCircle: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSpacer: {
  },
  title: {
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userInfoCard: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userIcon: {
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  membershipText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.qrBackground,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignSelf: 'center',
  },
  detailsContainer: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
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