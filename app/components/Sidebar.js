"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayersIcon,
  CopyIcon,
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
import { isSuperAdmin } from "../../lib/admin";
import AdSlot from "./AdSlot";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdminUser = isSuperAdmin(session?.user?.email);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/login") return null;

  const NAV_ITEMS = [
    { label: "Studio", href: "/", icon: LayersIcon },
    { label: "Remove Duplicate", href: "/remove-duplicate", icon: CopyIcon },
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
    <>
      {/* Mobile Top Header (Displayed only on <= 900px, hidden on desktop) */}
      <header
        className="mobile-header-bar"
        style={{
          width: "100%",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "10px 14px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          position: "sticky",
          top: 10,
          zIndex: 400,
        }}
      >
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.05rem",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
            }}
          >
            L
          </div>
          <div>
            <span style={{ fontSize: "1.05rem", color: "#0F172A", fontWeight: 700, lineHeight: 1.1, display: "block" }}>
              LabelPro
            </span>
            <span style={{ fontSize: "0.6rem", color: "#4F46E5", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>
              Studio
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!session && (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
              style={{
                padding: "6px 12px",
                background: "#EEF2FF",
                color: "#4338CA",
                border: "1px solid #C7D2FE",
                borderRadius: "9999px",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "#F8FAFC",
              border: "1px solid #CBD5E1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#0F172A",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "82%",
              maxWidth: 320,
              height: "100%",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.95rem" }}>
                  L
                </div>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "#F1F5F9",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Drawer Nav Items */}
            <div style={{ flex: 1, padding: "14px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginBottom: 6 }}>
                Operations
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: "10px",
                      color: isActive ? "#4338CA" : "#334155",
                      background: isActive ? "#EEF2FF" : "transparent",
                      border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                      textDecoration: "none",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#4338CA" : "#475569" }}>
                      <IconComponent />
                    </span>
                    {item.label}
                  </Link>
                );
              })}

              {isSuperAdminUser && (
                <>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginTop: 14, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <ShieldIcon /> SuperAdmin
                  </div>
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: "10px",
                      color: pathname === "/admin" ? "#4338CA" : "#4F46E5",
                      background: pathname === "/admin" ? "#EEF2FF" : "rgba(99, 102, 241, 0.08)",
                      border: pathname === "/admin" ? "1px solid #C7D2FE" : "1px solid rgba(99, 102, 241, 0.2)",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", color: "#4F46E5" }}>
                        <ShieldIcon />
                      </span>
                      <span>Admin Dashboard</span>
                    </div>
                    <span style={{ fontSize: "0.62rem", background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)", color: "#FFFFFF", padding: "1px 6px", borderRadius: "999px", fontWeight: 700, letterSpacing: "0.05em" }}>
                      ROOT
                    </span>
                  </Link>
                </>
              )}

              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginTop: 14, marginBottom: 6 }}>
                Company &amp; Legal
              </div>
              {LEGAL_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: "10px",
                      color: isActive ? "#4338CA" : "#475569",
                      background: isActive ? "#EEF2FF" : "transparent",
                      border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                      textDecoration: "none",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#4338CA" : "#64748B" }}>
                      <IconComponent />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Drawer User Footer */}
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
                    type="button"
                    onClick={async () => {
                      setMobileOpen(false);
                      try {
                        if (typeof window !== "undefined") {
                          sessionStorage.clear();
                          Object.keys(localStorage).forEach((key) => {
                            if (key.startsWith("cached_") || key.startsWith("user_") || (session?.user?.email && key.includes(session.user.email))) {
                              localStorage.removeItem(key);
                            }
                          });
                        }
                      } catch (e) {}
                      await signOut({ callbackUrl: "/login" });
                    }}
                    style={{
                      width: "100%",
                      marginTop: 10,
                      padding: "8px 12px",
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      borderRadius: "8px",
                      color: "#DC2626",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                    textDecoration: "none",
                  }}
                >
                  Sign In to Studio
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (100% UNTOUCHED for Desktop users) */}
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
            <span className="heading-display logo-brand-text" style={{ fontSize: "1.15rem", color: "#0F172A", margin: 0, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-0.01em", display: "block" }}>
              LabelPro
            </span>
            <p style={{ fontSize: "0.62rem", color: "#4F46E5", margin: 0, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
              E-Commerce Studio
            </p>
          </div>
        </Link>

        {/* Navigation Links (Google Sitelinks Hierarchy) */}
        <nav aria-label="Main Sitelinks Navigation" style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginBottom: 6 }}>
            Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                prefetch={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: isActive ? "#4338CA" : "#334155",
                  background: isActive ? "#EEF2FF" : "transparent",
                  border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  boxShadow: isActive ? "0 2px 8px rgba(79, 70, 229, 0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#4338CA" : "#475569" }}>
                  <IconComponent />
                </span>
                {item.label}
              </Link>
            );
          })}

          {isSuperAdminUser && (
            <>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginTop: 14, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <ShieldIcon /> SuperAdmin
              </div>
              <Link
                href="/admin"
                title="SuperAdmin Command Center"
                prefetch={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: pathname === "/admin" ? "#4338CA" : "#4F46E5",
                  background: pathname === "/admin" ? "#EEF2FF" : "rgba(99, 102, 241, 0.08)",
                  border: pathname === "/admin" ? "1px solid #C7D2FE" : "1px solid rgba(99, 102, 241, 0.2)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", color: "#4F46E5" }}>
                    <ShieldIcon />
                  </span>
                  <span>Admin Dashboard</span>
                </div>
                <span style={{ fontSize: "0.62rem", background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)", color: "#FFFFFF", padding: "1px 6px", borderRadius: "999px", fontWeight: 700, letterSpacing: "0.05em" }}>
                  ROOT
                </span>
              </Link>
            </>
          )}

          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", paddingLeft: 10, marginTop: 14, marginBottom: 6 }}>
            Company &amp; Legal
          </div>
          {LEGAL_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                prefetch={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 12px",
                  borderRadius: "10px",
                  color: isActive ? "#4338CA" : "#475569",
                  background: isActive ? "#EEF2FF" : "transparent",
                  border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.82rem",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#4338CA" : "#64748B" }}>
                  <IconComponent />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Optional Policy-Safe Sidebar Ad Unit (Controlled by SuperAdmin) */}
        <div style={{ padding: "0 12px" }}>
          <AdSlot slotKey="sidebarBanner" />
        </div>

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
                type="button"
                onClick={async () => {
                  try {
                    if (typeof window !== "undefined") {
                      sessionStorage.clear();
                      Object.keys(localStorage).forEach((key) => {
                        if (
                          key.startsWith("cached_") ||
                          key.startsWith("user_") ||
                          (session?.user?.email && key.includes(session.user.email))
                        ) {
                          localStorage.removeItem(key);
                        }
                      });
                    }
                  } catch (e) {
                    console.error("Storage clear error on signOut:", e);
                  }
                  await signOut({ callbackUrl: "/login" });
                }}
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
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
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
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
