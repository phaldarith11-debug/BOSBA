import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useCartStore } from "../../store/cart";
import { COLORS } from "../../constants";
import { formatUsd } from "../../lib/utils";
import type { CartItem as CartItemType } from "../../types";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholder}>📦</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.nameEn}</Text>
        <Text style={styles.price}>{formatUsd(item.priceUsd)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus size={14} color={item.quantity <= 1 ? "#d1d5db" : "#374151"} />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity >= item.stock && styles.qtyBtnDisabled]}
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            <Plus size={14} color={item.quantity >= item.stock ? "#d1d5db" : "#374151"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.productId)}>
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.total}>{formatUsd(item.priceUsd * item.quantity)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:           { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  thumb:         { width: 72, height: 72, borderRadius: 12, backgroundColor: "#f3f4f6", overflow: "hidden", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  image:         { width: "100%", height: "100%" },
  placeholder:   { fontSize: 28 },
  info:          { flex: 1 },
  name:          { fontSize: 13, fontWeight: "500", color: "#111827", marginBottom: 4, lineHeight: 18 },
  price:         { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  controls:      { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn:        { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  qtyBtnDisabled:{ borderColor: "#f3f4f6", backgroundColor: "#f9fafb" },
  qty:           { fontSize: 14, fontWeight: "600", color: "#111827", minWidth: 20, textAlign: "center" },
  deleteBtn:     { marginLeft: 8, width: 28, height: 28, borderRadius: 8, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" },
  total:         { fontSize: 14, fontWeight: "700", color: COLORS.primary },
});
