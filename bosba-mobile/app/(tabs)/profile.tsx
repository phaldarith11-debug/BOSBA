import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Alert, Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User, Package, Heart, Settings, Phone, Mail,
  MapPin, ExternalLink, ChevronRight, LogOut, LogIn,
  CheckCircle, AlertCircle,
} from "lucide-react-native";
import { useAuth } from "../../src/context/auth";
import { useI18n } from "../../src/context/i18n";
import { LanguageSwitcher } from "../../src/components/common/LanguageSwitcher";

const BRAND = "#e51b1b";

interface RowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
}

function Row({ icon, label, sublabel, onPress, rightContent, danger }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.rowIcon, danger && { backgroundColor: "#fef2f2" }]}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && { color: BRAND }]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {rightContent ?? (onPress ? <ChevronRight size={16} color={danger ? "#fca5a5" : "#94a3b8"} /> : null)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  async function handleSignOut() {
    Alert.alert(
      t.profile.signOut,
      "Are you sure?",
      [
        { text: t.common.cancel, style: "cancel" },
        { text: t.profile.signOut, style: "destructive", onPress: async () => { await signOut(); } },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.rowSublabel}>{t.common.loading}</Text>
      </View>
    );
  }

  const initials = (user?.name ?? "U").charAt(0).toUpperCase();
  const isVerified = !!user?.emailVerified;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      {user ? (
        <View style={styles.avatarSection}>
          {user.image ? (
            <Image source={{ uri: user.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          )}
          <Text style={styles.avatarName}>{user.name ?? "User"}</Text>
          <Text style={styles.avatarEmail}>{user.email}</Text>
          <View style={styles.verifiedBadge}>
            {isVerified ? (
              <><CheckCircle size={12} color="#22c55e" /><Text style={[styles.verifiedText, { color: "#22c55e" }]}> Verified</Text></>
            ) : (
              <><AlertCircle size={12} color="#f59e0b" /><Text style={[styles.verifiedText, { color: "#f59e0b" }]}> Email not verified</Text></>
            )}
          </View>
          {user.phone && <Text style={styles.avatarPhone}>{user.phone}</Text>}
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#94a3b8" />
          </View>
          <Text style={styles.loginTitle}>{t.profile.signInPrompt}</Text>
          <Text style={styles.loginSub}>Track orders, save wishlist & more</Text>
          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85} onPress={() => router.push("/(auth)/login")}>
            <LogIn size={18} color="#fff" />
            <Text style={styles.loginBtnText}>{t.auth.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 12 }}>
            <Text style={styles.registerLink}>{t.profile.registerPrompt} →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Account section */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.title}</Text>
          <View style={styles.card}>
            <Row icon={<Package size={18} color={BRAND} />} label={t.profile.orders} sublabel="Track your purchases" onPress={() => {}} />
            <View style={styles.divider} />
            <Row icon={<Heart size={18} color={BRAND} />} label={t.nav.wishlist} sublabel="Saved items" onPress={() => {}} />
            <View style={styles.divider} />
            <Row icon={<Settings size={18} color={BRAND} />} label={t.profile.settings} onPress={() => {}} />
            <View style={styles.divider} />
            <Row icon={<LogOut size={18} color={BRAND} />} label={t.profile.signOut} onPress={handleSignOut} danger />
          </View>
        </View>
      )}

      {/* Language section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.profile.language}</Text>
        <View style={styles.card}>
          <LanguageSwitcher variant="row" />
        </View>
      </View>

      {/* Contact section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.card}>
          <Row icon={<Phone size={18} color={BRAND} />} label="Call Us" sublabel="+855 12 345 678" onPress={() => Linking.openURL("tel:+85512345678")} />
          <View style={styles.divider} />
          <Row icon={<Mail size={18} color={BRAND} />} label="Email" sublabel="hello@bosba.com" onPress={() => Linking.openURL("mailto:hello@bosba.com")} />
          <View style={styles.divider} />
          <Row icon={<MapPin size={18} color={BRAND} />} label="Location" sublabel="Phnom Penh, Cambodia" />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Row icon={<ExternalLink size={18} color={BRAND} />} label="Visit Website" onPress={() => Linking.openURL("https://bosba.com")} />
          <View style={styles.divider} />
          <Row icon={<Text style={{ fontSize: 18 }}>🇰🇭</Text>} label="BOSBA Mobile" sublabel="v1.0.0 · Cambodia's Online Store" rightContent={<View />} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },

  avatarSection: { alignItems: "center", paddingVertical: 28, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  loginPrompt: { alignItems: "center", paddingVertical: 32, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avatarImage: { width: 72, height: 72, borderRadius: 36, marginBottom: 10 },
  avatarInitial: { fontSize: 28, fontWeight: "800", color: BRAND },
  avatarName: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  avatarEmail: { fontSize: 13, color: "#64748b", marginTop: 2 },
  avatarPhone: { fontSize: 13, color: "#64748b", marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  verifiedText: { fontSize: 12, fontWeight: "600" },

  loginTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  loginSub: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 9999 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  registerLink: { fontSize: 13, color: BRAND, fontWeight: "600" },

  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, paddingHorizontal: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  rowSublabel: { fontSize: 12, color: "#64748b", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#f8fafc", marginLeft: 64 },
});
