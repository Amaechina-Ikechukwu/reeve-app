import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PurchaseItem = {
	activationId?: number;
	id?: number;
	phone?: string;
	product?: string;
	price?: number;
	status?: string;
	createdAt?: string;
	expires?: string;
};

export default function VirtualNumbersIndex() {
	const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
	const [loading, setLoading] = useState(true);
	const colorScheme = useColorScheme();
	const navigation = useNavigation();
	const { showToast } = useToast();
	const router = useRouter();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTitle: 'Virtual Numbers',
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
			// Do not override headerLeft so default back button shows.
		});
	}, [navigation, colorScheme]);

	useEffect(() => {
		let mounted = true;

		const fetchPurchases = async () => {
			setLoading(true);
			try {
				const auth = getAuth();
				const user = auth.currentUser;
				if (!user) {
					showToast('Please log in to view purchases', 'error');
					setLoading(false);
					return;
				}

				const token = await user.getIdToken(true);
				const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

				const res = await fetch(`${API_BASE_URL}/virtual-numbers/purchases`, {
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
				if (data.success && Array.isArray(data.data)) {
					if (mounted) setPurchases(data.data as PurchaseItem[]);
				} else if (data.success && Array.isArray(data.data.purchases)) {
					if (mounted) setPurchases(data.data.purchases as PurchaseItem[]);
				} else {
					if (mounted) setPurchases([]);
				}
			} catch (err) {
				showToast(err instanceof Error ? err.message : 'Failed to fetch purchases', 'error');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchPurchases();
		return () => {
			mounted = false;
		};
	}, []);

	const renderEmpty = () => (
			<ThemedView style={styles.emptyContainer}>
					<ThemedText style={styles.emptyText}>No virtual numbers found</ThemedText>
					<Button title="Buy Virtual Number" onPress={() => router.push('/virtual-numbers/buy-number')} />
				</ThemedView>
	);

	const renderItem = ({ item }: { item: PurchaseItem }) => (
		<TouchableOpacity
			style={styles.itemCard}
			onPress={() => {
				// no detail screen currently; if exists, navigate accordingly
			}}>
			<ThemedText type="defaultSemiBold">{item.product ?? 'Virtual Number'}</ThemedText>
			<ThemedText style={styles.itemSub}>{item.phone ?? item.activationId ?? ''}</ThemedText>
			<ThemedText style={styles.itemStatus}>{item.status ?? ''}</ThemedText>
		</TouchableOpacity>
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
			{purchases.length === 0 ? (
				renderEmpty()
			) : (
				<FlatList
					data={purchases}
					keyExtractor={(i) => `${i.id ?? i.activationId ?? Math.random()}`}
					renderItem={renderItem}
					contentContainerStyle={styles.listContent}
				/>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	listContent: { padding: 20 },
	itemCard: {
		padding: 16,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 12,
	},
	itemStatus: { marginTop: 6, opacity: 0.9 },
	itemSub: { marginTop: 4, opacity: 0.7 },
	emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
	emptyText: { marginVertical: 12, fontSize: 16 },
});
