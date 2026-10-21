"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const BROADCAST_CHANNEL_NAME = "labelpro_auth_channel";

function clearAllSellerStorage() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.clear();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("cached_") ||
          key.startsWith("user_") ||
          key.includes("@") ||
          key.includes("admin") ||
          key.includes("token"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn("Storage cleanup error:", e);
  }
}

export default function AuthWatcher() {
  const { data: session, status } = useSession();
  const checkingRef = useRef(false);
  const loggedOutRef = useRef(false);

  const performInstantLogout = (reason = "account_blocked") => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;

    clearAllSellerStorage();

    // Broadcast to other open tabs to log out simultaneously
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: "FORCE_LOGOUT", reason });
        bc.close();
      }
    } catch (e) {}

    // Force NextAuth signout with immediate redirect to login with error parameter
    signOut({
      callbackUrl: `/login?error=${encodeURIComponent(reason)}`,
      redirect: true,
    }).catch(() => {
      if (typeof window !== "undefined") {
        window.location.href = `/login?error=${encodeURIComponent(reason)}`;
      }
    });
  };

  // 1. Listen for multi-tab broadcast messages
  useEffect(() => {
    if (typeof window === "undefined" || !window.BroadcastChannel) return;
    const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === "FORCE_LOGOUT") {
        performInstantLogout(event.data.reason || "account_blocked");
      }
    };
    return () => bc.close();
  }, []);

  // 2. Check NextAuth session error directly
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.isBlocked || session.error === "ACCOUNT_SUSPENDED") {
        performInstantLogout("account_blocked");
      }
    }
  }, [session, status]);

  // 3. Heartbeat & Window Focus Watcher
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    let timer = null;
    let isCancelled = false;

    const checkStatus = async () => {
      if (checkingRef.current || isCancelled || loggedOutRef.current) return;
      checkingRef.current = true;

      try {
        const res = await fetch("/api/auth/session-check", {
          cache: "no-store",
          headers: {
            "x-user-email": session.user.email,
          },
        });

        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          if (data.blocked || data.error === "ACCOUNT_SUSPENDED") {
            performInstantLogout("account_blocked");
            return;
          }
        } else if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.blocked) {
            performInstantLogout("account_blocked");
            return;
          }
        }
      } catch (e) {
        // Suppress temporary network flickers
      } finally {
        checkingRef.current = false;
      }
    };

    // Check immediately on mount/auth
    checkStatus();

    // High-efficiency interval (runs in < 1ms on server, 0 DB queries)
    timer = setInterval(checkStatus, 3500);

    // Immediate check on tab focus or visibility return
    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        checkStatus();
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [status, session?.user?.email]);

  return null;
}
