import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react-native";
import { fetchWithTimeout, friendlyError } from "../../src/lib/api";

const BRAND = "#e51b1b";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) { Alert.alert("Error", "Please enter your email address"); return; }
    setLoading(true);
    try {
      await fetchWithTimeout(`/api/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      // Always show the same confirmation (don't reveal whether the email exists).
      setSent(true);
    } catch (e) {
      Alert.alert("Couldn't send reset link", friendlyError(e).message);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <View style={styles.successIcon}>
          <CheckCircle size={40} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>Check your inbox</Text>
        <Text style={styles.successText}>If {email} is registered, we sent a reset link. Check your spam folder too.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={16} color={BRAND} />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.screen}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#374151" />
          <Text style={styles.navBackText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Mail size={32} color={BRAND} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>Enter your email and we&apos;ll send you a reset link.</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Mail size={16} color="#94a3b8" />
              <TextInput
                style={[styles.input, { marginLeft: 10, flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.dotsRow}>
                {[0,1,2].map((i) => <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.3 }]} />)}
              </View>
            ) : (
              <>
                <Text style={styles.btnText}>Send Reset Link</Text>
                <ArrowRight size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { alignItems: "center", justifyContent: "center", padding: 32 },
  navBack: { flexDirection: "row", alignItems: "center", gap: 6, padding: 20, paddingTop: 60 },
  navBackText: { fontSize: 16, color: "#374151", fontWeight: "600" },
  content: { padding: 24 },
  iconWrap: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 32, lineHeight: 20 },
  fieldWrap: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, backgroundColor: "#fff", paddingHorizontal: 14, height: 52 },
  input: { fontSize: 14, color: "#0f172a" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15 },
  btnDisabled: { backgroundColor: "#fca5a5" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 12, textAlign: "center" },
  successText: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backBtnText: { fontSize: 15, fontWeight: "700", color: BRAND },
});
