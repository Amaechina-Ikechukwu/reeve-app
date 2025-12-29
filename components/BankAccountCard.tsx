import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Types
export type AccountData = {
  account_number?: string;
  account_status?: string;
  amount?: number;
  bank_name?: string;
};

interface Props {
  accountData: AccountData | null;
  accountLoading: boolean;
  accountError: string | null;
  userFullname?: string | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BankAccountCard: React.FC<Props> = ({ accountData, accountLoading, accountError, userFullname, showToast }) => {
  const formatCurrency = (amount?: number) => {
    const value = typeof amount === 'number' ? amount : 0;
    try {
      return '₦' + value.toLocaleString('en-NG');
    } catch {
      return `₦${value}`;
    }
  };

  const formatAccountNumber = (acc?: string) => {
    if (!acc) return '•••• ••• •••';
    if (/^\d{10}$/.test(acc)) {
      return acc.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return acc;
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16, marginTop: 90 }}>
      <BlurView intensity={70} style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Ionicons name="wallet-outline" size={18} color="#EAF4F6" />
          <Text style={{ color: '#EAF4F6', fontWeight: '600', fontSize: 14, flex: 1 }}>Wallet Account</Text>
          {!!accountData?.account_status && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: accountData.account_status === 'ACTIVE' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: accountData.account_status === 'ACTIVE' ? '#86efac' : '#fca5a5' }}>{accountData.account_status}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#EAF4F6', fontSize: 16, fontWeight: '700' }}>
              {accountData?.bank_name ?? (accountLoading ? 'Loading…' : accountError ? 'Login required' : 'Bank')}
            </Text>
            <Text style={{ color: '#D1E6EA', fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              {accountData?.account_number ? formatAccountNumber(accountData.account_number) : '•••• ••• •••'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7df2c2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
            <Ionicons name="cash-outline" size={14} color="#0b3b2e" />
            <Text style={{ color: '#0b3b2e', fontWeight: '700', fontSize: 13 }}>{formatCurrency(accountData?.amount)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={async () => {
              if (!accountData) return;
              const payload = `Bank: ${accountData.bank_name}\nAccount: ${accountData.account_number}\nName: ${userFullname}`;
              await Clipboard.setStringAsync(payload);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showToast('Account details copied', 'success');
            }}
            style={styles.action}
          >
            <Ionicons name="copy-outline" size={14} color="#EAF4F6" />
            <Text style={{ color: '#EAF4F6', fontSize: 12, fontWeight: '600' }}>Copy details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={async () => {
              if (!accountData?.account_number) return;
              await Clipboard.setStringAsync(accountData.account_number);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showToast('Account number copied', 'success');
            }}
            style={styles.action}
          >
            <Ionicons name="copy" size={14} color="#EAF4F6" />
            <Text style={{ color: '#EAF4F6', fontSize: 12, fontWeight: '600' }}>Copy number</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 22,
    minHeight: 150,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)'
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)'
  }
});

export default BankAccountCard;
