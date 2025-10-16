import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ProductDetail = any;

export default function GiftCardDetail() {
  const params = useLocalSearchParams();
  const id = String(params?.id ?? '');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view this product', 'error');
          setLoading(false);
          return;
        }
        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const res = await fetch(`${API_BASE_URL}/reloadly/giftcard/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();
        if (mounted) setProduct(data?.data ?? null);
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed to load product', 'error');
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { mounted = false; };
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: product?.productName ?? 'Gift card',
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
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme, product]);

  const placeOrder = async () => {
    if (!product) return;
    const productId = product.productId ?? product.id;
    if (!productId) {
      showToast('Product id missing', 'error');
      return;
    }
    // determine unitPrice: prefer selectedDenomination, then fixedRecipientDenominations[0], then unitPrice from product
    const unitPrice = selectedDenomination ?? (product.fixedRecipientDenominations && product.fixedRecipientDenominations[0]) ?? product.unitPrice ?? null;
    if (!unitPrice) {
      showToast('Please select a denomination', 'error');
      return;
    }

    setPlacingOrder(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to place an order', 'error');
        setPlacingOrder(false);
        return;
      }
      const token = await user.getIdToken(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
      const url = `${API_BASE_URL}/reloadly/order/${encodeURIComponent(String(productId))}`;
      const body = { quantity, unitPrice };
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        if (data && typeof data === 'object' && data.message) showToast(data.message, 'error');
        else showToast(`HTTP ${res.status}: ${text}`, 'error');
        setPlacingOrder(false);
        return;
      }
      if (data && data.success) {
        showToast('Order placed', 'success');
        // navigate to orders or transaction detail if you have one
        router.push('/giftcards' as any);
      } else if (data && data.message) {
        showToast(data.message, 'info');
      } else {
        showToast('Order placed', 'success');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <ThemedView style={styles.center}><ActivityIndicator /></ThemedView>;

  if (!product) return <ThemedView style={styles.center}><ThemedText>No product found.</ThemedText></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* hero image */}
        {product.logoUrls?.[0] ? (
          <Image source={{ uri: product.logoUrls[0] }} style={[styles.heroImage, { width: Math.min(width - 32, 640) }]} />
        ) : null}

        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>{product.productName}</ThemedText>
          <ThemedText style={{ opacity: 0.8 }}>{product.brand?.brandName}</ThemedText>

          {product.category?.name ? <ThemedText style={{ marginTop: 8 }}>Category: {product.category.name}</ThemedText> : null}
          {product.country?.name ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              {product.country.flagUrl ? <Image source={{ uri: product.country.flagUrl }} style={{ width: 28, height: 18, marginRight: 8 }} /> : null}
              <ThemedText>Country: {product.country.name} ({product.country.isoName})</ThemedText>
            </View>
          ) : null}

          <ThemedText style={{ marginTop: 12, fontWeight: '600' }}>Denominations</ThemedText>
          {product.fixedRecipientDenominations && product.fixedRecipientDenominations.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {product.fixedRecipientDenominations.map((d: any) => (
                <TouchableOpacity key={String(d)} onPress={() => setSelectedDenomination(d)} style={[styles.denomBtn, selectedDenomination === d ? { backgroundColor: Colors[colorScheme ?? 'light'].tint, borderColor: Colors[colorScheme ?? 'light'].tint } : null]}>
                  <ThemedText style={selectedDenomination === d ? { color: '#fff' } : undefined}>{d}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ThemedText>No fixed denominations</ThemedText>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 }}>
              <ThemedText>-</ThemedText>
            </TouchableOpacity>
            <ThemedText style={{ marginHorizontal: 12 }}>{quantity}</ThemedText>
            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 }}>
              <ThemedText>+</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={{ marginTop: 12 }}>Unit price: {selectedDenomination ?? (product.fixedRecipientDenominations && product.fixedRecipientDenominations[0]) ?? product.unitPrice ?? 'N/A'}</ThemedText>
          <ThemedText>Total: {((selectedDenomination ?? (product.fixedRecipientDenominations && product.fixedRecipientDenominations[0]) ?? product.unitPrice) as number) ? ((selectedDenomination ?? (product.fixedRecipientDenominations && product.fixedRecipientDenominations[0]) ?? product.unitPrice) as number) * quantity : 'N/A'}</ThemedText>

          <ThemedText style={{ marginTop: 12, fontWeight: '600' }}>Redeem instructions</ThemedText>
          {product.redeemInstruction?.concise ? (
            <ThemedText>{product.redeemInstruction.concise}</ThemedText>
          ) : product.redeemInstruction?.verbose ? (
            <ThemedText>{product.redeemInstruction.verbose}</ThemedText>
          ) : (
            <ThemedText>No instructions provided</ThemedText>
          )}

          <View style={{ marginTop: 16 }}>
            {placingOrder ? (
              <ActivityIndicator />
            ) : (
              <Button title="Place Order" onPress={placeOrder} />
            )}
          </View>

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8 },
  card: { padding: 12, borderWidth: 1, borderRadius: 8, borderColor: '#ddd' },
  logo: { width: 120, height: 60, resizeMode: 'contain' },
  heroImage: { height: 180, alignSelf: 'center', resizeMode: 'contain', borderRadius: 8, marginBottom: 12 },
  denomBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8, marginBottom: 8 },
  denomSelected: { backgroundColor: '#0066ff', borderColor: '#0066ff' as any },
});
