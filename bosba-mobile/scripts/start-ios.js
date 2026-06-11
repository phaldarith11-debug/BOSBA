#!/usr/bin/env node
/**
 * Cross-platform `npm run ios` guard.
 *
 * The Apple iOS Simulator ONLY runs on macOS with Xcode installed. On Windows
 * (or Linux) `expo start --ios` cannot work — Expo tries to install Xcode from
 * the App Store and fails with:
 *   "Xcode must be fully installed before you can continue."
 *
 * So:
 *   • macOS  → launch the iOS Simulator as usual (`expo start --ios`).
 *   • other  → explain why there is no Simulator, then start the normal dev
 *              server so a QR code appears for testing on a REAL iPhone via
 *              Expo Go. Never attempts to open Xcode / the App Store.
 */
const { spawn } = require("node:child_process");

const isMac = process.platform === "darwin";

// `expo` is a local dependency; `npx` resolves it without a global install.
// shell:true is required so `npx`/`npx.cmd` resolves correctly on Windows.
function run(args) {
  const child = spawn("npx", ["expo", ...args], { stdio: "inherit", shell: true });
  child.on("exit", (code) => process.exit(code ?? 0));
}

if (isMac) {
  run(["start", "--ios"]);
} else {
  const osName = process.platform === "win32" ? "Windows" : process.platform;
  console.log(
    [
      "",
      "──────────────────────────────────────────────────────────────",
      `  iOS Simulator is NOT available on ${osName}.`,
      "  The Apple iOS Simulator only runs on macOS with Xcode.",
      "",
      "  ✅  To test on iOS from here, use a REAL iPhone + Expo Go:",
      "      1. Install 'Expo Go' from the App Store.",
      "      2. Put the iPhone on the SAME Wi-Fi as this PC.",
      "      3. Scan the QR code below with the iPhone Camera app.",
      "",
      "  ⚠️   Do NOT press 'i' in the Expo CLI on Windows — it tries to",
      "      install Xcode and will fail. (Press 'a' for an Android",
      "      emulator, or just scan the QR for any device.)",
      "",
      "  Starting the normal dev server now…",
      "──────────────────────────────────────────────────────────────",
      "",
    ].join("\n")
  );
  run(["start"]);
}
