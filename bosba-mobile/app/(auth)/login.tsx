import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../../src/context/auth";
import { useI18n } from "../../src/context/i18n";

const BRAND = "#e51b1b";

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </Svg>
  );
}

function Dots() {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[0, 1, 2].map((i) => <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.3 }]}/>)}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleOAuth(provider: string, fn: () => Promise<{ error?: string }>) {
    setOauthLoading(provider);
    const { error } = await fn();
    setOauthLoading(null);
    if (error) Alert.alert("Sign In Failed", error);
    else if (provider !== "google" && provider !== "facebook") router.replace("/(tabs)/");
  }

  async function handleLogin() {
    if (!email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) Alert.alert("Sign In Failed", error);
    else router.replace("/(tabs)/");
  }

  type OAuthButton = {
    id: string;
    label: string;
    color: string;
    textColor: string;
    border?: string;
    onPress: () => void;
  };

  const oauthButtons: OAuthButton[] = [
    ...(Platform.OS === "ios"
      ? [{ id: "apple", label: "Continue with Apple", color: "#000", textColor: "#fff", onPress: () => handleOAuth("apple", signInWithApple) }]
      : []),
    { id: "google", label: "Continue with Google", color: "#fff", textColor: "#374151", border: "#e2e8f0", onPress: () => handleOAuth("google", signInWithGoogle) },
    { id: "facebook", label: "Continue with Facebook", color: "#1877F2", textColor: "#fff", onPress: () => handleOAuth("facebook", signInWithFacebook) },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BOSBA</Text>
          <Text style={styles.tagline}>Cambodia&apos;s Online Store</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t.auth.loginTitle}</Text>
          <Text style={styles.subtitle}>{t.auth.loginSubtitle}</Text>

          {/* OAuth buttons */}
          {oauthButtons.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={[styles.oauthBtn, { backgroundColor: btn.color, borderColor: btn.border ?? btn.color }]}
              onPress={btn.onPress}
              disabled={!!oauthLoading || loading}
              activeOpacity={0.85}
            >
              {oauthLoading === btn.id
                ? <Dots/>
                : <>
                    {btn.id === "google" && <GoogleIcon/>}
                    {btn.id === "facebook" && <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>f</Text>}
                    {btn.id === "apple" && <Text style={{ fontSize: 18, color: "#fff" }}></Text>}
                    <Text style={[styles.oauthBtnText, { color: btn.textColor }]}>{btn.label}</Text>
                  </>
              }
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine}/>
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine}/>
          </View>

          {/* Continue with Email button */}
          <TouchableOpacity
            style={[styles.oauthBtn, { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }]}
            onPress={() => setShowEmailForm(!showEmailForm)}
            disabled={!!oauthLoading}
            activeOpacity={0.85}
          >
            <Mail size={18} color="#64748b"/>
            <Text style={[styles.oauthBtnText, { color: "#374151" }]}>Continue with Email</Text>
          </TouchableOpacity>

          {/* Email form — expands when button clicked */}
          {showEmailForm && (
            <View style={{ gap: 14, marginTop: 4 }}>
              <View>
                <Text style={styles.label}>{t.auth.email}</Text>
                <View style={styles.inputRow}>
                  <Mail size={16} color="#94a3b8" style={{ marginRight: 10 }}/>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{t.auth.password}</Text>
                  <Link href="/(auth)/forgot-password" style={styles.forgotLink}>{t.auth.forgotPassword}</Link>
                </View>
                <View style={styles.inputRow}>
                  <Lock size={16} color="#94a3b8" style={{ marginRight: 10 }}/>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPw}
                    autoComplete="current-password"
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={18} color="#94a3b8"/> : <Eye size={18} color="#94a3b8"/>}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { backgroundColor: "#fca5a5" }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? <Dots/> : <><Text style={styles.submitBtnText}>{t.auth.login}</Text><ArrowRight size={18} color="#fff"/></>}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.auth.noAccount} </Text>
            <Link href="/(auth)/register" style={styles.link}>{t.auth.register}</Link>
          </View>
        </View>

        <View style={styles.trust}>
          <Text style={styles.trustText}>🔒 Secure · 🇰🇭 Cambodia · ABA · Wing · COD</Text>
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
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 4 },
  oauthBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16 },
  oauthBtnText: { fontSize: 14, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  forgotLink: { fontSize: 12, fontWeight: "600", color: BRAND },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, backgroundColor: "#f8fafc", paddingHorizontal: 14, height: 50 },
  input: { flex: 1, fontSize: 14, color: "#0f172a" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: BRAND, borderRadius: 14, paddingVertical: 15, marginTop: 4 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 13, color: "#64748b" },
  link: { fontSize: 13, fontWeight: "700", color: BRAND },
  trust: { marginTop: 24, alignItems: "center" },
  trustText: { fontSize: 12, color: "#94a3b8" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#94a3b8" },
});
