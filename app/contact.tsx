import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius, getResponsiveInputHeight } from '../utils/responsive';

export default function ContactScreen() {
  const { user, getUserData } = useAuth();
  const insets = useSafeAreaInsets();
  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getUserData();
      if (data) {
        setName(`${data.firstName} ${data.lastName}`.trim());
        setUserId(data.membershipId || '');
      }
    };
    fetchUser();
  }, [getUserData]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + scaleSpacing(8), padding: scaleSpacing(12) }]}
        onPress={() => router.back()}
        accessibilityLabel="Back"
      >
        <View style={[styles.backButtonCircle, { borderRadius: scaleSpacing(20), width: scaleSpacing(40), height: scaleSpacing(40) }]}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </View>
      </TouchableOpacity>
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
              paddingTop: Math.max(insets.top + scaleSpacing(40), scaleSpacing(60)),
              paddingBottom: Math.max(insets.bottom, responsiveMargin.medium),
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
          <Text style={[styles.title, { fontSize: scaleFontSize(32), marginBottom: scaleSpacing(12) }]}>Contact Us</Text>
          <Text style={[styles.subtitle, { fontSize: scaleFontSize(16), marginBottom: responsiveMargin.large, lineHeight: scaleFontSize(22) }]}>We'd love to hear from you! Fill out the form below and we'll get back to you soon.</Text>
          <TextInput
            style={[
              styles.input, 
              styles.disabledInput,
              {
                borderRadius: responsiveBorderRadius.medium,
                paddingHorizontal: responsivePadding.horizontal,
                paddingVertical: scaleSpacing(14),
                fontSize: scaleFontSize(16),
                marginBottom: responsiveMargin.medium,
                minHeight: getResponsiveInputHeight(),
              }
            ]}
            placeholder="Name"
            value={name}
            editable={false}
            selectTextOnFocus={false}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={[
              styles.input, 
              styles.disabledInput,
              {
                borderRadius: responsiveBorderRadius.medium,
                paddingHorizontal: responsivePadding.horizontal,
                paddingVertical: scaleSpacing(14),
                fontSize: scaleFontSize(16),
                marginBottom: responsiveMargin.medium,
                minHeight: getResponsiveInputHeight(),
              }
            ]}
            placeholder="ID"
            value={userId}
            editable={false}
            selectTextOnFocus={false}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              {
                borderRadius: responsiveBorderRadius.medium,
                paddingHorizontal: responsivePadding.horizontal,
                paddingVertical: scaleSpacing(14),
                fontSize: scaleFontSize(16),
                marginBottom: responsiveMargin.medium,
                height: scaleSpacing(100),
              }
            ]}
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[
              styles.button, 
              (!message) && styles.buttonDisabled,
              {
                borderRadius: responsiveBorderRadius.medium,
                paddingVertical: scaleSpacing(14),
                paddingHorizontal: scaleSpacing(32),
                marginTop: scaleSpacing(8),
              }
            ]}
            onPress={handleSubmit}
            disabled={!message}
          >
            <Ionicons name="send" size={20} color="#fff" style={{ marginRight: scaleSpacing(8) }} />
            <Text style={[styles.buttonText, { fontSize: scaleFontSize(18) }]}>Send</Text>
          </TouchableOpacity>
          {submitted && <Text style={[styles.success, { fontSize: scaleFontSize(16), marginTop: responsiveMargin.medium }]}>Thank you for contacting us!</Text>}
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    color: '#222',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  success: {
    color: '#22C55E',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backButtonCircle: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
}); 