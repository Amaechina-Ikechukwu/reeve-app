import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type CardData = {
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  card_brand?: string;
  card_type?: string;
  status?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
};

type Props = {
  baseUrl?: string; // e.g. http://localhost:3000
  token?: string;
};

export const NairaVirtualCard: React.FC<Props> = ({ baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '', token = '' }) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // resolve baseUrl and token (try firebase idToken if token not provided)
        const apiBase = baseUrl.replace(/\/$/, '');
        let authToken = token;
        if (!authToken) {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            setError('User not authenticated');
            return;
          }
          authToken = await user.getIdToken(true);
        }

        const url = `${apiBase}/naira-card/details`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: authToken ? `Bearer ${authToken}` : '',
            Accept: 'application/json',
          },
        });
        const json = await res.json();
        // If API returns success: false, log the message and treat as no card
        if (json && json.success === false) {
        
          // keep card null so the UI shows the create CTA
          if (!mounted) return;
          setCard(null);
          return;
        }
        if (!mounted) return;
        if (!res.ok) {
          setError(json?.message || 'Failed to load card');
          return;
        }
        setCard(json?.data ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [baseUrl, token]);

  const mask = (value?: string) => {
    if (!value) return '';
    if (show) return value;
    // mask all but last 4
    return value.replace(/.(?=.{4})/g, '*');
  };

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
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>{error}</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, marginBottom: 12 }}>You don't have a naira virtual card yet.</Text>
        <Pressable onPress={() => router.push('/cards/create' as any)} style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}> 
          <Text style={{ color: '#fff' }}>Create a Naira Virtual Card</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.card, { borderColor: Colors[colorScheme ?? 'light'].tint }]}>
        <Text style={[styles.brand, { color: Colors[colorScheme ?? 'light'].text }]}>{card.card_brand ?? 'Card'}</Text>
        <Text style={[styles.number, { color: Colors[colorScheme ?? 'light'].text }]}>{mask(card.card_number)}</Text>
        <View style={styles.row}>
          <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Expiry: {mask(`${card.expiry_month}/${card.expiry_year}`)}</Text>
          <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>CVV: {mask(card.cvv)}</Text>
        </View>
      </View>

      <Pressable onPress={() => setShow((s) => !s)} style={styles.button}>
        <Text style={{ color: '#fff' }}>{show ? 'Hide' : 'Show'} details</Text>
      </Pressable>

      <View style={{ marginTop: 16 }}>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontWeight: '600' }}>Cardholder</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>{card.customer_name}</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>{card.customer_email}</Text>
        <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>{card.customer_phone}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  brand: {
    fontSize: 14,
    marginBottom: 8,
  },
  number: {
    fontSize: 20,
    letterSpacing: 2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NairaVirtualCard;
