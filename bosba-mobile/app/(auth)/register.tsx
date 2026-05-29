import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock } from "lucide-react-native";
import { useAuth } from "../../src/context/auth";

const BRAND = "#e51b1b";
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwStrength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthColor = ["#e2e8f0", "#ef4444", "#eab308", "#22c55e"];

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) { Alert.alert("Error", "Please fill in all required fields"); return; }
    if (form.password !== form.confirm) { Alert.alert("Error", "Passwords do not match"); return; }
    if (form.password.length < 8) { Alert.alert("Error", "Password must be at least 8 characters"); return; }

    setLoading(true);
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email.trim(), phone: form.phone ? `+855${form.phone}` : undefined, password: form.password }),
    });
    setLoading(false);

    if (res.ok) {
      Alert.alert("Account Created!", "A verification code has been sent to your email. Please verify before signing in.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } else {
      const data = await res.json();
      Alert.alert("Registration Failed", data.error ?? "Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>BOSBA</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Join BOSBA</Text>
          <Text style={styles.subtitle}>Shop Cambodia's best products</Text>

          {[
            { key: "name", label: "Full Name *", icon: <User size={16} color="#94a3b8" />, placeholder: "Your name", caps: "words" as const },
            { key: "email", label: "Email *", icon: <Mail size={16} color="#94a3b8" />, placeholder: "you@example.com", keyboard: "email-address" as const, caps: "none" as const },
          ].map(({ key, label, icon, placeholder, keyboard, caps }) => (
            <View key={key} style={styles.fieldWrap}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputRow}>
                {icon}
                <TextInput
                  style={[styles.input, { marginLeft: 10 }]}
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => setForm({ ...form, [key]: v })}
                  placeholder={placeholder}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize={caps ?? "none"}
                  keyboardType={keyboard}
                />
              </View>
            </View>
          ))}

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone (optional)</Text>
            <View style={styles.inputRow}>
              <Phone size={16} color="#94a3b8" />
              <View style={styles.prefix}><Text style={styles.prefixText}>+855</Text></View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                placeholder="12 345 678"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputRow}>
              <Lock size={16} color="#94a3b8" />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 10 }]}
                value={form.password}
                onChangeText={(v) => setForm({ ...form, password: v })}
                placeholder="Min. 8 characters"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </TouchableOpacity>
            </View>
            {form.password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1,2,3].map((l) => (
                  <View key={l} style={[styles.strengthBar, { backgroundColor: pwStrength >= l ? strengthColor[pwStrength] : "#e2e8f0" }]} />
                ))}
                <Text style={styles.strengthLabel}>{pwStrength===3?"Strong":pwStrength===2?"Good":"Weak"}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={[styles.inputRow, form.confirm && form.confirm !== form.password && { borderColor: "#fca5a5" }]}>
              <Lock size={16} color="#94a3b8" />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 10 }]}
                value={form.confirm}
                onChangeText={(v) => setForm({ ...form, confirm: v })}
                placeholder="Repeat password"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPw}
              />
            </View>
            {form.confirm && form.confirm !== form.password && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.btn, (loading || !form.password || form.password.length < 8) && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading || form.password.length < 8}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.dotsRow}>
                {[0,1,2].map((i) => <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.3 }]} />)}
              </View>
            ) : (
              <>
                <Text style={styles.btnText}>Create Account</Text>
                <ArrowRight size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: "900", color: BRAND, letterSpacing: -1 },
  tagline: { fontSize: 13, color: "#94a3b8", marginTop: 4 },

  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 24 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, backgroundColor: "#f8fafc", paddingHorizontal: 14, height: 50 },
  input: { fontSize: 14, color: "#0f172a" },
  prefix: { backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: 8 },
  prefixText: { fontSize: 13, fontWeight: "600", color: "#64748b" },

  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, color: "#94a3b8", width: 44 },
  errorText: { fontSize: 12, color: BRAND, marginTop: 4 },

  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15, marginTop: 8 },
  btnDisabled: { backgroundColor: "#fca5a5" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dotsRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { fontSize: 13, color: "#64748b" },
  link: { fontSize: 13, fontWeight: "700", color: BRAND },
});
