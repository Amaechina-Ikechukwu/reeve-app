import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PurchaseItem = {
	id?: string;
	package?: string;
	country?: string;
	price?: number;
	status?: string;
	createdAt?: string;
	expiresAt?: string;
};

export default function EsimIndex() {
	const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
	const [loading, setLoading] = useState(true);
	const colorScheme = useColorScheme();
	const { showToast } = useToast();
	const router = useRouter();
	const navigation = useNavigation();

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

				const res = await fetch(`${API_BASE_URL}/airalo/user-purchases`, {
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

		useLayoutEffect(() => {
			navigation.setOptions({
				headerShown: true,
				headerTitle: 'eSIM Purchases',
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

	const renderPurchaseItem = ({ item }: { item: PurchaseItem }) => (
		<ThemedView style={styles.purchaseItem}>
			<ThemedText type="defaultSemiBold">{item.package}</ThemedText>
			<ThemedText>{item.country}</ThemedText>
			<ThemedText>Price: ${item.price}</ThemedText>
			<ThemedText>Status: {item.status}</ThemedText>
			<ThemedText>Expires: {item.expiresAt}</ThemedText>
		</ThemedView>
	);

	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
			</ThemedView>
		);
	}

	if (purchases.length === 0) {
		return (
			<ThemedView style={[styles.container,{alignItems:'center',justifyContent:'center'}]}>
				<ThemedText type="title" style={styles.title}>
					eSIM Purchases
				</ThemedText>
				<ThemedText style={styles.emptyText}>
					You haven't purchased any eSIMs yet.
				</ThemedText>
				<Button
					title="Browse Countries"
					onPress={() => router.push('/esim/countries' as any)}
					style={styles.button}
				/>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.title}>
				eSIM Purchases
			</ThemedText>
			<FlatList
				data={purchases}
				keyExtractor={(item) => item.id || Math.random().toString()}
				renderItem={renderPurchaseItem}
				contentContainerStyle={styles.listContainer}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	title: {
		marginBottom: 20,
		textAlign: 'center',
	},
	emptyText: {
		textAlign: 'center',
		marginBottom: 20,
		fontSize: 16,
	},
	button: {
		marginTop: 20,
	},
	listContainer: {
		paddingBottom: 20,
	},
	purchaseItem: {
		padding: 15,
		marginBottom: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ccc',
	},
	backButton: {
		padding: 8,
		marginRight: 16,
	},
});