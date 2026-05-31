import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Pressable, Animated, useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react-native";
import { useI18n, LOCALES } from "../../context/i18n";
import type { Locale } from "../../context/i18n";

const BRAND = "#e51b1b";

type Props = {
  /** "pill" = compact header button, "row" = full-width settings row */
  variant?: "pill" | "row";
};

export function LanguageSwitcher({ variant = "pill" }: Props) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const { height } = useWindowDimensions();

  const current = LOCALES.find((l) => l.locale === locale) ?? LOCALES[0];

  function openModal() {
    setOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 60, duration: 160, useNativeDriver: true }),
    ]).start(() => setOpen(false));
  }

  function handleSelect(next: Locale) {
    setLocale(next);
    closeModal();
  }

  // Trigger button
  const triggerButton =
    variant === "row" ? (
      <TouchableOpacity style={styles.row} onPress={openModal} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <Text style={{ fontSize: 18 }}>🌐</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{t.profile.language}</Text>
          <Text style={styles.rowSublabel}>{current.nativeName}</Text>
        </View>
        <Text style={styles.rowArrow}>›</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity style={styles.pill} onPress={openModal} activeOpacity={0.75}>
        <Text style={styles.pillFlag}>{current.flag}</Text>
        <Text style={styles.pillLabel}>{current.nativeName}</Text>
        <Text style={styles.pillChevron}>▾</Text>
      </TouchableOpacity>
    );

  return (
    <>
      {triggerButton}

      <Modal visible={open} transparent animationType="none" onRequestClose={closeModal}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }], maxHeight: height * 0.55 },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>{t.profile.language}</Text>

          {LOCALES.map((lang, i) => {
            const active = lang.locale === locale;
            return (
              <TouchableOpacity
                key={lang.locale}
                style={[
                  styles.option,
                  i < LOCALES.length - 1 && styles.optionBorder,
                  active && styles.optionActive,
                ]}
                onPress={() => handleSelect(lang.locale)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionFlag}>{lang.flag}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionNative, active && styles.activeText]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.optionEnglish}>{lang.label}</Text>
                </View>
                {active && <Check size={16} color={BRAND} />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Pill variant
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  pillFlag: { fontSize: 16 },
  pillLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  pillChevron: { fontSize: 10, color: "#9ca3af", marginLeft: 1 },

  // Row variant
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  rowSublabel: { fontSize: 12, color: "#64748b", marginTop: 1 },
  rowArrow: { fontSize: 18, color: "#94a3b8" },

  // Modal
  backdrop: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: "700", color: "#0f172a",
    textAlign: "center", paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  option: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingVertical: 15,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  optionActive: { backgroundColor: "#fff5f5" },
  optionFlag: { fontSize: 26 },
  optionText: { flex: 1 },
  optionNative: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  optionEnglish: { fontSize: 12, color: "#64748b", marginTop: 1 },
  activeText: { color: BRAND },
});
