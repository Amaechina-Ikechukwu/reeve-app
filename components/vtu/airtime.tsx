import * as Contacts from 'expo-contacts';
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ContactsModal } from '@/components/ui/contacts-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];

const networks = [
  { id: 'mtn', name: 'MTN', color: '#FFC107' },
  { id: 'airtel', name: 'Airtel', color: '#E91E63' },
  { id: 'glo', name: 'Glo', color: '#4CAF50' },
  { id: '9mobile', name: '9Mobile', color: '#2196F3' },
];

export default function AirtimeTab() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('mtn');
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const { showToast } = useToast();

  const sanitizedCustom = customAmount.replace(/[^0-9]/g, '');
  const amountNumber = selectedAmount ?? (sanitizedCustom ? parseInt(sanitizedCustom, 10) : 0);

  // 📞 Pick contact from device
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
    setContactsModalVisible(false);
    showToast(`Selected ${name}'s number`, 'success');
  };

  // 💰 Airtime purchase handler
  const handlePurchase = async () => {
    if (!phoneNumber.trim()) {
      showToast('Please enter a phone number', 'error');
      return;
    }

    const amount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);
    if (amount <= 0) {
      showToast('Please select or enter a valid amount', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        showToast('Please log in to continue', 'error');
        return;
      }

      const userToken = await user.getIdToken(true);
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

      const response = await fetch(`${API_BASE_URL}/vtu/buyairtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: amount.toString(),
          network_id: selectedNetwork,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(
          `Airtime purchase successful! Order ID: ${data.data.order_id}`,
          'success'
        );
        setPhoneNumber('');
        setSelectedAmount(null);
        setCustomAmount('');
      } else {
        showToast(data.message || 'Purchase failed', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <IconSymbol
              size={48}
              name="phone.fill"
              color={Colors[colorScheme ?? 'light'].tint}
              style={styles.headerIcon}
            />
            <ThemedText type="title" style={styles.headerTitle}>
              Buy Airtime
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Top up your mobile phone instantly
            </ThemedText>
          </ThemedView>

          {/* Network Selection */}
          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Select Network
            </ThemedText>
            <View style={styles.networkGrid}>
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.networkButton,
                    selectedNetwork === network.id && {
                      backgroundColor: network.color,
                      borderColor: network.color,
                    },
                  ]}
                  onPress={() => setSelectedNetwork(network.id)}
                >
                  <ThemedText
                    style={[
                      styles.networkText,
                      selectedNetwork === network.id && styles.selectedNetworkText,
                    ]}
                  >
                    {network.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          {/* Phone Number */}
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
                style={[styles.input, styles.phoneInput]}
              />
              <TouchableOpacity
                style={[
                  styles.contactsButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].background },
                ]}
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

          {/* Select Amount */}
          <ThemedView style={styles.formSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Select Amount
            </ThemedText>
            <View style={styles.amountGrid}>
              {airtimeAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && {
                      backgroundColor: Colors[colorScheme ?? 'light'].tint,
                      borderColor: Colors[colorScheme ?? 'light'].tint,
                    },
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <ThemedText
                    style={[
                      styles.amountText,
                      selectedAmount === amount && styles.selectedAmountText,
                    ]}
                  >
                    ₦{amount.toLocaleString()}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>

          {/* Custom Amount (Separated properly) */}
          <ThemedView style={styles.customAmountWrapper}>
            <ThemedText style={styles.orText}>Or enter custom amount</ThemedText>
            <ThemedTextInput
              placeholder="Enter amount"
              value={customAmount}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, '');
                setCustomAmount(sanitized);
                setSelectedAmount(null);
              }}
              keyboardType="numeric"
              style={styles.customAmountInput}
            />
          </ThemedView>

          {/* Purchase Summary */}
          <ThemedView
            style={[
              styles.summarySection,
              { backgroundColor: Colors[colorScheme ?? 'light'].background },
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
              Purchase Summary
            </ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText>Network:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {networks.find((n) => n.id === selectedNetwork)?.name || 'Not selected'}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Phone Number:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {phoneNumber || 'Not entered'}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText>Amount:</ThemedText>
              <ThemedText type="defaultSemiBold">
                ₦{amountNumber.toLocaleString()}
              </ThemedText>
            </View>
          </ThemedView>

          <Button
            title="Purchase Airtime"
            onPress={handlePurchase}
            style={styles.purchaseButton}
            loading={isLoading}
            disabled={!phoneNumber.trim() || amountNumber <= 0}
          />
        </ThemedView>
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
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  headerIcon: { marginBottom: 16 },
  headerTitle: { fontSize: 28, marginBottom: 8, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
  formSection: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  input: { marginBottom: 8 },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 12,
    marginBottom: 20,
  },
  amountButton: {
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: { fontSize: 16, fontWeight: '600' },
  selectedAmountText: { color: '#fff' },
  customAmountWrapper: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'center',
  },
  orText: { fontSize: 14, marginBottom: 8, opacity: 0.6 },
  customAmountInput: {
    width: '60%',
    textAlign: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  summarySection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 18, marginBottom: 12, textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  purchaseButton: { marginTop: 8 },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    columnGap: 12,
  },
  networkButton: {
    width: '22%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkText: { fontSize: 14, fontWeight: '600' },
  selectedNetworkText: { color: '#fff' },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center' },
  phoneInput: { flex: 1, marginBottom: 0 },
  contactsButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.icon + '30',
  },
});
