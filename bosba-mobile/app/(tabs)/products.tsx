import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, ActivityIndicator, Pressable, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { getProducts } from "../../src/lib/api";
import { useCartStore } from "../../src/store/cart";
import { normalizeProduct } from "../../src/lib/utils";
import type { Product } from "../../src/types";

const BRAND = "#e51b1b";

export default function ProductsScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async (q?: string) => {
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q) params.search = q;
      const data = await getProducts(params);
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
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSearch() {
    setSearch(searchInput);
    setLoading(true);
    load(searchInput || undefined);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
    setLoading(true);
    load();
  }

  function renderProduct({ item }: { item: Product }) {
    const discount = item.comparePrice
      ? Math.round((1 - item.priceUsd / item.comparePrice) * 100)
      : null;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
        onPress={() => router.push(`/product/${item.slug}`)}
      >
        <View style={styles.imageWrap}>
          {item.images[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>
          )}
          {discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          ) : null}
          {item.stock === 0 && (
            <View style={styles.oosMask}>
              <Text style={styles.oosLabel}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.categoryLabel}>{item.category.nameEn}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.nameEn}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.priceUsd.toFixed(2)}</Text>
            {item.comparePrice ? (
              <Text style={styles.comparePrice}>${item.comparePrice.toFixed(2)}</Text>
            ) : null}
          </View>
          {item.stock > 0 && item.stock < 10 && (
            <Text style={styles.stockWarning}>Only {item.stock} left!</Text>
          )}
        </View>

        {item.stock > 0 && (
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() =>
              addItem({
                productId: item.id,
                nameEn: item.nameEn,
                nameKm: item.nameKm,
                priceUsd: item.priceUsd,
                quantity: 1,
                imageUrl: item.images[0] ?? "",
                stock: item.stock,
              })
            }
          >
            <Text style={styles.addBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Search size={16} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#94a3b8"
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={clearSearch} hitSlop={8}>
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {search.length > 0 && (
        <Text style={styles.searchResultLabel}>
          Results for &ldquo;<Text style={{ color: BRAND }}>{search}</Text>&rdquo;
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={BRAND} style={{ marginTop: 48 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>⚠️</Text>
          <Text style={styles.emptyTitle}>Cannot reach server</Text>
          <Text style={[styles.emptySubtitle, { textAlign: "center", paddingHorizontal: 24, lineHeight: 18, marginBottom: 16 }]}>{error}</Text>
          <TouchableOpacity
            style={{ backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9999 }}
            onPress={() => { setLoading(true); load(search || undefined); }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(search || undefined); }}
              tintColor={BRAND}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: 14, backgroundColor: "#fff", borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a", padding: 0 },
  searchResultLabel: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 12, color: "#64748b" },

  list: { padding: 14, paddingTop: 0, paddingBottom: 32 },
  row: { gap: 12, marginBottom: 12 },

  card: {
    flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  imageWrap: { width: "100%", aspectRatio: 1, backgroundColor: "#f8fafc", position: "relative" },
  image: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  discountBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: BRAND, borderRadius: 9999,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  oosMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  oosLabel: { fontSize: 11, fontWeight: "700", color: "#374151" },
  info: { padding: 10 },
  categoryLabel: { fontSize: 9, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
  productName: { fontSize: 12, fontWeight: "600", color: "#0f172a", lineHeight: 17, marginBottom: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  price: { fontSize: 13, fontWeight: "800", color: BRAND },
  comparePrice: { fontSize: 11, color: "#94a3b8", textDecorationLine: "line-through" },
  stockWarning: { fontSize: 10, color: "#f97316", fontWeight: "600" },
  addBtn: {
    backgroundColor: BRAND, marginHorizontal: 10, marginBottom: 10,
    paddingVertical: 7, borderRadius: 9999, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  errorBox: { alignItems: "center", paddingTop: 80 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: "#94a3b8" },
});
