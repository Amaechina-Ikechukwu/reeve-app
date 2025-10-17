import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, radius = 12, style }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const baseColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const highlightColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)';

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'string' ? (width === '100%' ? '100%' : width) : width,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        } as any,
        style as any,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '30%',
          transform: [{ translateX }],
          backgroundColor: highlightColor,
          opacity: 0.6,
        } as any}
      />
    </Animated.View>
  );
};

export default Skeleton;
