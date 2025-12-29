import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { ToastProvider } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('Error preventing splash screen auto-hide:', error);
});

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Hide splash screen immediately
  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch((error) => {
      console.warn('Error hiding splash screen:', error);
    });
  }, []);

  return (
    <ToastProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: '' }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
          <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
          <Stack.Screen name="bvn/index" options={{ headerShown: false }} />
          <Stack.Screen name="bvn/verify-phone" options={{ headerShown: false }} />
          <Stack.Screen name="bvn/verify-otp" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ToastProvider>
  );
}
