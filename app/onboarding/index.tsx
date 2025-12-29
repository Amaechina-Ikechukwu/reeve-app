import { OnboardingSlide, OnboardingSlideData } from '@/components/ui/onboarding-slide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, ListRenderItem, StyleSheet, View } from 'react-native';

const ONBOARDING_KEY = 'hasSeenOnboarding';

const SLIDES: OnboardingSlideData[] = [
  {
    id: '1',
    image: require('@/assets/images/app/earth-view.jpg'),
    title: 'From daily essentials to the extraordinary',
    subtitle: 'Everything you need, seamlessly integrated',
  },
  {
    id: '2',
    image: require('@/assets/images/app/ight-strokes.jpg'),
    title: 'Everything Just Flows',
    subtitle: 'Experience the future of connected living',
  },
  {
    id: '3',
    image: require('@/assets/images/app/concerts.jpg'),
    title: 'Elevate Your Connected Life',
    subtitle: 'Ready to get started?',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<OnboardingSlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(async () => {
    const isLastSlide = currentIndex === SLIDES.length - 1;

    if (isLastSlide) {
      // Mark onboarding as complete and navigate to main app
      try {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        // Use push instead of replace to ensure proper navigation
        router.push('/(tabs)');
      } catch (error) {
        console.error('Failed to save onboarding completion:', error);
        // Still navigate even if storage fails
        router.push('/(tabs)');
      }
    } else {
      // Move to next slide
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, router]);

  const handleSkip = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
      router.push('/(tabs)');
    }
  }, [router]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem: ListRenderItem<OnboardingSlideData> = useCallback(
    ({ item, index }) => (
      <OnboardingSlide
        item={item}
        index={index}
        total={SLIDES.length}
        onNext={handleNext}
        onSkip={handleSkip}
        isLast={index === SLIDES.length - 1}
      />
    ),
    [handleNext, handleSkip]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const { width } = Dimensions.get('window');
      return {
        length: width,
        offset: width * index,
        index,
      };
    },
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
