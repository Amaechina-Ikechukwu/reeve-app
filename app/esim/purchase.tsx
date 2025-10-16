import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PurchaseEsim() {
  const params = useLocalSearchParams();
  // prefer operatorId param (explicit id) but fall back to operator (legacy)
  const operatorId = (params?.operatorId as string) ?? (params?.operator as string) ?? '';
  const operator = (params?.operator as string) ?? operatorId;
  const country = (params?.country as string) ?? '';
  const packageId = (params?.packageId as string) ?? (params?.package as string) ?? '';
  const packageTitle = (params?.packageTitle as string) ?? '';
  const price = params?.price ?? params?.price_ngn ?? undefined;

  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Confirm eSIM Purchase',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
      headerLeft: () => (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme]);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to place an order', 'error');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const url = `${API_BASE_URL}/airalo/orders?packageId=${encodeURIComponent(packageId)}&operatorId=${encodeURIComponent(operatorId)}`;

      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        // If backend returns structured JSON error, show message
        if (data && typeof data === 'object' && data.message) {
          if (data.required && data.available !== undefined) {
            // insufficient funds
            showToast(data.message + ` (required: ${data.required}, available: ${data.available})`, 'error');
          } else {
            showToast(data.message, 'error');
          }
        } else {
          showToast(`HTTP ${res.status}: ${text}`, 'error');
        }
        setLoading(false);
        return;
      }

      // Success
      if (data && data.success) {
        showToast('Purchase successful', 'success');
        // Navigate to eSIM purchases page or details page
  router.push('/esim' as any);
      } else if (data && data.message) {
        showToast(data.message, 'info');
      } else {
        showToast('Order placed', 'success');
  router.push('/esim/' as any);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const operatorTitle = (params?.operatorTitle as string) ?? '';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">{packageTitle || packageId}</ThemedText>
        <ThemedText>Operator: {operatorTitle || operator}</ThemedText>
        <ThemedText>Country: {country}</ThemedText>
        {price ? <ThemedText>Price: {String(price)}</ThemedText> : null}
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Confirm Purchase" onPress={placeOrder} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 20, borderWidth: 1, borderRadius: 12, marginBottom: 24 },
  backButton: { padding: 8 },
});
