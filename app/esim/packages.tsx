import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PackageItem = {
  id?: number | string;
  title?: string;
  price?: number;
  currency?: string;
  validity?: string;
  data?: string;
  description?: string;
};

export default function EsimPackages() {
  const params = useLocalSearchParams();
  // operator may be an id (number) or slug; operatorTitle is optional human title passed from previous screen
  const operator = (params?.operator as string) ?? '';
  const operatorTitle = (params?.operatorTitle as string) ?? '';
  const country = (params?.country as string) ?? '';
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();
  const navigation = useNavigation();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to view packages', 'error');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken(true);

      // Try primary endpoint: country-scoped operator packages
  // If operator looks numeric, prefer numeric id in path; otherwise use slug
  const opSegment = /^[0-9]+$/.test(String(operator)) ? encodeURIComponent(operator) : encodeURIComponent(operator);
  const primary = `${API_BASE_URL}/airalo/countries/${encodeURIComponent(country)}/operators/${opSegment}/packages`;
      let res = await fetch(primary, { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

      // Fallback to a secondary endpoint if primary fails with 404
      if (res.status === 404) {
        const fallback = `${API_BASE_URL}/airalo/operators/${encodeURIComponent(operator)}/packages?country=${encodeURIComponent(country)}`;
        res = await fetch(fallback, { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      // Support either array or { success: true, data: [...] }
      if (Array.isArray(data)) setPackages(data as PackageItem[]);
      else if (data && Array.isArray(data.data)) setPackages(data.data as PackageItem[]);
      else setPackages([]);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load packages', 'error');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (operator && country) fetchPackages();
  }, [operator, country]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: operator ? `${operator.charAt(0).toUpperCase() + operator.slice(1)} Packages` : 'Packages',
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
  }, [navigation, router, colorScheme, operator]);

  const renderPackage = ({ item }: { item: PackageItem & any }) => (
    <TouchableOpacity
      style={styles.packageItem}
      onPress={() =>
        router.push({
          pathname: '/esim/purchase',
          params: {
            operatorId: operator,
            operatorTitle: operatorTitle,
            country,
            packageId: item.id,
            packageTitle: item.title,
            price: item.price ?? item.price_ngn ?? item.net_price,
            price_ngn: item.price_ngn ?? item.price_ngn,
          },
        } as any)
      }
    >
      <ThemedText type="defaultSemiBold">{item.title ?? item.description ?? 'Package'}</ThemedText>
      {/* <ThemedText>{item.data ?? ''} • {item.day ? `${item.day} days` : ''}</ThemedText> */}
      <ThemedText> NGN {item.price_ngn ?? item.price_ngn ?? ''}</ThemedText>
      {item.short_info ? <ThemedText>{item.short_info}</ThemedText> : null}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
      ) : packages.length === 0 ? (
        <ThemedText style={styles.emptyText}>No packages available.</ThemedText>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => String(item.id ?? item.title ?? Math.random().toString())}
          renderItem={renderPackage}
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
  packageItem: { padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  backButton: { padding: 8, marginRight: 16 },
});
