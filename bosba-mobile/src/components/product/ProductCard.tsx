import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { COLORS, FONT_SIZE } from "../constants";
import { formatUsd } from "../lib/utils";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  width?: number;
}

export function ProductCard({ product, width }: ProductCardProps) {
  const priceUsd = Number(product.priceUsd);
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null;
  const discount = comparePrice
    ? Math.round((1 - priceUsd / comparePrice) * 100)
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, width ? { width } : {}]}
      onPress={() => router.push(`/product/${product.slug}`)}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrap}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📦</Text>
          </View>
        )}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {product.stock === 0 && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.nameEn}</Text>
        <View style={styles.prices}>
          <Text style={styles.price}>{formatUsd(product.priceUsd)}</Text>
          {product.comparePrice && (
            <Text style={styles.comparePrice}>{formatUsd(product.comparePrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:                 { backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  imageWrap:            { position: "relative", aspectRatio: 1, backgroundColor: "#f3f4f6" },
  image:                { width: "100%", height: "100%" },
  imagePlaceholder:     { flex: 1, alignItems: "center", justifyContent: "center" },
  imagePlaceholderText: { fontSize: 36 },
  discountBadge:        { position: "absolute", top: 8, left: 8, backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discountText:         { color: "#fff", fontSize: FONT_SIZE.xs, fontWeight: "700" },
  soldOutBadge:         { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  soldOutText:          { color: "#fff", fontWeight: "700", fontSize: FONT_SIZE.sm },
  info:                 { padding: 10 },
  name:                 { fontSize: FONT_SIZE.sm, color: "#111827", fontWeight: "500", marginBottom: 6, lineHeight: 18 },
  prices:               { flexDirection: "row", alignItems: "center", gap: 6 },
  price:                { fontSize: FONT_SIZE.md, fontWeight: "700", color: COLORS.primary },
  comparePrice:         { fontSize: FONT_SIZE.xs, color: "#9ca3af", textDecorationLine: "line-through" },
});
