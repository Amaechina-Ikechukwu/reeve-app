import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
export function DevTestingButtons() {
  const { showToast } = useToast();
  const router = useRouter();

  const injectTestTransaction = async () => {
    try {
      const testTransaction = {
        amount: Math.floor(Math.random() * 10000) + 1000,
        type: 'airtime',
        status: 'completed',
        description: 'Test Successful Transaction',
        flow: 'credit',
      };
      
      await api.post('/transactions', testTransaction);
      showToast('Test transaction injected successfully!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to inject transaction', 'error');
    }
  };

  const clearAppData = async () => {
    Alert.alert(
      'Clear App Data',
      'This will clear all app data. Please restart the app manually to see the splash screen.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              showToast('App data cleared. Please restart the app manually.', 'success');
            } catch (error) {
              showToast('Failed to clear app data', 'error');
            }
          },
        },
      ]
    );
  };

  if (!__DEV__) {
    return null;
  }

  return (
    <ThemedView style={{ flexDirection: "column", gap: 8, marginTop: 16 }}>
      <Button title="Inject Test Transaction" onPress={injectTestTransaction} />
      <Button
        title="Testing toast error"
        onPress={() => showToast("Error", "error")}
      />
      <Button
        title="Testing toast info"
        onPress={() => showToast("Info", "info")}
      />
      <Button
        title="Testing success"
        onPress={() => showToast("Success", "success")}
      />
      <Button title="Clear App & Restart" onPress={clearAppData} />
      <Button
        title="Try!"
        onPress={() => {
          Sentry.captureException(new Error("First error"));
        }}
      />
    </ThemedView>
  );
}
