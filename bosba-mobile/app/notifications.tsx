import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../src/context/auth";
import { getNotifications, markNotificationRead } from "../src/lib/api";
import { COLORS } from "../src/constants";
import { relativeTime } from "../src/lib/utils";

type Notification = {
  id: string;
  type: string;
  titleEn: string;
  bodyEn: string | null;
  data: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (!token) { setLoading(false); return; }
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getNotifications(token);
      setItems(data);
    } catch {
      // fail silently — network issues are common on mobile
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, [token]));

  async function handlePress(item: Notification) {
    if (!item.readAt && token) {
      markNotificationRead(item.id, token).catch(() => {});
      setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n));
    }
    // Navigate based on type and data
    try {
      const data = item.data ? JSON.parse(item.data) : null;
      if (item.type === "ORDER_UPDATE" && data?.orderId) {
        router.push(`/order/${data.orderId}`);
      }
    } catch {}
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  if (!token) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sign in to see your notifications.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>Notifications</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubText}>Order updates and promotions will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.readAt && styles.itemUnread]}
            onPress={() => handlePress(item)}
          >
            <View style={styles.itemIcon}>
              <Text style={styles.itemIconText}>{typeIcon(item.type)}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, !item.readAt && styles.itemTitleUnread]}>{item.titleEn}</Text>
              {item.bodyEn && <Text style={styles.itemBody} numberOfLines={2}>{item.bodyEn}</Text>}
              <Text style={styles.itemTime}>{relativeTime(item.createdAt)}</Text>
            </View>
            {!item.readAt && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    ORDER_UPDATE: "📦",
    PAYMENT:      "💳",
    PROMO:        "🎁",
    SYSTEM:       "⚙️",
  };
  return icons[type] ?? "🔔";
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: "#f9fafb" },
  heading:        { fontSize: 22, fontWeight: "700", color: "#111827", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  list:           { paddingHorizontal: 16, paddingBottom: 40 },
  emptyContainer: { flex: 1 },
  center:         { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyText:      { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 6, textAlign: "center" },
  emptySubText:   { fontSize: 13, color: "#9ca3af", textAlign: "center" },
  btn:            { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText:        { color: "#fff", fontWeight: "600", fontSize: 15 },
  item:           { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  itemUnread:     { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  itemIcon:       { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemIconText:   { fontSize: 18 },
  itemContent:    { flex: 1 },
  itemTitle:      { fontSize: 14, color: "#374151", marginBottom: 3 },
  itemTitleUnread:{ fontWeight: "600", color: "#111827" },
  itemBody:       { fontSize: 13, color: "#6b7280", lineHeight: 18 },
  itemTime:       { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  dot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 4 },
});
