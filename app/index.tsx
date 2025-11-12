import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

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
  membershipText: '#ffffff',
  contactText: '#F0F8FF',
};

export default function Index() {
  const { user, loading, logout, getUserData } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [showToastState, setShowToastState] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim1] = useState(new Animated.Value(0.8));
  const [scaleAnim2] = useState(new Animated.Value(0.8));
  const [profile, setProfile] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const check = async () => {
      if (!loading) {
        if (!user) {
          router.replace('/welcome');
        } else {
          setCheckingProfile(true);
          const profileData = await getUserData();
          if (!profileData) {
            router.replace({ pathname: '/signup', params: { phone: user?.phoneNumber || '' } });
          } else {
            setProfile(profileData);
            setCheckingProfile(false);
            
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
            
            Animated.stagger(200, [
              Animated.spring(scaleAnim1, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim2, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      }
    };
    check();
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!user) return;
      setCheckingProfile(true);
      const profileData = await getUserData();
      setProfile(profileData);
      setCheckingProfile(false);
    });
    return unsubscribe;
  }, [navigation, user]);

  const handleMembershipPress = () => {
    router.push('/barcode');
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg(message);
    setToastType(type);
    setShowToastState(true);
    setTimeout(() => setShowToastState(false), 2000);
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
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: onConfirm, style: 'destructive' }
        ]
      );
    }
  };

  const handleLogout = async () => {
    showAlert('Logout', 'Are you sure you want to logout?', async () => {
      try {
        await logout();
        displayToast('Successfully logged out', 'success');
      } catch (error) {
        displayToast('Logout failed', 'error');
      }
    });
  };

  if (loading || checkingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getToastColor = () => {
    switch (toastType) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: responsivePadding.horizontal,
            paddingTop: Math.max(insets.top, responsiveMargin.medium),
            paddingBottom: Math.max(insets.bottom, responsiveMargin.medium),
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
          <View style={[styles.headerTop, { marginBottom: responsiveMargin.medium }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.logo, { fontSize: scaleFontSize(32) }]}>Manga Lounge</Text>
              <Text style={[styles.subtitle, { fontSize: scaleFontSize(16), marginTop: scaleSpacing(4) }]}>Your Digital Experience</Text>
            </View>
            <TouchableOpacity
              style={[styles.logoutButton, { padding: scaleSpacing(12), borderRadius: responsiveBorderRadius.medium }]}
              onPress={handleLogout}
              accessibilityLabel="Logout"
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.welcomeContainer, { padding: responsivePadding.horizontal, borderRadius: responsiveBorderRadius.large }]}>
            <Text style={[styles.welcomeText, { fontSize: scaleFontSize(16) }]}>
              Welcome back,
            </Text>
            <Text style={[styles.userName, { fontSize: scaleFontSize(24), marginTop: scaleSpacing(4) }]}>
              {profile ? `${profile.firstName} ${profile.lastName}`.trim() : user?.email || 'User'}
            </Text>
          </View>
        </View>

        {/* Main Menu */}
        <View style={[styles.menuContainer, { gap: responsiveMargin.medium }]}>
          <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
            <TouchableOpacity
              style={[styles.menuCard, styles.membershipCard, { borderRadius: responsiveBorderRadius.large, minHeight: scaleSpacing(140) }]}
              onPress={handleMembershipPress}
              activeOpacity={0.9}
              accessibilityLabel="Membership Barcode"
            >
              <View style={[styles.cardContent, { padding: responsivePadding.horizontal, minHeight: scaleSpacing(140) }]}>
                <View style={[styles.cardIconContainer, { marginRight: responsiveMargin.medium }]}>
                  <Ionicons name="qr-code-outline" size={48} color={COLORS.membershipText} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, { color: COLORS.membershipText, fontSize: scaleFontSize(22), marginBottom: scaleSpacing(4) }]}>Membership</Text>
                  <Text style={[styles.cardSubtitle, { color: `${COLORS.membershipText}CC`, fontSize: scaleFontSize(14) }]}>Show your QR code</Text>
                </View>
                <View style={[styles.cardArrow, { borderRadius: responsiveBorderRadius.large, padding: scaleSpacing(8) }]}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.membershipText} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
            <TouchableOpacity
              style={[styles.menuCard, styles.contactCard, { borderRadius: responsiveBorderRadius.large, minHeight: scaleSpacing(140) }]}
              onPress={handleSettingsPress}
              activeOpacity={0.9}
              accessibilityLabel="Settings"
            >
              <View style={[styles.cardContent, { padding: responsivePadding.horizontal, minHeight: scaleSpacing(140) }]}>
                <View style={[styles.cardIconContainer, { marginRight: responsiveMargin.medium }]}>
                  <Ionicons name="settings-outline" size={48} color={COLORS.contactText} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, { color: COLORS.contactText, fontSize: scaleFontSize(22), marginBottom: scaleSpacing(4) }]}>Settings</Text>
                  <Text style={[styles.cardSubtitle, { color: `${COLORS.contactText}CC`, fontSize: scaleFontSize(14) }]}>Manage your account</Text>
                </View>
                <View style={[styles.cardArrow, { borderRadius: responsiveBorderRadius.large, padding: scaleSpacing(8) }]}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.contactText} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Stats */}
        <View style={{ flexDirection: 'row', gap: responsiveMargin.medium, marginBottom: responsiveMargin.medium }}>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: responsiveBorderRadius.large, paddingVertical: scaleSpacing(24), paddingHorizontal: scaleSpacing(12), alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Ionicons name={profile?.isCheckedIn ? 'walk' : 'walk-outline'} size={32} color={profile?.isCheckedIn ? COLORS.success : COLORS.textSecondary} style={{ marginBottom: scaleSpacing(10) }} />
            <Text style={{ fontSize: scaleFontSize(15), color: COLORS.textSecondary, fontWeight: '500', marginBottom: scaleSpacing(2), letterSpacing: 0.2 }}>Status</Text>
            <Text style={{ fontSize: scaleFontSize(18), color: COLORS.text, fontWeight: '700', letterSpacing: 0.3 }}>{profile?.isCheckedIn ? 'Checked In' : 'Checked Out'}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: responsiveBorderRadius.large, paddingVertical: scaleSpacing(24), paddingHorizontal: scaleSpacing(12), alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Ionicons name="time-outline" size={32} color={COLORS.textSecondary} style={{ marginBottom: scaleSpacing(10) }} />
            <Text style={{ fontSize: scaleFontSize(15), color: COLORS.textSecondary, fontWeight: '500', marginBottom: scaleSpacing(2), letterSpacing: 0.2 }}>Entry Time</Text>
            <Text style={{ fontSize: scaleFontSize(18), color: COLORS.text, fontWeight: '700', letterSpacing: 0.3 }}>
              {profile?.isCheckedIn && profile?.lastEntryTime
                ? (() => {
                    let dateObj;
                    if (typeof profile.lastEntryTime?.toDate === 'function') {
                      dateObj = profile.lastEntryTime.toDate();
                    } else {
                      dateObj = new Date(profile.lastEntryTime);
                    }
                    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                  })()
                : '-'}
            </Text>
          </View>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Toast Notification */}
      {showToastState && (
        <Animated.View 
          style={[
            styles.toast,
            { 
              backgroundColor: getToastColor(),
              top: Math.max(insets.top, scaleSpacing(60)),
              left: responsivePadding.horizontal,
              right: responsivePadding.horizontal,
              gap: scaleSpacing(10),
              paddingHorizontal: responsivePadding.horizontal,
              paddingVertical: scaleSpacing(16),
              borderRadius: responsiveBorderRadius.medium,
            }
          ]}
        >
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'error' ? 'alert-circle' : 'information-circle'} 
            size={20} 
            color="#ffffff" 
          />
          <Text style={[styles.toastText, { fontSize: scaleFontSize(15) }]}>{toastMsg}</Text>
        </Animated.View>
      )}
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
    marginTop: scaleSpacing(20),
    fontSize: scaleFontSize(16),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    // marginTop and marginBottom are set inline
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // marginBottom is set inline
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  menuContainer: {
    flex: 1,
  },
  menuCard: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  membershipCard: {
    backgroundColor: COLORS.cardBackground,
  },
  contactCard: {
    backgroundColor: COLORS.cardBackground,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    // marginRight is set inline
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardSubtitle: {
    fontWeight: '500',
  },
  cardArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.textSecondary,
    opacity: 0.2,
    marginHorizontal: 20,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
});
