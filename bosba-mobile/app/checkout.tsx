import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useCartStore } from "../src/store/cart";
import { useAuth } from "../src/context/auth";
import { useI18n } from "../src/context/i18n";
import { createOrder, getDeliveryZones } from "../src/lib/api";
import { COLORS } from "../src/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Zone = {
  id: string;
  nameEn: string;
  priceUsd: number;
  estimatedDays: number;
  freeOverUsd: number | null;
};

const CAMBODIA_PROVINCES = [
  "Phnom Penh", "Kandal", "Siem Reap", "Battambang", "Banteay Meanchey",
  "Kampong Cham", "Kampong Chhnang", "Kampong Speu", "Kampong Thom",
  "Kampot", "Kep", "Koh Kong", "Kratie", "Mondulkiri", "Oddar Meanchey",
  "Pailin", "Preah Sihanouk", "Preah Vihear", "Prey Veng", "Pursat",
  "Ratanakiri", "Stung Treng", "Svay Rieng", "Takeo", "Tbong Khmum",
];

const PAYMENT_METHODS = [
  { id: "ABA_BANK",   label: "ABA Bank Transfer / KHQR", icon: "🏦" },
  { id: "WING_MONEY", label: "Wing Money",               icon: "💸" },
  { id: "COD",        label: "Cash on Delivery",         icon: "📦" },
] as const;

// ─── Province → best zone ─────────────────────────────────────────────────────

function normalizeStr(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

function zoneForProvince(province: string, zones: Zone[] & { provinces?: string[] }[]): Zone | null {
  if (!zones.length) return null;
  if (!province) return null;
  const target = normalizeStr(province);

  // 1. Exact match
  const exact = (zones as Array<Zone & { provinces?: string[] }>).find(
    (z) => z.provinces?.some((p) => normalizeStr(p) === target)
  );
  if (exact) return exact;

  // 2. Partial match
  const partial = (zones as Array<Zone & { provinces?: string[] }>).find(
    (z) => z.provinces?.some((p) => {
      const pn = normalizeStr(p);
      return target.includes(pn) || pn.includes(target);
    })
  );
  if (partial) return partial;

  // 3. Explicit "Other Province" zone
  const otherZone = (zones as Array<Zone & { provinces?: string[] }>).find(
    (z) => z.provinces?.some((p) => normalizeStr(p) === "other province")
  );
  if (otherZone) return otherZone;

  // 4. Catchall: zone with empty provinces array
  const catchAll = (zones as Array<Zone & { provinces?: string[] }>).find(
    (z) => !z.provinces || z.provinces.length === 0
  );
  if (catchAll) return catchAll;

  // Last resort: final zone in list
  return zones[zones.length - 1];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const { items, subtotalUsd, clearCart } = useCartStore();
  const { token } = useAuth();
  const { t } = useI18n();

  const [zones, setZones] = useState<Array<Zone & { provinces?: string[] }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [showProvinceList, setShowProvinceList] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    province: "",
    district: "",
    commune: "",
    notes: "",
    latitude:  null as number | null,
    longitude: null as number | null,
    formattedAddress: "",
  });

  useFocusEffect(
    useCallback(() => {
      getDeliveryZones()
        .then((raw: any[]) =>
          setZones(
            raw.map((z) => ({
              ...z,
              priceUsd:    Number(z.priceUsd),
              freeOverUsd: z.freeOverUsd != null ? Number(z.freeOverUsd) : null,
            }))
          )
        )
        .catch(() => {});
    }, [])
  );

  const selectedZone = zoneForProvince(form.province, zones);
  const sub = subtotalUsd();
  const deliveryFee =
    selectedZone
      ? selectedZone.freeOverUsd !== null && sub >= selectedZone.freeOverUsd
        ? 0
        : selectedZone.priceUsd
      : 0;
  const total = sub + deliveryFee;

  // ── Submit order ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.province || !form.commune) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Add items before checking out.");
      return;
    }
    if (!token) {
      Alert.alert("Sign In Required", "Please sign in to place an order.");
      router.push("/(auth)/login");
      return;
    }

    const zone = selectedZone;
    if (!zone) {
      Alert.alert("No Delivery Zone", "We couldn't find a delivery zone for your province. Please contact support.");
      return;
    }

    setSubmitting(true);
    try {
      const phone = form.phone.startsWith("+855") ? form.phone : `+855${form.phone}`;
      const order = await createOrder(
        {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address: {
            fullName:        form.fullName,
            phone,
            addressLine1:    form.addressLine1,
            city:            form.city,
            province:        form.province,
            district:        form.district || undefined,
            commune:         form.commune  || undefined,
            notes:           form.notes || undefined,
            latitude:        form.latitude ?? undefined,
            longitude:       form.longitude ?? undefined,
            formattedAddress:form.formattedAddress || undefined,
          },
          deliveryZoneId: zone.id,
          paymentMethod,
          currency: "USD",
        },
        token
      );

      clearCart();
      router.replace(`/order/${order.id}`);
    } catch (err: unknown) {
      Alert.alert("Order Failed", err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t.checkout.title}</Text>

        {/* ── Location section ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.checkout.deliveryAddress || "Delivery Address"}</Text>

          {/* Full Name */}
          <FieldLabel label={`${t.checkout.fullName} *`} />
          <TextInput
            style={styles.input}
            value={form.fullName}
            onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
            placeholder={t.checkout.fullName}
            placeholderTextColor="#9ca3af"
          />

          {/* Phone */}
          <FieldLabel label={`${t.checkout.phoneLabel} *`} />
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}><Text style={styles.phonePrefixText}>+855</Text></View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
              placeholder="12 345 678"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Province picker */}
          <FieldLabel label={`${t.checkout.province} *`} />
          <TouchableOpacity
            style={styles.provincePicker}
            onPress={() => setShowProvinceList((v) => !v)}
          >
            <Text style={form.province ? styles.provinceText : styles.provincePlaceholder}>
              {form.province || t.checkout.selectProvince}
            </Text>
            <Text style={styles.provinceChevron}>{showProvinceList ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {showProvinceList && (
            <View style={styles.provinceList}>
              {CAMBODIA_PROVINCES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.provinceItem, form.province === p && styles.provinceItemActive]}
                  onPress={() => { setForm((f) => ({ ...f, province: p })); setShowProvinceList(false); }}
                >
                  <Text style={[styles.provinceItemText, form.province === p && styles.provinceItemTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* City/District */}
          <FieldLabel label={`${t.checkout.city} *`} />
          <TextInput
            style={styles.input}
            value={form.city}
            onChangeText={(v) => setForm((f) => ({ ...f, city: v, district: v }))}
            placeholder="e.g. Phnom Penh"
            placeholderTextColor="#9ca3af"
          />

          {/* Commune */}
          <FieldLabel label={`${t.checkout.commune} *`} />
          <TextInput
            style={styles.input}
            value={form.commune}
            onChangeText={(v) => setForm((f) => ({ ...f, commune: v }))}
            placeholder="e.g. Boeng Keng Kang I"
            placeholderTextColor="#9ca3af"
          />

          {/* Address */}
          <FieldLabel label={`${t.checkout.address} *`} />
          <TextInput
            style={styles.input}
            value={form.addressLine1}
            onChangeText={(v) => setForm((f) => ({ ...f, addressLine1: v }))}
            placeholder={t.checkout.addressPlaceholder}
            placeholderTextColor="#9ca3af"
          />

          {/* Notes */}
          <FieldLabel label={t.checkout.notes} />
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={form.notes}
            onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
            placeholder={t.checkout.notesPlaceholder}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* ── Delivery zone ─────────────────────────────────────── */}
        {zones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Delivery Zone</Text>
            {zones.map((zone) => {
              const active = selectedZone?.id === zone.id;
              const fee = zone.freeOverUsd !== null && sub >= zone.freeOverUsd ? 0 : zone.priceUsd;
              return (
                <TouchableOpacity
                  key={zone.id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => setForm((f) => ({ ...f, province: f.province }))}
                >
                  <View>
                    <Text style={styles.optionLabel}>{zone.nameEn}</Text>
                    <Text style={styles.optionSub}>{zone.estimatedDays} business day{zone.estimatedDays !== 1 ? "s" : ""}</Text>
                  </View>
                  <Text style={[styles.optionPrice, fee === 0 && { color: "#22c55e" }]}>
                    {fee === 0 ? "Free" : `$${fee.toFixed(2)}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Payment ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.option, paymentMethod === pm.id && styles.optionActive]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionIcon}>{pm.icon}</Text>
                <Text style={styles.optionLabel}>{pm.label}</Text>
              </View>
              {paymentMethod === pm.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Order summary ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.checkout.orderSummary}</Text>
          <SummaryRow label={t.checkout.subtotal} value={`$${sub.toFixed(2)}`} />
          <SummaryRow
            label={t.checkout.delivery}
            value={
              selectedZone
                ? deliveryFee === 0 ? "Free 🎉" : `$${deliveryFee.toFixed(2)}`
                : "—"
            }
          />
          <View style={styles.divider} />
          <SummaryRow label={t.checkout.total} value={`$${total.toFixed(2)}`} bold />
        </View>

        <TouchableOpacity
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{t.checkout.placeOrder}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: "#f9fafb" },
  scroll:{ padding: 16, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },

  section:      { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },

  // Form fields
  fieldLabel: { fontSize: 13, color: "#374151", fontWeight: "500", marginBottom: 4, marginTop: 8 },
  input:      { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#111827", backgroundColor: "#fafafa" },
  inputMulti: { minHeight: 60, textAlignVertical: "top" },

  // Phone row
  phoneRow:        { flexDirection: "row", gap: 8 },
  phonePrefix:     { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#f9fafb", justifyContent: "center" },
  phonePrefixText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  phoneInput:      { flex: 1 },

  // Province picker
  provincePicker:        { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" },
  provinceText:          { fontSize: 15, color: "#111827" },
  provincePlaceholder:   { fontSize: 15, color: "#9ca3af" },
  provinceChevron:       { fontSize: 12, color: "#6b7280" },
  provinceList:          { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, marginTop: 4, maxHeight: 240, overflow: "hidden", backgroundColor: "#fff" },
  provinceItem:          { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  provinceItemActive:    { backgroundColor: "#fff5f5" },
  provinceItemText:      { fontSize: 14, color: "#374151" },
  provinceItemTextActive:{ color: COLORS.primary, fontWeight: "600" },

  // Option cards (zones / payment)
  option:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 8 },
  optionActive: { borderColor: COLORS.primary, backgroundColor: "#fff5f5" },
  optionRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  optionIcon:   { fontSize: 18 },
  optionLabel:  { fontSize: 14, fontWeight: "500", color: "#111827" },
  optionSub:    { fontSize: 12, color: "#6b7280", marginTop: 2 },
  optionPrice:  { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  check:        { color: COLORS.primary, fontWeight: "700", fontSize: 16 },

  // Summary
  divider:  { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
  row:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rowLabel: { fontSize: 14, color: "#374151" },
  rowValue: { fontSize: 14, color: "#374151" },
  rowBold:  { fontWeight: "700", color: "#111827", fontSize: 15 },

  // Submit button
  btn:         { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
});
