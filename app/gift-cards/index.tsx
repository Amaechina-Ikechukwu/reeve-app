import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardItem = any;

export default function GiftcardsIndex() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Gift Cards',
      headerTitleAlign: 'center',
      headerBackTitle: '',
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

  useEffect(() => {
    let mounted = true;
    const fetchCards = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view your gift cards', 'error');
          setCards([]);
          setLoading(false);
          return;
        }

        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE_URL}/reloadly/user-cards`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          if (mounted) setCards(data.data as CardItem[]);
        } else if (Array.isArray(data)) {
          if (mounted) setCards(data as CardItem[]);
        } else {
          if (mounted) setCards([]);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed to load gift cards', 'error');
        if (mounted) setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCards();
    return () => {
      mounted = false;
    };
  }, []);

  const renderCard = ({ item }: { item: CardItem }) => (
    <TouchableOpacity style={styles.cardItem} onPress={() => router.push({ pathname: '/gift-cards/detail', params: { id: item.id } } as any)}>
      <View style={styles.row}>
        {item.productDetails?.logoUrls?.[0] ? (
          <Image source={{ uri: item.productDetails.logoUrls[0] }} style={styles.logo} />
        ) : (
          <IconSymbol name="card-outline" size={36} color={Colors[colorScheme ?? 'light'].text} />
        )}
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{item.product?.productName ?? item.productDetails?.productName ?? 'Gift Card'}</ThemedText>
          <ThemedText>{item.status}</ThemedText>
          <ThemedText>Amount: {item.amount ?? item.totalPrice ?? ''} {item.currencyCode ?? ''}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </ThemedView>
    );
  }

  if (!loading && cards.length === 0) {
    return (
      <ThemedView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ThemedText type="title">No gift cards</ThemedText>
        <ThemedText style={{ textAlign: 'center', marginTop: 12 }}>You don't have any gift cards yet.</ThemedText>
        <Button title="Browse Gift Cards" onPress={() => router.push({ pathname: '/giftcards/market' })} style={{ marginTop: 20 }} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(i) => i.id || Math.random().toString()}
        renderItem={renderCard}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  listContainer: { paddingBottom: 20 },
  cardItem: { padding: 12, marginBottom: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  row: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 56, height: 36, marginRight: 12, resizeMode: 'contain' },
});
