import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './button';

type Props = {
  image: any;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  index?: number;
  total?: number;
  onNext?: () => void;
  onSkip?: () => void;
  primaryButtonTitle?: string;
};

export const OnboardingSlide: React.FC<Props> = ({
  image,
  title,
  subtitle,
  children,
  onPress,
  index = 1,
  total = 3,
  onNext,
  onSkip,
  primaryButtonTitle,
}) => {
  const theme = useTheme();
  const overlayColor = (theme as any).dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const opacity = anim;

  return (
    <ImageBackground
      source={image}
      style={styles.background}
      imageStyle={styles.imageStyle}
      blurRadius={Platform.OS === 'web' ? 3 : 20}>
      <Pressable style={[styles.overlay, { backgroundColor: overlayColor }]} onPress={onPress} disabled={!onPress}>
        {/* Skip control */}
        {onSkip ? (
          <Pressable style={styles.skip} onPress={onSkip} accessibilityLabel="Skip onboarding">
            <Text style={[styles.skipText, { color: theme.colors.text }]}>Skip</Text>
          </Pressable>
        ) : null}

        <View style={styles.content} pointerEvents="none">
          <Animated.Text style={[styles.title, { color: "#f2f2f2", opacity, transform: [{ translateY }] }]}>
            {title}
          </Animated.Text>
          {subtitle ? (
            <Animated.Text style={[styles.subtitle, { color: "#f2f2f2", opacity, transform: [{ translateY }] }]}>
              {subtitle}
            </Animated.Text>
          ) : null}
        </View>

        {/* optional children (apps can pass custom cta) */}
        {children}

        {/* indicators + primary button area */}
        <View style={styles.bottomRow} pointerEvents="box-none">
          <View style={styles.indicators}>
            {Array.from({ length: total }).map((_, i) => {
              const active = i + 1 === index;
              return <View key={i} style={[styles.dot, active ? styles.dotActive : null, { opacity: active ? 1 : 0.5 }]} />;
            })}
          </View>

        {onNext ? (
            <Button
              title={primaryButtonTitle ?? 'Next'}
              style={styles.primaryButton}
              onPress={onNext}
              accessibilityRole="button"
            />
          ) : null}
        </View>
          
      </Pressable>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    maxWidth: 900,
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 58,
    width:230
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.9,
  },
  skip: {
    position: 'absolute',
    top: 48,
    right: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.95,
  },
  bottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap:10
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 6,
    opacity: 0.5,
  },
  dotActive: {
    width: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    opacity: 1,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
