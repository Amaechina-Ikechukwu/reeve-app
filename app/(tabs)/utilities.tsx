import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Gradient = readonly [string, string] | readonly [string, string, string];
type ServiceItem = {
  key: string;
  name: string;
  icon: string;
  height: number;
  borderColors: Gradient;
  cardColors: Gradient;
  iconColors: Gradient;
  iconTint: string;
  page: string;
};

export default function UtilitiesScreen() {
  const router = useRouter();

  // Full services list copied to keep visuals consistent
  const services: ServiceItem[] = [
    {
      key: 'vtu',
      name: 'VTU (Airtime/Data)',
      page: '/vtu',
      icon: 'call',
      height: 160,
      borderColors: ['rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 0.08)', 'rgba(255, 99, 132, 0.04)'] as const,
      cardColors: ['rgba(255, 122, 122, 0.22)', 'rgba(255, 77, 136, 0.10)'] as const,
      iconColors: ['#ff7a7a', '#ff4d88'] as const,
      iconTint: '#ffffff',
    },
    {
      key: 'social',
      name: 'Social Growth',
      icon: 'trending-up-outline',
      page: '/sizzle',
      height: 180,
      borderColors: ['rgba(129, 140, 248, 0.5)', 'rgba(129, 140, 248, 0.08)', 'rgba(129, 140, 248, 0.04)'] as const,
      cardColors: ['rgba(141, 164, 255, 0.22)', 'rgba(124, 58, 237, 0.10)'] as const,
      iconColors: ['#8da4ff', '#7c3aed'] as const,
      iconTint: '#ffffff',
    },
    {
      key: 'cards',
      name: 'Cards',
      page: '/cards',
      icon: 'card-outline',
      height: 120,
      borderColors: ['rgba(245, 158, 11, 0.45)', 'rgba(245, 158, 11, 0.08)', 'rgba(245, 158, 11, 0.04)'] as const,
      cardColors: ['rgba(248, 212, 119, 0.22)', 'rgba(245, 158, 11, 0.10)'] as const,
      iconColors: ['#f8d477', '#f59e0b'] as const,
      iconTint: '#3a2c12',
    },
    {
      key: 'virtual-numbers',
      name: 'Virtual Numbers',
      page: '/virtual-numbers',
      icon: 'keypad-outline',
      height: 160,
      borderColors: ['rgba(52, 211, 153, 0.45)', 'rgba(52, 211, 153, 0.08)', 'rgba(52, 211, 153, 0.04)'] as const,
      cardColors: ['rgba(95, 245, 197, 0.22)', 'rgba(52, 211, 153, 0.10)'] as const,
      iconColors: ['#5ff5c5', '#34d399'] as const,
      iconTint: '#0f2e24',
    },
    {
      key: 'gift-cards',
      name: 'Gift Cards',
      page: '/gift-cards',
      icon: 'gift-outline',
      height: 120,
      borderColors: ['rgba(6, 182, 212, 0.5)', 'rgba(6, 182, 212, 0.08)', 'rgba(6, 182, 212, 0.04)'] as const,
      cardColors: ['rgba(97, 215, 245, 0.22)', 'rgba(6, 182, 212, 0.10)'] as const,
      iconColors: ['#61d7f5', '#06b6d4'] as const,
      iconTint: '#0a2a32',
    },
    {
      key: 'cable',
      name: 'Cable',
      page: '/utilities/cable',
      icon: 'tv-outline',
      height: 180,
      borderColors: ['rgba(167, 139, 250, 0.5)', 'rgba(167, 139, 250, 0.08)', 'rgba(167, 139, 250, 0.04)'] as const,
      cardColors: ['rgba(193, 180, 255, 0.22)', 'rgba(167, 139, 250, 0.10)'] as const,
      iconColors: ['#c1b4ff', '#a78bfa'] as const,
      iconTint: '#261c55',
    },
    {
      key: 'electricity',
      name: 'Electricity',
      page: '/utilities/electricity',
      icon: 'flash-outline',
      height: 140,
      borderColors: ['rgba(251, 191, 36, 0.5)', 'rgba(251, 191, 36, 0.08)', 'rgba(251, 191, 36, 0.04)'] as const,
      cardColors: ['rgba(255, 224, 138, 0.22)', 'rgba(251, 191, 36, 0.10)'] as const,
      iconColors: ['#ffe08a', '#fbbf24'] as const,
      iconTint: '#3a300e',
    },
    {
      key: 'esim',
      name: 'eSIM',
      page: '/esim',
      icon: 'wifi',
      height: 140,
      borderColors: ['rgba(99, 102, 241, 0.5)', 'rgba(99, 102, 241, 0.08)', 'rgba(99, 102, 241, 0.04)'] as const,
      cardColors: ['rgba(129, 140, 248, 0.22)', 'rgba(99, 102, 241, 0.10)'] as const,
      iconColors: ['#818cf8', '#6366f1'] as const,
      iconTint: '#ffffff',
    },
  ];

  // Utilities page should include services beyond the first four shown on Home
  const utilityServices = services;

  const ServiceCard = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      key={item.key}
      activeOpacity={0.8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(item.page as any);
      }}
      style={{ margin: 6, height: item.height }}
    >
      <LinearGradient
        colors={item.borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.serviceCard, { borderRadius: 22 }]}
      >
        <LinearGradient
          colors={item.cardColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceCardInner}
        >
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={item.iconColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name={item.icon as any} size={22} color={item.iconTint as string} />
            </LinearGradient>
          </View>
          <ThemedText style={styles.serviceLabel}>{item.name}</ThemedText>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );

  const MasonryGrid = ({ data, columnCount = 2 }: { data: ServiceItem[]; columnCount?: number }) => {
    const columns: ServiceItem[][] = Array.from({ length: columnCount }, () => []);
    const heights: number[] = Array.from({ length: columnCount }, () => 0);

    data.forEach((it) => {
      let target = 0;
      for (let i = 1; i < columnCount; i++) if (heights[i] < heights[target]) target = i;
      columns[target].push(it);
      heights[target] += it.height;
    });

    return (
      <View style={{ flexDirection: 'row' }}>
        {columns.map((col, idx) => (
          <View key={`col-${idx}`} style={{ flex: 1 }}>
            {col.map((item) => (
              <ServiceCard key={item.key} item={item} />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]}>
      <ScrollView >
      <View style={styles.headerImage}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Utilities
        </ThemedText>
      </View>
      <MasonryGrid data={utilityServices} columnCount={2} />
    </ScrollView>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  headerImage: {
    padding: 16,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 22,
    padding: 2,
  },
  serviceCardInner: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#00ffff',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  iconWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 6,
  },
  serviceLabel: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 16,
  },
});
