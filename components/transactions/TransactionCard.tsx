import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Transaction } from '../../types/transactions';
import { Colors } from '../../constants/theme';

type Props = {
  transaction: Transaction;
  onPress?: () => void;
};

const typeIconMap: Record<string, { name: string; color: string }> = {
  airtime: { name: 'phone-portrait-outline', color: '#06b6d4' },
  data: { name: 'wifi-outline', color: '#6366f1' },
  electricity: { name: 'flash-outline', color: '#f59e0b' },
  cable: { name: 'tv-outline', color: '#8b5cf6' },
  vtu: { name: 'call-outline', color: '#10b981' },
  giftcard: { name: 'gift-outline', color: '#06b6d4' },
  card: { name: 'card-outline', color: '#f97316' },
  transfer: { name: 'swap-horizontal-outline', color: '#3b82f6' },
  esim: { name: 'wifi', color: '#6366f1' },
  sizzle: { name: 'trending-up-outline', color: '#7c3aed' },
};

export const TransactionCard: React.FC<Props> = ({ transaction, onPress }) => {
  const icon = typeIconMap[transaction.type] ?? { name: 'receipt-outline', color: '#6b7280' };
  const isCredit = transaction.flow === 'credit';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: `${icon.color}22` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.title}>{transaction.description ?? transaction.type}</Text>
          <Text style={styles.time}>{new Date(transaction.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          {isCredit ? '+' : '-'}{formatAmount(transaction.amount)}
        </Text>
        <Text style={styles.status}>{transaction.status}</Text>
      </View>
    </TouchableOpacity>
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
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, paddingRight: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  meta: { maxWidth: '72%' },
  title: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  time: { fontSize: 12, opacity: 0.7, marginTop: 2, color: Colors.light.text },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 14, fontWeight: '700' },
  credit: { color: '#12a150' },
  debit: { color: '#c92a2a' },
  status: { fontSize: 12, opacity: 0.8, marginTop: 4, color: Colors.light.text },
});

export default TransactionCard;
