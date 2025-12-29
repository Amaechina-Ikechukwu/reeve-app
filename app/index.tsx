import SplashScreen from '@/components/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  // Redirect to onboarding if user hasn't seen it
  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // Otherwise redirect to main app
  return <Redirect href="/(tabs)" />;
}
