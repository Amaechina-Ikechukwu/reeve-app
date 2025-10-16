import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Operator = {
  id?: number | string;
  title?: string;
  slug?: string;
  style?: string;
  gradient_start?: string;
  gradient_end?: string;
  type?: string;
  is_prepaid?: boolean;
  esim_type?: string;
  image?: { url?: string; width?: number; height?: number };
  country?: { slug?: string; country_code?: string; title?: string };
  packages_count?: number;
};

export default function EsimOperators() {
  const params = useLocalSearchParams();
  const slug = (params?.slug as string) ?? '';
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();
  const navigation = useNavigation();

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to view operators', 'error');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      const res = await fetch(`${API_BASE_URL}/airalo/countries/${encodeURIComponent(slug)}/operators`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setOperators(data.data as Operator[]);
      } else if (Array.isArray(data)) {
        setOperators(data as Operator[]);
      } else {
        setOperators([]);
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load operators', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchOperators();
  }, [slug]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)} Operators` : 'Operators',
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme, slug]);

  const renderOperator = ({ item }: { item: Operator }) => (
    <TouchableOpacity
      style={styles.operatorItem}
      onPress={() =>
        router.push({
          pathname: '/esim/packages',
          params: { operator: String(item.id ?? item.slug ?? ''), country: slug, operatorTitle: item.title ?? item.slug },
        } as any)
      }
    >
      <View style={styles.row}>
        {item.image?.url ? (
          <Image source={{ uri: item.image.url }} style={styles.logo} />
        ) : (
          <ThemedText style={styles.logoFallback}>🏷️</ThemedText>
        )}
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {item.title || item.slug}
        </ThemedText>
      </View>
      <ThemedText>Packages: {item.packages_count ?? 0}</ThemedText>
      <ThemedText>Type: {item.esim_type ?? (item.is_prepaid ? 'Prepaid' : 'Unknown')}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      ) : operators.length === 0 ? (
        <ThemedText style={styles.emptyText}>No operators found.</ThemedText>
      ) : (
        <FlatList
          data={operators}
          keyExtractor={(item) => String(item.id ?? item.slug ?? Math.random().toString())}
          renderItem={renderOperator}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  listContainer: { paddingBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, opacity: 0.8 },
  operatorItem: { padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: { width: 64, height: 40, marginRight: 12, resizeMode: 'cover', borderRadius: 6 },
  logoFallback: { fontSize: 20, marginRight: 12 },
  title: { textTransform: 'capitalize' },
  backButton: { padding: 8, marginRight: 16 },
});
