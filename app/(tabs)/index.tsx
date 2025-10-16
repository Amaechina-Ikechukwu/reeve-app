import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserStatusChecker } from '@/components/user-status-checker';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useUserDetails } from '@/hooks/useUserDetails';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';

// Overview API types
interface Profile {
  kycStatus: string;
}

interface Wallet {
  balance: number;
  accountNumber: string;
  bankName: string;
  lastUpdated: string;
}

interface TransactionSummary {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  totalAmount: number;
  totalAmountRaw: string;
}

interface RecentTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  flow: string;
}

interface Transactions {
  summary: TransactionSummary;
  recent: RecentTransaction[];
  periodDays: number;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Notifications {
  unreadCount: number;
  recent: NotificationItem[];
}

interface Tasks {
  needsAppCode: boolean;
  needsTransactionPin: boolean;
  needsKyc: boolean;
  needsExpoToken: boolean;
  kycStatus: string;
}

interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  isRead?: boolean;
  status?: string;
  amount?: number;
  flow?: string;
  createdAt: string;
  metadata: Record<string, any>;
}

interface OverviewData {
  profile: Profile;
  wallet: Wallet;
  transactions: Transactions;
  notifications: Notifications;
  tasks: Tasks;
  activityFeed: ActivityFeedItem[];
}

interface OverviewApiResponse {
  success: boolean;
  data: OverviewData;
}

// Accounts API types
interface AccountDetailsResponse {
  success: boolean;
  data: {
    account_number: string;
    account_status: string;
    amount: number;
    bank_name: string;
  };
}

export default function HomeScreen() {
    const { showToast } = useToast();
    const { userDetails } = useUserDetails();
    const router = useRouter();

    const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewError, setOverviewError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountDetailsResponse['data'] | null>(null);
  const [accountLoading, setAccountLoading] = useState<boolean>(true);
  const [accountError, setAccountError] = useState<string | null>(null);

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
      page:string
    };

    const services: ServiceItem[] = [
      {
        key: 'vtu',
        name: 'VTU (Airtime/Data)',
        page:"/vtu",
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
        page:'/sizzle',
  height: 180,
        borderColors: ['rgba(129, 140, 248, 0.5)', 'rgba(129, 140, 248, 0.08)', 'rgba(129, 140, 248, 0.04)'] as const,
  cardColors: ['rgba(141, 164, 255, 0.22)', 'rgba(124, 58, 237, 0.10)'] as const,
        iconColors: ['#8da4ff', '#7c3aed'] as const,
        iconTint: '#ffffff',
      },
      {
        key: 'cards',
        name: 'Cards',
        page:'/cards',
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
        page:'/virtual-numbers',
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
  //     {
  //       key: 'crypto',
  //       name: 'Crypto P2P',
  //       page: '/crypto',
  //       icon: 'swap-horizontal-outline',
  // height: 140,
  //       borderColors: ['rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.04)'] as const,
  // cardColors: ['rgba(105, 240, 195, 0.22)', 'rgba(16, 185, 129, 0.10)'] as const,
  //       iconColors: ['#69f0c3', '#10b981'] as const,
  //       iconTint: '#0a2b1f',
  //     },
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

    // Show only four services on the home screen
    const homeServices: ServiceItem[] = services.slice(0, 4);

    useEffect(() => {
      const fetchOverview = async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            setOverviewError('User not authenticated');
            setOverviewLoading(false);
            return;
          }

          const idToken = await user.getIdToken(true);

          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
          const response = await fetch(`${API_BASE_URL}/overview`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: OverviewApiResponse = await response.json();

          if (data.success) {
            setOverviewData(data.data);
          } else {
            setOverviewError('Failed to fetch overview data');
          }
        } catch (err) {
          setOverviewError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setOverviewLoading(false);
        }
      };

      fetchOverview();
    }, []);

    useEffect(() => {
      const fetchAccountDetails = async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            setAccountError('User not authenticated');
            setAccountLoading(false);
            return;
          }

          const idToken = await user.getIdToken(true);
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
          const response = await fetch(`${API_BASE_URL}/accounts/details`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const json: AccountDetailsResponse = await response.json();
      
          if (json.success) {
                setAccountData(json.data);
              } else {
            setAccountError('Failed to fetch account details');
          }
        } catch (err) {
          setAccountError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setAccountLoading(false);
        }
      };

      fetchAccountDetails();
    }, []);

    const ServiceCard = ({ item }: { item: ServiceItem }) => (
      <TouchableOpacity
        key={item.key}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       
            router.push(item?.page as any);
          
        }}
        style={{ margin: 6, height: item.height }}
      >
        {/* Gradient border */}
          <LinearGradient
          colors={item.borderColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.serviceCard, { borderRadius: 22 }]}
        >
          {/* Inner soft dark panel with subtle tint */}
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

    // Simple masonry layout: distribute items by cumulative column height
    const MasonryGrid = ({
      data,
      columnCount = 2,
    }: {
      data: ServiceItem[];
      columnCount?: number;
    }) => {
      const columns: ServiceItem[][] = Array.from({ length: columnCount }, () => []);
      const heights: number[] = Array.from({ length: columnCount }, () => 0);

      data.forEach((it) => {
        let target = 0;
        for (let i = 1; i < columnCount; i++) if (heights[i] < heights[target]) target = i;
        columns[target].push(it);
        heights[target] += it.height;
      });

      return (
        <View style={{ flexDirection: 'row',  }}>
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

    // format helpers
    const formatCurrency = (amount?: number) => {
      const value = typeof amount === 'number' ? amount : 0;
      try {
        return '₦' + value.toLocaleString('en-NG');
      } catch {
        return `₦${value}`;
      }
    };

    const formatAccountNumber = (acc?: string) => {
      if (!acc) return '•••• ••• •••';
      if (/^\d{10}$/.test(acc)) {
        return acc.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      }
      return acc;
    };


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'rgba(161, 206, 220, 0.2)', dark: 'rgba(29, 61, 71, 0.2)' }}
      headerImage={
        <View style={[styles.headerContainer,]}>
          {/* <BlurView intensity={10} > */}

 <Image
            source={{uri:"https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHRlY2h8ZW58MHx8MHx8fDA%3D"}}
            style={styles.reactLogo}
          />
          <View style={[styles.overlay,{backgroundColor:"rgba(29, 61, 71, 0.7)",}]}>
            
            {userDetails && (
              <View style={styles.userInfo}>
                 <Avatar name={userDetails.fullname} size={32} />
                <Text style={styles.userName}>{userDetails.fullname}</Text>
               
              </View>
            )}
            <BlurView intensity={50} style={styles.notificationContainer}>
              <TouchableNativeFeedback
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/notifications')
                }}
              >
                <View style={{ padding: 2 }}>
                  <Ionicons name="notifications-outline" size={24} color="white" />
                </View>
              </TouchableNativeFeedback>

            </BlurView>
          </View>
          {/* </BlurView> */}
          {/* Glass bank account card */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, marginTop: 90 }}>
            <BlurView intensity={70} style={{
              borderRadius: 16,
              overflow: 'hidden',
              paddingHorizontal: 16,
              paddingVertical: 22,
              minHeight: 150,
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(255,255,255,0.18)'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="wallet-outline" size={18} color="#EAF4F6" />
                <Text style={{ color: '#EAF4F6', fontWeight: '600', fontSize: 14, flex: 1 }}>Wallet Account</Text>
                {!!accountData?.account_status && (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: accountData.account_status === 'ACTIVE' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: accountData.account_status === 'ACTIVE' ? '#86efac' : '#fca5a5' }}>{accountData.account_status}</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{flex:1}}>
                  <Text style={{ color: '#EAF4F6', fontSize: 16, fontWeight: '700' }}>
                    {accountData?.bank_name ?? (accountLoading ? 'Loading…' : accountError ? 'Unavailable' : 'Bank')}
                  </Text>
                  <Text style={{ color: '#D1E6EA', fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                    {accountData?.account_number ? formatAccountNumber(accountData.account_number) : '•••• ••• •••'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7df2c2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                  <Ionicons name="cash-outline" size={14} color="#0b3b2e" />
                  <Text style={{ color: '#0b3b2e', fontWeight: '700', fontSize: 13 }}>{formatCurrency(accountData?.amount)}</Text>
                </View>
              </View>
              {/* Copy actions */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={async () => {
                    if (!accountData) return;
                    const payload = `Bank: ${accountData.bank_name}\nAccount: ${accountData.account_number}\nName: ${userDetails?.fullname}`;
                    await Clipboard.setStringAsync(payload);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast('Account details copied', 'success');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  <Ionicons name="copy-outline" size={14} color="#EAF4F6" />
                  <Text style={{ color: '#EAF4F6', fontSize: 12, fontWeight: '600' }}>Copy details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={async () => {
                    if (!accountData?.account_number) return;
                    await Clipboard.setStringAsync(accountData.account_number);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast('Account number copied', 'success');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  <Ionicons name="copy" size={14} color="#EAF4F6" />
                  <Text style={{ color: '#EAF4F6', fontSize: 12, fontWeight: '600' }}>Copy number</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

        </View>
      }>
      <UserStatusChecker />

  <MasonryGrid data={homeServices} columnCount={2} />
      {__DEV__&& <ThemedView style={{flexDirection:"column"}}>

        <Button title='Testing toast error' onPress={()=>showToast("Error", 'error')} />
      <Button title='Testing toast info' onPress={()=>showToast("Info", 'info')} />
      <Button title='Testing success' onPress={()=>showToast("Success", 'success')} />
      </ThemedView> }
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height:"100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  headerContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
   
    padding: 16,
  },
  notificationContainer: {
    padding: 8,
    borderRadius: 20,
    overflow: 'hidden',
     marginTop:20,
  },
  userInfo: {

    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
     marginTop:20,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  serviceCard: {
    flex: 1,
    borderRadius: 22,
    padding: 2, // gradient border thickness
  },
  serviceCardInner: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    // Neon glow
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  dashboardContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.text,
  },
  walletCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  accountText: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 8,
  },
  bankText: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  notificationItem: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  tasksCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.6,
    marginTop: 4,
  },
});
