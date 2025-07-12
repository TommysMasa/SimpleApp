import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    const fetchUserData = async () => {
      // AuthContextのloadingが完了するまで待つ
      if (authLoading) {
        return;
      }

      if (!user) {
        router.replace('/welcome');
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Fetching user data for:', user.uid);
        const data = await getUserData();
        if (data) {
          console.log('✅ User data retrieved:', data);
          setUserData(data);
        } else {
          console.error('❌ User data not found in Firestore');
        }
      } catch (error) {
        console.error('❌ User data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, getUserData, authLoading]);

  // AuthContextがまだloadingの場合
  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AABD2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AABD2" />
        <Text style={styles.loadingText}>Loading membership data...</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load membership data</Text>
          <Text style={styles.errorSubText}>Please try logging out and logging back in</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manga Lounge</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* User Info */}
        <Text style={styles.welcomeText}>
          {userData.displayName}'s{'\n'}Membership Card
        </Text>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          Please show this QR code{'\n'}when you enter the store.
        </Text>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={userData.membershipId}
            size={170}
            color="#000000"
            backgroundColor="#FFFFFF"
            logo={undefined}
            logoSize={30}
            logoBackgroundColor="transparent"
          />
        </View>

        {/* Membership ID */}
        <Text style={styles.membershipIdText}>
          ID: {userData.membershipId}
        </Text>

        {/* Member Since */}
        <Text style={styles.memberSinceText}>
          Member since: {new Date(userData.createdAt).toLocaleDateString('en-US')}
        </Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>Back to Menu</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 23,
    paddingBottom: 19,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    color: '#3AABD2',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  instructionText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 29,
  },
  qrContainer: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  membershipIdText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#3AABD2',
    marginBottom: 8,
  },
  memberSinceText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
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