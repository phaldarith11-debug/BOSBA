import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react-native";
import { useCartStore } from "../../src/store/cart";
import { useI18n } from "../../src/context/i18n";
import type { CartItem } from "../../src/types";

const BRAND = "#e51b1b";

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImage}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 28 }}>📦</Text>
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.nameEn}</Text>
        <Text style={styles.itemPrice}>${Number(item.priceUsd).toFixed(2)}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
          >
            <Minus size={14} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity >= item.stock && styles.qtyBtnDisabled]}
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            <Plus size={14} color={item.quantity >= item.stock ? "#cbd5e1" : "#475569"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ${(Number(item.priceUsd) * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Remove item?", item.nameEn, [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: () => removeItem(item.productId) },
            ])
          }
          hitSlop={8}
          style={styles.removeBtn}
        >
          <Trash2 size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { items, subtotalUsd, clearCart } = useCartStore();
  const { t } = useI18n();
  const subtotal = subtotalUsd();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <ShoppingBag size={40} color="#fca5a5" />
        </View>
        <Text style={styles.emptyTitle}>{t.cart.empty}</Text>
        <Text style={styles.emptySubtitle}>{t.cart.emptyHint}</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          activeOpacity={0.85}
          onPress={() => router.push("/products")}
        >
          <Text style={styles.browseBtnText}>{t.cart.emptyCta}</Text>
          <ArrowRight size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </ScrollView>

      {/* Sticky summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t.cart.subtotal} ({items.length})</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t.cart.delivery}</Text>
          <Text style={[styles.summaryValue, { color: "#22c55e" }]}>{t.cart.deliveryNote}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>{t.cart.total}</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutBtnText}>{t.cart.checkout}</Text>
          <ArrowRight size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(t.common.confirm, t.common.delete, [
              { text: t.common.cancel, style: "cancel" },
              { text: t.common.delete, style: "destructive", onPress: clearCart },
            ])
          }
        >
          <Text style={styles.clearText}>{t.common.delete}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },

  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#f8fafc" },
  emptyIcon: { width: 80, height: 80, borderRadius: 9999, backgroundColor: "#fff1f1", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  browseBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 9999,
  },
  browseBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  itemCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", marginHorizontal: 14, marginTop: 12,
    borderRadius: 16, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  itemImage: {
    width: 72, height: 72, borderRadius: 12, overflow: "hidden",
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: "600", color: "#0f172a", lineHeight: 18, marginBottom: 4 },
  itemPrice: { fontSize: 13, fontWeight: "700", color: BRAND, marginBottom: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 0 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 9999, borderWidth: 1,
    borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center",
  },
  qtyBtnDisabled: { borderColor: "#f1f5f9" },
  qtyText: { width: 32, textAlign: "center", fontSize: 14, fontWeight: "700", color: "#0f172a" },

  itemActions: { alignItems: "flex-end", gap: 12 },
  itemTotal: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  removeBtn: { padding: 4 },

  summary: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9",
    padding: 20, paddingBottom: 32,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: "#475569" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  totalValue: { fontSize: 18, fontWeight: "800", color: BRAND },
  checkoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: BRAND, borderRadius: 9999,
    paddingVertical: 15, marginTop: 14,
  },
  checkoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  clearText: { textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 10 },
});
