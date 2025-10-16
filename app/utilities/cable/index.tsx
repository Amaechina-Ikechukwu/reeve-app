import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type VerifyResponse = {
	success: boolean;
	message: string;
	data?: {
		service_name?: string;
		customer_id?: string;
		customer_name?: string;
		status?: string;
		due_date?: string;
		balance?: string;
		current_bouquet?: string;
		renewal_amount?: string;
	};
};

type Variation = {
	variation_id: number;
	service_name: string;
	service_id: string;
	package_bouquet?: string;
	price?: string;
	availability?: string;
	discounted_amount?: string | null;
	discounted_percentage?: string | null;
};

export default function CableUtilities() {
	const [customerId, setCustomerId] = useState('');
	const [serviceId, setServiceId] = useState('gotv');
	const [loading, setLoading] = useState(false);
	const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null);
	const [variations, setVariations] = useState<Variation[]>([]);
	const [variationsLoading, setVariationsLoading] = useState(false);
	const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
	const { showToast } = useToast();
	const colorScheme = useColorScheme();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTitle: 'Cable Utilities',
			headerTitleAlign: 'center',
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

	const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

	const SERVICES: { id: string; label: string }[] = [
		{ id: 'dstv', label: 'DStv' },
		{ id: 'gotv', label: 'GOtv' },
		{ id: 'startimes', label: 'StarTimes' },
		{ id: 'showmax', label: 'Showmax' },
	];

	// avoid repeated auto-verify calls for same input
	const lastAutoVerified = useRef<{ customerId?: string; serviceId?: string }>({});
	const autoVerifyTimer = useRef<number | null>(null);

	const getToken = async () => {
		const auth = getAuth();
		const user = auth.currentUser;
		if (!user) throw new Error('User not authenticated');
		return user.getIdToken(true);
	};

	const handleVerify = async () => {
		if (!customerId || !serviceId) {
			showToast('Enter customer id and service id', 'error');
			return;
		}

		try {
			setLoading(true);
			const token = await getToken();
			const res = await fetch(`${API_BASE_URL}/cable/verify`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify({ customer_id: customerId, service_id: serviceId }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`HTTP ${res.status}: ${text}`);
			}

			const data: VerifyResponse = await res.json();
			setVerifyResult(data);
			if (data.success) showToast(data.message || 'Verification successful', 'success');
			else showToast(data.message || 'Verification failed', 'error');
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Verification failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	const loadVariations = async () => {
		if (!serviceId) {
			showToast('Enter service id to load plans', 'error');
			return;
		}

		try {
			setVariationsLoading(true);
			const token = await getToken();
			const res = await fetch(`${API_BASE_URL}/cable/variations/${encodeURIComponent(serviceId)}`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`HTTP ${res.status}: ${text}`);
			}

			const json = await res.json();
			if (json.success && Array.isArray(json.data)) {
				setVariations(json.data as Variation[]);
				showToast(json.message || 'Variations loaded', 'success');
			} else {
				setVariations([]);
				showToast(json.message || 'No variations found', 'error');
			}
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Failed to load variations', 'error');
		} finally {
			setVariationsLoading(false);
		}
	};

	const handleSubscribe = async () => {
		if (!selectedVariation) {
			showToast('Select a plan to subscribe', 'error');
			return;
		}
		if (!customerId || !serviceId) {
			showToast('Customer and service id required', 'error');
			return;
		}

		try {
			setLoading(true);
			const token = await getToken();
			const body = { customer_id: customerId, service_id: serviceId, variation_id: selectedVariation.variation_id };
			const res = await fetch(`${API_BASE_URL}/cable/subscribe`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});

			const text = await res.text();
			let json: any = {};
			try { json = JSON.parse(text); } catch { json = { message: text }; }

			if (!res.ok) {
				const msg = json?.message || `HTTP ${res.status}`;
				throw new Error(msg);
			}

			showToast(json?.message || 'Subscription successful', 'success');
			// After successful subscribe, optionally refresh verify/variations
			await handleVerify();
			await loadVariations();
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Subscription failed', 'error');
		} finally {
			setLoading(false);
		}
	};

	// auto-verify when customerId reaches 10 or 11 digits and auto-load plans
	useEffect(() => {
		const normalized = customerId.replace(/\D/g, '');
		if ((normalized.length === 10 || normalized.length === 11) && serviceId) {
			// prevent duplicate auto requests for same values
			if (lastAutoVerified.current.customerId === normalized && lastAutoVerified.current.serviceId === serviceId) return;

			// debounce a little to avoid firing while user is typing
			if (autoVerifyTimer.current) {
				clearTimeout(autoVerifyTimer.current);
			}
			autoVerifyTimer.current = setTimeout(async () => {
				try {
					await handleVerify();
					lastAutoVerified.current = { customerId: normalized, serviceId };
				} catch (e) {
					// ignore — showToast handled in called funcs
				}
			}, 400) as unknown as number;
		}
		return () => {
			if (autoVerifyTimer.current) clearTimeout(autoVerifyTimer.current);
		};
	}, [customerId, serviceId]);

	// load available plans when service changes (or on initial mount)
	useEffect(() => {
		// reset UI state tied to previous service
		setSelectedVariation(null);
		setVerifyResult(null);
		loadVariations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serviceId]);

	const renderVariation = ({ item }: { item: Variation }) => {
		const isSelected = selectedVariation?.variation_id === item.variation_id;
		return (
			<TouchableOpacity
				style={[styles.variationItem, isSelected && styles.variationSelected]}
				onPress={() => setSelectedVariation(item)}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<ThemedText type="defaultSemiBold">{item.package_bouquet || item.service_name}</ThemedText>
					<ThemedText>₦{item.price}</ThemedText>
				</View>
				<ThemedText>{item.availability}</ThemedText>
			</TouchableOpacity>
		);
	};

	return (
		<ThemedView style={styles.container}>

			<ThemedText type="title" style={styles.title}>
				Cable Utilities
			</ThemedText>

			<ThemedTextInput placeholder="Card number" value={customerId} onChangeText={setCustomerId} />

			<ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>Select service</ThemedText>
			<View style={styles.servicesRow}>
				{SERVICES.map((s) => {
					const selected = s.id === serviceId;
					return (
						<TouchableOpacity
							key={s.id}
							style={[styles.serviceBtn, selected && styles.serviceBtnSelected]}
							onPress={() => setServiceId(s.id)}>
							<ThemedText style={selected ? styles.serviceTextSelected : styles.serviceText}>{s.label}</ThemedText>
						</TouchableOpacity>
					);
				})}
			</View>

			

			{verifyResult?.data ? (
                <View>
                   
                    <ThemedView style={styles.verifyBox}>
                         <ThemedText type="defaultSemiBold">Your details:</ThemedText>
					<ThemedText type="defaultSemiBold">{verifyResult.data.customer_name}</ThemedText>
					<ThemedText>Account: {verifyResult.data.customer_id}</ThemedText>
					<ThemedText>Status: {verifyResult.data.status}</ThemedText>
					<ThemedText>Renewal amount: {verifyResult.data.renewal_amount}</ThemedText>
				</ThemedView>
                </View>
				
			) : null}

			

			{variationsLoading ? (
				<ActivityIndicator style={{ marginTop: 12 }} />
			) : (
				<FlatList
					data={variations}
					keyExtractor={(i) => `${i.variation_id}`}
					renderItem={renderVariation}
					style={styles.list}
					contentContainerStyle={{ paddingBottom: 120 }}
                    ListHeaderComponent={<ThemedText style={{fontSize:18}} >{serviceId.toUpperCase()} Plans</ThemedText>}
                    ListHeaderComponentStyle={{margin:10}}
				/>
			)}


			{/* fixed bottom subscribe bar */}
			<View style={[styles.fixedBottom, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
				<Button title={`Subscribe${selectedVariation ? ` — ₦${selectedVariation.price}` : ''}`} onPress={handleSubscribe} loading={loading} disabled={!selectedVariation} />
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	title: {
		marginBottom: 12,
		textAlign: 'center',
	},
	verifyBox: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		marginVertical: 12,
	},
	list: {
		flex: 1,
		marginTop: 8,
	},
	variationItem: {
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		marginBottom: 8,
	},
	variationSelected: {
		borderColor: '#ff2b4d',
		backgroundColor: '#ff2b4d11',
	},
	servicesRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	serviceBtn: {
		flex: 1,
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
		marginRight: 8,
		alignItems: 'center',
	},
	serviceBtnSelected: {
		borderColor: '#ff2b4d',
		backgroundColor: '#ff2b4d11',
	},
	serviceText: {
		fontSize: 14,
	},
	serviceTextSelected: {
		fontSize: 14,
		color: '#ff2b4d',
	},
	fixedBottom: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		padding: 16,
		borderTopWidth: 1,
	},
});

