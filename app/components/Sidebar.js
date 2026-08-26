"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Print Studio", href: "/", icon: "🖨️" },
    { label: "Batch History", href: "#", icon: "🕒" },
    { label: "Templates", href: "#", icon: "📄" },
    { label: "Settings", href: "#", icon: "⚙️" },
  ];

  return (
    <aside
      style={{
        width: 260,
        height: "100vh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            background: "var(--primary-accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.2rem",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          L
        </div>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.01em", margin: 0 }}>
            LabelPro.in
          </h1>
          <p style={{ fontSize: "0.7rem", color: "var(--primary-accent)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Industrial Engine
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "24px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 12, marginBottom: 8 }}>
          Workspace
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
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                background: isActive ? "var(--bg-card-hover)" : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.9rem",
                transition: "all 0.15s ease",
                borderLeft: isActive ? "3px solid var(--primary-accent)" : "3px solid transparent",
                position: "relative",
              }}
            >
              {isActive && (
                <div style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 3, background: "var(--primary-accent)", boxShadow: "var(--shadow-glow)" }} />
              )}
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Area */}
      {session && (
        <div style={{ padding: "16px", borderTop: "1px solid var(--border-subtle)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {session.user?.image ? (
              <img src={session.user.image} alt="User" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-card-solid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                👤
              </div>
            )}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {session.user?.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
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
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-rose)";
              e.currentTarget.style.color = "var(--accent-rose)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
