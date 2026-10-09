"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayersIcon,
  QrCodeIcon,
  UsersIcon,
  TruckIcon,
  TagIcon,
  SettingsIcon,
  InfoIcon,
  MailIcon,
  ShieldIcon,
  FileTextIcon,
  ScaleIcon,
  ZapIcon,
} from "./Icons";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Studio", href: "/", icon: LayersIcon },
    { label: "Customer Analysis", href: "/customer-analysis", icon: UsersIcon },
    { label: "Returns Entry", href: "/returns", icon: TruckIcon },
    { label: "QR Scans", href: "/analytics", icon: QrCodeIcon },
    { label: "Templates", href: "/templates", icon: TagIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const LEGAL_ITEMS = [
    { label: "About Us", href: "/about", icon: InfoIcon },
    { label: "Contact Support", href: "/contact", icon: MailIcon },
    { label: "Privacy Policy", href: "/privacy", icon: ShieldIcon },
    { label: "Terms of Service", href: "/terms", icon: FileTextIcon },
    { label: "Legal Disclaimer", href: "/disclaimer", icon: ScaleIcon },
  ];

  return (
    <aside
      className="sidebar-desktop"
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
        zIndex: 500,
        padding: 0,
        borderRadius: "20px",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05)",
      }}
    >
      {/* Brand Header */}
      <Link
        href="/"
        style={{
          padding: "20px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #F1F5F9",
          textDecoration: "none",
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
      </Link>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginBottom: 6 }}>
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: "10px",
                color: isActive ? "#4F46E5" : "#64748B",
                background: isActive ? "#EEF2FF" : "transparent",
                border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.85rem",
                boxShadow: isActive ? "0 2px 8px rgba(79, 70, 229, 0.08)" : "none",
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

        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginTop: 14, marginBottom: 6 }}>
          Company &amp; Legal
        </div>
        {LEGAL_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderRadius: "10px",
                color: isActive ? "#4F46E5" : "#64748B",
                background: isActive ? "#EEF2FF" : "transparent",
                border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.82rem",
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
      <div style={{ padding: "14px 16px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC" }}>
        {session ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="User" style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #E2E8F0" }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #C7D2FE", color: "#4F46E5", fontSize: "0.82rem", fontWeight: 700 }}>
                  {(session.user?.name || "S")[0]}
                </div>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: "0.8rem", color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.name || "Seller"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#64748B", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {session.user?.email || "Seller Account"}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "6px 12px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "8px",
                color: "#DC2626",
                fontSize: "0.75rem",
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
              padding: "9px 12px",
              background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
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
