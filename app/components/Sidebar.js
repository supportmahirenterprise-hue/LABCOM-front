"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Overview", href: "/", icon: "◒" },
    { label: "Analytics", href: "/analytics", icon: "📈" },
    { label: "Templates", href: "/templates", icon: "⚏" },
    { label: "Settings", href: "/settings", icon: "⚙" },
  ];

  return (
    <aside
      className="premium-glass"
      style={{
        width: 260,
        height: "calc(100vh - 48px)", // accounts for 24px padding top and bottom from layout-wrapper
        position: "sticky",
        top: 24,
        alignSelf: "flex-start",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid var(--glass-border)" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.2rem",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <span className="heading-display">L</span>
        </div>
        <div>
          <h1 className="heading-display" style={{ fontSize: "1.25rem", color: "var(--text-pure)", margin: 0 }}>
            LabelPro
          </h1>
          <p style={{ fontSize: "0.7rem", color: "var(--aurora-1)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Print Engine
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 12, marginBottom: 10 }}>
          Main Menu
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
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--text-pure)" : "var(--text-silver)",
                background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 500 : 400,
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 3, background: "var(--aurora-1)", boxShadow: "var(--shadow-glow)" }} />
              )}
              <span style={{ fontSize: "1.1rem", opacity: isActive ? 1 : 0.7, color: isActive ? "var(--aurora-1)" : "inherit" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Area */}
      {session && (
        <div style={{ padding: "20px", borderTop: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {session.user?.image ? (
              <img src={session.user.image} alt="User" style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.1)" }}>
                👤
              </div>
            )}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-pure)", fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {session.user?.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {session.user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-silver)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              e.currentTarget.style.color = "var(--accent-rose)";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border)";
              e.currentTarget.style.color = "var(--text-silver)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
