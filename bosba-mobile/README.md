# BOSBA Mobile (Expo)

Expo SDK 56 · Expo Router · React Native 0.85. Ships to **Android** and **iOS** (iPhone + iPad).

---

## ⚠️ iOS Simulator does NOT work on Windows

The Apple **iOS Simulator only runs on macOS with Xcode installed.** There is no
way to run it on Windows or Linux — this is an Apple restriction, not a project
bug.

If you press **`i`** in the Expo CLI on Windows, Expo tries to launch the
Simulator, fails, and offers to install Xcode from the App Store:

```
Opening on iOS...
Xcode must be fully installed before you can continue.
Continue to the App Store?  →  Error: Command failed: open https://apps.apple.com/...
```

**On Windows, do not press `i`.** Test iOS on a **real iPhone with Expo Go**
(instructions below). `npm run ios` is safe on Windows — it detects the OS,
explains this, and starts the normal QR server instead of touching Xcode.

### Platform support matrix

| You are on | Android testing | iOS testing |
|------------|-----------------|-------------|
| **Windows** (this team's default) | Android emulator (`a`) **or** real Android phone + Expo Go | **Real iPhone + Expo Go (scan QR)** — no Simulator |
| **macOS** | Android emulator / real phone | iOS Simulator (`i` / `npm run ios:simulator`) **or** real iPhone + Expo Go |

---

## Prerequisites

- Node.js (use the version in CI; tested on Node 24)
- The backend running locally: `cd ../bosba-ecommerce && npm run dev`
  (binds `0.0.0.0:3000` so phones on the LAN can reach it)
- **Expo Go** app on your phone (App Store / Google Play)
- Phone and PC on the **same Wi-Fi**

> The app auto-detects your PC's current LAN IP from the Metro connection in dev,
> so a stale `EXPO_PUBLIC_API_URL` self-corrects on a physical device. See
> `src/lib/api.ts`.

---

## Testing workflows

### Start the dev server
```bash
cd bosba-mobile
npm install        # first time only
npm start          # or: npm run start:clear  (clears the Metro cache)
```
A QR code appears in the terminal.

### Real iPhone (primary iOS workflow) 🍏
1. Install **Expo Go** from the App Store.
2. Same Wi-Fi as the PC.
3. Open the **Camera** app and point it at the QR code → tap the banner to open in Expo Go.

### Real Android phone 🤖
1. Install **Expo Go** from Google Play.
2. Same Wi-Fi as the PC.
3. Open **Expo Go → Scan QR code** and scan the terminal QR.

### Android emulator (Windows OK)
```bash
npm run android        # boots/uses an Android Virtual Device
```

### Can't connect? Use tunnel mode (no LAN/IP needed)
```bash
npm run tunnel         # routes through @expo/ngrok
```
Useful on locked-down/guest Wi-Fi or when the phone and PC are on different networks.

### What works only in a build (NOT in Expo Go)
- **Sign in with Apple** — needs a dev/standalone build on a real device.
- **Remote push notifications** — not wired up yet (the Notifications tab uses a
  pull model). When enabled, also needs a build + APNs credentials.

Email/password login and the server-side Google sign-in flow **do** work in Expo Go.

---

## Build workflow (EAS)

One-time: `npm i -g eas-cli && eas login`.

> ⚠️ **Before any real build**, replace the placeholder API URL in `eas.json`
> (`EXPO_PUBLIC_API_URL: "https://your-bosba-domain.com"`) with the real
> production HTTPS API for each profile you build.

### Android
```bash
npm run build:android:dev     # internal dev/test APK
npm run build:android         # production (Play Store)
```
Android builds run on Windows/macOS/Linux — no special hardware.

### iOS  (build runs in the EAS cloud — no Mac required to BUILD)
```bash
npm run build:ios             # eas build --platform ios --profile production
```
You do **not** need a Mac to *build* with EAS (it builds on cloud macOS workers).
You **do** need:
- An **Apple Developer Program** membership ($99/yr).
- EAS will prompt to create the Distribution certificate + provisioning profile,
  and (because `usesAppleSignIn` is set) register the *Sign in with Apple*
  capability automatically.
- Bundle identifier **`com.bosba.shop`** must exist / be claimable in your Apple
  account.

### Submit to the App Store
```bash
eas submit --platform ios --profile production
```
Or fill `submit.production.ios` in `eas.json` with `appleId` / `ascAppId` /
`appleTeamId` for non-interactive submits.

---

## iOS configuration reference (verified)

`app.json` → `expo.ios`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `bundleIdentifier` | `com.bosba.shop` | App identity (matches Android `package`) |
| `supportsTablet` | `true` | Native iPad support (grid is responsive: 2/3/4 cols) |
| `usesAppleSignIn` | `true` | Enables Sign in with Apple (via `expo-apple-authentication`) |
| `infoPlist.NSCameraUsageDescription` | … | QR scanning |
| `infoPlist.NSPhotoLibraryUsageDescription` | … | Profile photo upload |
| `infoPlist.ITSAppUsesNonExemptEncryption` | `false` | Skips export-compliance prompt on every upload |

> **Note:** `newArchEnabled` is intentionally **absent** — it is invalid in SDK 56
> (RN 0.85 is New-Architecture-only). Do not re-add it.

---

## npm scripts

| Script | What it does |
|--------|--------------|
| `npm start` | Dev server + QR (use for both Android & iPhone via Expo Go) |
| `npm run start:clear` | Same, clearing the Metro cache |
| `npm run android` | Open on Android emulator/device |
| `npm run ios` | **OS-aware:** macOS → Simulator; Windows/Linux → explains + starts QR server |
| `npm run ios:simulator` | Force `expo start --ios` (macOS only) |
| `npm run tunnel` | Dev server over ngrok tunnel |
| `npm run build:android` / `build:ios` / `build:all` | EAS production builds |
