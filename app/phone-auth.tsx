import { router } from 'expo-router';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import type { ApplicationVerifier } from 'firebase/auth';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import type { WebViewMessageEvent } from 'react-native-webview';
import { WebView } from 'react-native-webview';
import { Country, CountryPicker } from '../components/CountryPicker';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast, { ToastType } from '../components/Toast';
import { auth } from '../firebaseConfig';
import { accessibilityHelpers } from '../utils/accessibility';

const NativeWebView: typeof WebView | undefined = Platform.select({ web: undefined, default: WebView });
const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;

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
  const [nativeRecaptchaVisible, setNativeRecaptchaVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const webRecaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const nativeRecaptchaPromise = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const containerId = 'recaptcha-container';
    let container = document.getElementById(containerId);
    let created = false;

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';
      document.body.appendChild(container);
      created = true;
    }

    return () => {
      if (created && container?.parentNode) {
        container.parentNode.removeChild(container);
      }
      webRecaptchaVerifier.current?.clear();
      webRecaptchaVerifier.current = null;
    };
  }, []);

  const createVerifierFromToken = useCallback((token: string): ApplicationVerifier => {
    let consumed = false;
    return {
      type: 'recaptcha',
      verify: async () => {
        if (consumed) {
          throw new Error('reCAPTCHA token has already been used.');
        }
        consumed = true;
        return token;
      },
    };
  }, []);

  const requestWebRecaptcha = useCallback(async (): Promise<ApplicationVerifier> => {
    const containerId = 'recaptcha-container';
    if (!webRecaptchaVerifier.current) {
      webRecaptchaVerifier.current = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
      });
    }

    try {
      const token = await webRecaptchaVerifier.current.verify();
      return createVerifierFromToken(token);
    } finally {
      webRecaptchaVerifier.current?.clear();
      webRecaptchaVerifier.current = null;
    }
  }, [createVerifierFromToken]);

  const handleNativeRecaptchaCancel = useCallback(() => {
    const pending = nativeRecaptchaPromise.current;
    if (pending) {
      pending.reject(new Error('reCAPTCHA was cancelled.'));
      nativeRecaptchaPromise.current = null;
    }
    setNativeRecaptchaVisible(false);
  }, []);

  const requestNativeRecaptcha = useCallback((): Promise<ApplicationVerifier> => {
    if (!RECAPTCHA_SITE_KEY) {
      return Promise.reject(new Error('Missing EXPO_PUBLIC_RECAPTCHA_SITE_KEY environment variable.'));
    }

    return new Promise<ApplicationVerifier>((resolve, reject) => {
      nativeRecaptchaPromise.current = {
        resolve: (token) => {
          nativeRecaptchaPromise.current = null;
          resolve(createVerifierFromToken(token));
        },
        reject: (error) => {
          nativeRecaptchaPromise.current = null;
          reject(error);
        },
      };
      setNativeRecaptchaVisible(true);
    });
  }, [createVerifierFromToken]);

  const handleNativeRecaptchaMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data || '{}');
        if (data.type === 'success' && typeof data.token === 'string') {
          nativeRecaptchaPromise.current?.resolve(data.token);
          setNativeRecaptchaVisible(false);
          return;
        }

        if (data.type === 'expired') {
          nativeRecaptchaPromise.current?.reject(new Error('reCAPTCHA expired. Please try again.'));
        } else {
          nativeRecaptchaPromise.current?.reject(new Error('Unable to complete reCAPTCHA challenge.'));
        }
      } catch {
        nativeRecaptchaPromise.current?.reject(new Error('Unexpected reCAPTCHA response.'));
      } finally {
        nativeRecaptchaPromise.current = null;
        setNativeRecaptchaVisible(false);
      }
    },
    []
  );

  const recaptchaHtml = useMemo(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return '';
    }

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body, html { margin: 0; padding: 0; height: 100%; background-color: #f9f9f9; }
      .container { height: 100%; display: flex; align-items: center; justify-content: center; }
    </style>
    <script>
      function onRecaptchaSuccess(token) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', token }));
      }
      function onRecaptchaError() {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
      }
      function onRecaptchaExpired() {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
      }
      function renderRecaptcha() {
        if (!window.grecaptcha) {
          return;
        }
        window.grecaptcha.render('recaptcha-root', {
          sitekey: '${RECAPTCHA_SITE_KEY}',
          callback: onRecaptchaSuccess,
          'error-callback': onRecaptchaError,
          'expired-callback': onRecaptchaExpired,
        });
      }
      window.onRecaptchaLoaded = function () {
        if (window.grecaptcha) {
          renderRecaptcha();
        }
      };
    </script>
    <script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit" async defer></script>
  </head>
  <body>
    <div class="container">
      <div id="recaptcha-root"></div>
    </div>
  </body>
</html>`;
  }, []);

  const requestAppVerifier = useCallback(async (): Promise<ApplicationVerifier> => {
    if (Platform.OS === 'web') {
      return requestWebRecaptcha();
    }

    return requestNativeRecaptcha();
  }, [requestNativeRecaptcha, requestWebRecaptcha]);

  const handleContinue = () => {
    if (!phoneNumber) {
      setError('Please enter your phone number.');
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
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
      const appVerifier = await requestAppVerifier();
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
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
      {/* Native reCAPTCHA modal */}
      {NativeWebView ? (
        <Modal
          visible={nativeRecaptchaVisible}
          animationType="fade"
          transparent
          onRequestClose={handleNativeRecaptchaCancel}
        >
          <View style={styles.recaptchaModalBg}>
            <View style={styles.recaptchaCard}>
              <Text style={styles.recaptchaTitle}>Verify you are human</Text>
              {recaptchaHtml ? (
                <NativeWebView
                  originWhitelist={["*"]}
                  javaScriptEnabled
                  domStorageEnabled
                  automaticallyAdjustContentInsets={false}
                  onMessage={handleNativeRecaptchaMessage}
                  source={{ html: recaptchaHtml }}
                  style={styles.recaptchaWebview}
                />
              ) : (
                <Text style={styles.errorText}>Missing reCAPTCHA configuration.</Text>
              )}
              <TouchableOpacity style={styles.recaptchaCancelBtn} onPress={handleNativeRecaptchaCancel}>
                <Text style={styles.recaptchaCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.header}>
              <Text style={styles.title}>My number is</Text>
              <Text style={styles.subtitle}>We&apos;ll send a verification code to this number</Text>
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
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.privacyText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://docs.google.com/document/d/1MzkEqOgJxMN331SuUivt8S8Fs_7lqrz1pCqsijoE3Tw/edit?usp=sharing')}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText} onPress={() => Linking.openURL('https://docs.google.com/document/d/14t9aHzjedxMGTB7-3JncpY0ARyljt3pzFv3b87Oe7z8/edit?usp=sharing')}>Privacy Policy</Text>
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.continueButton, (phoneNumber.replace(/\D/g, '').length !== 10 || loading) && styles.continueButtonDisabled]}
                onPress={handleContinue}
                disabled={phoneNumber.replace(/\D/g, '').length !== 10 || loading}
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
  recaptchaWebview: {
    width: 320,
    height: 430,
    backgroundColor: 'transparent',
    alignSelf: 'stretch',
  },
});