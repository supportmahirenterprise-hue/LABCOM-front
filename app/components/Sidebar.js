"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Professional SVG Vector Icons
function StudioIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ReturnsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function TemplatesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Studio", href: "/", icon: StudioIcon },
    { label: "Analytics", href: "/analytics", icon: AnalyticsIcon },
    { label: "Customer Analysis", href: "/customer-analysis", icon: CustomersIcon },
    { label: "Returns Entry", href: "/returns", icon: ReturnsIcon },
    { label: "Templates", href: "/templates", icon: TemplatesIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
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
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05)",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "22px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.15rem",
            boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
          }}
        >
          L
        </div>
        <div>
          <h1 className="heading-display" style={{ fontSize: "1.15rem", color: "#0F172A", margin: 0, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.01em" }}>
            LabelPro
          </h1>
          <p style={{ fontSize: "0.62rem", color: "#4F46E5", margin: 0, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
            Print Engine
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        <div style={{ fontSize: "0.64rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 12, marginBottom: 8 }}>
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
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
                color: isActive ? "#4F46E5" : "#64748B",
                background: isActive ? "#F1F5F9" : "transparent",
                border: isActive ? "1px solid #E2E8F0" : "1px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.88rem",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#4F46E5" : "#94A3B8" }}>
                <IconComponent />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Demo Login Section */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC" }}>
        {session ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="User" style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #E2E8F0" }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #C7D2FE", color: "#4F46E5", fontSize: "0.85rem", fontWeight: 700 }}>
                  {(session.user?.name || "S")[0]}
                </div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.82rem", color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
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
                padding: "8px 12px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "8px",
                color: "#DC2626",
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
              background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              transition: "all 0.2s ease",
            }}
          >
            <ZapIcon /> Quick Demo Login
          </button>
        )}
      </div>
    </aside>
  );
}



