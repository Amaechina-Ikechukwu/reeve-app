import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ContactsModal } from '@/components/ui/contacts-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDataPlans } from '@/hooks/useDataPlans';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const networks = [
  { id: 'mtn', name: 'MTN', icon: 'wifi' },
  { id: '9mobile', name: '9Mobile', icon: 'antenna.radiowaves.left.and.right' },
  { id: 'airtel', name: 'Airtel', icon: 'dot.radiowaves.left.and.right' },
  { id: 'glo', name: 'Glo', icon: 'waveform' },
];

export default function DataTab() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const { dataPlans, loading, error } = useDataPlans(selectedNetwork.id);

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast('Contacts permission is required to pick a number', 'error');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const contactsWithPhones = data.filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
        setContacts(contactsWithPhones);
        setContactsModalVisible(true);
      } else {
        showToast('No contacts found', 'error');
      }
    } catch (error) {
      showToast('Failed to access contacts', 'error');
    }
  };

  const handleSelectContact = (phoneNumber: string, name: string) => {
    setPhoneNumber(phoneNumber);
    showToast(`Selected ${name}'s number`, 'success');
  };

  const handlePurchase = () => {
    if (!phoneNumber.trim()) {
      showToast('Please enter a phone number', 'error');
      return;
    }
    if (!selectedPlan) {
      showToast('Please select a data plan', 'error');
      return;
    }
    showToast(
      `${selectedPlan.data_plan} for ${phoneNumber} purchased successfully!`,
      'success'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <ThemedView style={styles.header}>
          <IconSymbol
            size={48}
            name="wifi"
            color={Colors[colorScheme ?? 'light'].tint}
            style={styles.headerIcon}
          />
          <ThemedText type="title" style={styles.headerTitle}>
            Buy Data
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Get high-speed internet data instantly
          </ThemedText>
        </ThemedView>

        {/* PHONE INPUT */}
        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Phone Number
          </ThemedText>
          <View style={styles.phoneInputContainer}>
            <ThemedTextInput
              placeholder="Enter phone number (e.g., 08012345678)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
              style={styles.phoneInput}
            />
            <TouchableOpacity
              style={styles.contactsButton}
              onPress={pickContact}
            >
              <IconSymbol
                size={20}
                name="person.crop.circle"
                color={Colors[colorScheme ?? 'light'].tint}
              />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* NETWORKS */}
        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Select Network
          </ThemedText>
          <View style={styles.networksContainer}>
            {networks.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkCard,
                  selectedNetwork.id === network.id && {
                    borderColor: Colors[colorScheme ?? 'light'].tint,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  setSelectedNetwork(network);
                  setSelectedPlan(null);
                }}
              >
                <IconSymbol
                  size={24}
                  name={network.icon as any}
                  color={
                    selectedNetwork.id === network.id
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].text
                  }
                />
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.networkName,
                    selectedNetwork.id === network.id && {
                      color: Colors[colorScheme ?? 'light'].tint,
                    },
                  ]}
                >
                  {network.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* DATA PLANS */}
        <ThemedView style={styles.formSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Select Data Plan
          </ThemedText>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading data plans...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {dataPlans
                .filter((plan) => plan.availability === 'Available')
                .map((plan) => (
                  <TouchableOpacity
                    key={plan.variation_id}
                    style={[
                      styles.planCard,
                      selectedPlan?.variation_id === plan.variation_id && {
                        borderColor: Colors[colorScheme ?? 'light'].tint,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <View style={styles.planRow}>
                      <View style={styles.planTextContainer}>
                        <ThemedText
                          type="defaultSemiBold"
                          style={styles.planName}
                          numberOfLines={1}
                        >
                          {plan.data_plan}
                        </ThemedText>
                        <ThemedText
                          style={styles.planDescription}
                          numberOfLines={1}
                        >
                          {plan.service_name}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.planPrice}
                      >
                        ₦{parseInt(plan.price).toLocaleString()}
                      </ThemedText>
                    </View>

                    {selectedPlan?.variation_id === plan.variation_id && (
                      <View style={styles.selectedIndicator}>
                        <IconSymbol
                          size={20}
                          name="checkmark.circle.fill"
                          color={Colors[colorScheme ?? 'light'].tint}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </ThemedView>

        {/* SUMMARY */}
        {selectedPlan && (
          <ThemedView style={styles.summarySection}>
            <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
              Purchase Summary
            </ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText>Phone Number:</ThemedText>
              <ThemedText type="defaultSemiBold">{phoneNumber}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Data Plan:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {selectedPlan.data_plan}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Network:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {selectedPlan.service_name}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Amount:</ThemedText>
              <ThemedText type="defaultSemiBold">
                ₦{parseInt(selectedPlan.price).toLocaleString()}
              </ThemedText>
            </View>
          </ThemedView>
        )}

        <Button
          title="Purchase Data"
          onPress={handlePurchase}
          style={styles.purchaseButton}
          disabled={!phoneNumber.trim() || !selectedPlan}
        />
      </ScrollView>

      <ContactsModal
        visible={contactsModalVisible}
        onClose={() => setContactsModalVisible(false)}
        onSelectContact={handleSelectContact}
        contacts={contacts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {  paddingBottom: 60 },

  header: { padding: 20,alignItems: 'center', marginBottom: 28 },
  headerIcon: { marginBottom: 12 },
  headerTitle: { fontSize: 28, marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, textAlign: 'center', opacity: 0.7 },

  formSection: { padding: 20,marginBottom: 32 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },

  phoneInputContainer: { padding: 20,flexDirection: 'row', alignItems: 'center' },
  phoneInput: { flex: 1 },
  contactsButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.icon + '30',
  },

  networksContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  networkCard: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.icon + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkName: { fontSize: 14, marginTop: 6, textAlign: 'center' },

  plansContainer: { gap: 12 },
  planCard: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.icon + '30',
    position: 'relative',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTextContainer: { flex: 1, marginRight: 10 },
  planName: { fontSize: 16 },
  planDescription: { fontSize: 13, opacity: 0.7 },
  planPrice: { fontSize: 16, color: Colors.light.tint },
  selectedIndicator: { position: 'absolute', top: 10, right: 10 },

  summarySection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 18, marginBottom: 12, textAlign: 'center' },
  summaryRow: {padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  purchaseButton: { marginTop: 8 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fee',
  },
  errorText: { color: '#d00', textAlign: 'center' },
});
