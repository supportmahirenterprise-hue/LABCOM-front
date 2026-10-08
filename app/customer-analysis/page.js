"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
    </svg>
  );
}

function LocationIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BuildingIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <line x1="8" y1="6" x2="8.01" y2="6" />
      <line x1="16" y1="6" x2="16.01" y2="6" />
      <line x1="12" y1="6" x2="12.01" y2="6" />
      <line x1="12" y1="10" x2="12.01" y2="10" />
      <line x1="12" y1="14" x2="12.01" y2="14" />
      <line x1="16" y1="10" x2="16.01" y2="10" />
      <line x1="16" y1="14" x2="16.01" y2="14" />
      <line x1="8" y1="10" x2="8.01" y2="10" />
      <line x1="8" y1="14" x2="8.01" y2="14" />
    </svg>
  );
}

function PhoneIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function HomeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CreditCardIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function BanknotesIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export default function CustomerAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [skuFilter, setSkuFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [repeatOnly, setRepeatOnly] = useState(false);
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toast, setToast] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const paginatedCustomers = useMemo(() => {
    if (!data?.customers) return [];
    const start = (currentPage - 1) * pageSize;
    return data.customers.slice(start, start + pageSize);
  }, [data?.customers, currentPage, pageSize]);

  const filteredSkuMatrix = useMemo(() => {
    if (!insightsData?.skuPerformanceMatrix) return [];
    if (skuFilter === "PAUSE") {
      return insightsData.skuPerformanceMatrix.filter((item) => item.shouldPause);
    }
    if (skuFilter === "WINNER") {
      return insightsData.skuPerformanceMatrix.filter((item) => item.isWinner);
    }
    if (skuFilter === "RTO") {
      return insightsData.skuPerformanceMatrix.filter((item) => item.rtoRate >= 15);
    }
    return insightsData.skuPerformanceMatrix;
  }, [insightsData?.skuPerformanceMatrix, skuFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, repeatOnly, selectedState, selectedDistrict]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleStateChange = (newStat) => {
    setSelectedState(newStat);
    setSelectedDistrict("ALL");
  };

  async function fetchCustomerAnalysis() {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const userEmail = session.user.email;
      const queryParams = new URLSearchParams({
        email: userEmail,
        search: search.trim(),
        repeatOnly: repeatOnly ? "true" : "false",
        state: selectedState,
        district: selectedDistrict,
      });

      const [resCustomer, resInsights] = await Promise.all([
        fetch(`${BACKEND_URL}/api/customer-analysis?${queryParams.toString()}`, {
          headers: { "x-user-email": userEmail },
        }),
        fetch(`${BACKEND_URL}/api/insights/dashboard`, {
          headers: { "x-user-email": userEmail },
        }).catch(() => null),
      ]);

      if (resCustomer && resCustomer.ok) {
        const json = await resCustomer.json();
        setData(json);
      } else {
        showToast("Failed to load customer analysis data", "error");
      }

      if (resInsights && resInsights.ok) {
        const insightsJson = await resInsights.json();
        setInsightsData(insightsJson);
      }
    } catch (err) {
      console.error("Failed to fetch customer analysis:", err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchCustomerAnalysis();
    }
  }, [status, session?.user?.email, repeatOnly, selectedState, selectedDistrict]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomerAnalysis();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, position: "relative", width: "100%", maxWidth: "100%" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 9999,
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(0, 242, 254, 0.15)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--aurora-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="heading-display" style={{ fontSize: "1.65rem", color: "var(--text-pure)", margin: 0, letterSpacing: "-0.01em" }}>
                Customer Intelligence & District Demand Analysis
              </h1>
              <p style={{ fontSize: "0.83rem", color: "var(--text-silver)", marginTop: 4, marginBottom: 0 }}>
                State & District-wise demand analysis to identify high-volume order hubs vs emerging low-demand regions.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={fetchCustomerAnalysis}
            style={{ fontSize: "0.85rem", padding: "10px 18px", borderColor: "var(--aurora-2)", color: "var(--aurora-1)", display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh Sync
          </button>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 22px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Studio
          </Link>
        </div>
      </div>

      {/* 4 Premium Stat KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total Unique Customers */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #4F46E5", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Unique Buyers
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#EEF2FF", border: "1px solid #C7D2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0F172A", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalCustomers || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#4F46E5", fontWeight: 600, marginTop: 4, display: "block" }}>
            Total unique buyer profiles stored
          </span>
        </div>

        {/* Repeat Customers Count */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #D97706", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Repeat Buyers (2+ Orders)
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#D97706", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatCustomersCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#B45309", fontWeight: 600, marginTop: 4, display: "block" }}>
            Multi-order repeat customers
          </span>
        </div>

        {/* Repeat Rate % */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #059669", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Repeat Retention Rate
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#D1FAE5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#059669", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatRate || 0}%
          </div>
          <span style={{ fontSize: "0.76rem", color: "#047857", fontWeight: 600, marginTop: 4, display: "block" }}>
            Lifetime customer retention ratio
          </span>
        </div>

        {/* Total Orders Processed */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #0284C7", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Orders Logged
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#E0F2FE", border: "1px solid #BAE6FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0284C7", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalOrdersProcessed || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#0369A1", fontWeight: 600, marginTop: 4, display: "block" }}>
            Total shipping parcels logged in DB
          </span>
        </div>
      </div>

      {/* EXECUTIVE SMART ACTION HUB & PRODUCT PAUSE DECISION MATRIX */}
      <div className="premium-glass" style={{ padding: "24px 26px", borderRadius: "20px", background: "#FFFFFF", border: "1px solid #E2E8F0", marginBottom: 28, boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.05)" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "#0F172A", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4F46E5", display: "inline-block" }}></span>
              🎯 Executive Action Hub & SKU Pause Matrix
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 4, marginBottom: 0 }}>
              Automated seller decision intelligence: Products to pause, top winner SKUs, and high-growth potential districts.
            </p>
          </div>
        </div>

        {/* Smart Executive Action Cards Grid */}
        {insightsData?.actionCards && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16, marginBottom: 26 }}>
            {insightsData.actionCards.map((card) => (
              <div
                key={card.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: "16px",
                  background: card.type === "critical" ? "#FEF2F2" : card.type === "growth" ? "#F0FDF4" : "#F0F9FF",
                  border: card.type === "critical" ? "1px solid #FCA5A5" : card.type === "growth" ? "1px solid #86EFAC" : "1px solid #BAE6FD",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: card.type === "critical" ? "#DC2626" : card.type === "growth" ? "#166534" : "#0369A1", marginBottom: 6 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", marginBottom: 8, lineHeight: 1.3 }}>
                  {card.headline}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45 }}>
                  💡 <strong>Advice:</strong> {card.advice}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKU Performance & Pause Table */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                📦 Product Demand & Return Matrix (SKU-Wise)
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "2px 0 0 0" }}>
                Filter products to immediately see which SKUs need pausing or ad scaling.
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="segmented-control" style={{ background: "#F1F5F9", padding: "4px", borderRadius: "10px", display: "inline-flex", gap: 4 }}>
              {[
                { id: "ALL", label: "All Products" },
                { id: "PAUSE", label: "🛑 Need Pause" },
                { id: "WINNER", label: "🚀 Winners" },
                { id: "RTO", label: "⚠️ High RTO" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSkuFilter(f.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: skuFilter === f.id ? "#FFFFFF" : "transparent",
                    color: skuFilter === f.id ? "#4F46E5" : "#64748B",
                    fontWeight: skuFilter === f.id ? 700 : 500,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    boxShadow: skuFilter === f.id ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "12px 16px" }}>PRODUCT / SKU NAME</th>
                  <th style={{ padding: "12px 16px" }}>ORDERS LOGGED</th>
                  <th style={{ padding: "12px 16px" }}>CUSTOMER RETURNS</th>
                  <th style={{ padding: "12px 16px" }}>COURIER RTOs</th>
                  <th style={{ padding: "12px 16px" }}>RETURN RATE %</th>
                  <th style={{ padding: "12px 16px" }}>DECISION STATUS</th>
                  <th style={{ padding: "12px 16px" }}>SELLER RECOMMENDATION</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkuMatrix.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "#64748B" }}>
                      No matching products found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredSkuMatrix.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        background: item.shouldPause ? "#FFF5F5" : "transparent",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F172A" }}>
                        {item.sku}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0284C7" }}>
                        {item.totalOrders} units
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {item.customerReturnCount}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#475569" }}>
                        {item.rtoCount}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: item.returnRate >= 20 ? "#DC2626" : "#059669" }}>
                        {item.returnRate}%
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className={`badge ${item.badgeStyle}`}>
                          {item.actionBadge}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#334155", fontSize: "0.8rem", maxWidth: 300, lineHeight: 1.4 }}>
                        {item.adviceText}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Demand Heatmap Widget (High vs Low Demand District Analysis) */}
      <div className="premium-glass" style={{ marginBottom: 24, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "#0F172A", margin: 0 }}>
                <MapIcon /> District-Wise Demand Analysis (High vs Low Volume Regions)
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "2px 0 0 0" }}>
                Analyze high-performing district order hubs vs emerging low-demand regions.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {/* High Order Volume Hubs */}
          <div style={{ background: "#FFFBEB", padding: "16px 18px", borderRadius: "14px", border: "1px solid #FCD34D" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#B45309", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FlameIcon /> Top High-Volume District Hubs (Highest Demand)
              </span>
              <span style={{ fontSize: "0.72rem", color: "#92400E", fontWeight: 600 }}>Top Districts</span>
            </div>
            {(!data?.summary?.allDistrictsWithCounts || data.summary.allDistrictsWithCounts.length === 0) ? (
              <div style={{ fontSize: "0.8rem", color: "#92400E" }}>No district data logged yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[...(data.summary.allDistrictsWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((d) => (
                  <div
                    key={d.name}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "#FEF3C7",
                      border: "1px solid #FDE68A",
                      color: "#78350F",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{d.name}</span>
                    <span style={{ background: "#D97706", color: "#FFFFFF", padding: "1px 7px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
                      {d.count} Orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top State Hubs */}
          <div style={{ background: "#ECFDF5", padding: "16px 18px", borderRadius: "14px", border: "1px solid #A7F3D0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#047857", display: "flex", alignItems: "center", gap: 6 }}>
                Top High-Volume State Hubs
              </span>
              <span style={{ fontSize: "0.72rem", color: "#065F46", fontWeight: 600 }}>Top States</span>
            </div>
            {(!data?.summary?.allStatesWithCounts || data.summary.allStatesWithCounts.length === 0) ? (
              <div style={{ fontSize: "0.8rem", color: "#065F46" }}>No state data logged yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[...(data.summary.allStatesWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((s) => (
                  <div
                    key={s.name}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "#D1FAE5",
                      border: "1px solid #A7F3D0",
                      color: "#064E3B",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{s.name}</span>
                    <span style={{ background: "#059669", color: "#FFFFFF", padding: "1px 7px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
                      {s.count} Orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section: Search Bar + State Filter + District Filter + Repeat Filter */}
      <div className="premium-glass" style={{ marginBottom: 20, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ position: "absolute", left: 14, pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search Customer, Mobile, Address, District, State, or Order No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "var(--radius-md)",
                  color: "#0F172A",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: "10px 20px", fontSize: "0.85rem", whiteSpace: "nowrap" }}
            >
              Search
            </button>
          </form>

          {/* State & District Dropdowns + Repeat Toggle */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* State Filter Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", padding: "4px 12px", borderRadius: "var(--radius-md)", border: "1px solid #E2E8F0" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                State:
              </span>
              <select
                className="select-light"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">
                  All States ({data?.summary?.totalOrdersAll || data?.summary?.totalOrdersProcessed || 0})
                </option>
                {[...(data?.summary?.allStatesWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", padding: "4px 12px", borderRadius: "var(--radius-md)", border: "1px solid #E2E8F0" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                District:
              </span>
              <select
                className="select-light"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">
                  All Districts ({data?.summary?.totalOrdersForSelectedState || 0})
                </option>
                {[...(data?.summary?.allDistrictsWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .map((dst) => (
                  <option key={dst.name} value={dst.name}>
                    {dst.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Repeat Customers Filter Segment */}
            <div className="segmented-control">
              <button
                className={`segmented-tab ${!repeatOnly ? "active" : ""}`}
                onClick={() => setRepeatOnly(false)}
              >
                All Buyers ({data?.summary?.totalCustomers || 0})
              </button>
              <button
                className={`segmented-tab ${repeatOnly ? "active" : ""}`}
                onClick={() => setRepeatOnly(true)}
              >
                Repeat Only ({data?.summary?.repeatCustomersCount || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Directory Table with Dedicated District Column */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--aurora-1)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-pure)" }}>
              Customer Master Directory
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-silver)" }}>
            Click on any Order Count badge to inspect date-wise history
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-silver)", fontSize: "0.9rem" }}>
            ⏳ Fetching customer intelligence records...
          </div>
        ) : (!data?.customers || data.customers.length === 0) ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.88rem" }}>
            No customer records matching the filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", borderRadius: "0 0 16px 16px" }}>
            <table className="custom-table" style={{ width: "100%", minWidth: "1180px" }}>
              <thead>
                <tr>
                  <th style={{ width: "45px", minWidth: "45px" }}>#</th>
                  <th style={{ minWidth: "150px" }}>CUSTOMER NAME</th>
                  <th style={{ minWidth: "125px" }}>MOBILE NUMBER</th>
                  <th style={{ minWidth: "115px" }}>STATE</th>
                  <th style={{ minWidth: "130px" }}>DISTRICT</th>
                  <th style={{ minWidth: "240px" }}>DELIVERY ADDRESS</th>
                  <th style={{ minWidth: "180px", textAlign: "center" }}>ORDERS COUNT (CLICK TO VIEW)</th>
                  <th style={{ minWidth: "140px", whiteSpace: "nowrap", paddingRight: "24px" }}>LAST ORDER DATE</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={c.id || idx}>
                      <td style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {globalIdx} 
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--text-pure)", fontSize: "0.88rem" }}>
                        {c.name}
                      </td>
                      <td style={{ fontSize: "0.82rem", color: c.mobileNumber !== "N/A" ? "var(--aurora-1)" : "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {c.mobileNumber !== "N/A" ? c.mobileNumber : "N/A"}
                      </td>                      <td>
                        <span className="tag-pill badge-sky" style={{ fontSize: "0.75rem", padding: "3px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <LocationIcon size={12} /> {c.state}
                        </span>
                      </td>

                      {/* Dedicated District Column */}
                      <td>
                        <span className="tag-pill badge-teal" style={{ fontSize: "0.78rem", padding: "3px 10px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <BuildingIcon size={12} /> {c.district || "Central"}
                        </span>
                      </td>

                      {/* Full Address Multi-Line Wrap without truncation */}
                      <td
                        style={{
                          fontSize: "0.82rem",
                          color: "#475569",
                          minWidth: 220,
                          maxWidth: 400,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: "1.45",
                          padding: "12px 14px",
                        }}
                      >
                        {c.address}
                      </td>

                      {/* Orders Count Column */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          title="Click to view complete order history"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 16px",
                            borderRadius: "var(--radius-full)",
                            background: c.isRepeat ? "#FEF3C7" : "#F8FAFC",
                            border: c.isRepeat ? "1.5px solid #F59E0B" : "1px solid #E2E8F0",
                            color: c.isRepeat ? "#92400E" : "#334155",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: c.isRepeat ? "0 2px 8px rgba(245, 158, 11, 0.15)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {c.isRepeat && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          )}
                          <span>{c.ordersCountText}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </button>
                      </td>

                      <td style={{ fontSize: "0.8rem", color: "#64748B", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", paddingRight: "24px" }}>
                        {c.lastOrderDate || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive Pagination Bar */}
        {data?.customers && data.customers.length > 0 && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              background: "#F8FAFC",
            }}
          >
            {/* Page Info */}
            <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
              Showing{" "}
              <strong style={{ color: "#4F46E5" }}>
                {Math.min((currentPage - 1) * pageSize + 1, data.customers.length)}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "#4F46E5" }}>
                {Math.min(currentPage * pageSize, data.customers.length)}
              </strong>{" "}
              of <strong style={{ color: "#0F172A" }}>{data.customers.length}</strong> customers
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Rows per page selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#64748B" }}>
                <span>Rows per page:</span>
                <select
                  className="select-light"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Navigation Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  className="btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.8rem",
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
                >
                  «
                </button>
                <button
                  className="btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.8rem",
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
                >
                  Prev
                </button>

                {/* Page Buttons List */}
                {(() => {
                  const totalPagesCount = Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25)));
                  return Array.from({ length: totalPagesCount }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPagesCount || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;
                      return (
                        <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {showEllipsis && <span style={{ color: "#94A3B8", padding: "0 2px" }}>...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "8px",
                              border: p === currentPage ? "1px solid #4F46E5" : "1px solid #E2E8F0",
                              background: p === currentPage ? "#EEF2FF" : "#FFFFFF",
                              color: p === currentPage ? "#4F46E5" : "#475569",
                              fontWeight: p === currentPage ? 700 : 500,
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              minWidth: "32px",
                            }}
                          >
                            {p}
                          </button>
                        </span>
                      );
                    });
                })()}

                <button
                  className="btn-secondary"
                  disabled={currentPage >= Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25)))}
                  onClick={() => setCurrentPage((prev) => Math.min(Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25))), prev + 1))}
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.8rem",
                    opacity: currentPage >= Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25))) ? 0.4 : 1,
                  }}
                >
                  Next
                </button>
                <button
                  className="btn-secondary"
                  disabled={currentPage >= Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25)))}
                  onClick={() => setCurrentPage(Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25))))}
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.8rem",
                    opacity: currentPage >= Math.max(1, Math.ceil((data?.customers?.length || 0) / (pageSize || 25))) ? 0.4 : 1,
                  }}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order History Modal Popup */}
      {selectedCustomer && (
        <div className="modal-backdrop-light">
          <div
            className="modal-card-light"
            style={{
              width: "100%",
              maxWidth: 780,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px 30px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 className="heading-display" style={{ fontSize: "1.35rem", color: "#0F172A", margin: 0 }}>
                    Order History Log
                  </h2>
                  <span
                    className={selectedCustomer.isRepeat ? "badge-amber" : "badge-slate"}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {selectedCustomer.ordersCountText}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: 6, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                  <span>Buyer Name: <strong style={{ color: "#0F172A" }}>{selectedCustomer.name}</strong></span>
                  {selectedCustomer.mobileNumber !== "N/A" && (
                    <span style={{ color: "#0284C7", fontFamily: "var(--font-mono)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <PhoneIcon size={13} /> {selectedCustomer.mobileNumber}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 6, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LocationIcon size={12} /> State: {selectedCustomer.state}</span>
                  <span>|</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><BuildingIcon size={12} /> District: {selectedCustomer.district}</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <HomeIcon size={13} /> Address: {selectedCustomer.address}
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Order History Table */}
            {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
                No order history records found for this customer.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="custom-table" style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th style={{ width: "190px" }}>SUB ORDER ID / ORDER NO</th>
                      <th style={{ width: "110px" }}>PAYMENT</th>
                      <th style={{ width: "110px" }}>ORDER DATE</th>
                      <th style={{ width: "160px" }}>SKU CODE</th>
                      <th style={{ width: "50px" }}>QTY</th>
                      <th style={{ width: "110px" }}>DESTINATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.orders.map((ord, i) => (
                      <tr key={ord.subOrderNo || ord.orderNo || i}>
                        <td style={{ color: "#94A3B8", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                          {i + 1}
                        </td>
                        <td style={{ fontWeight: 700, color: "#4F46E5", fontFamily: "var(--font-mono)" }}>
                          {ord.subOrderNo || ord.orderNo || "N/A"}
                        </td>
                        <td>
                          <span
                            className={(ord.paymentType || "COD").toUpperCase() === "COD" ? "tag-pill badge-amber" : "tag-pill badge-emerald"}
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {(ord.paymentType || "COD").toUpperCase() === "COD" ? <><BanknotesIcon size={12} /> COD</> : <><CreditCardIcon size={12} /> Prepaid</>}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748B", fontFamily: "var(--font-mono)" }}>
                          {ord.orderDate || "N/A"}
                        </td>
                        <td>
                          <span className="tag-pill badge-slate" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
                            {ord.sku || "N/A"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: ord.qty > 1 ? "#D97706" : "#059669" }}>
                          {ord.qty || 1}
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#475569" }}>
                          {ord.state || selectedCustomer.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedCustomer(null)}
                style={{ padding: "8px 22px", fontSize: "0.85rem" }}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
