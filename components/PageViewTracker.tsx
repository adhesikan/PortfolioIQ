"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = document.cookie
    .split("; ")
    .find((c) => c.startsWith("piq_did="))
    ?.split("=")[1];
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    document.cookie = `piq_did=${id};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
  }
  return id;
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef("");

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const deviceId = getDeviceId();
    const referrer = document.referrer || undefined;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer, deviceId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
