"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Studio", href: "/", icon: "◒", shortLabel: "Studio" },
    { label: "Analytics", href: "/analytics", icon: "📈", shortLabel: "Stats" },
    { label: "Templates", href: "/templates", icon: "⚏", shortLabel: "Templates" },
    { label: "Settings", href: "/settings", icon: "⚙", shortLabel: "Settings" },
  ];

  return (
    <>
      {/* 1. Desktop Sticky Glass Sidebar (>= 1025px) */}
      <aside
        className="premium-glass sidebar-desktop"
        style={{
          width: 260,
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
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--glass-border)" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.15rem",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <span className="heading-display">L</span>
          </div>
          <div>
            <h1 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: 0, lineHeight: 1.2 }}>
              LabelPro
            </h1>
            <p style={{ fontSize: "0.65rem", color: "var(--aurora-1)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Print Engine
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 12, marginBottom: 8 }}>
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
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  color: isActive ? "var(--text-pure)" : "var(--text-silver)",
                  background: isActive ? "rgba(255, 255, 255, 0.06)" : "transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.88rem",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {isActive && (
                  <div style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 3, background: "var(--aurora-1)", boxShadow: "var(--shadow-glow)" }} />
                )}
                <span style={{ fontSize: "1rem", opacity: isActive ? 1 : 0.7, color: isActive ? "var(--aurora-1)" : "inherit" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Area */}
        {session && (
          <div style={{ padding: "16px 18px", borderTop: "1px solid var(--glass-border)", background: "rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="User" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.1)" }}>
                  👤
                </div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--text-pure)", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.name || "Seller"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-silver)",
                fontSize: "0.78rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* 2. Mobile Top Navigation Bar (< 1025px) */}
      <header
        className="mobile-topbar premium-glass"
        style={{
          width: "100%",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 90,
          marginBottom: 8,
          borderRadius: "14px",
          position: "sticky",
          top: 8,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-2) 100%)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            L
          </div>
          <div>
            <span className="heading-display" style={{ fontSize: "1.05rem", color: "#ffffff", fontWeight: 700, lineHeight: 1.1 }}>
              LabelPro
            </span>
            <span style={{ display: "block", fontSize: "0.6rem", color: "var(--aurora-1)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Engine
            </span>
          </div>
        </Link>

        {session && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-full)",
                padding: "4px 10px 4px 4px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {session.user?.image ? (
                <img src={session.user.image} alt="User" style={{ width: 26, height: 26, borderRadius: "50%" }} />
              ) : (
                <span style={{ fontSize: "0.9rem" }}>👤</span>
              )}
              <span style={{ fontSize: "0.75rem", fontWeight: 600, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user?.name?.split(" ")[0] || "Account"}
              </span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-silver)" }}>▼</span>
            </button>

            {showProfileMenu && (
              <div
                className="premium-glass"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "120%",
                  width: 220,
                  padding: "12px",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                  zIndex: 999,
                  background: "rgba(18, 18, 24, 0.95)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#fff", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user?.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-silver)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user?.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    color: "#fca5a5",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 3. Mobile Bottom Floating Glass Dock (< 1025px) */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          right: 12,
          height: 60,
          background: "rgba(14, 14, 20, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid var(--glass-border-hover)",
          borderRadius: "var(--radius-full)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          zIndex: 9999,
          boxShadow: "0 10px 40px rgba(0,0,0,0.7), 0 0 20px rgba(79, 172, 254, 0.15)",
          padding: "0 8px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                textDecoration: "none",
                color: isActive ? "var(--aurora-1)" : "var(--text-silver)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.68rem",
                padding: "6px 0",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    width: 24,
                    height: 3,
                    borderRadius: "99px",
                    background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))",
                    boxShadow: "var(--shadow-glow)",
                  }}
                />
              )}
              <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>{item.icon}</span>
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
