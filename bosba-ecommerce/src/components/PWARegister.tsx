"use client";

import { useEffect } from "react";

// Registers the service worker. Disabled in development so it never interferes
// with Next.js HMR / fast refresh; production builds get the full PWA.
export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // When a new SW takes over, refresh once so the user gets new assets.
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                // A previous SW was controlling the page → new version available.
                installing.postMessage?.("SKIP_WAITING");
              }
            });
          });
        })
        .catch(() => {
          // Registration failures must never surface to users.
        });
    };

    // Remember whether a SW already controlled this page. On the very first
    // install clients.claim() fires controllerchange too — we must NOT reload
    // then, only when an UPDATED worker takes over an already-controlled page.
    const hadController = !!navigator.serviceWorker.controller;

    // Wait for load so SW registration doesn't compete with first paint.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
