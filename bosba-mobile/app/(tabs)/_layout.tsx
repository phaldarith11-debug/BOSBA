import { Tabs } from "expo-router";
import { ShoppingCart, Home, Grid, User } from "lucide-react-native";
import { View, Text, StyleSheet, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartStore } from "../../src/store/cart";
import { useI18n } from "../../src/context/i18n";
import { LanguageSwitcher } from "../../src/components/common/LanguageSwitcher";

function CartIcon({ color, size }: { color: ColorValue; size: number }) {
  const totalItems = useCartStore((s) => s.totalItems());
  return (
    <View>
      <ShoppingCart color={color} size={size} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems > 9 ? "9+" : totalItems}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { t } = useI18n();
  // Respect the bottom safe area (iPhone home indicator, Android gesture nav) so
  // tab labels are never crowded against the home bar. On devices with hardware
  // buttons insets.bottom is 0, preserving the original 60pt/6pt phone layout.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        tabBarActiveTintColor: "#e51b1b",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f1f5f9",
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.nav.home,
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerTitle: "BOSBA",
          headerTitleStyle: { color: "#e51b1b", fontWeight: "900", fontSize: 22, letterSpacing: -0.5 },
          headerRight: () => (
            <View style={{ marginRight: 12 }}>
              <LanguageSwitcher variant="pill" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t.nav.products,
          tabBarIcon: ({ color, size }) => <Grid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t.nav.cart,
          tabBarIcon: ({ color, size }) => <CartIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.nav.profile,
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#e51b1b",
    borderRadius: 9999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
});
