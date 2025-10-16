import { Stack } from 'expo-router';
import React from 'react';

export const unstable_settings = {
  // ensure these screens are presented modally or as a separate flow if needed
};

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
