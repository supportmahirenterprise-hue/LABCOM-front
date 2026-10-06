"use client";

import { useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Studio", href: "/", icon: "◒" },
    { label: "Analytics", href: "/analytics", icon: "📈" },
    { label: "Customer Analysis", href: "/customer-analysis", icon: "👥" },
    { label: "Returns Entry", href: "/returns", icon: "📦" },
    { label: "Templates", href: "/templates", icon: "⚏" },
    { label: "Settings", href: "/settings", icon: "⚙" },
  ];

  return (
    <aside
      className="premium-glass sidebar-desktop"
      style={{
        width: 250,
        height: "calc(100vh - 48px)",
        position: "sticky",
        top: 24,
        alignSelf: "flex-start",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 50,
        padding: 0,
        borderRadius: "20px",
        background: "rgba(13, 16, 23, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "22px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.1rem",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
          }}
        >
          L
        </div>
        <div>
          <h1 className="heading-display" style={{ fontSize: "1.15rem", color: "#F8FAFC", margin: 0, lineHeight: 1.2, fontWeight: 700 }}>
            LabelPro
          </h1>
          <p style={{ fontSize: "0.62rem", color: "#06B6D4", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Print Engine
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 12, marginBottom: 8 }}>
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: "12px",
                color: isActive ? "#FFFFFF" : "#94A3B8",
                background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.88rem",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "1rem", color: isActive ? "#06B6D4" : "inherit" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Demo Login Section */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.07)", background: "rgba(0, 0, 0, 0.2)" }}>
        {session ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="User" style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)" }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                  👤
                </div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.82rem", color: "#F8FAFC", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.name || "Seller"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748B", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.email || "Seller Account"}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "8px",
                color: "#FCA5A5",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("credentials", { callbackUrl: "/", email: "seller@labelpro.in" })}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.25))",
              border: "1px solid rgba(99, 102, 241, 0.45)",
              borderRadius: "10px",
              color: "#F8FAFC",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}
          >
            ⚡ Quick Demo Login
          </button>
        )}
      </div>
    </aside>
  );
}


