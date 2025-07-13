import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { router } from 'expo-router';
import { getAuth, signInWithPhoneNumber } from 'firebase/auth';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Country, CountryPicker } from '../components/CountryPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import app from '../firebaseConfig';
import { accessibilityHelpers } from '../utils/accessibility';

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
  const inputRef = useRef<TextInput>(null);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal | null>(null);
  const auth = getAuth(app);
  const { sendPhoneVerification } = useAuth();
  const [showRecaptchaIntro, setShowRecaptchaIntro] = useState(false);

  // キーボードを閉じる
  const dismissKeyboard = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  // 電話番号のバリデーション
  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (selectedCountry.code === 'JP') {
      // 日本の携帯番号: 11桁、070/080/090
      return cleaned.length === 11 && /^(070|080|090)/.test(cleaned);
    }
    // 他国は10-15桁
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  // 入力時のフォーマット
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (selectedCountry.code === 'JP') {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    if (selectedCountry.code === 'US') {
      // US: (XXX) XXX-XXXX
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      if (cleaned.length <= 10) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return cleaned;
  };

  const handlePhoneNumberChange = (text: string) => {
    setError('');
    setPhoneNumber(formatPhoneNumber(text));
  };

  const handleContinue = () => {
    dismissKeyboard();
    if (!phoneNumber) {
      setError('Please enter your phone number.');
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Invalid phone number.');
      return;
    }
    setShowRecaptchaIntro(true);
  };

  // reCAPTCHAとSMS送信を実行
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
          <View style={styles.recaptchaCard}>
            <Text style={styles.recaptchaTitle}>Protecting your account</Text>
            <Text style={styles.recaptchaSubtitle}>Please solve this puzzle so we know you are a real person</Text>
            <TouchableOpacity style={styles.recaptchaStartBtn} onPress={handleStartRecaptcha}>
              <Text style={styles.recaptchaStartBtnText}>Start Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recaptchaCancelBtn} onPress={() => setShowRecaptchaIntro(false)}>
              <Text style={styles.recaptchaCancelBtnText}>Cancel</Text>
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
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="never"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.header}>
              <Text style={styles.title}>My number is</Text>
              <Text style={styles.subtitle}>We'll send a verification code to this number</Text>
            </View>
            <View style={styles.phoneInputContainer}>
              <CountryPicker
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
                style={styles.countryPicker}
              />
              <TextInput
                ref={inputRef}
                style={[styles.phoneInput, error && styles.inputError]}
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={selectedCountry.code === 'JP' ? 13 : 14}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                blurOnSubmit={true}
                autoFocus
                {...accessibilityHelpers.getFormFieldProps({
                  label: 'Phone number',
                  value: phoneNumber,
                  placeholder: 'Phone number',
                  required: true,
                  keyboardType: 'phone-pad',
                })}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.privacyText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.continueButton, (!phoneNumber || loading) && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={!phoneNumber || loading}
                {...accessibilityHelpers.getLoadingButtonProps('Continue', loading)}
              >
                {loading ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  countryPicker: {
    flex: 0,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  privacyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  linkText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
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