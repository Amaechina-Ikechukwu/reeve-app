import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { Button } from './button';
import { ThemedTextInput } from './text-input';

interface TransactionPinModalProps {
  visible: boolean;
  onClose: () => void;
  onSetPin: (pin: string) => void;
}

export function TransactionPinModal({ visible, onClose, onSetPin }: TransactionPinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    onSetPin(pin);
    setPin('');
    setConfirmPin('');
    onClose();
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ThemedText type="title" style={styles.title}>
            Set Transaction PIN
          </ThemedText>
          <ThemedText style={styles.message}>
            Please set a 4-digit PIN for your transactions.
          </ThemedText>
          <ThemedTextInput
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            style={styles.input}
          />
          <ThemedTextInput
            placeholder="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button title="Set PIN" onPress={handleSubmit} />
            <Button title="Later" onPress={handleClose} />
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
  input: {
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
});