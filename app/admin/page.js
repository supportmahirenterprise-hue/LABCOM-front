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

function StoreIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2" />
    </svg>
  );
}

function PackageIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function RotateCcwIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function UserXIcon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}

function ArrowUpDownIcon({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

function PhoneIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GlobeIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MessageSquareIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ScissorsIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function EyeIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function CheckIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SparklesIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange, label, description, badge = "", activeColor = "#4F46E5" }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 18px",
        background: checked ? "rgba(99, 102, 241, 0.04)" : "#F8FAFC",
        border: checked ? `1.5px solid ${activeColor}` : "1.5px solid #E2E8F0",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{label}</span>
          <span
            style={{
              fontSize: "0.64rem",
              padding: "2px 7px",
              borderRadius: "999px",
              fontWeight: 800,
              background: checked ? activeColor : "#E2E8F0",
              color: checked ? "#FFFFFF" : "#64748B",
              transition: "all 0.2s ease",
            }}
          >
            {checked ? (badge || "ACTIVE") : "DISABLED"}
          </span>
        </div>
        {description && (
          <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 3 }}>
            {description}
          </div>
        )}
      </div>

      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked ? activeColor : "#CBD5E1",
          position: "relative",
          transition: "background 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#FFFFFF",
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </div>
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
  const [selectedKpi, setSelectedKpi] = useState(null); // null | "users" | "customers" | "returns" | "orders" | "scans"
  const [onlyActiveActivity, setOnlyActiveActivity] = useState(false);
  const [hoveredKpi, setHoveredKpi] = useState(null);

  // Settings Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [settingsForm, setSettingsForm] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("store"); // "store" | "qr" | "whatsapp" | "crop"
  const [showWaKey, setShowWaKey] = useState(false);

  // Block action loading state
  const [blockingEmail, setBlockingEmail] = useState("");

  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      setSessionEmail(session.user.email);
    } else {
      if (typeof window !== "undefined") {
        const p = new URLSearchParams(window.location.search);
        const qEmail = p.get("email");
        if (qEmail && isSuperAdmin(qEmail)) {
          setSessionEmail(qEmail);
        }
      }
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((data) => {
          if (data?.user?.email) {
            setSessionEmail(data.user.email);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const activeEmail = session?.user?.email || sessionEmail;
  const userEmail = activeEmail;
  const isAdmin = isSuperAdmin(activeEmail);

  // Show Toast helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Stats & Users
  const fetchData = async (isManualRefresh = false, emailParam) => {
    if (isManualRefresh) setRefreshing(true);
    setError("");

    try {
      const email = emailParam || activeEmail;
      const [statsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/stats${email ? `?email=${encodeURIComponent(email)}` : ""}`, {
          headers: email ? { "x-user-email": email } : {},
          cache: "no-store",
        }),
        fetch(`/api/admin/users${email ? `?email=${encodeURIComponent(email)}` : ""}`, {
          headers: email ? { "x-user-email": email } : {},
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
    } catch (err) {
      console.error("SuperAdmin fetchData error:", err);
      setError(err.message || "Failed to fetch SuperAdmin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData(false, activeEmail);
    } else if (status === "unauthenticated" && !sessionEmail) {
      setLoading(false);
    }
  }, [status, isAdmin, activeEmail, sessionEmail]);

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

  // KPI Card Configs
  const KPI_CONFIGS = useMemo(() => [
    {
      id: "users",
      label: "Total Users",
      value: stats ? stats.totalUsers : "--",
      badgeText: stats ? `${stats.activeUsers} Active` : "",
      subtext: stats && stats.blockedUsers > 0 ? `${stats.blockedUsers} Blocked` : "Active platform accounts",
      icon: UsersIcon,
      accentColor: "#4F46E5",
      accentBg: "#EEF2FF",
      accentBorder: "#C7D2FE",
      ringColor: "rgba(79, 70, 229, 0.25)",
      filterTitle: "Registered Users Directory",
      featureHref: null,
      featureLabel: null,
      metricKey: null,
      metricName: "Users",
    },
    {
      id: "customers",
      label: "Total Customers",
      value: stats ? stats.totalCustomers.toLocaleString("en-IN") : "--",
      badgeText: "Buyer Directory",
      subtext: "India-wide verified buyer addresses",
      icon: UsersIcon,
      accentColor: "#16A34A",
      accentBg: "#F0FDF4",
      accentBorder: "#BBF7D0",
      ringColor: "rgba(22, 163, 74, 0.25)",
      filterTitle: "Top Sellers Ranked by Buyer Database",
      metricKey: "customersCount",
      metricName: "Customers",
    },
    {
      id: "returns",
      label: "Total Returns",
      value: stats ? stats.totalReturns.toLocaleString("en-IN") : "--",
      badgeText: "RTO & Alerts",
      subtext: "RTO & Customer return alerts",
      icon: TruckIcon,
      accentColor: "#DC2626",
      accentBg: "#FEF2F2",
      accentBorder: "#FECACA",
      ringColor: "rgba(220, 38, 38, 0.25)",
      filterTitle: "Sellers Ranked by Return Volume & RTOs",
      metricKey: "returnsCount",
      metricName: "Returns",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: stats ? stats.totalOrders.toLocaleString("en-IN") : "--",
      badgeText: "Label Studio History",
      subtext: "Processed shipping label history",
      icon: LayersIcon,
      accentColor: "#0284C7",
      accentBg: "#F0F9FF",
      accentBorder: "#BAE6FD",
      ringColor: "rgba(2, 132, 199, 0.25)",
      filterTitle: "Top Sellers Ranked by Processed Orders & Labels",
      metricKey: "ordersCount",
      metricName: "Orders",
    },
    {
      id: "scans",
      label: "QR Scans",
      value: stats ? stats.totalScans.toLocaleString("en-IN") : "--",
      badgeText: "Dynamic QR Scans",
      subtext: "Customer review & WhatsApp scans",
      icon: QrCodeIcon,
      accentColor: "#9333EA",
      accentBg: "#FAF5FF",
      accentBorder: "#E9D5FF",
      ringColor: "rgba(147, 51, 234, 0.25)",
      filterTitle: "Top Sellers Ranked by QR Engagement",
      metricKey: "scansCount",
      metricName: "Scans",
    },
  ], [stats]);

  const activeKpiConfig = useMemo(() => {
    return KPI_CONFIGS.find((c) => c.id === selectedKpi) || null;
  }, [selectedKpi, KPI_CONFIGS]);

  const handleKpiClick = (kpiId) => {
    if (selectedKpi === kpiId) {
      setSelectedKpi(null);
      setOnlyActiveActivity(false);
    } else {
      setSelectedKpi(kpiId);
    }
  };

  // Filter & Search Logic with Dynamic KPI Sorting & Filtering
  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      // Status filter
      if (statusFilter === "ACTIVE" && u.isBlocked) return false;
      if (statusFilter === "BLOCKED" && !u.isBlocked) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchName = (u.name || "").toLowerCase().includes(q);
        const matchStore = (u.storeName || "").toLowerCase().includes(q);
        if (!matchEmail && !matchName && !matchStore) return false;
      }

      // KPI Activity toggle filter
      if (selectedKpi && onlyActiveActivity) {
        if (selectedKpi === "customers") {
          return (u.stats?.customersCount || 0) > 0;
        }
        if (selectedKpi === "returns") {
          return (u.stats?.returnsCount || 0) > 0;
        }
        if (selectedKpi === "orders") {
          return (u.stats?.ordersCount || 0) > 0;
        }
        if (selectedKpi === "scans") {
          return (u.stats?.scansCount || 0) > 0 || Boolean(u.settings?.enableQr);
        }
        if (selectedKpi === "users") {
          return !u.isBlocked;
        }
      }

      return true;
    });

    // Dynamic KPI Sorting
    if (selectedKpi) {
      list = [...list].sort((a, b) => {
        if (selectedKpi === "customers") {
          const diff = (b.stats?.customersCount || 0) - (a.stats?.customersCount || 0);
          if (diff !== 0) return diff;
        } else if (selectedKpi === "returns") {
          const diff = (b.stats?.returnsCount || 0) - (a.stats?.returnsCount || 0);
          if (diff !== 0) return diff;
        } else if (selectedKpi === "orders") {
          const diff = (b.stats?.ordersCount || 0) - (a.stats?.ordersCount || 0);
          if (diff !== 0) return diff;
        } else if (selectedKpi === "scans") {
          const diff = (b.stats?.scansCount || 0) - (a.stats?.scansCount || 0);
          if (diff !== 0) return diff;
        } else if (selectedKpi === "users") {
          if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
          if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
        }
        return (a.name || a.email).localeCompare(b.name || b.email);
      });
    }

    return list;
  }, [users, statusFilter, searchQuery, selectedKpi, onlyActiveActivity]);

  // Loading State
  if ((status === "loading" && !sessionEmail) || (loading && isAdmin)) {
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

      {/* KPI Cards Grid (Interactive & Clickable for Sorting & Filtering) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
          width: "100%",
        }}
      >
        {KPI_CONFIGS.map((config) => {
          const isSelected = selectedKpi === config.id;
          const isHovered = hoveredKpi === config.id;
          const CardIcon = config.icon;

          return (
            <div
              key={config.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => handleKpiClick(config.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleKpiClick(config.id);
                }
              }}
              onMouseEnter={() => setHoveredKpi(config.id)}
              onMouseLeave={() => setHoveredKpi(null)}
              className="premium-glass"
              style={{
                background: isSelected
                  ? `linear-gradient(180deg, ${config.accentBg} 0%, #FFFFFF 100%)`
                  : isHovered
                  ? "#F8FAFC"
                  : "#FFFFFF",
                border: isSelected
                  ? `2px solid ${config.accentColor}`
                  : isHovered
                  ? `1.5px solid ${config.accentBorder}`
                  : "1px solid #E2E8F0",
                borderRadius: "18px",
                padding: "18px 20px",
                boxShadow: isSelected
                  ? `0 10px 25px -4px ${config.ringColor}, 0 0 0 2px ${config.ringColor}`
                  : isHovered
                  ? "0 8px 20px -4px rgba(15, 23, 42, 0.06)"
                  : "0 2px 10px rgba(15, 23, 42, 0.03)",
                transform: isSelected || isHovered ? "translateY(-3px)" : "translateY(0)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                outline: "none",
                userSelect: "none",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      color: isSelected ? config.accentColor : "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {config.label}
                  </span>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      background: config.accentBg,
                      color: config.accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease",
                      transform: isHovered || isSelected ? "scale(1.06)" : "scale(1)",
                    }}
                  >
                    <CardIcon />
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: isSelected ? config.accentColor : "#0F172A",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {config.value}
                </div>

                <div style={{ marginTop: 8 }}>
                  {config.id === "users" ? (
                    <div style={{ display: "flex", gap: 6, fontSize: "0.72rem" }}>
                      <span style={{ color: "#16A34A", fontWeight: 700, background: "#F0FDF4", padding: "2px 6px", borderRadius: "6px" }}>
                        {stats ? stats.activeUsers : 0} Active
                      </span>
                      {stats && stats.blockedUsers > 0 && (
                        <span style={{ color: "#DC2626", fontWeight: 700, background: "#FEF2F2", padding: "2px 6px", borderRadius: "6px" }}>
                          {stats.blockedUsers} Blocked
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.72rem", color: isSelected ? "#334155" : "#64748B", fontWeight: 500 }}>
                      {config.subtext}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Filter Banner when a KPI is selected */}
      {selectedKpi && activeKpiConfig && (
        <div
          className="premium-glass"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "16px 22px",
            marginBottom: 24,
            borderRadius: "18px",
            background: activeKpiConfig.accentBg,
            border: `1.5px solid ${activeKpiConfig.accentBorder}`,
            boxShadow: `0 8px 24px -4px ${activeKpiConfig.ringColor}`,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: activeKpiConfig.accentColor,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                flexShrink: 0,
              }}
            >
              <activeKpiConfig.icon size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 800, color: activeKpiConfig.accentColor, fontSize: "0.96rem" }}>
                  {activeKpiConfig.filterTitle}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: "#FFFFFF",
                    color: activeKpiConfig.accentColor,
                    border: `1px solid ${activeKpiConfig.accentBorder}`,
                  }}
                >
                  {filteredUsers.length} of {users.length} Sellers Matching
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#475569" }}>
                Directory is dynamically sorted in descending order by {activeKpiConfig.label.toLowerCase()}.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            {/* Toggle: Only with > 0 records */}
            {activeKpiConfig.metricKey && (
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#334155",
                  cursor: "pointer",
                  background: "#FFFFFF",
                  padding: "7px 12px",
                  borderRadius: "10px",
                  border: `1px solid ${activeKpiConfig.accentBorder}`,
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyActiveActivity}
                  onChange={(e) => setOnlyActiveActivity(e.target.checked)}
                  style={{ accentColor: activeKpiConfig.accentColor, cursor: "pointer" }}
                />
                <span>Only sellers with active records (&gt; 0)</span>
              </label>
            )}

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedKpi(null);
                setOnlyActiveActivity(false);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: "10px",
                background: activeKpiConfig.accentColor,
                color: "#FFFFFF",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "all 0.15s ease",
              }}
            >
              <span>Reset Filter ✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Users Directory & Controls Section */}
      <div
        className="premium-glass"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
          width: "100%",
          minHeight: "560px",
          display: "flex",
          flexDirection: "column",
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

            {/* Search Input - Fixed width to prevent toolbar shifting */}
            <div style={{ position: "relative", width: 280, maxWidth: "100%", flexShrink: 0 }}>
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
                  padding: "9px 36px 9px 36px",
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

        {/* Users Table - Fixed Layout and Explicit Column Widths to prevent size jump */}
        <div
          className="table-responsive-container"
          style={{
            overflowX: "auto",
            width: "100%",
            flex: 1,
            minHeight: "380px",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          <table
            className="custom-table"
            style={{
              width: "100%",
              minWidth: "1120px",
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              textAlign: "left",
              fontSize: "0.86rem",
            }}
          >
            <colgroup>
              <col style={{ width: "23%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "21%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#475569" }}>
                <th style={{ width: "23%", padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Seller / User</th>
                <th style={{ width: "16%", padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Store Name</th>
                <th style={{ width: "10%", padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Status</th>
                <th style={{ width: "15%", padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Settings Overview</th>
                <th style={{ width: "15%", padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>Telemetry Stats</th>
                <th style={{ width: "21%", padding: "12px 14px", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 20px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                        <SearchIcon size={22} />
                      </div>
                      <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem" }}>
                        {searchQuery ? `No sellers found matching "${searchQuery}"` : "No seller accounts found"}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748B", maxWidth: 380 }}>
                        {searchQuery
                          ? "Try searching with a different name, email, or store name."
                          : "No accounts match the current filter selection."}
                      </p>
                      {(searchQuery || statusFilter !== "ALL" || selectedKpi) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("ALL");
                            setSelectedKpi(null);
                            setOnlyActiveActivity(false);
                          }}
                          style={{
                            marginTop: 8,
                            padding: "7px 16px",
                            background: "#4F46E5",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                          }}
                        >
                          Clear Search &amp; Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
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
                            <div style={{ fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
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
                              {selectedKpi && activeKpiConfig?.metricKey && (
                                <span
                                  style={{
                                    fontSize: "0.66rem",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    background: "#F1F5F9",
                                    color: "#334155",
                                    border: "1px solid #CBD5E1",
                                    fontWeight: 700,
                                    fontFamily: "var(--font-mono)",
                                    flexShrink: 0,
                                  }}
                                >
                                  #{index + 1}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Store Name */}
                      <td style={{ padding: "14px", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                          <StoreIcon size={14} color="#64748B" />
                          <span
                            style={{
                              fontWeight: 600,
                              color: user.storeName ? "#0F172A" : "#94A3B8",
                              fontSize: "0.84rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={user.storeName || "Not configured"}
                          >
                            {user.storeName || "Not configured"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: "999px",
                            background: isBlocked ? "#FEF2F2" : "#F0FDF4",
                            color: isBlocked ? "#B91C1C" : "#15803D",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            border: isBlocked ? "1px solid #FCA5A5" : "1px solid #86EFAC",
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: isBlocked ? "#DC2626" : "#16A34A" }} />
                          {isBlocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>

                      {/* Settings Overview Badges */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                          <span
                            title={user.settings?.enableQr ? "QR Code Branding: Active" : "QR Code Branding: Inactive"}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: user.settings?.enableQr ? "#EEF2FF" : "#F1F5F9",
                              color: user.settings?.enableQr ? "#4338CA" : "#94A3B8",
                              border: user.settings?.enableQr ? "1px solid #C7D2FE" : "1px solid #E2E8F0",
                            }}
                          >
                            <QrCodeIcon size={11} />
                            <span>QR {user.settings?.enableQr ? "ON" : "OFF"}</span>
                          </span>
                          <span
                            title={user.settings?.enableWhatsApp ? "WhatsApp Automation: Active" : "WhatsApp Automation: Inactive"}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: user.settings?.enableWhatsApp ? "#F0FDF4" : "#F1F5F9",
                              color: user.settings?.enableWhatsApp ? "#15803D" : "#94A3B8",
                              border: user.settings?.enableWhatsApp ? "1px solid #BBF7D0" : "1px solid #E2E8F0",
                            }}
                          >
                            <MessageSquareIcon size={11} />
                            <span>WA {user.settings?.enableWhatsApp ? "ON" : "OFF"}</span>
                          </span>
                          <span
                            title={`Sort preference: ${user.settings?.sortBy || "SKU"}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#F8FAFC",
                              color: "#475569",
                              border: "1px solid #E2E8F0",
                              textTransform: "uppercase",
                            }}
                          >
                            <ArrowUpDownIcon size={10} />
                            <span>{user.settings?.sortBy || "SKU"}</span>
                          </span>
                        </div>
                      </td>

                      {/* Telemetry Stats (Clickable to Filter & Rank) */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                          {/* Orders Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleKpiClick("orders");
                            }}
                            title={`Orders: ${user.stats?.ordersCount || 0}. Click to filter and rank by Orders.`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: "7px",
                              background: selectedKpi === "orders" ? "#E0F2FE" : "#F8FAFC",
                              border: selectedKpi === "orders" ? "1.5px solid #0284C7" : "1px solid #E2E8F0",
                              color: selectedKpi === "orders" ? "#0369A1" : "#475569",
                              fontWeight: selectedKpi === "orders" ? 700 : 600,
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: selectedKpi === "orders" ? "0 2px 6px rgba(2, 132, 199, 0.2)" : "none",
                            }}
                          >
                            <PackageIcon size={12} color={selectedKpi === "orders" ? "#0284C7" : "#64748B"} />
                            <span>{user.stats?.ordersCount || 0}</span>
                          </button>

                          {/* Returns Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleKpiClick("returns");
                            }}
                            title={`Returns: ${user.stats?.returnsCount || 0}. Click to filter and rank by Returns.`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: "7px",
                              background: selectedKpi === "returns" ? "#FEE2E2" : "#F8FAFC",
                              border: selectedKpi === "returns" ? "1.5px solid #DC2626" : "1px solid #E2E8F0",
                              color: selectedKpi === "returns" ? "#B91C1C" : "#475569",
                              fontWeight: selectedKpi === "returns" ? 700 : 600,
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: selectedKpi === "returns" ? "0 2px 6px rgba(220, 38, 38, 0.2)" : "none",
                            }}
                          >
                            <RotateCcwIcon size={12} color={selectedKpi === "returns" ? "#DC2626" : "#64748B"} />
                            <span>{user.stats?.returnsCount || 0}</span>
                          </button>

                          {/* Customers Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleKpiClick("customers");
                            }}
                            title={`Customers: ${user.stats?.customersCount || 0}. Click to filter and rank by Customers.`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: "7px",
                              background: selectedKpi === "customers" ? "#DCFCE7" : "#F8FAFC",
                              border: selectedKpi === "customers" ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                              color: selectedKpi === "customers" ? "#15803D" : "#475569",
                              fontWeight: selectedKpi === "customers" ? 700 : 600,
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: selectedKpi === "customers" ? "0 2px 6px rgba(22, 163, 74, 0.2)" : "none",
                            }}
                          >
                            <UsersIcon size={12} color={selectedKpi === "customers" ? "#16A34A" : "#64748B"} />
                            <span>{user.stats?.customersCount || 0}</span>
                          </button>

                          {/* Scans Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleKpiClick("scans");
                            }}
                            title={`QR Scans: ${user.stats?.scansCount || 0}. Click to filter and rank by Scans.`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: "7px",
                              background: selectedKpi === "scans" ? "#F3E8FF" : "#F8FAFC",
                              border: selectedKpi === "scans" ? "1.5px solid #9333EA" : "1px solid #E2E8F0",
                              color: selectedKpi === "scans" ? "#7E22CE" : "#475569",
                              fontWeight: selectedKpi === "scans" ? 700 : 600,
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: selectedKpi === "scans" ? "0 2px 6px rgba(147, 51, 234, 0.2)" : "none",
                            }}
                          >
                            <QrCodeIcon size={12} color={selectedKpi === "scans" ? "#9333EA" : "#64748B"} />
                            <span>{user.stats?.scansCount || 0}</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                          {/* Edit Settings Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: "#FFFFFF",
                              color: "#334155",
                              border: "1px solid #CBD5E1",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              transition: "all 0.15s ease",
                            }}
                          >
                            <SettingsIcon size={13} />
                            <span>Settings</span>
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
                                background: isBlocked ? "#F0FDF4" : "#FFFFFF",
                                color: isBlocked ? "#16A34A" : "#DC2626",
                                border: isBlocked ? "1px solid #BBF7D0" : "1px solid #FECACA",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: isBlockingThis ? "not-allowed" : "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                transition: "all 0.15s ease",
                              }}
                            >
                              <UserXIcon size={13} color={isBlocked ? "#16A34A" : "#DC2626"} />
                              <span>{isBlockingThis ? "Saving..." : isBlocked ? "Unblock" : "Block"}</span>
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
      {/* LUXURY SETTINGS EDIT STUDIO MODAL (FOR SELECTED SELLER)                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        maxWidth={720}
        style={{ padding: 0, overflow: "hidden" }}
      >
        {editingUser && (
          <form
            onSubmit={handleSaveSettings}
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#FFFFFF",
              borderRadius: "24px",
              overflow: "hidden",
            }}
          >
            {/* 1. MODAL HERO HEADER */}
            <div
              style={{
                background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
                borderBottom: "1px solid #E2E8F0",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {editingUser.image ? (
                  <img
                    src={editingUser.image}
                    alt={editingUser.name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      border: "2px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "14px",
                      background: editingUser.isSuperAdmin
                        ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
                        : "linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                    }}
                  >
                    {(editingUser.name || editingUser.email)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
                      {editingUser.email}
                    </span>
                    {editingUser.isSuperAdmin ? (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: "#EEF2FF",
                          color: "#4F46E5",
                          fontWeight: 800,
                          border: "1px solid #C7D2FE",
                        }}
                      >
                        SUPERADMIN
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: "#F1F5F9",
                          color: "#475569",
                          fontWeight: 700,
                        }}
                      >
                        SELLER
                      </span>
                    )}
                    {editingUser.isBlocked ? (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: "#FEF2F2",
                          color: "#DC2626",
                          fontWeight: 800,
                          border: "1px solid #FECACA",
                        }}
                      >
                        BLOCKED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: "#F0FDF4",
                          color: "#16A34A",
                          fontWeight: 800,
                          border: "1px solid #BBF7D0",
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                    {settingsForm.storeName || editingUser.storeName || "Seller Store Studio"}
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                aria-label="Close dialog"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#0F172A";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* 2. SEGMENTED CONTROL TABS */}
            <div style={{ padding: "14px 24px 0", background: "#FFFFFF" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 4,
                  background: "#F1F5F9",
                  borderRadius: "14px",
                  padding: "4px",
                  border: "1px solid #E2E8F0",
                }}
              >
                {[
                  { id: "store", label: "Store Profile", icon: StoreIcon },
                  { id: "qr", label: "QR & Stamp", icon: QrCodeIcon },
                  { id: "whatsapp", label: "WhatsApp", icon: PhoneIcon },
                  { id: "crop", label: "Cropping", icon: ScissorsIcon },
                ].map((t) => {
                  const isActive = activeSettingsTab === t.id;
                  const IconComp = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveSettingsTab(t.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "none",
                        background: isActive ? "#FFFFFF" : "transparent",
                        color: isActive ? "#4338CA" : "#64748B",
                        fontWeight: isActive ? 800 : 600,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <span style={{ color: isActive ? "#4F46E5" : "#94A3B8" }}>
                        <IconComp size={15} />
                      </span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. MODAL BODY PANES */}
            <div
              style={{
                padding: "20px 24px 24px",
                maxHeight: "56vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* ================================================================= */}
              {/* TAB 1: STORE PROFILE                                              */}
              {/* ================================================================= */}
              {activeSettingsTab === "store" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Store Name Card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span>Store Brand Name</span>
                      <span style={{ fontSize: "0.72rem", color: "#6366F1", fontWeight: 600 }}>
                        Prints on: "Sold by: {settingsForm.storeName || "YOUR STORE"}"
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                        <StoreIcon size={16} />
                      </span>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        placeholder="e.g. Mahir Enterprise"
                        style={{
                          width: "100%",
                          padding: "10px 14px 10px 40px",
                          borderRadius: "10px",
                          border: "1.5px solid #CBD5E1",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: "#0F172A",
                          outline: "none",
                          background: "#F8FAFC",
                          transition: "border 0.15s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#4F46E5")}
                        onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
                      />
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
                      Seller Support &amp; Customer Contact
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                          Support Phone
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                            <PhoneIcon size={15} />
                          </span>
                          <input
                            type="text"
                            value={settingsForm.phone}
                            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                            placeholder="+91 9876543210"
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.84rem",
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                          Support Email
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                            <MailIcon size={15} />
                          </span>
                          <input
                            type="email"
                            value={settingsForm.supportEmail}
                            onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                            placeholder="support@store.com"
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.84rem",
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Web & Social Card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
                      Online Presence &amp; Store Destination
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                          Store Website URL
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                            <GlobeIcon size={15} />
                          </span>
                          <input
                            type="url"
                            value={settingsForm.storeUrl}
                            onChange={(e) => setSettingsForm({ ...settingsForm, storeUrl: e.target.value })}
                            placeholder="https://meesho.com/..."
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.84rem",
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569", display: "block", marginBottom: 5 }}>
                          Instagram Handle
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                            <InstagramIcon size={15} />
                          </span>
                          <input
                            type="text"
                            value={settingsForm.instagramHandle}
                            onChange={(e) => setSettingsForm({ ...settingsForm, instagramHandle: e.target.value })}
                            placeholder="@store_official"
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.84rem",
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Note Card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                      Custom Tagline / Thank-You Note
                    </label>
                    <div style={{ position: "relative" }}>
                      <textarea
                        rows={2}
                        value={settingsForm.customNote}
                        onChange={(e) => setSettingsForm({ ...settingsForm, customNote: e.target.value })}
                        placeholder="Thank You for Shopping with Us! Please rate 5 stars on Meesho to support our small business."
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1.5px solid #CBD5E1",
                          fontSize: "0.84rem",
                          color: "#0F172A",
                          outline: "none",
                          background: "#F8FAFC",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 2: QR & STAMP BRANDING                                        */}
              {/* ================================================================= */}
              {activeSettingsTab === "qr" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Master Toggle */}
                  <ToggleSwitch
                    checked={settingsForm.enableQr}
                    onChange={(val) => setSettingsForm({ ...settingsForm, enableQr: val })}
                    label="Thermal Label QR Code Stamping"
                    description="Generates high-resolution dynamic QR codes & buyer retention stamps on every shipping label."
                    activeColor="#4F46E5"
                  />

                  {settingsForm.enableQr && (
                    <>
                      {/* Destination URL */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          QR Code Target Destination URL
                        </label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                            <GlobeIcon size={16} />
                          </span>
                          <input
                            type="text"
                            value={settingsForm.qrText}
                            onChange={(e) => setSettingsForm({ ...settingsForm, qrText: e.target.value })}
                            placeholder="https://www.meesho.com/themahirenterprise"
                            style={{
                              width: "100%",
                              padding: "10px 14px 10px 38px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                      </div>

                      {/* Stamp Detail Note */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                            Stamp Caption / Multilingual Tagline
                          </label>
                          <span style={{ fontSize: "0.72rem", color: "#6366F1", fontWeight: 600 }}>
                            Supports tag: <code>{'{regionalThankYou}'}</code>
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={settingsForm.detailText}
                          onChange={(e) => setSettingsForm({ ...settingsForm, detailText: e.target.value })}
                          placeholder="Thank You for Shopping with Us!\n{regionalThankYou}"
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1.5px solid #CBD5E1",
                            fontSize: "0.84rem",
                            color: "#0F172A",
                            outline: "none",
                            background: "#F8FAFC",
                            fontFamily: "monospace",
                          }}
                        />
                      </div>

                      {/* Visual Stamp Style Cards */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                          Select Stamp Visual Style
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                          {[
                            { id: "badge", label: "Badge Style", desc: "Rounded pill outline with crisp icon" },
                            { id: "banner", label: "Full Banner", desc: "Edge-to-edge footer ribbon" },
                            { id: "minimal", label: "Minimal Stamp", desc: "Clean corner watermark" },
                          ].map((st) => {
                            const isSelected = (settingsForm.stampStyle || "badge") === st.id;
                            return (
                              <div
                                key={st.id}
                                onClick={() => setSettingsForm({ ...settingsForm, stampStyle: st.id })}
                                style={{
                                  padding: "12px",
                                  borderRadius: "12px",
                                  background: isSelected ? "rgba(99, 102, 241, 0.06)" : "#F8FAFC",
                                  border: isSelected ? "2px solid #4F46E5" : "1.5px solid #E2E8F0",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  position: "relative",
                                }}
                              >
                                {isSelected && (
                                  <span style={{ position: "absolute", top: 8, right: 8, color: "#4F46E5" }}>
                                    <CheckIcon size={16} />
                                  </span>
                                )}
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isSelected ? "#4338CA" : "#0F172A" }}>
                                  {st.label}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4, lineHeight: 1.3 }}>
                                  {st.desc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sliders for QR Dimensions */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F172A" }}>
                              QR Code Dimensions
                            </label>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, background: "#EEF2FF", color: "#4F46E5", padding: "2px 7px", borderRadius: "6px" }}>
                              {settingsForm.qrSize || 70} pt
                            </span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="110"
                            value={settingsForm.qrSize || 70}
                            onChange={(e) => setSettingsForm({ ...settingsForm, qrSize: parseInt(e.target.value, 10) })}
                            style={{ width: "100%", accentColor: "#4F46E5", cursor: "pointer" }}
                          />
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F172A" }}>
                              Stamp Font Size
                            </label>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, background: "#EEF2FF", color: "#4F46E5", padding: "2px 7px", borderRadius: "6px" }}>
                              {settingsForm.fontSize || 8} pt
                            </span>
                          </div>
                          <input
                            type="range"
                            min="6"
                            max="12"
                            value={settingsForm.fontSize || 8}
                            onChange={(e) => setSettingsForm({ ...settingsForm, fontSize: parseInt(e.target.value, 10) })}
                            style={{ width: "100%", accentColor: "#4F46E5", cursor: "pointer" }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 3: WHATSAPP AUTOMATION                                        */}
              {/* ================================================================= */}
              {activeSettingsTab === "whatsapp" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Master Toggle */}
                  <ToggleSwitch
                    checked={settingsForm.enableWhatsApp}
                    onChange={(val) =>
                      setSettingsForm({
                        ...settingsForm,
                        enableWhatsApp: val,
                        sendWhatsApp: val,
                      })
                    }
                    label="Automated WhatsApp Dispatch Alerts"
                    description="Automatically delivers daily dispatch summaries & scanned label packages directly to seller WhatsApp."
                    activeColor="#10B981"
                    badge="ONLINE"
                  />

                  {settingsForm.enableWhatsApp && (
                    <>
                      {/* API Key Card */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                            LexTrack WhatsApp API Key
                          </label>
                          <span style={{ fontSize: "0.72rem", color: "#10B981", fontWeight: 700 }}>
                            Official Gateway Token
                          </span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showWaKey ? "text" : "password"}
                            value={settingsForm.waApiKey}
                            onChange={(e) => setSettingsForm({ ...settingsForm, waApiKey: e.target.value })}
                            placeholder="wa_c6854599bd4b7a54cad78edbdd6ace51"
                            style={{
                              width: "100%",
                              padding: "10px 42px 10px 14px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.84rem",
                              fontFamily: "monospace",
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowWaKey(!showWaKey)}
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              border: "none",
                              background: "transparent",
                              color: "#64748B",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {showWaKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Receiver Number Card */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 6 }}>
                          Receiver WhatsApp Mobile Number
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              padding: "10px 12px",
                              borderRadius: "10px",
                              background: "#F1F5F9",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#475569",
                            }}
                          >
                            +91
                          </span>
                          <input
                            type="text"
                            value={settingsForm.waReceiverNumber}
                            onChange={(e) => setSettingsForm({ ...settingsForm, waReceiverNumber: e.target.value })}
                            placeholder="8140148878"
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              borderRadius: "10px",
                              border: "1.5px solid #CBD5E1",
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              color: "#0F172A",
                              outline: "none",
                              background: "#F8FAFC",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 6 }}>
                          Consolidated dispatch PDFs and shipment summaries will be automatically sent to this WhatsApp contact.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 4: CROPPING & MARGINS                                          */}
              {/* ================================================================= */}
              {activeSettingsTab === "crop" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Master Toggle */}
                  <ToggleSwitch
                    checked={settingsForm.cropEnabled}
                    onChange={(val) => setSettingsForm({ ...settingsForm, cropEnabled: val })}
                    label="Automatic PDF Shipping Label Cropping"
                    description="Crops unneeded invoices, buyer address duplicates, and extra margins for fast 4x6 thermal printing."
                    activeColor="#0284C7"
                  />

                  {settingsForm.cropEnabled && (
                    <>
                      {/* Visual Preset Cards */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>
                          Select Cropping Preset
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                          {[
                            { id: "label_only", label: "4x6 Thermal", desc: "100x150mm direct label standard" },
                            { id: "crop_bottom", label: "Bottom 58% Crop", desc: "Meesho & Flipkart A4 2-in-1 format" },
                            { id: "crop_top", label: "Top Half Crop", desc: "Crops upper 50% section" },
                          ].map((cp) => {
                            const isSelected = (settingsForm.cropPreset || "label_only") === cp.id;
                            return (
                              <div
                                key={cp.id}
                                onClick={() => setSettingsForm({ ...settingsForm, cropPreset: cp.id })}
                                style={{
                                  padding: "12px",
                                  borderRadius: "12px",
                                  background: isSelected ? "rgba(2, 132, 199, 0.06)" : "#F8FAFC",
                                  border: isSelected ? "2px solid #0284C7" : "1.5px solid #E2E8F0",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  position: "relative",
                                }}
                              >
                                {isSelected && (
                                  <span style={{ position: "absolute", top: 8, right: 8, color: "#0284C7" }}>
                                    <CheckIcon size={16} />
                                  </span>
                                )}
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isSelected ? "#0369A1" : "#0F172A" }}>
                                  {cp.label}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4, lineHeight: 1.3 }}>
                                  {cp.desc}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Crop % Slider */}
                      <div
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A" }}>
                            Bottom Margin Cut-off Percentage
                          </label>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#E0F2FE", color: "#0284C7", padding: "2px 8px", borderRadius: "6px" }}>
                            {settingsForm.cropBottom || 58}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={settingsForm.cropBottom ?? 58}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cropBottom: parseInt(e.target.value, 10) || 0 })}
                          style={{ width: "100%", accentColor: "#0284C7", cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94A3B8", marginTop: 4 }}>
                          <span>0% (Full Document)</span>
                          <span>58% (Recommended for Meesho)</span>
                          <span>90% (Maximum Crop)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 4. MODAL STICKY FOOTER */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #E2E8F0",
                background: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "#64748B" }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#4F46E5" }} />
                <span>Configuring seller settings for <strong>{editingUser.email}</strong></span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    background: "#FFFFFF",
                    border: "1.5px solid #CBD5E1",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingSettings}
                  style={{
                    padding: "9px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: savingSettings ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!savingSettings) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(79, 70, 229, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(79, 70, 229, 0.3)";
                  }}
                >
                  {savingSettings ? (
                    <>
                      <div style={{ width: 14, height: 14, border: "2px solid #FFFFFF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
