import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
  TextInput, Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../src/context/auth";
import { getOrder, getAppSettings, submitPaymentProof } from "../../src/lib/api";
import { COLORS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "../../src/constants";

type OrderItem = { nameEn: string; quantity: number; priceUsd: number; totalUsd: number; imageUrl?: string | null };
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalUsd: number;
  totalKhr?: number;
  subtotalUsd: number;
  deliveryFeeUsd: number;
  trackingCode?: string | null;
  notes?: string | null;
  paymentRefId?: string | null;
  paymentProofUrl?: string | null;
  paymentRejectReason?: string | null;
  createdAt: string;
  items: OrderItem[];
  address?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    province: string;
    district?: string | null;
    commune?: string | null;
  } | null;
};

type AbaSettings = {
  aba_account_name?: string;
  aba_account_number?: string;
  aba_khqr_image?: string;
  aba_payment_instructions?: string;
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!id || !token) return;
    getOrder(id, token)
      .then(setOrder)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  if (error || !order) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error ?? "Order not found"}</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Text style={styles.backIconText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order.orderNumber}</Text>
        </View>

        {/* Status badges */}
        <View style={styles.badges}>
          <StatusBadge status={order.status} labels={ORDER_STATUS_LABELS} />
          <StatusBadge status={order.paymentStatus} labels={PAYMENT_STATUS_LABELS} />
        </View>

        {/* Timeline */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tracking</Text>
            {order.trackingCode && (
              <Text style={styles.tracking}>Tracking code: {order.trackingCode}</Text>
            )}
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <View key={step} style={styles.step}>
                    <View style={[styles.stepDot, (done || active) && styles.stepDotActive]}>
                      {done && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && styles.stepLineActive]} />
                    )}
                    <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                      {ORDER_STATUS_LABELS[step] ?? step}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemThumb}>
                <Text style={styles.itemThumbText}>📦</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.nameEn}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>${Number(item.totalUsd).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Summary</Text>
          <PriceRow label="Subtotal" value={`$${Number(order.subtotalUsd).toFixed(2)}`} />
          <PriceRow label="Delivery" value={`$${Number(order.deliveryFeeUsd).toFixed(2)}`} />
          <View style={styles.divider} />
          <PriceRow label="Total" value={`$${Number(order.totalUsd).toFixed(2)}`} bold />
        </View>

        {/* Payment info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <PriceRow label="Method" value={order.paymentMethod.replace(/_/g, " ")} />
          <PriceRow label="Status" value={PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus} />
          <PriceRow label="Date" value={new Date(order.createdAt).toLocaleDateString()} />
        </View>

        {/* Manual ABA / KHQR payment */}
        {order.paymentMethod === "ABA_BANK" && order.paymentStatus !== "PAID" && (
          <AbaPaymentSection order={order} token={token} onSubmitted={load} />
        )}

        {/* Delivery Address */}
        {order.address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <Text style={styles.addressName}>{order.address.fullName}</Text>
            <Text style={styles.addressPhone}>{order.address.phone}</Text>
            <Text style={styles.addressText}>{order.address.addressLine1}</Text>
            <Text style={styles.addressText}>
              {[order.address.commune, order.address.district, order.address.city].filter(Boolean).join(", ")}
            </Text>
            <Text style={styles.addressText}>{order.address.province}</Text>
          </View>
        )}

        {order.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const colors: Record<string, string> = {
    PENDING: "#fef3c7", CONFIRMED: "#dbeafe", PROCESSING: "#ede9fe",
    SHIPPED: "#dbeafe", DELIVERED: "#d1fae5", CANCELLED: "#fee2e2",
    REFUNDED: "#f3f4f6", PAID: "#d1fae5", FAILED: "#fee2e2",
  };
  return (
    <View style={[styles.badge, { backgroundColor: colors[status] ?? "#f3f4f6" }]}>
      <Text style={styles.badgeText}>{labels[status] ?? status}</Text>
    </View>
  );
}

function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && styles.priceBold]}>{label}</Text>
      <Text style={[styles.priceValue, bold && styles.priceBold]}>{value}</Text>
    </View>
  );
}

function AbaPaymentSection({
  order,
  token,
  onSubmitted,
}: {
  order: Order;
  token: string | null;
  onSubmitted: () => void;
}) {
  const [aba, setAba] = useState<AbaSettings>({});
  const [refId, setRefId] = useState(order.paymentRefId ?? "");
  const [imageUri, setImageUri] = useState<string | null>(order.paymentProofUrl ?? null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAppSettings().then(setAba).catch(() => {});
  }, []);

  const submitted = order.status === "PAYMENT_SUBMITTED";
  const rejected = order.status === "PAYMENT_REJECTED";

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to upload your payment screenshot.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!token) return;
    if (!refId.trim() && !imageUri) {
      Alert.alert("Add proof", "Enter the transaction reference or attach a screenshot.");
      return;
    }
    // Only upload a freshly-picked local file (file://…), not an already-hosted https URL.
    const localImage = imageUri && imageUri.startsWith("http") ? undefined : imageUri ?? undefined;
    setSubmitting(true);
    try {
      await submitPaymentProof(
        { orderId: order.id, refId: refId.trim() || undefined, imageUri: localImage },
        token
      );
      Alert.alert("Submitted", "Your payment proof was submitted. We'll confirm shortly!");
      onSubmitted();
    } catch (e) {
      Alert.alert("Failed", e instanceof Error ? e.message : "Could not submit payment proof.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>ABA Bank Transfer / KHQR</Text>

      {submitted && (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>⏳ Awaiting confirmation</Text>
          <Text style={styles.bannerText}>We received your proof and will confirm your order shortly.</Text>
        </View>
      )}
      {rejected && (
        <View style={[styles.banner, styles.bannerError]}>
          <Text style={styles.bannerTitle}>❌ Payment not verified</Text>
          <Text style={styles.bannerText}>{order.paymentRejectReason || "Please re-submit your proof."}</Text>
        </View>
      )}

      {aba.aba_khqr_image ? (
        <View style={styles.qrWrap}>
          <Image source={{ uri: aba.aba_khqr_image }} style={styles.qrImage} resizeMode="contain" />
          <Text style={styles.qrHint}>Scan with ABA Mobile or any KHQR bank app</Text>
        </View>
      ) : null}

      <PriceRow label="Account name" value={aba.aba_account_name || "—"} />
      <PriceRow label="Account no." value={aba.aba_account_number || "—"} />
      <PriceRow label="Amount" value={`$${Number(order.totalUsd).toFixed(2)}`} bold />
      <PriceRow label="Reference" value={`#${order.orderNumber}`} />
      {aba.aba_payment_instructions ? (
        <Text style={styles.instructions}>{aba.aba_payment_instructions}</Text>
      ) : null}

      {!submitted && (
        <>
          <View style={styles.divider} />
          <Text style={styles.formLabel}>Transaction reference / ID</Text>
          <TextInput
            style={styles.input}
            value={refId}
            onChangeText={setRefId}
            placeholder="e.g. 100FT0123456789"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            <Text style={styles.uploadBtnText}>{imageUri ? "Change screenshot" : "📎 Upload screenshot"}</Text>
          </TouchableOpacity>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.proofPreview} resizeMode="cover" />}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{rejected ? "Re-submit Proof" : "Submit Payment Proof"}</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: "#f9fafb" },
  scroll:            { padding: 16, paddingBottom: 40 },
  center:            { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  errorText:         { color: "#ef4444", fontSize: 15, marginBottom: 16, textAlign: "center" },
  backBtn:           { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  backBtnText:       { color: "#fff", fontWeight: "600" },
  header:            { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backIcon:          { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  backIconText:      { fontSize: 18, color: "#374151" },
  title:             { fontSize: 18, fontWeight: "700", color: "#111827" },
  badges:            { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge:             { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:         { fontSize: 12, fontWeight: "600", color: "#374151" },
  card:              { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle:         { fontSize: 13, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  tracking:          { fontSize: 13, color: "#374151", marginBottom: 12, fontWeight: "500" },
  timeline:          { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  step:              { alignItems: "center", flex: 1 },
  stepDot:           { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center", zIndex: 1 },
  stepDotActive:     { backgroundColor: COLORS.primary },
  checkMark:         { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepLine:          { position: "absolute", top: 11, left: "50%", right: "-50%", height: 2, backgroundColor: "#e5e7eb" },
  stepLineActive:    { backgroundColor: COLORS.primary },
  stepLabel:         { fontSize: 9, color: "#9ca3af", textAlign: "center", marginTop: 6 },
  stepLabelActive:   { color: COLORS.primary, fontWeight: "600" },
  itemRow:           { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  itemThumb:         { width: 48, height: 48, borderRadius: 10, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  itemThumbText:     { fontSize: 20 },
  itemInfo:          { flex: 1 },
  itemName:          { fontSize: 13, fontWeight: "500", color: "#111827" },
  itemQty:           { fontSize: 12, color: "#6b7280", marginTop: 2 },
  itemTotal:         { fontSize: 13, fontWeight: "600", color: "#374151" },
  divider:           { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
  priceRow:          { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  priceLabel:        { fontSize: 14, color: "#6b7280" },
  priceValue:        { fontSize: 14, color: "#374151" },
  priceBold:         { fontWeight: "700", color: "#111827", fontSize: 15 },
  notes:             { fontSize: 14, color: "#374151", lineHeight: 20 },
  addressName:       { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 2 },
  addressPhone:      { fontSize: 14, color: "#4b5563", marginBottom: 4 },
  addressText:       { fontSize: 14, color: "#374151", marginBottom: 1 },

  // ABA manual payment section
  banner:            { backgroundColor: "#fffbeb", borderColor: "#fde68a", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerError:       { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  bannerTitle:       { fontSize: 14, fontWeight: "700", color: "#92400e", marginBottom: 2 },
  bannerText:        { fontSize: 13, color: "#78350f" },
  qrWrap:            { alignItems: "center", marginBottom: 12 },
  qrImage:           { width: 200, height: 200, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  qrHint:            { fontSize: 11, color: "#9ca3af", marginTop: 6 },
  instructions:      { fontSize: 13, color: "#4b5563", backgroundColor: "#f9fafb", borderRadius: 10, padding: 10, marginTop: 8, lineHeight: 19 },
  formLabel:         { fontSize: 13, color: "#374151", fontWeight: "500", marginBottom: 6 },
  input:             { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: "#111827", backgroundColor: "#fafafa", marginBottom: 10 },
  uploadBtn:         { borderWidth: 1, borderStyle: "dashed", borderColor: "#d1d5db", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 10 },
  uploadBtnText:     { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  proofPreview:      { width: 120, height: 120, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  submitBtn:         { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  submitBtnText:     { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnDisabled:       { opacity: 0.6 },
});
