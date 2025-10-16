import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Country = {
	id?: string;
	slug: string;
	title?: string;
	country_code?: string;
	image?: { url?: string; width?: number; height?: number };
	name?: string; // legacy alias
	iso?: string;
	flag?: string;
};

export default function EsimCountries() {
	const [countries, setCountries] = useState<Country[]>([]);
	const [countriesLoading, setCountriesLoading] = useState(false);
	const colorScheme = useColorScheme();
	const { showToast } = useToast();
	const router = useRouter();
	const navigation = useNavigation();

	const fetchCountries = async () => {
		setCountriesLoading(true);
		try {
			const auth = getAuth();
			const user = auth.currentUser;
			if (!user) {
				showToast('Please log in to view countries', 'error');
				setCountriesLoading(false);
				return;
			}

			const token = await user.getIdToken(true);
			const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

			const res = await fetch(`${API_BASE_URL}/airalo/countries`, {
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
			// Support response shapes: direct array, or { success: true, data: [...] }
			if (Array.isArray(data)) {
				setCountries(data as Country[]);
			} else if (data && Array.isArray(data.data)) {
				setCountries(data.data as Country[]);
			} else {
				setCountries([]);
			}
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Failed to load countries', 'error');
		} finally {
			setCountriesLoading(false);
		}
	};

	useEffect(() => {
		fetchCountries();
	}, []);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTitle: 'Select Country',
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

	const renderCountryItem = ({ item }: { item: Country }) => (
		<TouchableOpacity
			style={styles.countryItem}
			onPress={() => router.push(`/esim/operators/${item.slug}` as any)}
		>
			<View style={styles.countryRow}>
				{item.image?.url ? (
					<Image source={{ uri: item.image.url }} style={styles.flagImage} />
				) : (
					<ThemedText style={styles.flagFallback}>{item.flag ?? '🏳️'}</ThemedText>
				)}
				<ThemedText type="defaultSemiBold" style={styles.countryText}>
					{item.title || item.name || item.slug}
				</ThemedText>
			</View>
		</TouchableOpacity>
	);

	return (
		<ThemedView style={styles.container}>
			
			{countriesLoading ? (
				<ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
			) : countries.length === 0 ? (
				<ThemedText style={styles.emptyText}>No countries found.</ThemedText>
			) : (
				<FlatList
					data={countries}
					keyExtractor={(item) => item.slug || item.id || Math.random().toString()}
					renderItem={renderCountryItem}
					contentContainerStyle={styles.listContainer}
				/>
			)}
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
	listContainer: {
		paddingBottom: 20,
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 20,
		fontSize: 16,
		opacity: 0.8,
	},
	countryItem: {
		padding: 15,
		marginBottom: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ccc',
		backgroundColor: '#f9f9f9',
	},
	countryRow: { flexDirection: 'row', alignItems: 'center' },
	flagImage: { width: 36, height: 28, marginRight: 12, resizeMode: 'cover', borderRadius: 4 },
	flagFallback: { fontSize: 20, marginRight: 12 },
	countryText: { textTransform: 'capitalize' },
	backButton: {
		padding: 8,
		marginRight: 16,
	},
});