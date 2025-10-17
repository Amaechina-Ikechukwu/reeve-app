import SectionCard from '@/components/ui/SectionCard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api } from '../../lib/api';
import type { Transaction, TransactionsResponse } from '../../types/transactions';

type PagedResponse = {
  success: boolean;
  message?: string;
  data: Transaction[];
  nextCursor?: string | null;
};

// Basic transactions screen with infinite scroll and pull-to-refresh
export default function TransactionsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Transactions',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[scheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[scheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[scheme ?? 'light'].text,
      // Do not override headerLeft so default back button shows.
    });
  }, [navigation, scheme]);
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);

  const fetchPage = useCallback(async (reset = false) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      if (reset) {
        setError(null);
        setHasMore(true);
        setCursor(null);
        setItems([]);
      }
      const qs = new URLSearchParams();
      if (!reset && cursor) qs.set('cursor', cursor);
      // Use a conservative page size to reduce rate limit pressure
      qs.set('limit', '20');
      const path = `/transactions?${qs.toString()}`;
      const data = await api.get<PagedResponse | TransactionsResponse>(path, {
        ttlMs: reset ? 0 : 10_000, // short cache when paginating
        key: `txns-${cursor ?? 'first'}`,
      });

      const list = (data as any).data ?? [];
      setItems((prev) => (reset ? list : [...prev, ...list]));
      const next = (data as any).nextCursor ?? null;
      setCursor(next);
      setHasMore(Boolean(next) || (Array.isArray(list) && list.length > 0));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load transactions');
    } finally {
      loadingMoreRef.current = false;
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [cursor, refreshing]);

  useEffect(() => {
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(true);
  }, [fetchPage]);

  const renderItem = useCallback(({ item }: { item: Transaction }) => (
    <SectionCard style={{ marginHorizontal: 12, marginVertical: 6 }}>
      <View style={[styles.row, { paddingVertical: 0, paddingHorizontal: 0 }]}>
        <View style={styles.left}>
          <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>{item.description || item.type}</Text>
          <Text style={[styles.sub, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, item.flow === 'credit' ? styles.credit : styles.debit]}>
            {item.flow === 'credit' ? '+' : '-'}{formatAmount(item.amount)}
          </Text>
          <Text style={[styles.status, { color: isDark ? 'rgba(255,255,255,0.8)' : '#444' }]}>{item.status}</Text>
        </View>
      </View>
    </SectionCard>
  ), [isDark]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={() => {
        if (hasMore) fetchPage(false);
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={hasMore ? (
        <View style={styles.footer}><ActivityIndicator /></View>
      ) : null}
      ListEmptyComponent={!loading ? (
        <View style={styles.center}><Text>No transactions yet</Text></View>
      ) : null}
      contentContainerStyle={items.length === 0 ? styles.flexGrow : undefined}
    />
  );
}

function formatAmount(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)}`;
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  flexGrow: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  left: { flexShrink: 1, paddingRight: 12 },
  right: { alignItems: 'flex-end' },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
  credit: { color: '#12a150' },
  debit: { color: '#c92a2a' },
  status: { fontSize: 12, opacity: 0.8, marginTop: 2 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e5e5', marginLeft: 16 },
  footer: { paddingVertical: 16 },
  errorText: { color: '#c92a2a' },
});
