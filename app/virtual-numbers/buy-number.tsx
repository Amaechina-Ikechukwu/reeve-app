import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Country = { iso: string; text_en: string };

type ProviderInfo = {
	cost: number;
	count: number;
	rate?: number;
};

// API returns an object keyed by product name; each value is an object keyed by provider name
type ProductsResponse = Record<string, Record<string, ProviderInfo>>;

type Product = {
	name: string;
	providers: { provider: string; cost: number; count: number; rate?: number }[];
};

export default function BuyVirtualNumber() {
	const colorScheme = useColorScheme();
	const navigation = useNavigation();
	const router = useRouter();
	const { showToast } = useToast();

	const [countries, setCountries] = useState<Country[]>([]);
	const [countriesLoading, setCountriesLoading] = useState(false);
	const [countryModalVisible, setCountryModalVisible] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<Country | null>({ iso: 'nigeria', text_en: 'Nigeria' });

	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTitle: 'Buy Virtual Number',
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
	}, [navigation, router, colorScheme]);

	const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

	const fetchCountries = async () => {
		try {
			setCountriesLoading(true);
			const auth = getAuth();
			const user = auth.currentUser;
			if (!user) {
				showToast('Please log in to view countries', 'error');
				return;
			}
			const token = await user.getIdToken(true);
			const res = await fetch(`${API_BASE_URL}/virtual-numbers/countries`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (data.success && Array.isArray(data.data)) setCountries(data.data as Country[]);
			else setCountries([]);
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Failed to load countries', 'error');
		} finally {
			setCountriesLoading(false);
		}
	};

	const fetchProducts = async (countryIso: string) => {
		try {
			setLoading(true);
			const auth = getAuth();
			const user = auth.currentUser;
			if (!user) {
				showToast('Please log in to view products', 'error');
				return;
			}
			const token = await user.getIdToken(true);
			const res = await fetch(`${API_BASE_URL}/virtual-numbers/prices/${countryIso}`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`HTTP ${res.status}: ${text}`);
			}
			const data = await res.json();
			const items: Product[] = [];
			if (data.success && data.data && typeof data.data === 'object') {
				const resp = data.data as ProductsResponse;
				for (const productName of Object.keys(resp)) {
					const providers = resp[productName];
					const provs = Object.keys(providers).map(p => ({ provider: p, ...providers[p] }));
					items.push({ name: productName, providers: provs });
				}
			}
			// Sort by total availability desc, then by name
			items.sort((a, b) => {
				const aTotal = a.providers.reduce((sum, p) => sum + p.count, 0);
				const bTotal = b.providers.reduce((sum, p) => sum + p.count, 0);
				return bTotal - aTotal || a.name.localeCompare(b.name);
			});
			setProducts(items);
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Failed to load products', 'error');
			setProducts([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// initial load with default Nigeria
		fetchProducts(selectedCountry?.iso ?? 'nigeria');
		// prefetch countries silently
		fetchCountries();
	}, []);

	const filteredProducts = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return products;
		return products.filter((p) =>
			p.name.toLowerCase().includes(q) ||
			p.providers.some(prov => prov.provider.toLowerCase().includes(q))
		);
	}, [products, search]);

	const openCountryModal = () => {
		if (countries.length === 0 && !countriesLoading) fetchCountries();
		setCountryModalVisible(true);
	};

	const selectCountry = (c: Country) => {
		setSelectedCountry(c);
		setCountryModalVisible(false);
		fetchProducts(c.iso);
	};

	const renderHeader = () => (
		<View style={styles.topBar}>
			<TouchableOpacity style={styles.countryPill} onPress={openCountryModal}>
				<IconSymbol name="globe" size={16} color={Colors[colorScheme ?? 'light'].text} />
				<ThemedText style={styles.countryText}>{selectedCountry?.text_en ?? 'Select country'}</ThemedText>
				<IconSymbol name="chevron.down" size={16} color={Colors[colorScheme ?? 'light'].text} />
			</TouchableOpacity>
			<ThemedTextInput
				placeholder="Search products..."
				value={search}
				onChangeText={setSearch}
				// style={styles.search}
			/>
		</View>
	);

	const renderItem = ({ item }: { item: Product }) => (
		<ThemedView style={styles.card}>
			<View style={{ flex: 1 }}>
				<ThemedText type="defaultSemiBold" style={{ textTransform: 'capitalize' }}>
					{item.name}
				</ThemedText>
				<View style={styles.providersContainer}>
					{item.providers.map((prov, idx) => (
						<TouchableOpacity
							key={prov.provider}
							style={[
								styles.providerRow,
								{
									borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : '#e0e0e0',
									backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f8f8',
								},
								prov.count <= 0 && styles.disabledProvider
							]}
							disabled={prov.count <= 0}
							onPress={() => {
								if (process.env.EXPO_OS === 'ios') {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								}
								router.push({
									pathname: '/virtual-numbers/purchase',
									params: {
										country: selectedCountry?.iso ?? 'nigeria',
										product: item.name,
										provider: prov.provider,
										cost: String(prov.cost),
									},
								});
							}}
						>
							<ThemedText style={{ opacity: 0.7, fontSize: 14 }}>{prov.provider}</ThemedText>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<ThemedText type="defaultSemiBold" style={{ fontSize: 16, marginRight: 8 }}>₦{prov.cost}</ThemedText>
								<IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].text} />
							</View>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</ThemedView>
	);

	if (loading) {
		return (
			<ThemedView style={styles.loader}>
				<ActivityIndicator />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			{renderHeader()}
			{filteredProducts.length === 0 ? (
				<View style={styles.empty}>
					<ThemedText>No products found</ThemedText>
					<Button title="Change Country" size="small" onPress={openCountryModal} />
				</View>
			) : (
				<FlatList
					data={filteredProducts}
					keyExtractor={(i) => i.name}
					renderItem={renderItem}
					contentContainerStyle={styles.list}
				/>
			)}

			<Modal
				visible={countryModalVisible}
				animationType="slide"
				transparent
				onRequestClose={() => setCountryModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<ThemedView style={styles.modalCard}>
						<View style={styles.modalHeader}>
							<ThemedText type="title">Select Country</ThemedText>
							<Pressable onPress={() => setCountryModalVisible(false)}>
								<IconSymbol name="xmark" size={22} color={Colors[colorScheme ?? 'light'].text} />
							</Pressable>
						</View>
						{countriesLoading ? (
							<View style={styles.centerRow}>
								<ActivityIndicator />
							</View>
						) : (
							<FlatList
								data={countries}
								keyExtractor={(c) => c.iso}
								renderItem={({ item }) => (
									<TouchableOpacity style={styles.countryRow} onPress={() => selectCountry(item)}>
										<ThemedText>{item.text_en}</ThemedText>
										{selectedCountry?.iso === item.iso ? (
											<IconSymbol name="checkmark" size={18} color={Colors[colorScheme ?? 'light'].tint} />
										) : null}
									</TouchableOpacity>
								)}
								ItemSeparatorComponent={() => (
									<View style={[styles.sep, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
								)}
								contentContainerStyle={{ paddingBottom: 20 }}
							/>
						)}
					</ThemedView>
				</View>
			</Modal>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	list: { padding: 16 },
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 10,
	},
	topBar: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
	},
	countryPill: {
		alignSelf: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		marginBottom: 10,
	},
	countryText: { marginHorizontal: 4 },
	search: { marginBottom: 6 },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalCard: { maxHeight: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
	modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
	centerRow: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
	countryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
	sep: { height: 1 },
	backButton: { padding: 8 },
	providersContainer: { marginTop: 8 },
	providerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent:"space-between",
		marginTop: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		borderWidth: 1,
		height:50
	},
	disabledProvider: { opacity: 0.5 },
});

