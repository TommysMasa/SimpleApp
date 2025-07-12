import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const params = useLocalSearchParams();
  console.log('DEBUG params:', params);
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
  const [password, setPassword] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const { user, signUp } = useAuth();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  
  // Year options (1900 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => (currentYear - i).toString());
  
  // Month options
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
  
  // 日のオプション（選択された年月に応じて動的に生成）
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return daysInMonth;
  };
  
  const dayOptions = Array.from({ length: getDaysInMonth(birthYear, birthMonth) }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  useEffect(() => {
    // すでにログインしている場合はメニュー画面へ
    if (user) {
      router.replace('/');
    }
  }, [user]);

  // 月が変更されたときに日をリセット
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

  const formatDateOfBirth = () => {
    if (birthYear && birthMonth && birthDay) {
      return `${birthMonth}/${birthDay}/${birthYear}`;
    }
    return '';
  };

  const handleSignUp = async () => {
    console.log('DEBUG phone:', phone);
    const userData = {
      phone,
      firstName,
      lastName,
      email,
      dateOfBirth: formatDateOfBirth(),
      gender,
      password,
    };
    console.log('DEBUG userData:', userData);
    if (!phone || !firstName || !lastName || !email || !birthYear || !birthMonth || !birthDay || !gender || !password) {
      showAlert('Error', 'All fields are required');
      return;
    }

    if (!privacyAgreed) {
      showAlert('Error', 'You must agree to the privacy policy');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await signUp(userData);
      console.log('✅ Signup successful');
      
    } catch (error) {
      console.error('❌ Signup error:', error);
      
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

  // すでにログインしている場合
  if (user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AABD2" />
        <Text style={styles.loadingText}>Moving to menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Manga Lounge</Text>
          
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Value"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Value"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dateContainer}>
                {/* Year */}
                <View style={styles.datePickerContainer}>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => {
                      setShowYearPicker(!showYearPicker);
                      setShowMonthPicker(false);
                      setShowDayPicker(false);
                    }}
                  >
                    <Text style={[styles.datePickerText, !birthYear && styles.placeholderText]}>
                      {birthYear || 'Year'}
                    </Text>
                    <Text style={styles.chevron}>▼</Text>
                  </TouchableOpacity>
                  
                  {showYearPicker && (
                    <ScrollView style={styles.dropdown} nestedScrollEnabled>
                      {yearOptions.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={styles.dropdownItem}
                          onPress={() => handleYearSelect(year)}
                        >
                          <Text style={styles.dropdownText}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* Month */}
                <View style={styles.datePickerContainer}>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => {
                      setShowMonthPicker(!showMonthPicker);
                      setShowYearPicker(false);
                      setShowDayPicker(false);
                    }}
                  >
                    <Text style={[styles.datePickerText, !birthMonth && styles.placeholderText]}>
                      {birthMonth ? monthOptions.find(m => m.value === birthMonth)?.label : 'Month'}
                    </Text>
                    <Text style={styles.chevron}>▼</Text>
                  </TouchableOpacity>
                  
                  {showMonthPicker && (
                    <View style={styles.dropdown}>
                      {monthOptions.map((month) => (
                        <TouchableOpacity
                          key={month.value}
                          style={styles.dropdownItem}
                          onPress={() => handleMonthSelect(month.value)}
                        >
                          <Text style={styles.dropdownText}>{month.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Day */}
                <View style={styles.datePickerContainer}>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => {
                      setShowDayPicker(!showDayPicker);
                      setShowYearPicker(false);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[styles.datePickerText, !birthDay && styles.placeholderText]}>
                      {birthDay || 'Day'}
                    </Text>
                    <Text style={styles.chevron}>▼</Text>
                  </TouchableOpacity>
                  
                  {showDayPicker && (
                    <ScrollView style={styles.dropdown} nestedScrollEnabled>
                      {dayOptions.map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={styles.dropdownItem}
                          onPress={() => handleDaySelect(day)}
                        >
                          <Text style={styles.dropdownText}>{day}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity 
                style={styles.selectInput}
                onPress={() => setShowGenderPicker(!showGenderPicker)}
              >
                <Text style={[styles.selectText, !gender && styles.placeholderText]}>
                  {gender || 'Value'}
                </Text>
                <Text style={styles.chevron}>▼</Text>
              </TouchableOpacity>
              
              {showGenderPicker && (
                <View style={styles.dropdown}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => handleGenderSelect(option)}
                    >
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Value"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Value"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                autoCapitalize="none"
                autoCorrect={false}
                editable={false}
              />
            </View>

            {/* Privacy Policy Agreement */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setPrivacyAgreed(!privacyAgreed)}
            >
              <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
                {privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Privacy Policy Agreement</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.buttonDisabled]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F5F5F5" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.linkText}>Already have an account? Click here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 68,
    paddingTop: 67,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: -0.24,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1E1E1E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#1E1E1E',
    backgroundColor: '#FFFFFF',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  datePickerContainer: {
    flex: 1,
    position: 'relative',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#1E1E1E',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#1E1E1E',
  },
  placeholderText: {
    color: '#999999',
  },
  chevron: {
    fontSize: 12,
    color: '#1E1E1E',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#1E1E1E',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C2C2C',
    borderColor: '#2C2C2C',
  },
  checkmark: {
    color: '#F5F5F5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1E1E1E',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    borderColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#3AABD2',
    fontSize: 14,
    textDecorationLine: 'underline',
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