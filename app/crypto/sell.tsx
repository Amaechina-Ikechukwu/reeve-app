import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { Coin, CoinSellAddress, SellEstimate } from '@/types/crypto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
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
  View
} from 'react-native';

export default function SellCryptoScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [coinModalVisible, setCoinModalVisible] = useState(false);
  const [sellCryptoAmount, setSellCryptoAmount] = useState('');
  const [sellEstimate, setSellEstimate] = useState<SellEstimate | null>(null);
  const [sellAddressInfo, setSellAddressInfo] = useState<CoinSellAddress | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

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
          fetchSellAddress(response.coins[0].id);
        }
      }
    } catch (error) {
      showToast('Failed to load coins', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellAddress = async (coinId: string) => {
    setAddressLoading(true);
    try {
      const response = await api.get<CoinSellAddress>(
        `/crypto/sell/address/${coinId}`
      );
      if (response.success) {
        setSellAddressInfo(response);
      }
    } catch (error) {
      showToast('Failed to fetch sell address', 'error');
      console.error(error);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Sell Crypto',
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

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setCoinModalVisible(false);
    setSellEstimate(null);
    setSellCryptoAmount('');
    fetchSellAddress(coin.id);
  };

  const handleGetSellEstimate = async () => {
    if (!selectedCoin || !sellCryptoAmount) {
      showToast('Please enter crypto amount', 'error');
      return;
    }

    const amount = parseFloat(sellCryptoAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (sellAddressInfo && amount < sellAddressInfo.coin.minimum_amount) {
      showToast(
        `Minimum amount is ${sellAddressInfo.coin.minimum_amount} ${selectedCoin.symbol}`,
        'error'
      );
      return;
    }

    try {
      setEstimateLoading(true);
      const response = await api.post<SellEstimate>('/crypto/sell/estimate', {
        coinId: selectedCoin.id,
        cryptoAmount: sellCryptoAmount,
      });

      if (response.success) {
        setSellEstimate(response);
        showToast('Estimate calculated successfully', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to get estimate', 'error');
      console.error(error);
    } finally {
      setEstimateLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showToast('Address copied to clipboard', 'success');
  };

  const renderCoinItem = ({ item }: { item: Coin }) => (
    <TouchableOpacity
      style={[
        styles.coinItem,
        selectedCoin?.id === item.id && styles.selectedCoinItem,
      ]}
      onPress={() => handleCoinSelect(item)}
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
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={Colors[colorScheme ?? 'light'].tint}
          />
        )}
      </View>
    </TouchableOpacity>
  );

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
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Wallet Address Box */}
            {addressLoading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : (
              sellAddressInfo && (
                <View style={styles.addressBox}>
                  <View style={styles.addressHeader}>
                    <MaterialCommunityIcons name="wallet-outline" size={24} color="#856404" />
                    <ThemedText type="defaultSemiBold" style={styles.addressTitle}>
                      Send {selectedCoin?.symbol} to this address
                    </ThemedText>
                  </View>

                  <View style={styles.walletAddressContainer}>
                    <ThemedText style={styles.walletAddress} selectable>
                      {sellAddressInfo.coin.our_wallet_address}
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(sellAddressInfo.coin.our_wallet_address)}
                    >
                      <MaterialCommunityIcons name="content-copy" size={20} color="#007BFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.addressInfoRow}>
                    <ThemedText style={styles.addressInfoLabel}>Minimum:</ThemedText>
                    <ThemedText style={styles.addressInfoValue}>
                      {sellAddressInfo.coin.minimum_amount} {selectedCoin?.symbol}
                    </ThemedText>
                  </View>
                  <View style={styles.addressInfoRow}>
                    <ThemedText style={styles.addressInfoLabel}>Rate:</ThemedText>
                    <ThemedText style={styles.addressInfoValue}>
                      ₦{sellAddressInfo.coin.current_rate_naira.toLocaleString()}
                    </ThemedText>
                  </View>
                  <View style={styles.addressInfoRow}>
                    <ThemedText style={styles.addressInfoLabel}>Service Charge:</ThemedText>
                    <ThemedText style={styles.addressInfoValue}>
                      ₦{sellAddressInfo.coin.service_charge.toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              )
            )}

            {/* Amount Input */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>
                How much {selectedCoin?.symbol || 'crypto'} are you sending?
              </ThemedText>
              <ThemedTextInput
                placeholder={`Enter ${selectedCoin?.symbol || 'crypto'} amount`}
                value={sellCryptoAmount}
                onChangeText={setSellCryptoAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Get Estimate Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Calculate Estimate"
                onPress={handleGetSellEstimate}
                loading={estimateLoading}
                disabled={!selectedCoin || !sellCryptoAmount}
              />
            </View>

            {/* Estimate Details */}
            {sellEstimate && (
              <View style={styles.estimateBox}>
                <ThemedText type="title" style={styles.estimateTitle}>
                  Estimate Breakdown
                </ThemedText>

                <View style={styles.estimateRow}>
                  <ThemedText>Crypto Amount:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {sellEstimate.crypto_amount} {sellEstimate.coin.symbol}
                  </ThemedText>
                </View>

                <View style={styles.estimateRow}>
                  <ThemedText>Current Rate:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    ₦{sellEstimate.current_rate.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.estimateRow}>
                  <ThemedText>Gross Amount:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    ₦{sellEstimate.gross_amount.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.estimateRow}>
                  <ThemedText>Service Charge:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.chargeText}>
                    -₦{sellEstimate.service_charge.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <ThemedText type="defaultSemiBold" style={styles.totalLabel}>
                    You'll Receive:
                  </ThemedText>
                  <ThemedText type="title" style={styles.netAmount}>
                    ₦{sellEstimate.net_amount.toLocaleString()}
                  </ThemedText>
                </View>

                <View style={styles.noteBox}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#28A745" />
                  <ThemedText style={styles.note}>{sellEstimate.note}</ThemedText>
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="information" size={20} color="#007BFF" />
              <ThemedText style={styles.infoText}>
                <ThemedText type="defaultSemiBold">How it works:{'\n'}</ThemedText>
                1. Send your crypto to the address above{'\n'}
                2. Get an estimate to know how much you'll receive{'\n'}
                3. Funds will be credited to your account after confirmation
              </ThemedText>
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
                <MaterialCommunityIcons
                  name="close"
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
  addressBox: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addressTitle: {
    fontSize: 16,
    color: '#856404',
    flex: 1,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  walletAddress: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#000',
  },
  copyButton: {
    padding: 8,
  },
  addressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  addressInfoLabel: {
    fontSize: 14,
    color: '#856404',
  },
  addressInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  estimateBox: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  estimateTitle: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  chargeText: {
    color: '#DC3545',
  },
  divider: {
    height: 2,
    backgroundColor: '#007BFF',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
  },
  netAmount: {
    color: '#28A745',
    fontSize: 24,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
  },
  note: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#155724',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E7F3FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#004085',
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
