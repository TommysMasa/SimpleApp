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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

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
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.logo}>Manga Lounge</Text>
              <Text style={styles.subtitle}>Your Digital Experience</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text style={styles.userName}>
              {profile ? `${profile.firstName} ${profile.lastName}`.trim() : user?.email || 'User'}
            </Text>
          </View>
        </View>

        {/* Main Menu */}
        <View style={styles.menuContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
            <TouchableOpacity
              style={[styles.menuCard, styles.membershipCard]}
              onPress={handleMembershipPress}
              activeOpacity={0.9}
              accessibilityLabel="Membership Barcode"
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="qr-code-outline" size={48} color={COLORS.membershipText} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, { color: COLORS.membershipText }]}>Membership</Text>
                  <Text style={[styles.cardSubtitle, { color: `${COLORS.membershipText}CC` }]}>Show your QR code</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.membershipText} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
            <TouchableOpacity
              style={[styles.menuCard, styles.contactCard]}
              onPress={handleSettingsPress}
              activeOpacity={0.9}
              accessibilityLabel="Settings"
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="settings-outline" size={48} color={COLORS.contactText} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, { color: COLORS.contactText }]}>Settings</Text>
                  <Text style={[styles.cardSubtitle, { color: `${COLORS.contactText}CC` }]}>Manage your account</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.contactText} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Stats */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Ionicons name={profile?.isCheckedIn ? 'walk' : 'walk-outline'} size={32} color={profile?.isCheckedIn ? COLORS.success : COLORS.textSecondary} style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 15, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 2, letterSpacing: 0.2 }}>Status</Text>
            <Text style={{ fontSize: 18, color: COLORS.text, fontWeight: '700', letterSpacing: 0.3 }}>{profile?.isCheckedIn ? 'Checked In' : 'Checked Out'}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <Ionicons name="time-outline" size={32} color={COLORS.textSecondary} style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 15, color: COLORS.textSecondary, fontWeight: '500', marginBottom: 2, letterSpacing: 0.2 }}>Entry Time</Text>
            <Text style={{ fontSize: 18, color: COLORS.text, fontWeight: '700', letterSpacing: 0.3 }}>
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

      {/* Toast Notification */}
      {showToastState && (
        <Animated.View 
          style={[
            styles.toast,
            { backgroundColor: getToastColor() }
          ]}
        >
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'error' ? 'alert-circle' : 'information-circle'} 
            size={20} 
            color="#ffffff" 
          />
          <Text style={styles.toastText}>{toastMsg}</Text>
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
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    gap: 20,
  },
  menuCard: {
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 140,
  },
  membershipCard: {
    backgroundColor: COLORS.cardBackground,
  },
  contactCard: {
    backgroundColor: COLORS.cardBackground,
  },
  cardContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  cardIconContainer: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
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
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
});
