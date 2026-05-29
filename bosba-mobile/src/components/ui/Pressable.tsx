import { Pressable as RNPressable, StyleSheet, PressableProps, ViewStyle } from "react-native";

interface StyledPressableProps extends PressableProps {
  style?: ViewStyle;
  activeOpacity?: number;
}

export function Pressable({ style, activeOpacity = 0.7, children, ...rest }: StyledPressableProps) {
  return (
    <RNPressable
      style={({ pressed }) => [style, pressed && { opacity: activeOpacity }]}
      {...rest}
    >
      {children}
    </RNPressable>
  );
}
