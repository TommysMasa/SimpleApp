import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Country, CountryPicker } from '../components/CountryPicker';

export default function ChangePhoneRequestScreen() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
  });
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Phone Number</Text>
        <Text style={styles.label}>Registered Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <CountryPicker
            selectedCountry={selectedCountry}
            onCountrySelect={setSelectedCountry}
            style={styles.countryPicker}
            showFlag={false}
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={text => setPhone(text.replace(/\D/g, ''))}
            placeholder="Enter your registered phone number"
            keyboardType="number-pad"
            autoCapitalize="none"
            maxLength={20}
          />
        </View>
        <Text style={styles.label}>Registered Email Address</Text>
        <TextInput
          style={[styles.input, styles.emailInput]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your registered email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.submitButton} onPress={() => router.push('./change-phone-request-sent')}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    alignSelf: 'center',
    color: '#222',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  countryPicker: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },
  input: {
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    height: 44,
    flex: 1,
  },
  emailInput: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: undefined,
    height: 44,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 