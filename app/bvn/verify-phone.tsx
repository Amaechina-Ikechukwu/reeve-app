import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/SectionCard';
import { ThemedTextInput } from '@/components/ui/text-input';
import { accent, Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiFetch } from '@/lib/api';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VerifyPhoneScreen() {
  const params = useLocalSearchParams<{
    sessionId: string;
    maskedPhone: string;
    lastThree: string;
    name: string;
    expiresIn: string;
  }>();
  const [phoneInput, setPhoneInput] = useState('');
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate that the last 3 digits match
    if (!phoneInput || phoneInput.length < 3) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    const lastThreeInput = phoneInput.slice(-3);
    if (lastThreeInput !== params.lastThree) {
      showToast('Phone number does not match BVN records', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: {
          otpId: string;
          message: string;
        };
      }>('/accounts/dojah/bvn/phone', {
        method: 'POST',
        body: {
          completePhone: phoneInput,
          sessionId: params.sessionId,
        },
      });

      if (response.success && response.data.otpId) {
        showToast(response.message || 'OTP sent to your phone number', 'success');
        // Navigate to OTP verification with the new otpId
        router.push({
          pathname: '/bvn/verify-otp',
          params: {
            otpId: response.data.otpId,
            phoneNumber: phoneInput,
            name: params.name,
          },
        });
      } else {
        showToast('Phone verification failed', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to verify phone number', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                name="call-outline"
                size={60}
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            Verify Phone Number
          </ThemedText>

          {/* Welcome Card */}
          <SectionCard style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
              Welcome, {params.name}!
            </ThemedText>
            <View style={styles.divider} />
            <ThemedText style={styles.infoText}>
              We found a phone number linked to your BVN:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.maskedPhone}>
              {params.maskedPhone}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Please complete your phone number to receive an OTP.
            </ThemedText>
          </SectionCard>

          {/* Phone Input */}
          <View style={styles.formSection}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Phone Number
            </ThemedText>
            <ThemedTextInput
              placeholder={`Enter number ending in ${params.lastThree}`}
              value={phoneInput}
              onChangeText={(text) => setPhoneInput(text.replace(/\D/g, ''))}
              keyboardType="phone-pad"
              maxLength={15}
              style={styles.input}
            />
            <ThemedText style={styles.hint}>
              Must end with {params.lastThree}
            </ThemedText>
          </View>

          {/* Submit Button */}
          <Button
            title="Continue"
            onPress={handleSubmit}
            loading={loading}
            disabled={phoneInput.length < 3}
          />

          {/* Session Timer */}
          <View style={styles.timerContainer}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors[colorScheme ?? 'light'].icon}
            />
            <ThemedText style={styles.timerText}>
              Session expires in {Math.floor(parseInt(params.expiresIn || '900') / 60)} minutes
            </ThemedText>
          </View>
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
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    opacity: 0.3,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  maskedPhone: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 12,
    letterSpacing: 2,
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
        borderWidth:1,
        borderColor:accent,
        height:50,
        padding:5,
        borderRadius:10
  },
  hint: {
    fontSize: 13,
    opacity: 0.6,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  timerText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
