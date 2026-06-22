import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { getMenu } from "../../lib/api";
import { useI18n } from "../../context/i18n";

type MenuItem = {
  id: string;
  labelEn: string;
  labelKm: string | null;
  url: string;
};

/**
 * Horizontal quick-links row fed by the CMS "Mobile Quick Links" menu
 * (location=mobile_tabs), managed in the Developer "Menu Builder". Additive:
 * renders null when nothing is published, so the screen is unchanged by default.
 */
export function MenuChips({ location = "mobile_tabs" }: { location?: string }) {
  const { locale } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let alive = true;
    getMenu(location, "mobile")
      .then((data: { items?: MenuItem[] }) => {
        if (alive) setItems(data.items ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [location]);

  if (items.length === 0) return null;

  function go(url: string) {
    if (url.startsWith("/")) router.push(url as never);
    else Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => {
        const label = (locale === "km" ? item.labelKm || item.labelEn : item.labelEn) ?? "";
        return (
          <TouchableOpacity key={item.id} style={styles.chip} activeOpacity={0.8} onPress={() => go(item.url)}>
            <Text style={styles.chipText}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: "#fff" },
  content: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  chip: {
    backgroundColor: "#fff1f1",
    borderColor: "#ffc7c7",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  chipText: { color: "#c31111", fontSize: 13, fontWeight: "700" },
});
