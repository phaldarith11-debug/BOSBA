import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>This screen doesn&apos;t exist.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
        <Text style={styles.btnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 64, fontWeight: "900", color: "#e51b1b" },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 24 },
  btn: { backgroundColor: "#e51b1b", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
