import { View, StyleSheet } from "react-native";

interface DividerProps {
  color?: string;
  marginVertical?: number;
}

export function Divider({ color = "#f3f4f6", marginVertical = 8 }: DividerProps) {
  return <View style={[styles.divider, { backgroundColor: color, marginVertical }]} />;
}

const styles = StyleSheet.create({
  divider: { height: 1, width: "100%" },
});
