import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  Battambang_400Regular,
  Battambang_700Bold,
} from "@expo-google-fonts/battambang";
import { AuthProvider, useAuth } from "../src/context/auth";
import { I18nProvider, useI18n } from "../src/context/i18n";
import { AppSettingsProvider } from "../src/context/app-settings";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { loading: authLoading } = useAuth();
  const { isLoading: i18nLoading } = useI18n();
  const [fontsLoaded] = useFonts({ Battambang_400Regular, Battambang_700Bold });

  useEffect(() => {
    if (!authLoading && !i18nLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [authLoading, i18nLoading, fontsLoaded]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="product/[slug]"
        options={{
          headerShown: true,
          headerTitle: "Product",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#e51b1b",
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: true,
          headerTitle: "Checkout",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#e51b1b",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </SafeAreaProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </I18nProvider>
  );
}
