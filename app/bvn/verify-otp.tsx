import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/SectionCard';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/lib/api';
import Ionicons from '@expo/vector-icons/Ionicons';

interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    phoneNumber: string;
    verified: boolean;
  };
}

export default function VerifyOTPScreen() {
  const params = useLocalSearchParams<{
    otpId: string;
    phoneNumber: string;
    name: string;
  }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [currentOtpId, setCurrentOtpId] = useState(params.otpId);
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<VerifyOTPResponse>('/accounts/dojah/bvn/verify', {
        method: 'POST',
        body: {
          otpCode,
          otpId: currentOtpId,
        },
      });

      if (response.success ) {
        showToast('BVN verified successfully!', 'success');
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        showToast('OTP verification failed. Please try again.', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to verify OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: {
          otpId: string;
          expiresIn: number;
        };
      }>('/accounts/dojah/bvn/resend-otp', {
        method: 'POST',
        body: {
          sessionId: currentOtpId,
        },
      });

      if (response.success && response.data.otpId) {
        setCurrentOtpId(response.data.otpId);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        showToast(response.message || 'OTP resent successfully', 'success');
      } else {
        showToast('Failed to resend OTP', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to resend OTP', 'error');
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={60}
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            Enter OTP
          </ThemedText>

          {/* Info Card */}
          <SectionCard style={styles.card}>
            <ThemedText style={styles.infoText}>
              We've sent a 6-digit verification code to:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.phoneNumber}>
              {params.phoneNumber}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Please enter the code below to complete verification.
            </ThemedText>
          </SectionCard>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].icon + '40',
                    color: Colors[colorScheme ?? 'light'].text,
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                  },
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Submit Button */}
          <Button
            title="Verify OTP"
            onPress={handleSubmit}
            loading={loading}
            disabled={!isOtpComplete}
          />

          {/* Resend */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <ThemedText style={styles.timerText}>
                Resend code in {timer}s
              </ThemedText>
            ) : (
              <Button
                title="Resend OTP"
                onPress={handleResend}
                loading={resending}
                size="fit"
              />
            )}
          </View>

          {/* Help Text */}
          <ThemedText style={styles.helpText}>
            Didn't receive the code? Check your SMS or try resending.
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
  infoText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 12,
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  helpText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
