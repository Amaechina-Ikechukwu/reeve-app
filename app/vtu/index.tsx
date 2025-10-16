import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AirtimeTab from '@/components/vtu/airtime';
import DataTab from '@/components/vtu/data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const Tab = createMaterialTopTabNavigator();

export default function VTUPage() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'VTU Services',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
      headerLeft: () => (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <IconSymbol
            size={24}
            name="chevron.left"
            color={Colors[colorScheme ?? 'light'].text}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme]);

  return (
    <ThemedView style={styles.container}>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
          },
          tabBarIndicatorStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        }}>
        <Tab.Screen
          name="Airtime"
          component={AirtimeTab}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={20}
                name="phone.fill"
                color={focused ? Colors[colorScheme ?? 'light'].tint : color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Data"
          component={DataTab}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={20}
                name="wifi"
                color={focused ? Colors[colorScheme ?? 'light'].tint : color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
});
