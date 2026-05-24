"use client";

import { useEffect } from "react";

function shouldRegisterServiceWorker(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === "true";
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!shouldRegisterServiceWorker()) return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    async function registerServiceWorker() {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Service worker registration is non-critical; the app remains online-first.
      }
    }

    if (document.readyState === "complete") {
      void registerServiceWorker();
      return;
    }

    const handleLoad = () => {
      if (!cancelled) {
        void registerServiceWorker();
      }
    };

    window.addEventListener("load", handleLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return null;
}
