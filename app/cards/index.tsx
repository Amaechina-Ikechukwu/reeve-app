import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Text, View } from 'react-native';

const Tab = createMaterialTopTabNavigator();

import NairaVirtualCard from '@/components/cards/NairaVirtualCard';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder components for tab content
const VirtualCards = () => <NairaVirtualCard />;

const PhysicalCards = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Physical Cards</Text>
  </View>
);

// Naira tab with sub-tabs
const NairaCards = () => {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        // Make the sub-tabs look like a centered segmented control (pill)
        tabBarStyle: {
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          // center the tabs area with a fixed width so it appears like a pill control
          alignSelf: 'center',
          width: '72%',
          paddingVertical: 4,
          borderRadius: 999,
        },
        tabBarIndicatorStyle: {
          // white pill in light mode, subtle dark pill in dark mode
          backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
          height: '100%',
          borderRadius: 999,
          margin: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 6,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        tabBarPressColor: 'transparent',
      }}
    >
      <Tab.Screen name="Virtual" component={VirtualCards} />
      <Tab.Screen name="Physical" component={PhysicalCards} />
    </Tab.Navigator>
  );
};

// Dollar tab content
const DollarCards = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Dollar Cards</Text>
  </View>
);

export default function CardsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Cards',
      headerTitleAlign: 'center',
      headerBackTitle: '',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
    });
  }, [navigation, colorScheme]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
        },
      }}
    >
      <Tab.Screen name="Naira" component={NairaCards} />
      <Tab.Screen name="Dollar" component={DollarCards} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
