import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SizzleService, SizzleServicesModal } from '@/components/ui/sizzle-services-modal';
import { ThemedTextInput } from '@/components/ui/text-input';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SizzlePurchase() {
  const [services, setServices] = useState<SizzleService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<SizzleService | null>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [runs, setRuns] = useState('1');
  const [interval, setInterval] = useState('0');
  const [purchasing, setPurchasing] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          showToast('Please log in to view services', 'error');
          setLoadingServices(false);
          return;
        }

        const token = await user.getIdToken(true);
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

        const response = await fetch(`${API_BASE_URL}/sizzle/services`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          if (mounted) setServices(data.data as SizzleService[]);
        } else {
          if (mounted) setServices([]);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to fetch services', 'error');
      } finally {
        if (mounted) setLoadingServices(false);
      }
    };

    fetchServices();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectService = (service: SizzleService) => {
    setSelectedService(service);
    setQuantity(service.min); // default to min
  };

  const handlePurchase = async () => {
    if (!selectedService) {
      showToast('Please select a service', 'error');
      return;
    }
    if (!link.trim()) {
      showToast('Please enter a link', 'error');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < parseInt(selectedService.min) || qty > parseInt(selectedService.max)) {
      showToast(`Quantity must be between ${selectedService.min} and ${selectedService.max}`, 'error');
      return;
    }

    setPurchasing(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to continue', 'error');
        return;
      }

      const token = await user.getIdToken(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

      const response = await fetch(`${API_BASE_URL}/sizzle/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService.service,
          link: link.trim(),
          quantity: qty.toString(),
          runs: parseInt(runs) || 1,
          interval: parseInt(interval) || 0,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`Order placed! Order ID: ${data.data.orderId}`, 'success');
        // Reset form
        setSelectedService(null);
        setLink('');
        setQuantity('');
        setRuns('1');
        setInterval('0');
        // Navigate to orders list
        (router as any).replace('/sizzle');
      } else {
        showToast(data.message || 'Purchase failed', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
      Click to select service
          </ThemedText>
          <Button
            title={selectedService ? selectedService.name : "Choose Service"}
            onPress={() => setModalVisible(true)}
            style={styles.selectButton}
            disabled={loadingServices}
          />
          {selectedService && (
            <View style={styles.selectedService}>
              <ThemedText style={styles.selectedName}>{selectedService.name}</ThemedText>
              <ThemedText style={styles.selectedRate}>₦{selectedService.rate.toLocaleString()} per unit</ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Link
          </ThemedText>
          <ThemedTextInput
            placeholder="Enter link (e.g., https://instagram.com/username)"
            value={link}
            onChangeText={setLink}
            keyboardType="url"
          />
        </ThemedView>

        {/* <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quantity
          </ThemedText>
          <ThemedTextInput
            placeholder={`Min: ${selectedService?.min || 'N/A'}, Max: ${selectedService?.max || 'N/A'}`}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Runs (optional)
          </ThemedText>
          <ThemedTextInput
            placeholder="Number of runs"
            value={runs}
            onChangeText={setRuns}
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Interval (optional)
          </ThemedText>
          <ThemedTextInput
            placeholder="Interval in minutes"
            value={interval}
            onChangeText={setInterval}
            keyboardType="numeric"
          />
        </ThemedView> */}

        <Button
          title="Place Order"
          onPress={handlePurchase}
          style={styles.purchaseButton}
          loading={purchasing}
          disabled={!selectedService || !link.trim() || !quantity.trim()}
        />

    
      </ScrollView>

      <SizzleServicesModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectService={handleSelectService}
        services={services}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  formSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  selectButton: { marginBottom: 12 },
  selectedService: { padding: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
  selectedName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  selectedRate: { fontSize: 14, opacity: 0.8 },
  purchaseButton: { marginTop: 8 },
  backButton: { marginTop: 12 },
});
