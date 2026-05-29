import { useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCartStore } from "../src/store/cart";
import { useAuth } from "../src/context/auth";
import { createOrder, getDeliveryZones } from "../src/lib/api";
import { COLORS } from "../src/constants";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type Zone = { id: string; nameEn: string; priceUsd: number; estimatedDays: number };

const PAYMENT_METHODS = [
  { id: "ABA_BANK",   label: "ABA Bank QR" },
  { id: "WING_MONEY", label: "Wing Money" },
  { id: "COD",        label: "Cash on Delivery" },
] as const;

export default function CheckoutScreen() {
  const { items, subtotalUsd, clearCart } = useCartStore();
  const { token } = useAuth();

  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    province: "",
    notes: "",
  });

  useFocusEffect(
    useCallback(() => {
      getDeliveryZones().then((raw: Zone[]) => {
        const data = raw.map((z) => ({ ...z, priceUsd: Number(z.priceUsd) }));
        setZones(data);
        if (data.length > 0) setSelectedZone(data[0]);
      }).catch(() => {});
    }, [])
  );

  const total = subtotalUsd() + (selectedZone?.priceUsd ?? 0);

  async function handleSubmit() {
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.province) {
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

    setSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address: form,
        deliveryZoneId: selectedZone?.id,
        paymentMethod,
        currency: "USD",
      }, token);

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
        <Text style={styles.title}>Checkout</Text>

        {/* Delivery address */}
        <Section label="Delivery Address">
          <Field label="Full Name *" value={form.fullName} onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))} />
          <Field label="Phone *" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
          <Field label="Address *" value={form.addressLine1} onChangeText={(v) => setForm((f) => ({ ...f, addressLine1: v }))} />
          <Field label="City *" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
          <Field label="Province *" value={form.province} onChangeText={(v) => setForm((f) => ({ ...f, province: v }))} />
          <Field label="Notes (optional)" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} multiline />
        </Section>

        {/* Delivery zone */}
        {zones.length > 0 && (
          <Section label="Delivery Zone">
            {zones.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[styles.option, selectedZone?.id === zone.id && styles.optionActive]}
                onPress={() => setSelectedZone(zone)}
              >
                <View>
                  <Text style={styles.optionLabel}>{zone.nameEn}</Text>
                  <Text style={styles.optionSub}>{zone.estimatedDays} business days</Text>
                </View>
                <Text style={styles.optionPrice}>${zone.priceUsd.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* Payment method */}
        <Section label="Payment Method">
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.option, paymentMethod === pm.id && styles.optionActive]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <Text style={styles.optionLabel}>{pm.label}</Text>
              {paymentMethod === pm.id && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Section>

        {/* Order summary */}
        <Section label="Order Summary">
          <Row label="Subtotal" value={`$${subtotalUsd().toFixed(2)}`} />
          <Row label="Delivery" value={selectedZone ? `$${selectedZone.priceUsd.toFixed(2)}` : "—"} />
          <View style={styles.divider} />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold />
        </Section>

        <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Order</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType, multiline }: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad"; multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "#f9fafb" },
  scroll:       { padding: 16, paddingBottom: 40 },
  title:        { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 16 },
  section:      { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  fieldWrap:    { marginBottom: 12 },
  fieldLabel:   { fontSize: 13, color: "#374151", marginBottom: 4 },
  input:        { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: "#111827", backgroundColor: "#fafafa" },
  inputMulti:   { height: 72, textAlignVertical: "top" },
  option:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, marginBottom: 8 },
  optionActive: { borderColor: COLORS.primary },
  optionLabel:  { fontSize: 14, fontWeight: "500", color: "#111827" },
  optionSub:    { fontSize: 12, color: "#6b7280", marginTop: 2 },
  optionPrice:  { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  check:        { color: COLORS.primary, fontWeight: "700", fontSize: 16 },
  divider:      { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
  row:          { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rowLabel:     { fontSize: 14, color: "#374151" },
  rowValue:     { fontSize: 14, color: "#374151" },
  rowBold:      { fontWeight: "700", color: "#111827", fontSize: 15 },
  btn:          { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: "#fff", fontSize: 16, fontWeight: "700" },
});
