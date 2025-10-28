import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { BuyCryptoResponse, Coin } from '@/types/crypto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BuyCryptoScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [coinModalVisible, setCoinModalVisible] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);

  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; coins: Coin[] }>(
        '/crypto/buy/coins'
      );
      if (response.success) {
        setCoins(response.coins);
        // Auto-select first coin if available
        if (response.coins.length > 0 && !selectedCoin) {
          setSelectedCoin(response.coins[0]);
        }
      }
    } catch (error) {
      showToast('Failed to load coins', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Buy Crypto',
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

  const handleBuyCrypto = async () => {
    if (!selectedCoin || !buyAmount || !walletAddress) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      setBuyLoading(true);
      const response = await api.post<BuyCryptoResponse>('/crypto/buy/enhanced', {
        coinId: selectedCoin.id,
        amountInNaira: buyAmount,
        userWalletAddress: walletAddress,
      });

      if (response.success) {
        showToast(response.message, 'success');
        // Reset form
        setBuyAmount('');
        setWalletAddress('');
        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to buy crypto', 'error');
      console.error(error);
    } finally {
      setBuyLoading(false);
    }
  };

  const renderCoinItem = ({ item }: { item: Coin }) => (
    <TouchableOpacity
      style={[
        styles.coinItem,
        selectedCoin?.id === item.id && styles.selectedCoinItem,
      ]}
      onPress={() => {
        setSelectedCoin(item);
        setCoinModalVisible(false);
      }}
    >
      <View style={styles.coinRow}>
        <ThemedText style={styles.coinIcon}>{item.icon}</ThemedText>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText type="default" style={styles.coinNetwork}>
            {item.network}
          </ThemedText>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <ThemedText type="defaultSemiBold">
          ₦{item.current_price_naira.toLocaleString()}
        </ThemedText>
        {selectedCoin?.id === item.id && (
          <IconSymbol
            name="checkmark.circle.fill"
            size={20}
            color={Colors[colorScheme ?? 'light'].tint}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const estimatedCrypto = selectedCoin && buyAmount
    ? (parseFloat(buyAmount) / selectedCoin.current_price_naira).toFixed(8)
    : '0';

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} />
        ) : (
          <>
            {/* Coin Selector */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Select Cryptocurrency</ThemedText>
              <TouchableOpacity
                style={styles.coinSelector}
                onPress={() => setCoinModalVisible(true)}
              >
                <View style={styles.coinSelectorContent}>
                  {selectedCoin ? (
                    <>
                      <ThemedText style={styles.coinSelectorIcon}>{selectedCoin.icon}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold">
                          {selectedCoin.name}
                        </ThemedText>
                        <ThemedText style={styles.coinSelectorNetwork}>
                          {selectedCoin.network}
                        </ThemedText>
                      </View>
                      <ThemedText type="defaultSemiBold" style={styles.coinPrice}>
                        ₦{selectedCoin.current_price_naira.toLocaleString()}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText>Select a coin</ThemedText>
                  )}
                  <IconSymbol
                    name="chevron.down"
                    size={20}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Amount in Naira</ThemedText>
              <ThemedTextInput
                placeholder="Enter amount in ₦"
                value={buyAmount}
                onChangeText={setBuyAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Wallet Address Input */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Your Wallet Address</ThemedText>
              <ThemedTextInput
                placeholder={`Enter your ${selectedCoin?.network || 'wallet'} address`}
                value={walletAddress}
                onChangeText={setWalletAddress}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Estimate Box */}
            {selectedCoin && buyAmount && (
              <View style={styles.estimateBox}>
                <ThemedText style={styles.estimateLabel}>You will receive:</ThemedText>
                <ThemedText type="title" style={styles.estimateValue}>
                  {estimatedCrypto} {selectedCoin.symbol}
                </ThemedText>
                <ThemedText style={styles.estimateSubtext}>
                  Rate: ₦{selectedCoin.current_price_naira.toLocaleString()} per {selectedCoin.symbol}
                </ThemedText>
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={20} color="#007BFF" />
              <ThemedText style={styles.infoText}>
                Your crypto will be sent to your wallet address within 10-30 minutes after payment confirmation.
              </ThemedText>
            </View>

            {/* Buy Button */}
            <View style={styles.buttonContainer}>
              <Button
                title={`Buy ${selectedCoin?.symbol || 'Crypto'}`}
                onPress={handleBuyCrypto}
                loading={buyLoading}
                disabled={!selectedCoin || !buyAmount || !walletAddress}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Coin Selection Modal */}
      <Modal
        visible={coinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Select Coin</ThemedText>
              <Pressable onPress={() => setCoinModalVisible(false)}>
                <IconSymbol
                  name="xmark"
                  size={22}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </Pressable>
            </View>
            <FlatList
              data={coins}
              keyExtractor={(item) => item.id}
              renderItem={renderCoinItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  coinSelector: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
  },
  coinSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinSelectorIcon: {
    fontSize: 32,
  },
  coinSelectorNetwork: {
    fontSize: 12,
    color: '#888',
  },
  coinPrice: {
    marginRight: 8,
  },
  estimateBox: {
    backgroundColor: '#007BFF10',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007BFF30',
  },
  estimateLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  estimateValue: {
    fontSize: 28,
    color: '#007BFF',
    marginBottom: 4,
  },
  estimateSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E7F3FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#004085',
  },
  buttonContainer: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderRadius: 8,
  },
  selectedCoinItem: {
    backgroundColor: '#007BFF10',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  coinIcon: {
    fontSize: 32,
  },
  coinNetwork: {
    color: '#888',
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
