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

export default function Welcome() {
  const handleSignUpPress = () => {
    router.push('/phone-auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3A4A5C" />
      <View style={styles.content}>
        {/* Top spacer (smaller) */}
        <View style={{ flex: 0.7 }} />
        {/* Logo and subtitle with wide margin */}
        <View style={styles.topTextBlock}>
          <Text style={styles.logo}>Manga Lounge</Text>
        </View>
        {/* Bottom spacer (larger) */}
        <View style={{ flex: 1.3 }} />
        {/* Continue with phone button */}
        <TouchableOpacity style={styles.phoneButton} onPress={handleSignUpPress}>
          <Ionicons name="call" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.phoneButtonText}>Continue with phone</Text>
        </TouchableOpacity>
        {/* Age restriction note */}
        <View style={styles.ageRestrictionContainer}>
          <Ionicons name="information-circle" size={20} color="#5A8A7A" style={{ marginRight: 8 }} />
          <Text style={styles.ageRestrictionText}>
            Children under 13 may enter only with an adult parent or guardian.
          </Text>
        </View>

        {/* Change Phone Number link */}
        <Text style={[styles.termsText, { marginBottom: 32 }]}> 
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
    paddingHorizontal: 24,
  },
  topTextBlock: {
    width: '100%',
    paddingHorizontal: 44, // wide margin for top text
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D1B14', // espresso brown
    marginBottom: 8, // tighter vertical gap
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
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 32,
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
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  privacyNote: {
    color: '#222', // black
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  ageRestrictionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5A8A7A',
  },
  ageRestrictionText: {
    color: '#2D1B14',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  termsText: {
    color: '#222', // black
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
    fontWeight: '400',
  },
  link: {
    color: '#5A8A7A', // matching button color
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
}); 