"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export default function CustomerAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
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

      const res = await fetch(
        `${BACKEND_URL}/api/customer-analysis?${queryParams.toString()}`,
        {
          headers: { "x-user-email": userEmail },
        }
      );

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showToast("Failed to load customer analysis data", "error");
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
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid var(--aurora-1)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Unique Buyers
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(0, 242, 254, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--aurora-1)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--text-pure)", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalCustomers || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--aurora-1)", marginTop: 6, display: "block" }}>
            Total unique buyer profiles stored
          </span>
        </div>

        {/* Repeat Customers Count */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid #f59e0b",
            background: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Repeat Buyers (2+ Orders)
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(245, 158, 11, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#fbbf24", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatCustomersCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#fbbf24", marginTop: 6, display: "block" }}>
            Multi-order repeat customers
          </span>
        </div>

        {/* Repeat Rate % */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid var(--accent-emerald)",
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Repeat Retention Rate
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(16, 185, 129, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatRate || 0}%
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 6, display: "block" }}>
            Lifetime customer retention ratio
          </span>
        </div>

        {/* Total Orders Processed */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid #38bdf8",
            background: "linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Orders Logged
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(56, 189, 248, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#38bdf8", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalOrdersProcessed || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 6, display: "block" }}>
            Total shipping parcels logged in DB
          </span>
        </div>
      </div>

      {/* Regional Demand Heatmap Widget (High vs Low Demand District Analysis) */}
      <div className="premium-glass" style={{ marginBottom: 24, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(245, 158, 11, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>
                🗺️ District-Wise Demand Analysis (High vs Low Volume Regions)
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-silver)", margin: "2px 0 0 0" }}>
                Analyze high-performing district order hubs vs emerging low-demand regions.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {/* High Order Volume Hubs */}
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
                🔥 Top High-Volume District Hubs (Highest Demand)
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Top Districts</span>
            </div>
            {(!data?.summary?.allDistrictsWithCounts || data.summary.allDistrictsWithCounts.length === 0) ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>No district data logged yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[...(data.summary.allDistrictsWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((d) => (
                  <div
                    key={d.name}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      color: "#fef08a",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{d.name}</span>
                    <span style={{ background: "#f59e0b", color: "#000", padding: "1px 6px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
                      {d.count} Orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top State Hubs */}
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                Top High-Volume State Hubs
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Top States</span>
            </div>
            {(!data?.summary?.allStatesWithCounts || data.summary.allStatesWithCounts.length === 0) ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>No state data logged yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[...(data.summary.allStatesWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map((s) => (
                  <div
                    key={s.name}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#a7f3d0",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{s.name}</span>
                    <span style={{ background: "#10b981", color: "#000", padding: "1px 6px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" style={{ position: "absolute", left: 14, pointerEvents: "none" }}>
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
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  color: "#ffffff",
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", padding: "4px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--aurora-1)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", fontWeight: 600, whiteSpace: "nowrap" }}>
                State:
              </span>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                style={{
                  padding: "6px 12px",
                  background: "rgba(18, 18, 24, 0.95)",
                  border: "1px solid var(--aurora-1)",
                  borderRadius: "var(--radius-sm)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  outline: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(0, 242, 254, 0.15)",
                }}
              >
                <option value="ALL" style={{ background: "#121218", color: "#fff" }}>
                  All States ({data?.summary?.totalOrdersAll || data?.summary?.totalOrdersProcessed || 0})
                </option>
                {[...(data?.summary?.allStatesWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .map((st) => (
                  <option key={st.name} value={st.name} style={{ background: "#121218", color: "#fff" }}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", padding: "4px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", fontWeight: 600, whiteSpace: "nowrap" }}>
                District:
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  padding: "6px 12px",
                  background: "rgba(18, 18, 24, 0.95)",
                  border: "1px solid #38bdf8",
                  borderRadius: "var(--radius-sm)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  outline: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(56, 189, 248, 0.15)",
                }}
              >
                <option value="ALL" style={{ background: "#121218", color: "#fff" }}>
                  All Districts ({data?.summary?.totalOrdersForSelectedState || 0})
                </option>
                {[...(data?.summary?.allDistrictsWithCounts || [])]
                  .sort((a, b) => b.count - a.count)
                  .map((dst) => (
                  <option key={dst.name} value={dst.name} style={{ background: "#121218", color: "#fff" }}>
                    {dst.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Repeat Customers Filter Segment */}
            <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
              <button
                onClick={() => setRepeatOnly(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: !repeatOnly ? "rgba(0, 242, 254, 0.15)" : "transparent",
                  color: !repeatOnly ? "var(--aurora-1)" : "var(--text-silver)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                All Buyers ({data?.summary?.totalCustomers || 0})
              </button>
              <button
                onClick={() => setRepeatOnly(true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: repeatOnly ? "rgba(245, 158, 11, 0.2)" : "transparent",
                  color: repeatOnly ? "#fbbf24" : "var(--text-silver)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
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
                      </td>
                      <td>
                        <span className="tag-pill" style={{ fontSize: "0.75rem", padding: "3px 8px", background: "rgba(0, 242, 254, 0.08)", border: "1px solid rgba(0, 242, 254, 0.2)", color: "var(--aurora-1)" }}>
                          📍 {c.state}
                        </span>
                      </td>

                      {/* Dedicated District Column */}
                      <td>
                        <span className="tag-pill" style={{ fontSize: "0.78rem", padding: "3px 10px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", fontWeight: 700 }}>
                          🏙️ {c.district || "Central"}
                        </span>
                      </td>

                      {/* Full Address Multi-Line Wrap without truncation */}
                      <td
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-silver)",
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
                            background: c.isRepeat
                              ? "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)"
                              : "rgba(255, 255, 255, 0.06)",
                            border: c.isRepeat
                              ? "1.5px solid #f59e0b"
                              : "1px solid var(--glass-border)",
                            color: c.isRepeat ? "#fef08a" : "var(--text-pure)",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            boxShadow: c.isRepeat ? "0 0 14px rgba(245, 158, 11, 0.35)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {c.isRepeat && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
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

                      <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", paddingRight: "24px" }}>
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
              borderTop: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              background: "rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Page Info */}
            <div style={{ fontSize: "0.82rem", color: "var(--text-silver)" }}>
              Showing{" "}
              <strong style={{ color: "var(--aurora-1)" }}>
                {Math.min((currentPage - 1) * pageSize + 1, data.customers.length)}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "var(--aurora-1)" }}>
                {Math.min(currentPage * pageSize, data.customers.length)}
              </strong>{" "}
              of <strong style={{ color: "var(--text-pure)" }}>{data.customers.length}</strong> customers
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Rows per page selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-silver)" }}>
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-pure)",
                    borderRadius: "var(--radius-sm)",
                    padding: "4px 8px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value={10} style={{ background: "#0f172a" }}>10</option>
                  <option value={25} style={{ background: "#0f172a" }}>25</option>
                  <option value={50} style={{ background: "#0f172a" }}>50</option>
                  <option value={100} style={{ background: "#0f172a" }}>100</option>
                </select>
              </div>

              {/* Page Navigation Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage === 1 ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage === 1 ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage === 1 ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage === 1 ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Prev
                </button>

                {/* Page Buttons List */}
                {Array.from({ length: Math.ceil(data.customers.length / pageSize) }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === Math.ceil(data.customers.length / pageSize) || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && p - prevPage > 1;
                    return (
                      <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {showEllipsis && <span style={{ color: "var(--text-dim)", padding: "0 2px" }}>...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: "var(--radius-sm)",
                            border: p === currentPage ? "1px solid var(--aurora-1)" : "1px solid var(--glass-border)",
                            background: p === currentPage ? "rgba(0, 242, 254, 0.2)" : "rgba(255, 255, 255, 0.03)",
                            color: p === currentPage ? "var(--aurora-1)" : "var(--text-silver)",
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
                  })}

                <button
                  disabled={currentPage >= Math.ceil(data.customers.length / pageSize)}
                  onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(data.customers.length / pageSize), prev + 1))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage >= Math.ceil(data.customers.length / pageSize) ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage >= Math.ceil(data.customers.length / pageSize) ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage >= Math.ceil(data.customers.length / pageSize) ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
                <button
                  disabled={currentPage >= Math.ceil(data.customers.length / pageSize)}
                  onClick={() => setCurrentPage(Math.ceil(data.customers.length / pageSize))}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage >= Math.ceil(data.customers.length / pageSize) ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage >= Math.ceil(data.customers.length / pageSize) ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage >= Math.ceil(data.customers.length / pageSize) ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order History Modal */}
      {selectedCustomer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: 20,
          }}
        >
          <div
            className="premium-glass"
            style={{
              width: "100%",
              maxWidth: 780,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px 30px",
              borderRadius: "22px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(0,242,254,0.2)",
              border: "1px solid var(--glass-border-hover)",
              background: "rgba(18, 18, 24, 0.98)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 className="heading-display" style={{ fontSize: "1.35rem", color: "var(--text-pure)", margin: 0 }}>
                    Order History Log
                  </h2>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      background: selectedCustomer.isRepeat ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.08)",
                      color: selectedCustomer.isRepeat ? "#fef08a" : "var(--text-silver)",
                      border: selectedCustomer.isRepeat ? "1px solid #f59e0b" : "1px solid var(--glass-border)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {selectedCustomer.ordersCountText}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6 }}>
                  Buyer Name: <strong style={{ color: "#fff" }}>{selectedCustomer.name}</strong>
                  {selectedCustomer.mobileNumber !== "N/A" && (
                    <span style={{ marginLeft: 14, color: "var(--aurora-1)", fontFamily: "var(--font-mono)" }}>
                      📞 {selectedCustomer.mobileNumber}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 4, whiteSpace: "normal", wordBreak: "break-word" }}>
                  📍 State: {selectedCustomer.state} | 🏙️ District: {selectedCustomer.district}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 2, whiteSpace: "normal", wordBreak: "break-word" }}>
                  🏠 Address: {selectedCustomer.address}
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  color: "#ffffff",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Order History Table */}
            {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
              <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem" }}>
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
                        <td style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                          {i + 1}
                        </td>
                        <td style={{ fontWeight: 700, color: "var(--aurora-1)", fontFamily: "var(--font-mono)" }}>
                          {ord.subOrderNo || ord.orderNo || "N/A"}
                        </td>
                        <td>
                          <span
                            className="tag-pill"
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              fontWeight: 700,
                              background: (ord.paymentType || "COD").toUpperCase() === "COD" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                              border: (ord.paymentType || "COD").toUpperCase() === "COD" ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(16, 185, 129, 0.4)",
                              color: (ord.paymentType || "COD").toUpperCase() === "COD" ? "#f59e0b" : "#10b981",
                            }}
                          >
                            {(ord.paymentType || "COD").toUpperCase() === "COD" ? "💵 COD" : "💳 Prepaid"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)" }}>
                          {ord.orderDate || "N/A"}
                        </td>
                        <td>
                          <span className="tag-pill" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
                            {ord.sku || "N/A"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: ord.qty > 1 ? "#f59e0b" : "var(--accent-emerald)" }}>
                          {ord.qty || 1}
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-silver)" }}>
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
