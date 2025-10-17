import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type SectionCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  /** Visual variant: 'default' = solid card, 'glass' = translucent glass-look, 'elevated' = stronger shadow */
  variant?: 'default' | 'glass' | 'elevated';
};

export function SectionCard({ children, style, padding = 14, radius = 16, variant = 'default' }: SectionCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Base colors
  const bg =
    variant === 'glass'
      ? isDark
        ? 'rgba(255,255,255,0.03)'
        : 'rgba(255,255,255,0.7)'
      : isDark
      ? 'rgba(255,255,255,0.04)'
      : Colors.light.background || '#ffffff';

  const border = variant === 'glass' ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)') : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const shadow = variant === 'elevated' ? (isDark ? 0.22 : 0.12) : isDark ? 0.12 : 0.06;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius,
          padding,
          shadowOpacity: shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default SectionCard;
