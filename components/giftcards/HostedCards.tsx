import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

type HostedCard = any;

export default function HostedCards() {
  const [cards, setCards] = useState<HostedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchCards = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view hosted cards', 'error');
          setCards([]);
          setLoading(false);
          return;
        }
        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE_URL}/giftcards/available`, { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ value: '' }) });
        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { data = text; }
        if (!res.ok) {
          showToast(`HTTP ${res.status}: ${text}`, 'error');
          if (mounted) setCards([]);
          return;
        }
        if (data && Array.isArray(data.cards)) {
          if (mounted) setCards(data.cards as HostedCard[]);
        } else {
          if (mounted) setCards([]);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed to load cards', 'error');
        if (mounted) setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCards();
    return () => { mounted = false; };
  }, []);

  const renderCard = ({ item }: { item: HostedCard }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/giftcards/hosted/[id]', params: { id: item.id } } as any)}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.cardImage} /> : null}
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={{ opacity: 0.8 }}>{item.type} — {item.value}</ThemedText>
        <ThemedText style={{ marginTop: 8 }}>Price: {item.price}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.actionsRow}>
  <TouchableOpacity style={styles.action} onPress={() => router.push('/giftcards/hosted/sell' as any)}>
          <IconSymbol name="tag" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText>Sell</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => router.push('/giftcards/purchased' as any)}>
          <IconSymbol name="wallet" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText>Purchased</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => router.push('/giftcards/uploaded' as any)}>
          <IconSymbol name="cloud-upload" size={24} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText>Uploaded</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator />
      ) : cards.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ThemedText type="defaultSemiBold">You don't have any hosted cards yet</ThemedText>
          <ThemedText style={{ marginTop: 8, opacity: 0.8, textAlign: 'center' }}>Share and sell unused gift cards to earn — it only takes a minute to list your first card.</ThemedText>
          <Button title="Sell a card" onPress={() => router.push('/giftcards/hosted/sell' as any)} />
        </View>
      ) : (
        <FlatList data={cards} renderItem={renderCard} keyExtractor={(c) => String(c.id)} contentContainerStyle={{ paddingBottom: 40 }} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  action: { alignItems: 'center', gap: 6 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12 },
  cardImage: { width: 96, height: 56, marginRight: 12, resizeMode: 'cover', borderRadius: 6 },
});
