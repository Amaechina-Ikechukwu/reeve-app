import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { ToastProvider } from '@/contexts/ToastContext';
import { auth } from '@/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (mounted) setShouldShowOnboarding(!seen);
      } catch (e) {
        console.warn('Failed to read onboarding flag', e);
        if (mounted) setShouldShowOnboarding(false);
      } finally {
        if (mounted) setCheckedOnboarding(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      user.getIdToken().then((idToken) => {
        // console.log( idToken);
      });
    }
  }, [user]);

  // If we've finished checking auth and there's no user, ensure we land on the login screen.
  useEffect(() => {
    if (authChecked && !user) {
      // replace current route with login to avoid back nav to protected screens
      router.replace('/auth/login');
    }
  }, [authChecked, user, router]);

  return (
    <ToastProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* show a loader while we check AsyncStorage and auth */}
        {!checkedOnboarding || !authChecked ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            {!user ? (
              <>
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
              </>
            ) : shouldShowOnboarding ? (
              <Stack.Screen name="onboarding/1" options={{ headerShown: false }} />
            ) : (
              <>
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
                <Stack.Screen name="auth/verify-email" options={{ headerShown: false }} />
                <Stack.Screen name="bvn/index" options={{ headerShown: false }} />
                <Stack.Screen name="bvn/verify-phone" options={{ headerShown: false }} />
                <Stack.Screen name="bvn/verify-otp" options={{ headerShown: false }} />
              </>
            )}
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
          </Stack>
        )}
        <StatusBar style="auto" />
        {/* {checkedOnboarding && authChecked ? (
          <Pressable style={styles.reset} onPress={async () => {
            try {
              await AsyncStorage.removeItem('hasSeenOnboarding');
              setShouldShowOnboarding(true);
              // navigate to onboarding start
              router.replace('/onboarding/1');
            } catch (e) {
              console.warn('Failed to reset onboarding', e);
            }
          }} accessibilityLabel="Reset onboarding">
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        ) : null} */}
      </ThemeProvider>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reset: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    backgroundColor: '#00000066',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
