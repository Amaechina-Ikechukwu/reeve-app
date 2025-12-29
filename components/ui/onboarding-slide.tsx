import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    ImageSourcePropType,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from './button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OnboardingSlideData {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle?: string;
}

interface OnboardingSlideProps {
  item: OnboardingSlideData;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  item,
  index,
  total,
  onNext,
  onSkip,
  isLast,
}) => {
  const theme = useTheme();
  const isDark = theme.dark;
  const overlayColor = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <ImageBackground
      source={item.image}
      style={styles.background}
      imageStyle={styles.imageStyle}
      blurRadius={Platform.OS === 'web' ? 3 : 20}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        {/* Skip Button */}
        {!isLast && (
          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
        </Animated.View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {/* Page Indicators */}
          <View style={styles.indicators}>
            {Array.from({ length: total }).map((_, i) => {
              const isActive = i === index;
              return (
                <View
                  key={`indicator-${i}`}
                  style={[
                    styles.indicator,
                    isActive && styles.indicatorActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button */}
          <Button
            title={isLast ? 'Get Started' : 'Next'}
            style={styles.actionButton}
            onPress={onNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Next slide'}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: SCREEN_WIDTH,
    flex: 1,
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
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 48,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 24,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 40,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 24,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  indicatorActive: {
    width: 24,
    opacity: 1,
  },
  actionButton: {
    minWidth: 200,
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
});
