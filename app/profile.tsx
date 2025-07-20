import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { getUserData, updateUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dateError, setDateError] = useState('');
  const [emailError, setEmailError] = useState('');

    useEffect(() => {
    (async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setDateOfBirth(data.dateOfBirth || '');
        setGender(data.gender || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      }
    })();
  }, [getUserData]);

  const validateDateOfBirth = (dateString: string) => {
    if (!dateString) {
      setDateError('');
      return true;
    }

    // MM/DD/YYYY 形式のチェック
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
      setDateError('Please enter date in MM/DD/YYYY format');
      return false;
    }

    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);

    // 月の範囲チェック
    if (month < 1 || month > 12) {
      setDateError('Please enter a valid month (1-12)');
      return false;
    }

    // 年の範囲チェック
    if (year < 1900 || year > new Date().getFullYear()) {
      setDateError('Please enter a valid year');
      return false;
    }

    // 日の範囲チェック（月に応じて）
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      setDateError(`Please enter a valid day (1-${daysInMonth} for ${month}/${year})`);
      return false;
    }

    // 日付の妥当性チェック
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      setDateError('Please enter a valid date');
      return false;
    }

    // 未来の日付チェック
    if (date > new Date()) {
      setDateError('Date of birth cannot be in the future');
      return false;
    }

    // 13歳未満チェック
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    
    // 日付の差分を直接計算
    const daysDiff = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 3600 * 24));
    const yearsDiff = daysDiff / 365.25;
    const age = Math.floor(yearsDiff);
    
    if (age < 13) {
      setDateError('You must be at least 13 years old to use this app');
      return false;
    }

    setDateError('');
    return true;
  };

  const validateEmail = (emailString: string) => {
    if (!emailString) {
      setEmailError('');
      return true;
    }

    // 基本的なEmail形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailString)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // より詳細なEmail形式チェック
    const [localPart, domain] = emailString.split('@');
    
    // ローカル部分のチェック
    if (localPart.length === 0 || localPart.length > 64) {
      setEmailError('Email local part is invalid');
      return false;
    }

    // ドメイン部分のチェック
    if (domain.length === 0 || domain.length > 253) {
      setEmailError('Email domain is invalid');
      return false;
    }

    // ドメインにドットが含まれているかチェック
    if (!domain.includes('.')) {
      setEmailError('Email domain must contain a dot');
      return false;
    }

    // ドメインの最後がドットで終わっていないかチェック
    if (domain.endsWith('.')) {
      setEmailError('Email domain cannot end with a dot');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleDateInputChange = (text: string) => {
    // 数字のみを抽出
    const numbers = text.replace(/\D/g, '');
    
    // フォーマットを適用 (MM/DD/YYYY)
    let formatted = '';
    if (numbers.length >= 1) formatted += numbers.slice(0, 2);
    if (numbers.length >= 3) formatted += '/' + numbers.slice(2, 4);
    if (numbers.length >= 5) formatted += '/' + numbers.slice(4, 8);
    
    setDateOfBirth(formatted);
    
    // 8桁の数字が入力されたらバリデーション実行
    if (numbers.length === 8) {
      validateDateOfBirth(formatted);
    } else {
      setDateError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !dateOfBirth || !gender || !email) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    
    // 日付のバリデーション
    if (!validateDateOfBirth(dateOfBirth)) {
      return;
    }
    
    // Emailのバリデーション
    if (!validateEmail(email)) {
      return;
    }
    setSaving(true);
    try {
      await updateUserData({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </View>
        </TouchableOpacity>
        <ScrollView 
          contentContainerStyle={styles.inner} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={[styles.input, dateError ? styles.inputError : null]}
            placeholder="Date of Birth (MM/DD/YYYY)"
            value={dateOfBirth}
            onChangeText={handleDateInputChange}
            keyboardType="numeric"
            maxLength={10}
          />
          {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Gender"
            value={gender}
            onChangeText={setGender}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Phone Number"
            value={phone}
            editable={false}
            selectTextOnFocus={false}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
          {saved && <Text style={styles.success}>Profile saved!</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111',
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  success: {
    color: '#22C55E',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    padding: 12,
  },
  backButtonCircle: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
}); 