import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, FlatList,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ShoppingCart, Heart, Minus, Plus, CheckCircle, Truck } from "lucide-react-native";
import { getProduct } from "../../src/lib/api";
import { useCartStore } from "../../src/store/cart";
import { normalizeProduct } from "../../src/lib/utils";
import type { Product } from "../../src/types";

const BRAND = "#e51b1b";
const { width: SCREEN_W } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getProduct(slug)
      .then((data) => {
        const p: Product = normalizeProduct(data.product ?? data);
        setProduct(p);
        navigation.setOptions({ title: p?.nameEn ?? "Product" });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.priceUsd / product.comparePrice) * 100)
    : null;

  function handleAddToCart() {
    if (!product || product.stock === 0) return;
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameKm: product.nameKm,
      priceUsd: Number(product.priceUsd),
      quantity,
      imageUrl: product.images[0] ?? "",
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Images */}
        <View style={styles.mainImage}>
          {product.images[selectedImage] ? (
            <Image
              source={{ uri: product.images[selectedImage] }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 60 }}>📦</Text>
            </View>
          )}
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          ) : null}
        </View>

        {/* Thumbnail strip */}
        {product.images.length > 1 && (
          <FlatList
            horizontal
            data={product.images}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumb,
                  index === selectedImage && styles.thumbActive,
                ]}
              >
                <Image source={{ uri: item }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.category}>{product.category.nameEn}</Text>
          <Text style={styles.name}>{product.nameEn}</Text>
          {product.nameKm ? (
            <Text style={styles.nameKm}>{product.nameKm}</Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.priceUsd.toFixed(2)}</Text>
            {product.comparePrice ? (
              <Text style={styles.comparePrice}>${product.comparePrice.toFixed(2)}</Text>
            ) : null}
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            {product.stock > 0 ? (
              <>
                <CheckCircle size={16} color="#22c55e" />
                <Text style={styles.stockIn}>
                  {product.stock < 10 ? `Only ${product.stock} left` : "In Stock"}
                </Text>
              </>
            ) : (
              <Text style={styles.stockOut}>Out of Stock</Text>
            )}
          </View>

          {/* Quantity */}
          {product.stock > 0 && (
            <View style={styles.qtyWrap}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={16} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} color={quantity >= product.stock ? "#cbd5e1" : "#475569"} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features strip */}
          <View style={styles.featureRow}>
            <Truck size={14} color="#64748b" />
            <Text style={styles.featureText}>Delivery across Cambodia · ABA · Wing · COD</Text>
          </View>

          {/* Description */}
          {product.descriptionEn ? (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descText}>{product.descriptionEn}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.wishlistBtn} activeOpacity={0.7}>
          <Heart size={22} color={BRAND} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addToCartBtn, (product.stock === 0 || added) && styles.addToCartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.85}
        >
          <ShoppingCart size={18} color="#fff" />
          <Text style={styles.addToCartText}>
            {added ? "Added ✓" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16, color: "#64748b" },

  mainImage: {
    width: SCREEN_W,
    height: SCREEN_W * 0.85,
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  discountBadge: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: BRAND, borderRadius: 9999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  discountText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  thumb: {
    width: 60, height: 60, borderRadius: 10, overflow: "hidden",
    borderWidth: 2, borderColor: "transparent", backgroundColor: "#f8fafc",
  },
  thumbActive: { borderColor: BRAND },

  info: { paddingHorizontal: 20, paddingTop: 4 },
  category: { fontSize: 11, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  name: { fontSize: 22, fontWeight: "800", color: "#0f172a", lineHeight: 30, marginBottom: 4 },
  nameKm: { fontSize: 16, color: "#64748b", marginBottom: 12 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 10 },
  price: { fontSize: 28, fontWeight: "900", color: BRAND },
  comparePrice: { fontSize: 16, color: "#94a3b8", textDecorationLine: "line-through" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 },
  stockIn: { fontSize: 14, color: "#22c55e", fontWeight: "600" },
  stockOut: { fontSize: 14, color: BRAND, fontWeight: "600" },
  qtyWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12 },
  qtyLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 0 },
  qtyBtn: { width: 36, height: 36, borderRadius: 9999, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  qtyBtnDisabled: { borderColor: "#f1f5f9" },
  qtyValue: { width: 40, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#0f172a" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, marginBottom: 20 },
  featureText: { fontSize: 12, color: "#64748b", flex: 1 },
  descSection: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  descTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  descText: { fontSize: 14, color: "#475569", lineHeight: 22 },

  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 12, alignItems: "center",
    backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: "#f1f5f9",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12,
  },
  wishlistBtn: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1.5,
    borderColor: "#fee2e2", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff9f9",
  },
  addToCartBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: BRAND, borderRadius: 14, paddingVertical: 14,
  },
  addToCartBtnDisabled: { backgroundColor: "#94a3b8" },
  addToCartText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
