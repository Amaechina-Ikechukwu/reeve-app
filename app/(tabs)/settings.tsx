import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useUserDetails } from '@/hooks/useUserDetails';
import * as Linking from 'expo-linking';
import { openBrowserAsync } from 'expo-web-browser';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type PressableProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
	const { userDetails } = useUserDetails();
    const { showToast } = useToast();

	const SUPPORT_EMAIL = useMemo(() => 'support@reeve.app', []);
	const WHATSAPP_NUMBER = useMemo(() => '+2348012345678', []); // kept for display
	const WHATSAPP_WA_ME = useMemo(() => 'https://wa.me/message/HQCPT6ETWBIXI1', []);

	const openMailTo = async () => {
		try {
			const subject = encodeURIComponent('Reeve App Support');
			const body = encodeURIComponent('Hello Support,\n\n');
			const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
			const supported = await Linking.canOpenURL(url);
			if (supported) {
				await Linking.openURL(url);
			} else {
				showToast('No mail app found. Opening webmail…', 'info');
				await openBrowserAsync(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${subject}`);
			}
		} catch (e) {
			showToast('Could not open email client.', 'error');
		}
	};

	const openWhatsApp = async () => {
		try {
			// Try the wa.me deep link first
			const waSupported = await Linking.canOpenURL(WHATSAPP_WA_ME);
			if (waSupported) {
				await Linking.openURL(WHATSAPP_WA_ME);
				return;
			}

			// Fallback to whatsapp scheme with phone (may work if app is installed)
			const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
			const schemeUrl = `whatsapp://send?phone=${phone}`;
			if (await Linking.canOpenURL(schemeUrl)) {
				await Linking.openURL(schemeUrl);
				return;
			}

			// Last resort open in browser
			await openBrowserAsync(WHATSAPP_WA_ME);
		} catch (e) {
			showToast('Could not open WhatsApp.', 'error');
		}
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView>
				<ThemedView style={styles.container}>
			{/* User details */}
			<View style={styles.card}>
				<View style={styles.userRow}>
					<Avatar name={userDetails?.fullname || 'User'} size={54} />
					<View style={{ gap: 2 }}>
						<ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
							{userDetails?.fullname || '—'}
						</ThemedText>
						<ThemedText style={styles.muted}>{userDetails?.email || '—'}</ThemedText>
						{userDetails?.phone ? (
							<ThemedText style={styles.muted}>{userDetails.phone}</ThemedText>
						) : null}
					</View>
				</View>
			</View>

			{/* Contact */}
			<Section title="Contact">
				<Row title="Contact support" subtitle={SUPPORT_EMAIL} icon="tray" onPress={openMailTo} />
				<Row title="Chat on WhatsApp" subtitle={WHATSAPP_NUMBER} icon="whatsapp" onPress={openWhatsApp} />
			</Section>

			{/* Legal / Policies */}
			<Section title="Legal">
				<ExternalLink href="https://www.whatsapp.com/legal/privacy-policy" asChild>
					<Row title="WhatsApp Privacy Policy" icon="shield" />
				</ExternalLink>
				<ExternalLink href="https://reeve.digital/a=terms" asChild>
					<Row title="Terms of Service" icon="file-document-outline" />
				</ExternalLink>
				<ExternalLink href="https://reeve.digital/a=privacypolicy" asChild>
					<Row title="Privacy Policy" icon="lock-outline" />
				</ExternalLink>
			</Section>
				</ThemedView>
			</ScrollView>
		</SafeAreaView>
		
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<View style={styles.section}>
			<ThemedText style={styles.sectionTitle} type="defaultSemiBold">
				{title}
			</ThemedText>
			<ThemedView style={styles.card}>{children}</ThemedView>
		</View>
	);
}

function Row({
	title,
	subtitle,
	icon,
	onPress,
	...rest
}: {
	title: string;
	subtitle?: string;
	icon: string;
	onPress?: () => void;
} & PressableProps) {
	return (
		<Pressable
			{...rest}
			onPress={onPress}
			style={({ pressed }) => [styles.row, pressed && styles.pressed, rest.style as any]}
		>
			<View style={styles.rowLeft}>
				<IconSymbol name={icon} size={20} color={Colors.light.tint} />
				<View style={{ gap: 2 }}>
					<ThemedText>{title}</ThemedText>
					{subtitle ? <ThemedText style={styles.muted}>{subtitle}</ThemedText> : null}
				</View>
			</View>
			<IconSymbol name="chevron.right" size={18} color={Colors.light.icon} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 18,
	},
	section: {
		gap: 8,
	},
	sectionTitle: {
		opacity: 0.8,
		letterSpacing: 0.3,
	},
	card: {
		borderRadius: 16,
		padding: 14,
		gap: 6,
	},
	userRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	row: {
		paddingVertical: 14,
		paddingHorizontal: 4,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	rowLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	pressed: {
		opacity: 0.7,
	},
	muted: {
		opacity: 0.7,
		fontSize: 13,
	},
});

