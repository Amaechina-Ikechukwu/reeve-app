import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PurchaseVirtualNumber() {
  const { country, product, provider, cost } = useLocalSearchParams<{
    country?: string;
    product?: string;
    provider?: string;
    cost?: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Confirm Purchase',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
      headerLeft: () => (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Country:</ThemedText>
            <ThemedText style={styles.value}>{country ? country.charAt(0).toUpperCase() + country.slice(1) : ''}</ThemedText>
          </View>

          <View style={styles.row}>
            <ThemedText style={styles.label}>Product:</ThemedText>
            <ThemedText style={styles.value}>{product ? product.charAt(0).toUpperCase() + product.slice(1) : ''}</ThemedText>
          </View>

          <View style={styles.row}>
            <ThemedText style={styles.label}>Provider:</ThemedText>
            <ThemedText style={styles.value}>{provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : ''}</ThemedText>
          </View>

          <View style={styles.row}>
            <ThemedText style={styles.label}>Cost:</ThemedText>
            <ThemedText style={styles.value}>₦{cost}</ThemedText>
          </View>
        </View>

        <Button title="Proceed to Pay" onPress={() => router.push('/virtual-numbers')} style={styles.button} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  content: { flex: 1, justifyContent: 'center' },
  card: { 
    padding: 20, 
    borderWidth: 1, 
    borderRadius: 12, 
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  value: { 
    fontSize: 16,
  },
  button: { marginTop: 20 },
  backButton: { padding: 8 },
});
