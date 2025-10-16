import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function BVNScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">BVN Verification</ThemedText>
      <ThemedText>
        This is a placeholder for BVN verification page.
        More details will be added later.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});