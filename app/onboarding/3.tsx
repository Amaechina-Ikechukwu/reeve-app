import { OnboardingSlide } from '@/components/ui/onboarding-slide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function OnboardingThree() {
  const router = useRouter();

  async function finish() {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', '1');
    } catch (e) {
      console.warn('Failed to write onboarding flag', e);
    }
    // Navigate to the app's main tabs
    router.replace('/(tabs)');
  }

  return (
    <OnboardingSlide
      image={require("@/assets/images/app/concerts.jpg")}
      title="Elevate Your Connected Life"
      subtitle=""
      onPress={finish}
      index={3}
      total={3}
      onNext={finish}
      onSkip={() => router.replace('/(tabs)')}
      primaryButtonTitle="Get started"
    />
  );
}

const styles = StyleSheet.create({
  cta: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
});
