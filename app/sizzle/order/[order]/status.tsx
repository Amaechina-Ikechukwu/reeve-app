import { useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type OrderStatus = {
  order: string;
  status: string;
  charge: string;
  start_count: string;
  remains: string;
  currency: string;
};

export default function OrderStatusPage() {
  const params = useLocalSearchParams();
  const orderId = params.order as string | undefined;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const { showToast } = useToast();
  const colorScheme = useColorScheme();

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view order status', 'error');
          setLoading(false);
          return;
        }

        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

        const resp = await fetch(`${API_BASE_URL}/sizzle/order/${orderId}/status`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${text}`);
        }

        const data = await resp.json();
        if (data.success && data.data) {
          if (mounted) setOrder(data.data as OrderStatus);
        } else {
          showToast(data.message || 'Failed to fetch order status', 'error');
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Network error', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatus();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <ThemedView style={styles.loader}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No order details available</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.row}>Order: {order.order}</ThemedText>
        <ThemedText style={styles.row}>Status: {order.status}</ThemedText>
        <ThemedText style={styles.row}>Charge: {order.charge} {order.currency}</ThemedText>
        <ThemedText style={styles.row}>Start count: {order.start_count}</ThemedText>
        <ThemedText style={styles.row}>Remains: {order.remains}</ThemedText>
      </View>

      <Button title="Refresh" onPress={() => {
        // simple refresh by re-running effect: toggle loading
        setLoading(true);
        setOrder(null);
      }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 16, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  row: { marginBottom: 6 },
});
