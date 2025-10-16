import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HostedCards from '@/components/giftcards/HostedCards';
import OnlineCards from '@/components/giftcards/OnlineCards';

const Tab = createMaterialTopTabNavigator();

const OnlineCardsTab = () => <OnlineCards />;

// use the hosted component from components/giftcards/HostedCards

export default function GiftCardsMarket() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: Colors[colorScheme ?? 'light'].text }}>Gift Cards</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          // center the tabs area
          tabBarStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          tabBarIndicatorStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        }}
      >
    <Tab.Screen name="Online" component={OnlineCardsTab} />
    <Tab.Screen name="Hosted" component={HostedCards} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
