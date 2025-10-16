import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from './icon-symbol';
import { ThemedTextInput } from './text-input';

export interface SizzleService {
  service: string;
  name: string;
  category: string;
  rate: number;
  min: string;
  max: string;
  type: string;
  desc: string;
  dripfeed: string;
  originalName: string;
  originalRate: number;
  markup: number;
  currency: string;
}

interface SizzleServicesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectService: (service: SizzleService) => void;
  services: SizzleService[];
}

export function SizzleServicesModal({ visible, onClose, onSelectService, services }: SizzleServicesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<SizzleService[]>(services);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.service.includes(query)
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  const handleSelectService = (service: SizzleService) => {
    onSelectService(service);
    onClose();
    setSearchQuery('');
  };

  const renderService = ({ item }: { item: SizzleService }) => (
    <TouchableOpacity
      style={[
        styles.serviceItem,
        { backgroundColor: Colors[colorScheme ?? 'light'].background }
      ]}
      onPress={() => handleSelectService(item)}
    >
      <View style={styles.serviceInfo}>
        <ThemedText type="defaultSemiBold" style={styles.serviceName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.serviceCategory}>
          {item.category}
        </ThemedText>
        <ThemedText style={styles.serviceRate}>
          ₦{item.rate.toLocaleString()} ({item.currency})
        </ThemedText>
        <ThemedText style={styles.serviceMinMax}>
          Min: {item.min} | Max: {item.max}
        </ThemedText>
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
              Select Service
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ThemedTextInput
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />

          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.service}
            renderItem={renderService}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchInput: {
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.icon + '30',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  serviceRate: {
    fontSize: 14,
    color: Colors.light.tint,
    marginBottom: 2,
  },
  serviceMinMax: {
    fontSize: 12,
    opacity: 0.6,
  },
  chevron: {
    marginLeft: 12,
  },
});