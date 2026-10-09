"use client";

import Link from "next/link";
import { HomeIcon } from "./components/Icons";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div className="premium-glass" style={{ maxWidth: 460, width: "100%", padding: "36px 24px" }}>
        <h1 className="heading-display" style={{ fontSize: "3rem", color: "var(--aurora-1)", margin: "0 0 8px 0" }}>
          404
        </h1>
        <h3 style={{ fontSize: "1.2rem", color: "var(--text-pure)", margin: "0 0 12px 0" }}>
          Page Not Found
        </h3>
        <p style={{ fontSize: "0.88rem", color: "var(--text-silver)", marginBottom: 24 }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <HomeIcon size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
