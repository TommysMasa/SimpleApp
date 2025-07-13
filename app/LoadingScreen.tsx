import React, { useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet } from 'react-native';

const COLORS = {
  background: '#F7F5F3',
  logo: '#4A6FA5',
};

export default function LoadingScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}>Manga Lounge</Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 44,
    fontWeight: 'bold',
    color: COLORS.logo,
    letterSpacing: 1.5,
  },
}); 