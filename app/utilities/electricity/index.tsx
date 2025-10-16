import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import React, { useLayoutEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import OptionsModal from '@/components/ui/options-modal';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableOpacity } from 'react-native';

type BuyResponse = {
  success: boolean;
  message?: string;
  required_amount?: number;
  service_charge?: number;
  total_required?: number;
  current_balance?: number;
  data?: any;
};

export default function ElectricityUtilities() {
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('enugu-electric');
  const [variationId, setVariationId] = useState('prepaid');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [servicesModalVisible, setServicesModalVisible] = useState(false);
  const [variationModalVisible, setVariationModalVisible] = useState(false);

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { showToast } = useToast();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Electricity',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
    });
  }, [navigation, colorScheme]);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const ELECTRICITY_SERVICES = [
    'ikeja-electric',
    'eko-electric',
    'kano-electric',
    'portharcourt-electric',
    'jos-electric',
    'ibadan-electric',
    'kaduna-electric',
    'abuja-electric',
    'enugu-electric',
    'benin-electric',
    'aba-electric',
    'yola-electric',
  ];

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.getIdToken(true);
  };

  const handleBuy = async () => {
    if (!customerId || !serviceId || !variationId || !amount) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/utility/buy-electricity`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          service_id: serviceId,
          variation_id: variationId,
          amount: numericAmount,
        }),
      });

      const text = await res.text();
      let json: BuyResponse = {} as any;
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text } as any;
      }

      if (!res.ok) {
        if (json && (json.required_amount || json.total_required)) {
          showToast(json.message || 'Insufficient balance', 'error');
        } else {
          showToast(json.message || `HTTP ${res.status}`, 'error');
        }
        return;
      }

      showToast(json.message || 'Electricity purchase successful', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
     

      <ThemedTextInput
        placeholder="Customer ID / Meter No"
        value={customerId}
        onChangeText={setCustomerId}
      />

      <ThemedText style={{ marginTop: 8 }}>Service ID</ThemedText>
      <TouchableOpacity onPress={() => setServicesModalVisible(true)} activeOpacity={0.8}>
        <View pointerEvents="none">
          <ThemedTextInput
            placeholder="service id (eg enugu-electric)"
            value={serviceId}
            onChangeText={setServiceId}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <ThemedText style={{ marginTop: 8 }}>Variation</ThemedText>
      <TouchableOpacity onPress={() => setVariationModalVisible(true)} activeOpacity={0.8}>
        <View pointerEvents="none">
          <ThemedTextInput
            placeholder="variation id (eg prepaid)"
            value={variationId}
            onChangeText={setVariationId}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      <ThemedText style={{ marginTop: 8 }}>Amount</ThemedText>
      <ThemedTextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={{ marginTop: 16 }}>
        <Button title="Buy" onPress={handleBuy} loading={loading} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}

      <OptionsModal
        visible={servicesModalVisible}
        onClose={() => setServicesModalVisible(false)}
        options={ELECTRICITY_SERVICES}
        onSelect={(s) => setServiceId(s)}
        title="Select electricity service"
      />

      <OptionsModal
        visible={variationModalVisible}
        onClose={() => setVariationModalVisible(false)}
        options={["prepaid", "postpaid"]}
        onSelect={(s) => setVariationId(s)}
        title="Select variation"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginBottom: 12, textAlign: 'center' },
});
