import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleFontSize, scaleSpacing, getResponsivePadding, getResponsiveMargin, getResponsiveBorderRadius } from '../utils/responsive';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const responsivePadding = getResponsivePadding();
  const responsiveMargin = getResponsiveMargin();
  const responsiveBorderRadius = getResponsiveBorderRadius();

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
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: responsivePadding.horizontal,
            paddingTop: Math.max(insets.top + scaleSpacing(40), scaleSpacing(60)),
            paddingBottom: Math.max(insets.bottom, responsiveMargin.medium),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { fontSize: scaleFontSize(32), marginBottom: responsiveMargin.large }]}>Settings</Text>
        <View style={[styles.menuList, { marginTop: responsiveMargin.medium }]}>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: scaleSpacing(18) }]} onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={24} color="#6366F1" style={[styles.menuIcon, { marginRight: responsiveMargin.medium }]} />
            <Text style={[styles.menuText, { fontSize: scaleFontSize(18) }]}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={[styles.menuArrow, { marginLeft: scaleSpacing(8) }]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: scaleSpacing(18) }]} onPress={() => router.push('/contact')}>
            <Ionicons name="mail-outline" size={24} color="#6366F1" style={[styles.menuIcon, { marginRight: responsiveMargin.medium }]} />
            <Text style={[styles.menuText, { fontSize: scaleFontSize(18) }]}>Contact</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={[styles.menuArrow, { marginLeft: scaleSpacing(8) }]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: scaleSpacing(18) }]} onPress={() => Linking.openURL('https://docs.google.com/document/d/14t9aHzjedxMGTB7-3JncpY0ARyljt3pzFv3b87Oe7z8/edit?usp=sharing')}>
            <Ionicons name="document-text-outline" size={24} color="#6366F1" style={[styles.menuIcon, { marginRight: responsiveMargin.medium }]} />
            <Text style={[styles.menuText, { fontSize: scaleFontSize(18) }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={[styles.menuArrow, { marginLeft: scaleSpacing(8) }]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { paddingVertical: scaleSpacing(18) }]} onPress={() => Linking.openURL('https://docs.google.com/document/d/1MzkEqOgJxMN331SuUivt8S8Fs_7lqrz1pCqsijoE3Tw/edit?usp=sharing')}>
            <Ionicons name="reader-outline" size={24} color="#6366F1" style={[styles.menuIcon, { marginRight: responsiveMargin.medium }]} />
            <Text style={[styles.menuText, { fontSize: scaleFontSize(18) }]}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={[styles.menuArrow, { marginLeft: scaleSpacing(8) }]} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  title: {
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  menuList: {
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuIcon: {
  },
  menuText: {
    flex: 1,
    color: '#222',
    fontWeight: '500',
  },
  menuArrow: {
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