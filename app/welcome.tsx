import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveButtonHeight, getResponsiveBorderRadius } from '../utils/responsive';

export default function Welcome() {
  const handleSignUpPress = () => {
    router.push('/phone-auth');
  };

  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3A4A5C" />
      <View style={[
        styles.content, 
        { 
          paddingHorizontal: responsivePadding.horizontal,
          paddingTop: Math.max(insets.top, 0),
          paddingBottom: Math.max(insets.bottom, 0),
        }
      ]}>
        {/* Top spacer (smaller) */}
        <View style={{ flex: 0.7 }} />
        {/* Logo and subtitle with wide margin */}
        <View style={[styles.topTextBlock, { paddingHorizontal: scaleSpacing(44) }]}>
          <Text style={[styles.logo, { fontSize: scaleFontSize(48), marginBottom: scaleSpacing(8) }]}>Manga Lounge</Text>
        </View>
        {/* Bottom spacer (larger) */}
        <View style={{ flex: 1.3 }} />
        {/* Continue with phone button */}
        <TouchableOpacity 
          style={[
            styles.phoneButton, 
            { 
              borderRadius: responsiveBorderRadius.large,
              paddingVertical: scaleSpacing(18),
              paddingHorizontal: scaleSpacing(32),
              marginBottom: responsiveMargin.large,
              minHeight: getResponsiveButtonHeight(),
            }
          ]} 
          onPress={handleSignUpPress}
        >
          <Ionicons name="call" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={[styles.phoneButtonText, { fontSize: scaleFontSize(18) }]}>Continue with phone</Text>
        </TouchableOpacity>
        {/* Age restriction note */}
        <View style={[
          styles.ageRestrictionContainer,
          {
            borderRadius: responsiveBorderRadius.medium,
            paddingHorizontal: responsivePadding.horizontal,
            paddingVertical: scaleSpacing(12),
            marginBottom: responsiveMargin.medium,
            marginTop: responsiveMargin.medium,
          }
        ]}>
          <Ionicons name="information-circle" size={20} color="#5A8A7A" style={{ marginRight: 8 }} />
          <Text style={[styles.ageRestrictionText, { fontSize: scaleFontSize(14), lineHeight: scaleFontSize(20) }]}>
            Children under 13 may enter only with an adult parent or guardian.
        </Text>
        </View>

        {/* Change Phone Number link */}
        <Text style={[styles.termsText, { marginBottom: responsiveMargin.large, fontSize: scaleFontSize(13), lineHeight: scaleFontSize(19) }]}> 
          <Text style={styles.link} onPress={() => router.push('./change-phone-request')}>Change Phone Number</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F3', // warm cream/off-white
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTextBlock: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    color: '#2D1B14', // espresso brown
    letterSpacing: -2, // more balanced spacing
    textAlign: 'center', // ensure perfectly centered
  },
  subtitle: {
    fontSize: 18,
    color: '#6B4E3D', // medium brown
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A8A7A', // sage green
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#2D1B14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  phoneButtonText: {
    color: '#F7F5F3',
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  ageRestrictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F4',
    borderLeftWidth: 4,
    borderLeftColor: '#5A8A7A',
    width: '100%',
  },
  ageRestrictionText: {
    color: '#2D1B14',
    fontWeight: '500',
    flex: 1,
  },
  termsText: {
    color: '#222', // black
    textAlign: 'center',
    fontWeight: '400',
  },
  link: {
    color: '#5A8A7A', // matching button color
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
}); 