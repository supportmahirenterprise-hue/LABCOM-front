"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheckIcon } from "./Icons";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        // Small delay to ensure smooth page load
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch (e) {
      // localStorage may fail in private mode
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cookie_consent", "accepted");
    } catch (e) {}
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("cookie_consent", "declined");
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie Consent Banner"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 720,
        margin: "0 auto",
        zIndex: 9999,
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid #CBD5E1",
        borderRadius: "16px",
        padding: "16px 20px",
        boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 1px 1px rgba(15, 23, 42, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animation: "fadeInUp 0.3s ease-out forwards",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "#EEF2FF",
            color: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <ShieldCheckIcon size={20} color="#4F46E5" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>
            We Value Your Privacy &amp; Data Rights
          </div>
          <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, lineHeight: 1.55 }}>
            We use essential cookies to keep LabelPro secure and third-party advertising cookies (including Google AdSense) to serve relevant advertisements. Read our{" "}
            <Link href="/privacy" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "underline" }}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" style={{ color: "#4F46E5", fontWeight: 600, textDecoration: "underline" }}>
              Terms
            </Link>{" "}
            for complete cookie and opt-out information.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          flexWrap: "wrap",
          paddingTop: 4,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <button
          type="button"
          onClick={handleDecline}
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            border: "1px solid #CBD5E1",
            background: "#F8FAFC",
            color: "#475569",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Necessary Only
        </button>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            padding: "7px 18px",
            borderRadius: "8px",
            border: "1px solid #4338CA",
            background: "#4F46E5",
            color: "#FFFFFF",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            transition: "all 0.15s ease",
          }}
        >
          Accept All Cookies
        </button>
      </div>
    </aside>
  );
}
