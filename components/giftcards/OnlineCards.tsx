import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import OptionsModal from '@/components/ui/options-modal';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Product = any;

export default function OnlineCards() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to browse products', 'error');
          setProducts([]);
          setLoading(false);
          return;
        }

        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE_URL}/reloadly/products`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          if (mounted) setProducts(data.data as Product[]);
        } else if (Array.isArray(data)) {
          if (mounted) setProducts(data as Product[]);
        } else {
          if (mounted) setProducts([]);
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed to load products', 'error');
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    // fetch categories + countries lazily
    const fetchMeta = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        // categories
        try {
          const res = await fetch(`${API_BASE_URL}/reloadly/product-categories`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.data)) {
              if (mounted) setCategories(data.data);
            }
          }
        } catch (e) {
          // ignore meta fetch errors
        }
        // countries
        try {
          const res = await fetch(`${API_BASE_URL}/reloadly/countries`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.data)) {
              if (mounted) setCountries(data.data);
            }
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore
      }
    };
    fetchMeta();
    return () => { mounted = false; };
  }, []);

  // simple fuzzy match: checks if all characters in pattern exist in order in text (case-insensitive)
  const fuzzyMatch = (text: string, pattern: string) => {
    if (!pattern) return true;
    const t = text.toLowerCase();
    const p = pattern.toLowerCase();
    let pi = 0;
    for (let i = 0; i < t.length && pi < p.length; i++) {
      if (t[i] === p[pi]) pi++;
    }
    return pi === p.length;
  };

  useEffect(() => {
    // client-side filtering
    const q = query.trim();
    const out = products.filter((p: any) => {
      // match query against productName, brandName, and shortDescription if available
      const name = String(p.productName || '');
      const brand = String((p.brand && p.brand.brandName) || '');
      const desc = String(p.shortDescription || '');
      const textToSearch = [name, brand, desc].join(' ');
      if (q && !fuzzyMatch(textToSearch, q)) return false;
      if (selectedCategory != null) {
        // product may have category id or category name; try both
        if (p.categoryId && p.categoryId !== selectedCategory) return false;
        if (p.category && p.category !== selectedCategory && String(p.category).toLowerCase() !== String(selectedCategory)) {
          // also allow matching by category name
          const cat = categories.find(c => c.id === selectedCategory);
          if (cat && p.category && String(p.category).toLowerCase() !== String(cat.name).toLowerCase()) return false;
        }
      }
      if (selectedCountry) {
        // product may have countryCode or availableCountries array
        if (p.countryCode && String(p.countryCode).toLowerCase() !== selectedCountry.toLowerCase()) return false;
        if (p.availableCountries && Array.isArray(p.availableCountries)) {
          const found = p.availableCountries.find((c: any) => String(c).toLowerCase() === selectedCountry.toLowerCase() || (c.isoName && String(c.isoName).toLowerCase() === selectedCountry.toLowerCase()));
          if (!found && !p.countryCode) return false;
        }
      }
      return true;
    });
    setFiltered(out);
  }, [products, query, selectedCategory, selectedCountry, categories]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/giftcards/online/[id]', params: { id: String(item.productId ?? item.id ?? '') } } as any)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.logoUrls?.[0] ? <Image source={{ uri: item.logoUrls[0] }} style={styles.logo} /> : null}
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{item.productName}</ThemedText>
          <ThemedText style={{ opacity: 0.8 }}>{item.brand?.brandName}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></ThemedView>;

  return (
    <ThemedView style={{ flex: 1, padding: 12 }}>
      {/* search + filters */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder="Search products..."
          value={query}
          onChangeText={setQuery}
          style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setCountryModalVisible(true)} style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
            <ThemedText>{selectedCountry ? `Country: ${selectedCountry}` : 'Select country'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
            <ThemedText>{selectedCategory ? `Category: ${categories.find(c => c.id === selectedCategory)?.name ?? selectedCategory}` : 'Select category'}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setQuery(''); setSelectedCategory(null); setSelectedCountry(null); }} style={{ padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8 }}>
            <ThemedText>Clear</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList data={filtered.length ? filtered : products} keyExtractor={(i) => String(i.productId)} renderItem={renderProduct} contentContainerStyle={{ paddingBottom: 40 }} />

      {/* Category picker */}
      <OptionsModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title="Select category"
        options={["All", ...categories.map((c: any) => String(c.name))]}
        onSelect={(name) => {
          if (name === 'All') setSelectedCategory(null);
          else {
            const match = categories.find((c: any) => String(c.name) === name);
            setSelectedCategory(match ? match.id : null);
          }
        }}
      />

      {/* Country picker */}
      <OptionsModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        title="Select country"
        options={countries.map((c: any) => String(c.name))}
        onSelect={(code) => setSelectedCountry(code)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderWidth: 1, borderRadius: 8, borderColor: '#ddd', marginBottom: 12 },
  logo: { width: 64, height: 40, marginRight: 12, resizeMode: 'contain' },
});
