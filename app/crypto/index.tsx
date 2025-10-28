import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { Coin } from '@/types/crypto';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CryptoScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; coins: Coin[] }>(
        '/crypto/buy/coins'
      );
      if (response.success) {
        setCoins(response.coins);
      }
    } catch (error) {
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
        headerTitle: 'Crypto',
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <IconSymbol
              size={24}
              name="chevron.left"
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        ),
      });
    }, [navigation, router, colorScheme]);

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path as any);
  };

  const renderCoinItem = ({ item }: { item: Coin }) => (
    <TouchableOpacity style={styles.coinItem}>
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
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Action Cards */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => handleNavigate('/crypto/buy')}
        >
          <LinearGradient
            colors={['rgba(40, 167, 69, 0.15)', 'rgba(40, 167, 69, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionCardGradient}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#28A745' }]}>
              <MaterialCommunityIcons name="arrow-down-circle" size={32} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={styles.actionTitle}>
              Buy Crypto
            </ThemedText>
            <ThemedText style={styles.actionDescription}>
              Purchase cryptocurrency with Naira
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => handleNavigate('/crypto/sell')}
        >
          <LinearGradient
            colors={['rgba(220, 53, 69, 0.15)', 'rgba(220, 53, 69, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionCardGradient}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#DC3545' }]}>
              <MaterialCommunityIcons name="arrow-up-circle" size={32} color="#FFFFFF" />
            </View>
            <ThemedText type="title" style={styles.actionTitle}>
              Sell Crypto
            </ThemedText>
            <ThemedText style={styles.actionDescription}>
              Convert cryptocurrency to Naira
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Available Coins Section */}
      <View style={styles.coinsSection}>
        <ThemedText type="title" style={styles.sectionTitle}>
          Available Cryptocurrencies
        </ThemedText>
        
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? 'light'].text}
            style={styles.loader}
          />
        ) : coins.length === 0 ? (
          <ThemedText style={styles.emptyText}>No coins available</ThemedText>
        ) : (
          <FlatList
            data={coins}
            keyExtractor={(item) => item.id}
            renderItem={renderCoinItem}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  coinsSection: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    opacity: 0.8,
  },
  coinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'transparent',
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
  },
  	backButton: {
		padding: 8,
		marginRight: 16,
	},
});
