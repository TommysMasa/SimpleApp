import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Easing,
    findNodeHandle,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView as RNScrollView,
    TextInput as RNTextInput,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

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
  inputBorder: '#E2E8F0',
  inputFocus: '#5A8A7A',
};

export default function SignUp() {
  const params = useLocalSearchParams();
  const [phone, setPhone] = useState((params.phone as string) || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [gender, setGender] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const { signUp } = useAuth();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => (currentYear - i).toString());
  
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };
  
  const dayOptions = Array.from({ length: getDaysInMonth(birthYear, birthMonth) }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  const monthRef = useRef<RNTextInput>(null);
  const dayRef = useRef<RNTextInput>(null);
  const yearRef = useRef<RNTextInput>(null);
  const scrollViewRef = useRef<RNScrollView>(null);
  const genderRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const firstNameRef = useRef<RNTextInput>(null);
  const lastNameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const maxDays = getDaysInMonth(birthYear, birthMonth);
      if (parseInt(birthDay) > maxDays) {
        setBirthDay('');
      }
    }
  }, [birthYear, birthMonth]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Measure and show gender dropdown in a Modal to avoid z-index/ScrollView clipping issues
  const [genderMenuRect, setGenderMenuRect] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const openGenderMenu = () => {
    const handle = findNodeHandle(genderRef.current);
    if (!handle) {
      setShowGenderPicker(true);
      return;
    }
    UIManager.measureInWindow(handle, (x, y, width, height) => {
      setGenderMenuRect({ x, y, width, height });
      setShowGenderPicker(true);
    });
  };

  const formatDateOfBirth = () => {
    if (birthYear && birthMonth && birthDay) {
      return `${birthMonth}/${birthDay}/${birthYear}`;
    }
    return '';
  };

  const validateEmail = (emailString: string) => {
    if (!emailString) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailString)) return false;
    
    const [localPart, domain] = emailString.split('@');
    
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (domain.length === 0 || domain.length > 253) return false;
    if (!domain.includes('.')) return false;
    if (domain.endsWith('.')) return false;
    
    return true;
  };

  const validateAge = (year: string, month: string, day: string) => {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    if (monthNum < 1 || monthNum > 12) {
      showAlert('Invalid Date', 'Please enter a valid month (1-12)');
      return -1;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      showAlert('Invalid Date', 'Please enter a valid year');
      return -1;
    }

    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum < 1 || dayNum > daysInMonth) {
      showAlert('Invalid Date', `Please enter a valid day (1-${daysInMonth} for ${monthNum}/${yearNum})`);
      return -1;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    if (birthDate.getFullYear() !== yearNum || birthDate.getMonth() !== monthNum - 1 || birthDate.getDate() !== dayNum) {
      showAlert('Invalid Date', 'Please enter a valid date');
      return -1;
    }

    const today = new Date();
    if (birthDate > today) {
      showAlert('Invalid Date', 'Date of birth cannot be in the future');
      return -1;
    }
    
    const daysDiff = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 3600 * 24));
    const yearsDiff = daysDiff / 365.25;
    const age = Math.floor(yearsDiff);
    
    return age;
  };

  const handleSignUp = async () => {
    const userData = {
      phone,
      firstName,
      lastName,
      email,
      dateOfBirth: formatDateOfBirth(),
      gender,
    };
    
    if (!phone || !firstName || !lastName || !email || !birthYear || !birthMonth || !birthDay || !gender) {
      showAlert('Error', 'All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    const age = validateAge(birthYear, birthMonth, birthDay);
    if (age === -1) return;
    if (age < 13) {
      showAlert('Age Restriction', 'You must be at least 13 years old to use this app');
      return;
    }

    if (!privacyAgreed) {
      showAlert('Error', 'You must agree to the privacy policy');
      return;
    }

    setLoading(true);
    
    try {
      await signUp(userData);
      router.replace('/');
    } catch (error) {
      const authError = error as any;
      let errorMessage = 'Account creation failed';
      
      if (authError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (authError.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection';
      }
      
      showAlert('Signup error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderPicker(false);
  };

  const handleYearSelect = (selectedYear: string) => {
    setBirthYear(selectedYear);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (selectedMonth: string) => {
    setBirthMonth(selectedMonth);
    setShowMonthPicker(false);
  };

  const handleDaySelect = (selectedDay: string) => {
    setBirthDay(selectedDay);
    setShowDayPicker(false);
  };

  const scrollToInput = (ref: React.RefObject<any>) => {
    if (ref.current && scrollViewRef.current) {
      const inputHandle = findNodeHandle(ref.current);
      const scrollHandle = findNodeHandle(scrollViewRef.current);
      if (inputHandle && scrollHandle) {
        UIManager.measureLayout(
          inputHandle,
          scrollHandle,
          () => {},
          (x, y, width, height) => {
            const screenHeight = Dimensions.get('window').height;
            const scrollOffset = y - screenHeight / 4;
            scrollViewRef.current?.scrollTo({ y: scrollOffset > 0 ? scrollOffset : 0, animated: true });
          }
        );
      }
    }
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/')}
              accessibilityLabel="Back to Home"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Manga Lounge</Text>
              <Text style={styles.subtitle}>Complete Your Profile</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="never"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.form}>
              {/* Name Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      ref={firstNameRef}
                      style={styles.input}
                      placeholder="Enter first name"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoComplete="given-name"
                      returnKeyType="next"
                      onSubmitEditing={() => lastNameRef.current?.focus()}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      ref={lastNameRef}
                      style={styles.input}
                      placeholder="Enter last name"
                      value={lastName}
                      onChangeText={setLastName}
                      autoComplete="family-name"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="example@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => monthRef.current?.focus()}
                  />
                </View>
              </View>

              {/* Birth Date Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Date of Birth</Text>
                </View>
                <View style={styles.dateContainer}>
                  {/* Month */}
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.dateLabel}>Month</Text>
                    <TextInput
                      ref={monthRef}
                      style={styles.input}
                      placeholder="MM"
                      value={birthMonth}
                      onChangeText={text => {
                        const val = text.replace(/[^0-9]/g, '').slice(0,2);
                        setBirthMonth(val);
                        if (val.length === 2) {
                          dayRef.current?.focus();
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      returnKeyType="next"
                      onFocus={() => scrollToInput(monthRef)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && birthMonth.length === 0) {
                          // Optionally, focus previous field if exists
                        }
                      }}
                      onSubmitEditing={() => dayRef.current?.focus()}
                    />
                  </View>
                  {/* Day */}
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.dateLabel}>Day</Text>
                    <TextInput
                      ref={dayRef}
                      style={styles.input}
                      placeholder="DD"
                      value={birthDay}
                      onChangeText={text => {
                        const val = text.replace(/[^0-9]/g, '').slice(0,2);
                        setBirthDay(val);
                        if (val.length === 2) {
                          yearRef.current?.focus();
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                      returnKeyType="next"
                      onFocus={() => scrollToInput(dayRef)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && birthDay.length === 0) {
                          monthRef.current?.focus();
                        }
                      }}
                      onSubmitEditing={() => yearRef.current?.focus()}
                    />
                  </View>
                  {/* Year */}
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.dateLabel}>Year</Text>
                    <TextInput
                      ref={yearRef}
                      style={styles.input}
                      placeholder="YYYY"
                      value={birthYear}
                      onChangeText={text => {
                        const val = text.replace(/[^0-9]/g, '').slice(0,4);
                        setBirthYear(val);
                        if (val.length === 4) {
                          Keyboard.dismiss();
                          setTimeout(() => scrollToInput(genderRef), 200);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={4}
                      returnKeyType="done"
                      onFocus={() => scrollToInput(yearRef)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && birthYear.length === 0) {
                          dayRef.current?.focus();
                        }
                      }}
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                        setTimeout(() => scrollToInput(genderRef), 200);
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Additional Info Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Gender</Text>
                  <TouchableOpacity 
                    ref={genderRef}
                    style={styles.selectInput}
                    onPress={openGenderMenu}
                  >
                    <Text style={[styles.selectText, !gender && styles.placeholderText]}>
                      {gender || 'Select gender'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  
                  {/* Dropdown moved to a Modal to ensure it renders above other content */}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    placeholder="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={false}
                  />
                </View>
              </View>

              {/* Privacy Agreement */}
              <View style={styles.section}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setPrivacyAgreed(!privacyAgreed)}
                >
                  <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
                    {privacyAgreed && <Ionicons name="checkmark" size={14} color={COLORS.surface} />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the <Text style={styles.linkText}>Privacy Policy</Text> and <Text style={styles.linkText}>Terms of Service</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.buttonDisabled]} 
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.surface} />
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => router.push('/welcome')}
              >
                <Text style={styles.linkText}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>

    {/* Gender dropdown modal */}
    <Modal visible={showGenderPicker} transparent animationType="fade" onRequestClose={() => setShowGenderPicker(false)}>
      <TouchableWithoutFeedback onPress={() => setShowGenderPicker(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.dropdownAbsolute,
              {
                top: genderMenuRect.y + genderMenuRect.height + 4,
                left: genderMenuRect.x,
                width: Math.max(genderMenuRect.width, 200),
              },
            ]}
          >
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => handleGenderSelect(option)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
    position: 'relative',
    zIndex: 9996,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
    position: 'relative',
    zIndex: 9997,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    color: COLORS.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  datePickerContainer: {
    flex: 1,
    position: 'relative',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    zIndex: 99998,
  },
  selectText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 99999,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dropdownAbsolute: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    maxHeight: 240,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 20,
    overflow: 'hidden',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
}); 