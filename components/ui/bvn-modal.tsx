import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Button } from './button';

interface BVNModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BVNModal({ visible, onClose }: BVNModalProps) {
  const handleGoToBVN = () => {
    onClose();
    router.push('/bvn'); // Placeholder route
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="title" style={styles.title}>
            BVN Verification Required
          </ThemedText>
          <ThemedText style={styles.message}>
            It's important to verify your BVN for security and compliance purposes.
            Please complete your BVN verification to continue using all features.
          </ThemedText>
          <View style={styles.buttonContainer}>
            <Button title="Verify BVN" onPress={handleGoToBVN} />
            <Button title="Later" onPress={onClose} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
});