import React from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { IconSymbol } from './icon-symbol';

export interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  title?: string;
}

export function OptionsModal({ visible, onClose, options, onSelect, title }: OptionsModalProps) {
  const colorScheme = useColorScheme();

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item);
        onClose();
      }}
      style={[
        styles.optionItem,
        { backgroundColor: Colors[colorScheme ?? 'light'].background, borderColor: Colors[colorScheme ?? 'light'].icon + '30' },
      ]}
    >
      <ThemedText>{item}</ThemedText>
      <IconSymbol
        size={18}
        name="chevron.right"
        color={Colors[colorScheme ?? 'light'].text}
        style={{ opacity: 0.6 }}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
              {title ?? 'Select'}
            </ThemedText>
            <View style={{ width: 32 }} />
          </View>

          <FlatList
            data={options}
            keyExtractor={(i) => i}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
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
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    padding: 6,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
});

export default OptionsModal;
