"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { isSuperAdmin } from "../../lib/admin";
import Modal from "../components/Modal";
import {
  ShieldIcon,
  UsersIcon,
  TruckIcon,
  LayersIcon,
  QrCodeIcon,
  SettingsIcon,
} from "../components/Icons";

function RefreshCwIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "BLOCKED"

  // Settings Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [settingsForm, setSettingsForm] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("store"); // "store" | "qr" | "whatsapp" | "crop"

  // Block action loading state
  const [blockingEmail, setBlockingEmail] = useState("");

  const userEmail = session?.user?.email || "";
  const isAdmin = isSuperAdmin(userEmail);

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Stats & Users
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError("");

    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", {
          headers: { "x-user-email": userEmail },
          cache: "no-store",
        }),
        fetch("/api/admin/users", {
          headers: { "x-user-email": userEmail },
          cache: "no-store",
        }),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        if (statsRes.status === 403 || usersRes.status === 403) {
          setError("Access Denied: You do not have SuperAdmin authorization.");
          setLoading(false);
          setRefreshing(false);
          return;
        }
        throw new Error("Failed to load SuperAdmin telemetry data.");
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (usersData.success) {
        setUsers(usersData.users);
      }
      if (isManualRefresh) {
        showToast("Live data refreshed successfully!");
      }
    } catch (err) {
      console.error("SuperAdmin fetchData error:", err);
      setError(err.message || "Failed to fetch SuperAdmin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      fetchData();
    } else if (status === "authenticated" && !isAdmin) {
      setLoading(false);
    }
  }, [status, isAdmin]);

  // Open Edit Modal for a user
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setSettingsForm({
      storeName: user.settings?.storeName || "",
      phone: user.settings?.phone || "",
      supportEmail: user.settings?.supportEmail || "",
      storeUrl: user.settings?.storeUrl || "",
      instagramHandle: user.settings?.instagramHandle || "",
      customNote: user.settings?.customNote || "",
      enableQr: user.settings?.enableQr ?? true,
      useNativeScript: user.settings?.useNativeScript ?? false,
      stampStyle: user.settings?.stampStyle || "badge",
      qrText: user.settings?.qrText || "",
      detailText: user.settings?.detailText || "",
      qrX: user.settings?.qrX ?? 14,
      qrY: user.settings?.qrY ?? 14,
      qrSize: user.settings?.qrSize ?? 70,
      fontSize: user.settings?.fontSize ?? 8,
      sortBy: user.settings?.sortBy || "sku",
      sortOrder: user.settings?.sortOrder || "asc",
      downloadSummary: user.settings?.downloadSummary ?? false,
      enableWhatsApp: user.settings?.enableWhatsApp ?? false,
      sendWhatsApp: user.settings?.sendWhatsApp ?? false,
      waApiKey: user.settings?.waApiKey || "",
      waReceiverNumber: user.settings?.waReceiverNumber || "",
      pdfReceiverNumber: user.settings?.pdfReceiverNumber || "",
      imageReceiverNumber: user.settings?.imageReceiverNumber || "",
      cropEnabled: user.settings?.cropEnabled ?? false,
      cropPreset: user.settings?.cropPreset || "label_only",
      cropMode: user.settings?.cropMode || "custom",
      cropTop: user.settings?.cropTop ?? 0,
      cropBottom: user.settings?.cropBottom ?? 58,
      cropLeft: user.settings?.cropLeft ?? 0,
      cropRight: user.settings?.cropRight ?? 0,
    });
    setActiveSettingsTab("store");
  };

  // Save User Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingSettings(true);

    try {
      const res = await fetch("/api/admin/users/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: editingUser.email,
          settings: settingsForm,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update user settings");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.email === editingUser.email) {
            return {
              ...u,
              storeName: settingsForm.storeName || u.storeName,
              settings: {
                ...u.settings,
                ...data.settings,
              },
            };
          }
          return u;
        })
      );

      showToast(`Settings updated successfully for ${editingUser.email}`);
      setEditingUser(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Toggle Block User
  const handleToggleBlock = async (user) => {
    const isTargetBlocked = Boolean(user.isBlocked);
    const actionName = isTargetBlocked ? "UNBLOCK" : "BLOCK";

    if (
      !window.confirm(
        `Are you sure you want to ${actionName} seller account: "${user.email}"?`
      )
    ) {
      return;
    }

    setBlockingEmail(user.email);
    try {
      const res = await fetch("/api/admin/users/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: user.email,
          isBlocked: !isTargetBlocked,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${actionName} user.`);
      }

      // Update in local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.email === user.email) {
            return { ...u, isBlocked: !isTargetBlocked };
          }
          return u;
        })
      );

      // Also update stats counts
      setStats((prev) => {
        if (!prev) return prev;
        const delta = !isTargetBlocked ? 1 : -1;
        return {
          ...prev,
          blockedUsers: prev.blockedUsers + delta,
          activeUsers: prev.activeUsers - delta,
        };
      });

      showToast(data.message || `User status updated.`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBlockingEmail("");
    }
  };

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (statusFilter === "ACTIVE" && u.isBlocked) return false;
      if (statusFilter === "BLOCKED" && !u.isBlocked) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchName = (u.name || "").toLowerCase().includes(q);
        const matchStore = (u.storeName || "").toLowerCase().includes(q);
        return matchEmail || matchName || matchStore;
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  // Loading State
  if (status === "loading" || (loading && isAdmin)) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, border: "4px solid #EEF2FF", borderTop: "4px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#475569", fontWeight: 600, fontSize: "0.95rem" }}>
          Authenticating SuperAdmin Telemetry...
        </p>
      </div>
    );
  }

  // Unauthorized Access Guard
  if (!isAdmin) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="premium-glass" style={{ maxWidth: 520, width: "100%", background: "#FFFFFF", border: "1px solid #FCA5A5", borderRadius: "24px", padding: "40px 32px", textAlign: "center", boxShadow: "0 20px 40px rgba(239, 68, 68, 0.08)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "20px", background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertTriangleIcon />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#991B1B", marginBottom: 10 }}>
            Access Denied: SuperAdmin Privileges Required
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#4B5563", lineHeight: 1.6, marginBottom: 24 }}>
            This root portal is strictly reserved for the primary platform SuperAdmin (<strong>vishal.nexios@gmail.com</strong>).
            Your current logged in account does not hold root administrative clearance.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Link
              href="/"
              style={{
                padding: "10px 20px",
                background: "#4F46E5",
                color: "#FFFFFF",
                borderRadius: "12px",
                fontSize: "0.88rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Return to Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 80px" }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            padding: "12px 20px",
            borderRadius: "14px",
            background: toast.type === "error" ? "#DC2626" : "#0F172A",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.88rem",
            fontWeight: 600,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {toast.type === "error" ? <AlertTriangleIcon /> : <CheckCircleIcon />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SuperAdmin Header Banner */}
      <div
        className="premium-glass"
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
          borderRadius: "24px",
          padding: "32px 28px",
          color: "#FFFFFF",
          marginBottom: 28,
          boxShadow: "0 15px 35px -5px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(99, 102, 241, 0.3)",
                border: "1px solid rgba(165, 180, 252, 0.4)",
                color: "#C7D2FE",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <ShieldIcon /> Root SuperAdmin Command Center
            </span>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
              Active Admin: <strong>{userEmail}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            Platform Sellers &amp; Operations Dashboard
          </h1>
          <p style={{ margin: "6px 0 0", color: "#94A3B8", fontSize: "0.9rem", maxWidth: 650 }}>
            Inspect all registered users, customer databases, reverse logistics returns, and manage seller configuration parameters in real-time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>
              <RefreshCwIcon />
            </span>
            <span>{refreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {/* Total Users */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Users
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UsersIcon />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {stats ? stats.totalUsers : "--"}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, fontSize: "0.72rem" }}>
            <span style={{ color: "#16A34A", fontWeight: 700, background: "#F0FDF4", padding: "2px 6px", borderRadius: "6px" }}>
              {stats ? stats.activeUsers : 0} Active
            </span>
            {stats && stats.blockedUsers > 0 && (
              <span style={{ color: "#DC2626", fontWeight: 700, background: "#FEF2F2", padding: "2px 6px", borderRadius: "6px" }}>
                {stats.blockedUsers} Blocked
              </span>
            )}
          </div>
        </div>

        {/* Total Customers */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Customers
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UsersIcon />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {stats ? stats.totalCustomers.toLocaleString("en-IN") : "--"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748B" }}>
            India-wide verified buyer addresses
          </p>
        </div>

        {/* Total Returns */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Returns
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TruckIcon />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {stats ? stats.totalReturns.toLocaleString("en-IN") : "--"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748B" }}>
            RTO &amp; Customer return alerts
          </p>
        </div>

        {/* Total Orders */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Orders
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#F0F9FF", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayersIcon />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {stats ? stats.totalOrders.toLocaleString("en-IN") : "--"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748B" }}>
            Processed shipping label history
          </p>
        </div>

        {/* QR Scans */}
        <div
          className="premium-glass"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              QR Scans
            </span>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#FAF5FF", color: "#9333EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCodeIcon />
            </div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {stats ? stats.totalScans.toLocaleString("en-IN") : "--"}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "0.72rem", color: "#64748B" }}>
            Customer review &amp; WhatsApp scans
          </p>
        </div>
      </div>

      {/* Users Directory & Controls Section */}
      <div
        className="premium-glass"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* Controls Toolbar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
            paddingBottom: 18,
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A", margin: 0 }}>
              Registered Sellers Directory ({filteredUsers.length})
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748B" }}>
              Manage seller profile configs, crop dimensions, WhatsApp integrations, and account status.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            {/* Status Filter Tabs */}
            <div style={{ display: "flex", background: "#F1F5F9", borderRadius: "12px", padding: 3 }}>
              {["ALL", "ACTIVE", "BLOCKED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9px",
                    border: "none",
                    background: statusFilter === st ? "#FFFFFF" : "transparent",
                    color: statusFilter === st ? "#0F172A" : "#64748B",
                    fontWeight: statusFilter === st ? 700 : 500,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    boxShadow: statusFilter === st ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {st === "ALL" ? "All Users" : st === "ACTIVE" ? "Active" : "Blocked"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search by name, email, store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  fontSize: "0.85rem",
                  border: "1px solid #CBD5E1",
                  borderRadius: "12px",
                  outline: "none",
                  background: "#F8FAFC",
                  color: "#0F172A",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: "#94A3B8", cursor: "pointer" }}
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Seller / User</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Store Name</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Settings Overview</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Telemetry Stats</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "36px 14px", textAlign: "center", color: "#64748B" }}>
                    No seller accounts match your search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBlocked = Boolean(user.isBlocked);
                  const isPrimaryAdmin = user.isSuperAdmin;
                  const isBlockingThis = blockingEmail === user.email;

                  return (
                    <tr
                      key={user.email}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Seller / User info */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #E2E8F0" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: isPrimaryAdmin ? "#EEF2FF" : "#F1F5F9",
                                color: isPrimaryAdmin ? "#4F46E5" : "#475569",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                border: isPrimaryAdmin ? "1.5px solid #C7D2FE" : "1px solid #CBD5E1",
                              }}
                            >
                              {(user.name || user.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                              <span>{user.name || user.email.split("@")[0]}</span>
                              {isPrimaryAdmin && (
                                <span
                                  style={{
                                    fontSize: "0.62rem",
                                    padding: "2px 6px",
                                    borderRadius: "999px",
                                    background: "#4F46E5",
                                    color: "#FFFFFF",
                                    fontWeight: 800,
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  SUPERADMIN
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Store Name */}
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            color: "#0F172A",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          {user.storeName || "Not set"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px" }}>
                        {isBlocked ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: "999px",
                              background: "#FEF2F2",
                              color: "#DC2626",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              border: "1px solid #FECACA",
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DC2626" }} />
                            BLOCKED
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: "999px",
                              background: "#F0FDF4",
                              color: "#16A34A",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              border: "1px solid #BBF7D0",
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Settings Overview Badges */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span
                            title="QR Code Branding"
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: user.settings?.enableQr ? "#EEF2FF" : "#F1F5F9",
                              color: user.settings?.enableQr ? "#4338CA" : "#94A3B8",
                              fontWeight: 600,
                            }}
                          >
                            QR: {user.settings?.enableQr ? "ON" : "OFF"}
                          </span>
                          <span
                            title="WhatsApp Automation"
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: user.settings?.enableWhatsApp ? "#F0FDF4" : "#F1F5F9",
                              color: user.settings?.enableWhatsApp ? "#15803D" : "#94A3B8",
                              fontWeight: 600,
                            }}
                          >
                            WA: {user.settings?.enableWhatsApp ? "ON" : "OFF"}
                          </span>
                          <span
                            title="Sort Preference"
                            style={{
                              fontSize: "0.7rem",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#F8FAFC",
                              color: "#475569",
                              border: "1px solid #E2E8F0",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            Sort: {user.settings?.sortBy || "SKU"}
                          </span>
                        </div>
                      </td>

                      {/* Telemetry Stats */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontSize: "0.78rem", color: "#334155", display: "flex", gap: 12 }}>
                          <span title="Orders processed">📦 {user.stats?.ordersCount || 0}</span>
                          <span title="Returns recorded">🔄 {user.stats?.returnsCount || 0}</span>
                          <span title="Customers tracked">👥 {user.stats?.customersCount || 0}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          {/* Edit Settings Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: "#EEF2FF",
                              color: "#4338CA",
                              border: "1px solid #C7D2FE",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <SettingsIcon />
                            <span>Edit Settings</span>
                          </button>

                          {/* Block / Unblock Button (Disabled for primary admin) */}
                          {!isPrimaryAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(user)}
                              disabled={isBlockingThis}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: isBlocked ? "#F0FDF4" : "#FEF2F2",
                                color: isBlocked ? "#16A34A" : "#DC2626",
                                border: isBlocked ? "1px solid #BBF7D0" : "1px solid #FECACA",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: isBlockingThis ? "not-allowed" : "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {isBlockingThis
                                ? "Updating..."
                                : isBlocked
                                ? "Unblock User"
                                : "Block User"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SETTINGS EDIT MODAL (FOR SELECTED SELLER)                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Edit Seller Settings: ${editingUser?.email || ""}`}
        maxWidth={640}
      >
        {editingUser && (
          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: 6, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 }}>
              {[
                { id: "store", label: "Store Profile" },
                { id: "qr", label: "QR & Stamp" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "crop", label: "Cropping" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveSettingsTab(t.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeSettingsTab === t.id ? "#EEF2FF" : "transparent",
                    color: activeSettingsTab === t.id ? "#4338CA" : "#64748B",
                    fontWeight: activeSettingsTab === t.id ? 700 : 500,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Store Profile */}
            {activeSettingsTab === "store" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    placeholder="e.g. Mahir Enterprise"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Support Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      placeholder="e.g. support@store.com"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Store Website URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.storeUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeUrl: e.target.value })}
                      placeholder="https://..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramHandle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })}
                      placeholder="@store_handle"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Custom Customer Note / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.customNote}
                    onChange={(e) => setSettingsForm({ ...settingsForm, customNote: e.target.value })}
                    placeholder="e.g. Thank you for your support!"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: QR & Stamp Settings */}
            {activeSettingsTab === "qr" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="enableQrCheckbox"
                    checked={settingsForm.enableQr}
                    onChange={(e) => setSettingsForm({ ...settingsForm, enableQr: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="enableQrCheckbox" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", cursor: "pointer" }}>
                    Enable QR Code Stamping on Shipping Labels
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    QR Code Link URL
                  </label>
                  <input
                    type="text"
                    value={settingsForm.qrText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, qrText: e.target.value })}
                    placeholder="https://..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Stamp Note / Detail Text
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.detailText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, detailText: e.target.value })}
                    placeholder="Thank You for Shopping with Us!"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Stamp Style
                    </label>
                    <select
                      value={settingsForm.stampStyle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stampStyle: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    >
                      <option value="badge">Badge Style</option>
                      <option value="banner">Banner Style</option>
                      <option value="minimal">Minimal Stamp</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      QR Size (pt)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.qrSize}
                      onChange={(e) => setSettingsForm({ ...settingsForm, qrSize: parseInt(e.target.value, 10) || 70 })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WhatsApp Automation */}
            {activeSettingsTab === "whatsapp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="enableWaCheckbox"
                    checked={settingsForm.enableWhatsApp}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableWhatsApp: e.target.checked,
                        sendWhatsApp: e.target.checked,
                      })
                    }
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="enableWaCheckbox" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", cursor: "pointer" }}>
                    Enable WhatsApp Dispatch Summary Alerts
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    WhatsApp API Key
                  </label>
                  <input
                    type="text"
                    value={settingsForm.waApiKey}
                    onChange={(e) => setSettingsForm({ ...settingsForm, waApiKey: e.target.value })}
                    placeholder="wa_..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                    Receiver WhatsApp Number (e.g. 918140148878)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.waReceiverNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, waReceiverNumber: e.target.value })}
                    placeholder="918140148878"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Cropping Margins */}
            {activeSettingsTab === "crop" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="enableCropCheckbox"
                    checked={settingsForm.cropEnabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cropEnabled: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label htmlFor="enableCropCheckbox" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", cursor: "pointer" }}>
                    Enable Automatic PDF Label Cropping
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Crop Preset
                    </label>
                    <select
                      value={settingsForm.cropPreset}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cropPreset: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    >
                      <option value="label_only">Label Only (4x6 thermal)</option>
                      <option value="crop_top">Crop Top Half</option>
                      <option value="crop_bottom">Crop Bottom (58% A4)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>
                      Bottom Crop (%)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.cropBottom}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cropBottom: parseInt(e.target.value, 10) || 0 })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#F1F5F9",
                  border: "none",
                  color: "#475569",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  background: "#4F46E5",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: savingSettings ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                }}
              >
                {savingSettings ? "Saving Settings..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
