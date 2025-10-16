import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type OrderItem = {
  order: string;
  status: string;
  charge?: string;
  start_count?: string;
  remains?: string;
  currency?: string;
};

export default function SizzleIndex() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view orders', 'error');
          setLoading(false);
          return;
        }

        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

        const response = await fetch(`${API_BASE_URL}/sizzle/orders`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data.orders)) {
          if (mounted) setOrders(data.data.orders as OrderItem[]);
        } else if (data.success && Array.isArray(data.data)) {
          if (mounted) setOrders(data.data as OrderItem[]);
        } else {
          // fallback: if API returns single items
          if (data.success && data.data?.order) {
            if (mounted) setOrders([data.data as OrderItem]);
          } else {
            if (mounted) setOrders([]);
          }
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to fetch orders', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const renderEmpty = () => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="tray" size={48} color={Colors[colorScheme ?? 'light'].icon} />
      <ThemedText style={styles.emptyText}>No sizzle orders found</ThemedText>
      <Button title="Buy Sizzle" onPress={() => router.push('/sizzle/purchase')} />
    </ThemedView>
  );

  const renderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() =>
        router.push({ pathname: '/sizzle/order/[order]/status', params: { order: item.order } })
      }
    >
      <ThemedText type="defaultSemiBold">Order #{item.order}</ThemedText>
      <ThemedText style={styles.itemStatus}>{item.status}</ThemedText>
      <ThemedText style={styles.itemSub}>{item.charge ? `${item.charge} ${item.currency ?? ''}` : ''}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loader}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {orders.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.order}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 20 },
  itemCard: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemStatus: { marginTop: 6, opacity: 0.9 },
  itemSub: { marginTop: 4, opacity: 0.7 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { marginVertical: 12, fontSize: 16 },
});
