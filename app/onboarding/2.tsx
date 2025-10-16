import { OnboardingSlide } from '@/components/ui/onboarding-slide';
import { useRouter } from 'expo-router';
import React from 'react';

export default function OnboardingTwo() {
  const router = useRouter();
  return (
    <OnboardingSlide
      image={require("@/assets/images/app/ight-strokes.jpg")}
      title="Everything Just Flows"
      subtitle=""
      onPress={() => router.replace('/onboarding/3')}
      index={2}
      total={3}
      onNext={() => router.replace('/onboarding/3')}
      onSkip={() => router.replace('/(tabs)')}
      primaryButtonTitle="Next"
    />
  );
}
