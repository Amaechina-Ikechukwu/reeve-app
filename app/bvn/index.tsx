import { useRouter } from 'expo-router';
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

interface BVNStartResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    maskedPhone: string;
    lastThree: string;
    expiresIn: number;
    name: string;
    bvnData: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
    };
  };
}

export default function BVNScreen() {
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();

  const handleSubmit = async () => {
    // Validate BVN (11 digits)
    if (!bvn || bvn.length !== 11 || !/^\d{11}$/.test(bvn)) {
      showToast('Please enter a valid 11-digit BVN', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<BVNStartResponse>('/accounts/dojah/bvn/start', {
        method: 'POST',
        body: { bvn },
      });

      if (response.success) {
        console.log(JSON.stringify(response,null,2))
        showToast(response.message || 'BVN verified successfully!', 'success');
        // Navigate to phone verification with session data
        router.push({
          pathname: '/bvn/verify-phone',
          params: {
            sessionId: response.data?.sessionId || '',
            maskedPhone: response.data?.maskedPhone || '',
            lastThree: response.data?.lastThree || '',
            name: response.data?.name || '',
            expiresIn: response.data?.expiresIn?.toString() || '300',
          },
        });
      } else {
        showToast('BVN verification failed', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to verify BVN', 'error');
      console.log(error)
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
                name="person-outline"
                size={60}
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText type="title" style={styles.title}>
            BVN Verification
          </ThemedText>

          {/* Info Card */}
          <SectionCard style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.infoText}>
                We need to verify your identity using your Bank Verification Number (BVN).
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <ThemedText style={styles.securityText}>
              🔒 Your BVN is encrypted and secure. We comply with all data protection regulations.
            </ThemedText>
          </SectionCard>

          {/* BVN Input */}
          <View style={styles.formSection}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Bank Verification Number (BVN)
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter your 11-digit BVN"
              value={bvn}
              onChangeText={(text) => setBvn(text.replace(/\D/g, '').slice(0, 11))}
              keyboardType="number-pad"
              maxLength={11}
              style={styles.input}
            />
            <ThemedText style={styles.hint}>
              Dial *565*0# to get your BVN
            </ThemedText>
          </View>

          {/* Submit Button */}
          <Button
            title="Verify BVN"
            onPress={handleSubmit}
            loading={loading}
            disabled={bvn.length !== 11}
          />

          {/* Help Text */}
          <ThemedText style={styles.helpText}>
            Having trouble? Contact support for assistance.
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
    opacity: 0.3,
  },
  securityText: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
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
  helpText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
