import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = "bosba_auth_token";
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

export type AuthUser = {
  id: string;
  name: string | null;
  nameKm: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  emailVerified: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithFacebook: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function storeSession(token: string, user: AuthUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function callOAuthEndpoint(endpoint: string, body: object): Promise<{ error?: string; token?: string; user?: AuthUser }> {
  try {
    const res = await fetch(`${API_BASE}/api/mobile/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "Authentication failed" };
    }
    return res.json();
  } catch {
    return { error: "Network error. Check your connection." };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Google auth session
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Facebook auth session
  const [fbRequest, fbResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "",
  });

  // Resolve stored session on mount
  useEffect(() => {
    async function restore() {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          const res = await fetch(`${API_BASE}/api/mobile/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.ok) { setToken(stored); setUser(await res.json()); }
          else await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } catch {}
      finally { setLoading(false); }
    }
    restore();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const accessToken = googleResponse.authentication?.accessToken;
      if (accessToken) {
        callOAuthEndpoint("google", { accessToken }).then(async (result) => {
          if (result.token && result.user) {
            await storeSession(result.token, result.user);
            setToken(result.token);
            setUser(result.user);
          }
        });
      }
    }
  }, [googleResponse]);

  // Handle Facebook OAuth response
  useEffect(() => {
    if (fbResponse?.type === "success") {
      const accessToken = fbResponse.authentication?.accessToken;
      if (accessToken) {
        callOAuthEndpoint("facebook", { accessToken }).then(async (result) => {
          if (result.token && result.user) {
            await storeSession(result.token, result.user);
            setToken(result.token);
            setUser(result.user);
          }
        });
      }
    }
  }, [fbResponse]);

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/mobile/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { const d = await res.json(); return { error: d.error ?? "Invalid credentials" }; }
      const { token: t, user: u } = await res.json();
      await storeSession(t, u);
      setToken(t);
      setUser(u);
      return {};
    } catch {
      return { error: "Network error. Check your connection." };
    }
  }

  async function signInWithGoogle(): Promise<{ error?: string }> {
    if (!googleRequest) return { error: "Google sign-in not configured" };
    await promptGoogle();
    return {};
  }

  async function signInWithFacebook(): Promise<{ error?: string }> {
    if (!fbRequest) return { error: "Facebook sign-in not configured" };
    await promptFacebook();
    return {};
  }

  async function signInWithApple(): Promise<{ error?: string }> {
    if (Platform.OS !== "ios") return { error: "Apple Sign In is only available on iOS" };
    try {
      const AppleAuth = await import("expo-apple-authentication");
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ")
        : undefined;
      const result = await callOAuthEndpoint("apple", {
        identityToken: credential.identityToken,
        name,
      });
      if (result.error) return { error: result.error };
      if (result.token && result.user) {
        await storeSession(result.token, result.user);
        setToken(result.token);
        setUser(result.user);
      }
      return {};
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === "ERR_REQUEST_CANCELED") return {};
      return { error: "Apple Sign In failed" };
    }
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/mobile/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUser(await res.json());
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signInWithGoogle, signInWithFacebook, signInWithApple, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
