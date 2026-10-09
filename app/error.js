"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from "./components/Icons";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console or monitoring service
    console.error("Client-side exception caught by Error Boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        className="premium-glass"
        style={{
          maxWidth: 520,
          width: "100%",
          padding: "36px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertTriangleIcon size={28} color="#EF4444" />
        </div>

        <h2 className="heading-display" style={{ fontSize: "1.4rem", color: "var(--text-pure)", margin: 0 }}>
          Something went wrong!
        </h2>

        <p style={{ fontSize: "0.88rem", color: "var(--text-silver)", margin: 0, lineHeight: 1.5 }}>
          An unexpected error occurred while rendering this page. Don't worry, your data is safe.
        </p>

        {error?.message && (
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.78rem",
              color: "#f87171",
              fontFamily: "var(--font-mono)",
              textAlign: "left",
              overflowX: "auto",
              maxHeight: 100,
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 10, width: "100%", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn-primary"
            style={{ fontSize: "0.88rem", padding: "10px 22px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCwIcon size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary"
            style={{ textDecoration: "none", fontSize: "0.88rem", padding: "10px 22px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <HomeIcon size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
