import Skeleton from '@/components/ui/skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { api } from '../../lib/api';
import type { Transaction, TransactionsResponse } from '../../types/transactions';
import { ThemedText } from '../themed-text';

type Props = {
  limit?: number; // default 4
  onError?: (msg: string) => void;
};

export const RecentTransactions: React.FC<Props> = ({ limit = 4, onError }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is logged in before making API call
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          if (mounted) {
            setLoading(false);
            setItems([]);
          }
          return;
        }
        
        const data = await api.get<TransactionsResponse>(`/transactions/recents?limit=${encodeURIComponent(String(limit))}`, {
          ttlMs: 15_000, // cache briefly to prevent spamming endpoint
          signal: controller.signal,
          key: `recents-${limit}`,
        });
        if (!mounted) return;
        
        // Add mock transactions for testing
        const mockTransactions: Transaction[] = [
          {
            id: 'txn-001',
            amount: 2500,
            type: 'airtime',
            status: 'completed',
            description: 'MTN Airtime Purchase',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            flow: 'debit',
          },
          {
            id: 'txn-002',
            amount: 15000,
            type: 'transfer',
            status: 'completed',
            description: 'Account Credit',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
            flow: 'credit',
          },
          {
            id: 'txn-003',
            amount: 5000,
            type: 'data',
            status: 'completed',
            description: 'Data Bundle Purchase',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            flow: 'debit',
          },
          {
            id: 'txn-004',
            amount: 8500,
            type: 'electricity',
            status: 'completed',
            description: 'Electricity Token - IKEDC',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
            flow: 'debit',
          },
        ];
        
        const transactions = data?.data ?? [];
        setItems([...mockTransactions, ...transactions].slice(0, limit));
      } catch (e: any) {
        const msg = e?.message ?? 'Failed to load recent transactions';
        setError(msg);
        onError?.(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [limit]);

  if (loading) {
    // Shimmer skeletons while loading
    return (
      <View>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ marginBottom: i === 2 ? 0 : 10 }}>
            <View
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 18,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Skeleton width={'60%'} height={14} />
                  <Skeleton width={'40%'} height={10} style={{ marginTop: 8 }} />
                </View>
                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <Skeleton width={70} height={14} />
                  <Skeleton width={50} height={10} style={{ marginTop: 8 }} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.center}>
        <ThemedText>No recent transactions</ThemedText>
      </View>
    );
  }

  // Card container for each transaction
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push('/transactions' as any)}
          activeOpacity={0.85}
          style={styles.cardTouchable}
        >
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                shadowOpacity: isDark ? 0.12 : 0.08,
              },
            ]}
          >
            <View style={styles.cardLeft}>
              <ThemedText style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
                {item.description || item.type}
              </ThemedText>
              <ThemedText style={[styles.sub, { color: isDark ? 'rgba(255,255,255,0.6)' : '#888' }]}>
                {new Date(item.createdAt).toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.cardRight}>
              <ThemedText style={[styles.amount, item.flow === 'credit' ? styles.credit : styles.debit]}>
                {item.flow === 'credit' ? '+' : '-'}{formatAmount(item.amount)}
              </ThemedText>
              <ThemedText style={[styles.status, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>{item.status}</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
};

function formatAmount(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)}`;
  }
}

const styles = StyleSheet.create({
  center: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  cardTouchable: {
    borderRadius: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    // border for light/dark mode can be added if needed
  },
  cardLeft: { flexShrink: 1, paddingRight: 12 },
  cardRight: { alignItems: 'flex-end' },
  title: { fontSize: 15, fontWeight: '600', color: '#222' },
  sub: { fontSize: 12, opacity: 0.7, marginTop: 2, color: '#888' },
  amount: { fontSize: 15, fontWeight: '700' },
  credit: { color: '#12a150' },
  debit: { color: '#c92a2a' },
  status: { fontSize: 12, opacity: 0.8, marginTop: 2, color: '#666' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e5e5' },
  errorText: { color: '#c92a2a' },
});

export default RecentTransactions;
