"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb && cb.startsWith("/")) {
        setCallbackUrl(cb);
      }
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", color: "#0F172A" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        padding: 24,
      }}
    >
      <div className="premium-glass" style={{ maxWidth: 420, width: "100%", textAlign: "center", padding: "44px 32px", borderRadius: "24px", background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 10px 35px -5px rgba(15, 23, 42, 0.08)" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.6rem",
            margin: "0 auto 16px",
            boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3)",
          }}
        >
          L
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
          Welcome to LabelPro.in
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: 28 }}>
          Log in to access your intelligent shipping label engine.
        </p>


        {/* Google Login */}
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "11px 16px",
            fontSize: "0.88rem",
            fontWeight: 600,
            background: "#FFFFFF",
            color: "#0F172A",
            border: "1px solid #CBD5E1",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={() => signIn("google", { callbackUrl })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "#94A3B8" }}>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ padding: "0 10px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        {/* Instant Demo Login Button */}
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 16px",
            fontSize: "0.88rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            transition: "all 0.2s ease",
          }}
          onClick={() => signIn("credentials", { callbackUrl, email: "seller@labelpro.in" })}
        >
          ⚡ Quick Demo Login
        </button>

        <p style={{ marginTop: 22, fontSize: "0.72rem", color: "#94A3B8", lineHeight: 1.5 }}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={{ color: "#4F46E5", textDecoration: "underline" }}>Terms</a> and{" "}
          <a href="/privacy" style={{ color: "#4F46E5", textDecoration: "underline" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}


