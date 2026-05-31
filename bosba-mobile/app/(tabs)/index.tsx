import { useEffect, useState } from "react";
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { getProducts } from "../../src/lib/api";
import { useCartStore } from "../../src/store/cart";
import { normalizeProduct } from "../../src/lib/utils";
import type { Product } from "../../src/types";
import { ShoppingCart, ArrowRight } from "lucide-react-native";

const BRAND = "#e51b1b";

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const priceUsd = Number(product.priceUsd);
  const comparePrice = product.comparePrice != null ? Number(product.comparePrice) : null;
  const discount = comparePrice
    ? Math.round((1 - priceUsd / comparePrice) * 100)
    : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
      onPress={() => router.push(`/product/${product.slug}`)}
    >
      <View style={styles.imageWrap}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 32 }}>📦</Text>
          </View>
        )}
        {discount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discount}%</Text>
          </View>
        ) : null}
        {product.stock === 0 ? (
          <View style={styles.oos}>
            <Text style={styles.oosText}>Out of Stock</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.category}>{product.category.nameEn}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.nameEn}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${priceUsd.toFixed(2)}</Text>
          {comparePrice ? (
            <Text style={styles.comparePrice}>${comparePrice.toFixed(2)}</Text>
          ) : null}
        </View>
      </View>

      {product.stock > 0 && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            addItem({
              productId: product.id,
              nameEn: product.nameEn,
              nameKm: product.nameKm,
              priceUsd,
              quantity: 1,
              imageUrl: product.images[0] ?? "",
              stock: product.stock,
            })
          }
          activeOpacity={0.75}
        >
          <ShoppingCart size={14} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await getProducts({ featured: "true", limit: "8" });
      const raw: Product[] = data.products ?? data ?? [];
      setProducts(raw.map(normalizeProduct));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={BRAND} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroSub}>🇰🇭 Cambodia&apos;s Online Store</Text>
          <Text style={styles.heroTitle}>Shop Smart,{"\n"}
            <Text style={{ color: "#fbbf24" }}>Save More</Text>
          </Text>
          <TouchableOpacity
            style={styles.heroCta}
            activeOpacity={0.85}
            onPress={() => router.push("/products")}
          >
            <Text style={styles.heroCtaText}>Shop Now</Text>
            <ArrowRight size={16} color={BRAND} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 72 }}>🛍️</Text>
      </View>

      {/* Trust strip */}
      <View style={styles.trustStrip}>
        {["🚚 Fast Delivery", "🔒 Secure Pay", "📦 Easy Returns"].map((item) => (
          <Text key={item} style={styles.trustItem}>{item}</Text>
        ))}
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push("/products")}>
            <Text style={styles.sectionLink}>View all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={BRAND} style={{ marginTop: 32 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Cannot reach server</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>📦</Text>
            <Text style={styles.errorTitle}>No featured products yet</Text>
            <Text style={styles.errorMsg}>Check back soon for new arrivals.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        )}
      </View>

      {/* Promo banner */}
      <View style={styles.promo}>
        <Text style={styles.promoEyebrow}>Nationwide Delivery</Text>
        <Text style={styles.promoTitle}>We deliver across all Cambodia</Text>
        <TouchableOpacity
          style={styles.promoCta}
          activeOpacity={0.85}
          onPress={() => router.push("/products")}
        >
          <Text style={styles.promoCtaText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },

  hero: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "900", lineHeight: 34, marginBottom: 16 },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  heroCtaText: { color: BRAND, fontWeight: "700", fontSize: 14 },

  trustStrip: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  trustItem: { fontSize: 11, color: "#475569", fontWeight: "600" },

  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  sectionLink: { fontSize: 13, color: BRAND, fontWeight: "600" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: { width: "100%", aspectRatio: 1, backgroundColor: "#f8fafc", position: "relative" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: BRAND, borderRadius: 9999,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  oos: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  oosText: { color: "#374151", fontSize: 11, fontWeight: "700" },
  info: { padding: 10 },
  category: { fontSize: 9, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  name: { fontSize: 12, fontWeight: "600", color: "#0f172a", lineHeight: 17, marginBottom: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  price: { fontSize: 13, fontWeight: "800", color: BRAND },
  comparePrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: BRAND, margin: 10, marginTop: 0,
    paddingVertical: 7, borderRadius: 9999, justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  errorBox: {
    alignItems: "center", paddingVertical: 32, paddingHorizontal: 16,
  },
  errorIcon: { fontSize: 36, marginBottom: 10 },
  errorTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginBottom: 6 },
  errorMsg: { fontSize: 12, color: "#64748b", textAlign: "center", lineHeight: 18, marginBottom: 16 },
  retryBtn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  promo: {
    margin: 16, backgroundColor: "#0f172a", borderRadius: 20, padding: 24,
    marginTop: 24,
  },
  promoEyebrow: { color: "#fbbf24", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  promoTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 16 },
  promoCta: {
    backgroundColor: BRAND, paddingHorizontal: 20, paddingVertical: 11,
    borderRadius: 9999, alignSelf: "flex-start",
  },
  promoCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
