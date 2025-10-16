import { Button } from '@/components/ui/button';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CreateNairaCardScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState(''); // yyyy-mm-dd
  const [address, setAddress] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [lga, setLga] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [brand, setBrand] = useState('AfriGo');

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

  const apiBase = useMemo(() => API_BASE_URL.replace(/\/$/, ''), [API_BASE_URL]);

  // Extract customer_id from various response shapes
  const extractCustomerId = (resp: any): string | null => {
    const candidates = [
      resp?.customer_id,
      resp?.data?.customer_id,
      resp?.data?.data?.customer_id,
    ].filter(Boolean);
    return (candidates[0] as string) || null;
  };

  const onSubmit = async () => {
    if (submitting) return;
    // Basic validation
    if (!firstName || !lastName || !email || !phone || !bvn || !dob || !address || !stateVal || !lga) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('You must be signed in to continue', 'error');
        return;
      }

      const idToken = await user.getIdToken(true);

      // 1) Create Customer
      const createCustomerRes = await fetch(`${apiBase}/naira-card/user/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          middle_name: middleName || undefined,
          last_name: lastName,
          email,
          phone,
          bvn,
          date_of_birth: dob,
          address,
          state: stateVal,
          lga,
          gender: gender || undefined,
          occupation: occupation || undefined,
          mode: 'sandbox',
        }),
      });

      const createCustomerJson = await createCustomerRes.json().catch(() => ({}));
      if (!createCustomerRes.ok) {
        const msg = createCustomerJson?.message || createCustomerJson?.data?.message || `Customer create failed (${createCustomerRes.status})`;
        showToast(msg, 'error', 5000);
        return;
      }

      const customerId = extractCustomerId(createCustomerJson);
      if (!customerId) {
        showToast('No customer_id returned from server', 'error');
        return;
      }

      showToast('Customer created. Creating card…', 'info');

      // 2) Create Card
      const createCardRes = await fetch(`${apiBase}/naira-card/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'virtual',
          customer_id: customerId,
          brand: brand || 'AfriGo',
        }),
      });

      const createCardJson = await createCardRes.json().catch(() => ({}));
      if (!createCardRes.ok) {
        const msg = createCardJson?.message || createCardJson?.data?.message || `Card create failed (${createCardRes.status})`;
        showToast(msg, 'error', 6000);
        return;
      }

      showToast('Naira card created successfully', 'success');
      router.replace('/cards' as any);
    } catch (e: any) {
      showToast(e?.message || 'Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Create Naira Virtual Card</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, marginTop: 8 }}>
          Fill in your details to create a customer, then we’ll create your virtual Naira card.
        </Text>

        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Middle name (optional)" value={middleName} onChangeText={setMiddleName} autoCapitalize="words" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Phone (e.g. 2347000000000)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="BVN" value={bvn} onChangeText={setBvn} keyboardType="number-pad" maxLength={11} />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} autoCapitalize="none" />
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Address" value={address} onChangeText={setAddress} />
        </View>
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.rowItem]}>
            <ThemedTextInput placeholder="State" value={stateVal} onChangeText={setStateVal} />
          </View>
          <View style={[styles.formGroup, styles.rowItem]}>
            <ThemedTextInput placeholder="LGA" value={lga} onChangeText={setLga} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.formGroup, styles.rowItem]}>
            <ThemedTextInput placeholder="Gender (optional)" value={gender} onChangeText={setGender} />
          </View>
          <View style={[styles.formGroup, styles.rowItem]}>
            <ThemedTextInput placeholder="Occupation (optional)" value={occupation} onChangeText={setOccupation} />
          </View>
        </View>
        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Brand (e.g. AfriGo)" value={brand} onChangeText={setBrand} autoCapitalize="none" />
        </View>

        <View style={{ height: 8 }} />
        <Button title="Create Customer & Card" onPress={onSubmit} loading={submitting} disabled={submitting} />
        <Button title="Cancel" onPress={() => router.back()} size="small" disabled={submitting} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  formGroup: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
});
