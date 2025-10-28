import { useRouter } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SectionCard } from '@/components/ui/SectionCard';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { auth } from '@/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const user = auth.currentUser;

  const handleResendEmail = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await sendEmailVerification(user);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        showToast('Email verified successfully!', 'success');
        // Navigate to next step (BVN verification or main app)
        router.replace('/(tabs)');
      } else {
        showToast('Email not yet verified. Please check your inbox.', 'info');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to check verification', 'error');
    } finally {
      setChecking(false);
    }
  };

  // Send verification email on mount if user exists and not verified
  useEffect(() => {
    if (user && !user.emailVerified) {
      sendEmailVerification(user).catch(console.error);
    }
  }, [user]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' },
            ]}
          >
            <Ionicons
              name="mail"
              size={60}
              color={Colors[colorScheme ?? 'light'].tint}
            />
          </View>
        </View>

        {/* Title */}
        <ThemedText type="title" style={styles.title}>
          Verify Your Email
        </ThemedText>

        {/* Info Card */}
        <SectionCard style={styles.card}>
          <ThemedText style={styles.description}>
            We've sent a verification link to:
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.email}>
            {user?.email}
          </ThemedText>
          <View style={styles.divider} />
          <ThemedText style={styles.instructions}>
            Please check your email (including your spam/junk folder) and click the verification link to continue.
          </ThemedText>
        </SectionCard>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            title="I've Verified My Email"
            onPress={handleCheckVerification}
            loading={checking}
          />

          <Button
            title="Resend Email"
            onPress={handleResendEmail}
            loading={loading}
            size="fit"
          />
        </View>

        {/* Help Text */}
        <ThemedText style={styles.helpText}>
          Didn't receive the email? Check your spam/junk folder or click resend.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    opacity: 0.3,
  },
  instructions: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  helpText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
