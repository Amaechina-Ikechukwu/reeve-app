import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedActivityIndicator } from '@/components/ui/activity-indicator';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, accent } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
};

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [readingIds, setReadingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const tint = useThemeColor({}, 'tint');


  const parseResponseList = (json: any): NotificationItem[] => {
    // handle several possible shapes
    if (!json) return [];
    if (Array.isArray(json)) return json as NotificationItem[];
    if (json.success && json.data) {
      if (Array.isArray(json.data)) return json.data as NotificationItem[];
      if (Array.isArray(json.data.notifications)) return json.data.notifications as NotificationItem[];
    }
    if (Array.isArray(json.notifications)) return json.notifications as NotificationItem[];
    if (Array.isArray(json.data?.notifications)) return json.data.notifications as NotificationItem[];
    return [];
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const json = await api.get<any>('/notifications', { ttlMs: 10_000 });
      // Debug: log raw API response to help diagnose parsing issues
      // Remove or guard this in production if sensitive data may be present
      console.log('[notifications] raw response:', JSON.stringify(json));
      const items = parseResponseList(json);
      // Sort newest first
      const sorted = [...items].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    
      setNotifications(sorted);
      // derive unread count locally
      setUnreadCount(sorted.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      showToast(err instanceof Error ? err.message : 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // We derive unread count from the notifications list to avoid extra API calls

  const markAsRead = async (id: string) => {
    try {
      setReadingIds((prev) => new Set(prev).add(id));
      await api.put(`/notifications/${encodeURIComponent(id)}/read`, {});
      // optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      showToast('Notification marked as read', 'success');
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read`, err);
      showToast(err instanceof Error ? err.message : 'Failed to mark notification read', 'error');
    } finally {
      setReadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const markAllRead = async () => {
    setRefreshing(true);
    try {
      await api.put('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
      showToast(err instanceof Error ? err.message : 'Failed to mark all notifications read', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([fetchNotifications()]);
    setRefreshing(false);
  }, [fetchNotifications]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
   
    return (
      <View style={[styles.item, item.isRead ? styles.itemRead : null]}>
        <View style={styles.leading}>
          {!item.isRead ? <View style={[styles.unreadDot, { backgroundColor: tint }]} /> : <IconSymbol name="bell-outline" color={tint} size={20} />}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {item.title}
          </ThemedText>
          {item.body ? <ThemedText style={styles.body}>{item.body}</ThemedText> : null}
          {item.createdAt ? <ThemedText style={styles.date}>{new Date(item.createdAt).toLocaleString()}</ThemedText> : null}
        </View>

        {!item.isRead ? (
          <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.markBtn} disabled={readingIds.has(item.id)}>
            <ThemedText style={[styles.markText, readingIds.has(item.id) && { opacity: 0.6 }]}>Mark read</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Notifications</ThemedText>
        <View style={styles.headerActions}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
          </View>
          {/* <Button
            title="Mark all read"
            size="fit"
            onPress={markAllRead}
            disabled={unreadCount === 0}
            style={{ marginLeft: 12 }}
          /> */}
        </View>
      </View>

      {loading ? (
        <ThemedActivityIndicator size="large" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i, idx) => (i?.id ? String(i.id) : String(idx))}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 120, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <IconSymbol name="bell-off-outline" color={tint} size={28} />
              <ThemedText style={{ marginTop: 8 }}>No notifications yet</ThemedText>
            </View>
          )}
        />
      )}
    </ThemedView></SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  item: {
    backgroundColor: Colors.light.background,
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemRead: { opacity: 0.6 },
  title: { marginBottom: 4 },
  body: { opacity: 0.85 },
  date: { marginTop: 8, opacity: 0.6, fontSize: 12 },
  leading: { width: 24, alignItems: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  markBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#e6f4ea' },
  markText: { color: '#0b7a3a', fontWeight: '600' },
  badge: { minWidth: 26, paddingHorizontal: 8, height: 24, borderRadius: 12, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '700' },
  empty: { padding: 24, alignItems: 'center' },
});
