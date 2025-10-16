import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from './icon-symbol';
import { ThemedTextInput } from './text-input';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number: string }>;
}

interface ContactsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContact: (phoneNumber: string, name: string) => void;
  contacts: Contact[];
}

export function ContactsModal({ visible, onClose, onSelectContact, contacts }: ContactsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumbers?.some(phone =>
          phone.number.includes(searchQuery)
        )
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const handleSelectContact = (contact: Contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const phoneNumber = contact.phoneNumbers[0].number.replace(/\s+/g, '');
      onSelectContact(phoneNumber, contact.name);
      onClose();
      setSearchQuery('');
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        { backgroundColor: Colors[colorScheme ?? 'light'].background }
      ]}
      onPress={() => handleSelectContact(item)}
    >
      <View style={styles.contactInfo}>
        <ThemedText type="defaultSemiBold" style={styles.contactName}>
          {item.name}
        </ThemedText>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <ThemedText style={styles.contactPhone}>
            {item.phoneNumbers[0].number}
          </ThemedText>
        )}
      </View>
      <IconSymbol
        size={20}
        name="chevron.right"
        color={Colors[colorScheme ?? 'light'].text}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                size={24}
                name="xmark"
                color={Colors[colorScheme ?? 'light'].text}
              />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Select Contact
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ThemedTextInput
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoFocus
          />

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            showsVerticalScrollIndicator={false}
            style={styles.contactsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </ThemedText>
              </View>
            }
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.icon + '20',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.icon + '20',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    opacity: 0.7,
  },
  chevron: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});