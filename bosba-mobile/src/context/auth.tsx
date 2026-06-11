import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { API_BASE, fetchWithTimeout, friendlyError } from "../lib/api";

// Google uses a SERVER-SIDE OAuth flow (see /api/mobile/auth/google/start +
// /callback). The app opens that URL in a system browser; the backend talks to
// Google with an HTTPS redirect_uri and hands the session token back via the app's
// deep-link scheme. This works in Expo Go — unlike the native exp:// redirect that
// Google rejects with "Error 400: invalid_request".
//
// The browser must reach the backend over PUBLIC HTTPS, so Google OAuth uses
// EXPO_PUBLIC_PUBLIC_URL (your ngrok/https URL) when set, falling back to API_BASE.
const OAUTH_BASE = process.env.EXPO_PUBLIC_PUBLIC_URL || API_BASE;

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = "bosba_auth_token";

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
    const res = await fetchWithTimeout(`/api/mobile/auth/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error ?? "Authentication failed" };
    }
    return res.json();
  } catch (e) {
    return { error: friendlyError(e).message };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          const res = await fetchWithTimeout(`/api/mobile/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.ok) { setToken(stored); setUser(await res.json()); }
          // 401 → token is invalid/expired; drop it. Network errors → keep the
          // token so the user stays signed in once connectivity returns.
          else if (res.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } catch {}
      finally { setLoading(false); }
    }
    restore();
  }, []);

  // Exchange a session token for the user profile, then persist + activate it.
  async function activateSession(authToken: string): Promise<{ error?: string }> {
    try {
      const res = await fetchWithTimeout(`/api/mobile/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return { error: "Signed in, but could not load your profile. Please try again." };
      const u: AuthUser = await res.json();
      await storeSession(authToken, u);
      setToken(authToken);
      setUser(u);
      return {};
    } catch (e) {
      return { error: friendlyError(e).message };
    }
  }

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
      const res = await fetchWithTimeout(`/api/mobile/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); return { error: d.error ?? "Invalid credentials" }; }
      const { token: t, user: u } = await res.json();
      await storeSession(t, u);
      setToken(t);
      setUser(u);
      return {};
    } catch (e) {
      return { error: friendlyError(e).message };
    }
  }

  async function signInWithGoogle(): Promise<{ error?: string }> {
    // Deep link the browser will be sent back to once the backend has a session.
    // Expo Go → exp://<host>/--/auth/google ; standalone → bosba://auth/google
    const returnUrl = Linking.createURL("auth/google");
    const startUrl =
      `${OAUTH_BASE}/api/mobile/auth/google/start?return_url=${encodeURIComponent(returnUrl)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

      // User closed the browser / hit cancel — not an error.
      if (result.type !== "success" || !result.url) return {};

      const { queryParams } = Linking.parse(result.url);
      const err = typeof queryParams?.error === "string" ? queryParams.error : undefined;
      const authToken = typeof queryParams?.token === "string" ? queryParams.token : undefined;

      if (err) {
        return { error: `Google sign-in failed (${err}). Please try again.` };
      }
      if (!authToken) {
        return { error: "Google sign-in did not return a token. Please try again." };
      }
      return activateSession(authToken);
    } catch {
      return {
        error:
          "Could not start Google sign-in.\n\n" +
          "Make sure EXPO_PUBLIC_PUBLIC_URL points to your public HTTPS URL " +
          "(e.g. your ngrok address) and the backend is running.",
      };
    }
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
      const res = await fetchWithTimeout(`/api/mobile/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
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
