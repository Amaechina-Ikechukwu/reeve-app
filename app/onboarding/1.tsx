import { OnboardingSlide } from '@/components/ui/onboarding-slide';
import { useRouter } from 'expo-router';
import React from 'react';

export default function OnboardingOne() {
  const router = useRouter();
  return (
    <OnboardingSlide
      image={require("@/assets/images/app/earth-view.jpg")}
      title="From daily essentials to the extraordinary — seamlessly."
      subtitle=""
      onPress={() => router.replace('/onboarding/2')}
      index={1}
      total={3}
      onNext={() => router.replace('/onboarding/2')}
      onSkip={() => router.replace('/(tabs)')}
      primaryButtonTitle="Next"
    />
  );
}
