import { View, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../../constants";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "small" | "large";
}

export function LoadingSpinner({ fullScreen = false, size = "large" }: LoadingSpinnerProps) {
  return (
    <View style={[styles.wrap, fullScreen && styles.fullScreen]}>
      <ActivityIndicator color={COLORS.primary} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:       { alignItems: "center", justifyContent: "center", padding: 32 },
  fullScreen: { flex: 1 },
});
