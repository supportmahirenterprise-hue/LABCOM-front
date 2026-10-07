"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global client-side exception caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0b0f19", color: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "32px 24px",
              background: "rgba(15, 23, 42, 0.8)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", margin: "0 0 12px 0", color: "#ffffff" }}>
              Application Exception
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "20px" }}>
              A critical error occurred in the application shell. Please refresh the page to continue.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                color: "#000",
                fontWeight: 700,
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
