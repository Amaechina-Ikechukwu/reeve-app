import React from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  size?: 'large' | 'small' | 'fit';
};

export function Button({ title, loading, disabled, size = 'large', style, ...rest }: ButtonProps) {
  // always red neon unless disabled
  const backgroundColor = disabled ? '#555' : '#ff0b2d';

  // animated scale for press feedback
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        disabled ? styles.disabledShadowWrap : null,
        { transform: [{ scale }] },
        size === 'large' && styles.large,
        size === 'small' && styles.small,
        size === 'fit' && styles.fit,
      ]}>
      <Pressable
        accessibilityRole="button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        // Pressable.style can be a function; normalize to a function that merges styles
        style={(state) => {
          const resolvedStyle = typeof style === 'function' ? style(state) : style;
          return [styles.button, { backgroundColor }];
        }}
        disabled={disabled || loading}
        {...rest}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={[styles.text, (size === 'small' || size === 'fit') && styles.smallText]} type="defaultSemiBold">
            {title}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 12,
    // neon outer glow achieved by a large shadow (iOS) and elevation (Android)
    shadowColor: '#ff2b4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
    marginVertical: 8,
  },
  disabledShadowWrap: {
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // inner subtle border and gradient-like effect via rgba overlay
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor:"#ff2b4d"
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textShadowColor: 'rgba(255,75,98,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  smallText: {
    fontSize: 14,
  },
  large: {
    width: '90%',
    alignSelf: 'center',
  },
  small: {
    width: 100,
    fontSize:16,
    alignSelf: 'center',
    padding:5
  },
  fit: {
    alignSelf: 'flex-start',
  },
});
