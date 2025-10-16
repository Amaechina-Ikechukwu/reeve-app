import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function ThemedActivityIndicator({ size = 'small' }: { size?: 'small' | 'large' }) {
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={tint} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
