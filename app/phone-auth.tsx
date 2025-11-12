import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { router } from 'expo-router';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Country, CountryPicker } from '../components/CountryPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { app, auth } from '../firebaseConfig';
import { accessibilityHelpers } from '../utils/accessibility';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius, getResponsiveInputHeight, getResponsiveButtonHeight } from '../utils/responsive';

export default function PhoneAuth() {
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [error, setError] = useState('');
  const [showRecaptchaIntro, setShowRecaptchaIntro] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal | null>(null);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleContinue = () => {
    if (!phoneNumber) {
      setError('Please enter your phone number.');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Invalid phone number. Enter 10 digits.');
      return;
    }
    setShowRecaptchaIntro(true);
  };

  const handleStartRecaptcha = async () => {
    setShowRecaptchaIntro(false);
    setLoading(true);
    setError('');
    try {
      const cleaned = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `${selectedCountry.dialCode}${cleaned}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifier.current as unknown as import('firebase/auth').ApplicationVerifier
      );
      setToastMessage('Verification code sent!');
      setToastType('success');
      setToastVisible(true);
      setTimeout(() => {
        router.push({ pathname: '/sms-verification', params: { verificationId: confirmation.verificationId, phoneNumber: fullPhoneNumber } });
      }, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to send verification code.');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Custom reCAPTCHA intro modal */}
      <Modal
        visible={showRecaptchaIntro}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRecaptchaIntro(false)}
      >
        <View style={styles.recaptchaModalBg}>
          <View style={[styles.recaptchaCard, { width: '88%', borderRadius: responsiveBorderRadius.large, padding: scaleSpacing(28) }]}>
            <Text style={[styles.recaptchaTitle, { fontSize: scaleFontSize(22), marginBottom: scaleSpacing(12) }]}>Protecting your account</Text>
            <Text style={[styles.recaptchaSubtitle, { fontSize: scaleFontSize(16), marginBottom: scaleSpacing(28) }]}>Please solve this puzzle so we know you are a real person</Text>
            <TouchableOpacity style={[styles.recaptchaStartBtn, { borderRadius: responsiveBorderRadius.small, paddingVertical: scaleSpacing(14), paddingHorizontal: scaleSpacing(32), marginBottom: scaleSpacing(12) }]} onPress={handleStartRecaptcha}>
              <Text style={[styles.recaptchaStartBtnText, { fontSize: scaleFontSize(16) }]}>Start Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.recaptchaCancelBtn, { paddingVertical: scaleSpacing(8), paddingHorizontal: scaleSpacing(16) }]} onPress={() => setShowRecaptchaIntro(false)}>
              <Text style={[styles.recaptchaCancelBtnText, { fontSize: scaleFontSize(15) }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* reCAPTCHA modal (always mounted, only used when needed) */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={false}
      />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent, 
              { 
                paddingHorizontal: responsivePadding.horizontal,
                paddingTop: Math.max(insets.top, responsiveMargin.medium),
                paddingBottom: Math.max(insets.bottom, responsivePadding.horizontal),
              }
            ]}
          keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={[styles.header, { marginBottom: responsiveMargin.large }]}>
              <Text style={[styles.title, { fontSize: scaleFontSize(32), marginBottom: scaleSpacing(12) }]}>My number is</Text>
              <Text style={[styles.subtitle, { fontSize: scaleFontSize(16), marginBottom: scaleSpacing(24), lineHeight: scaleFontSize(24) }]}>We'll send a verification code to this number</Text>
            </View>
            <View style={[styles.phoneInputContainer, { marginBottom: responsiveMargin.medium, gap: scaleSpacing(12) }]}>
            {/* CountryPickerはそのまま */}
              <CountryPicker
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
                style={styles.countryPicker}
              />
              <TextInput
                ref={inputRef}
                style={[
                  styles.phoneInput, 
                  error && styles.inputError,
                  {
                    borderRadius: responsiveBorderRadius.medium,
                    paddingHorizontal: responsivePadding.horizontal,
                    paddingVertical: scaleSpacing(16),
                    fontSize: scaleFontSize(18),
                    minHeight: getResponsiveInputHeight(),
                  }
                ]}
                value={phoneNumber}
              onChangeText={text => {
                setError('');
                const cleaned = text.replace(/\D/g, '');
                setPhoneNumber(cleaned);
              }}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                blurOnSubmit={true}
                autoFocus
              autoComplete="tel"
              textContentType="telephoneNumber"
                {...accessibilityHelpers.getFormFieldProps({
                  label: 'Phone number',
                  value: phoneNumber,
                  placeholder: 'Phone number',
                  required: true,
                keyboardType: 'number-pad',
                })}
              />
            </View>
            {error ? <Text style={[styles.errorText, { fontSize: scaleFontSize(14), marginBottom: scaleSpacing(8) }]}>{error}</Text> : null}
            <Text style={[styles.privacyText, { fontSize: scaleFontSize(14), lineHeight: scaleFontSize(20), marginBottom: responsiveMargin.large }]}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://docs.google.com/document/d/1MzkEqOgJxMN331SuUivt8S8Fs_7lqrz1pCqsijoE3Tw/edit?usp=sharing')}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://docs.google.com/document/d/14t9aHzjedxMGTB7-3JncpY0ARyljt3pzFv3b87Oe7z8/edit?usp=sharing')}>Privacy Policy</Text>
            </Text>
            <View style={[styles.buttonContainer, { paddingTop: scaleSpacing(8), paddingBottom: responsivePadding.horizontal }]}>
              <TouchableOpacity
                style={[
                  styles.continueButton, 
                  (phoneNumber.replace(/\D/g, '').length !== 10 || loading) && styles.continueButtonDisabled,
                  {
                    borderRadius: responsiveBorderRadius.medium,
                    paddingVertical: scaleSpacing(16),
                    paddingHorizontal: scaleSpacing(40),
                    minHeight: getResponsiveButtonHeight(),
                  }
                ]}
                onPress={handleContinue}
                disabled={phoneNumber.replace(/\D/g, '').length !== 10 || loading}
                {...accessibilityHelpers.getLoadingButtonProps('Continue', loading)}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={[styles.continueButtonText, { fontSize: scaleFontSize(18) }]}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        position="top"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    flex: 0,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 4,
  },
  privacyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    alignItems: 'center',
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recaptchaModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recaptchaCard: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  recaptchaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  recaptchaSubtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 28,
  },
  recaptchaStartBtn: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  recaptchaStartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recaptchaCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  recaptchaCancelBtnText: {
    color: '#888',
    fontSize: 15,
  },
}); 