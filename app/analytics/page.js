"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

import {
  ZapIcon,
  SmartphoneIcon,
  MonitorIcon,
  CalendarIcon,
  StoreIcon,
  TagIcon,
  TargetIcon,
  PackageIcon,
  TrendingUpIcon,
  BarChartIcon,
  UsersIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
} from "../components/Icons";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState(null);

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

  async function fetchAnalytics() {
    if (!session?.user?.email) return;
    if (!data) setLoading(true);
    try {
      const userEmail = session.user.email;
      const res = await fetch(
        `${BACKEND_URL}/api/analytics?email=${encodeURIComponent(userEmail)}`,
        {
          headers: { "x-user-email": userEmail },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchAnalytics();
    }
  }, [status, session?.user?.email]);

  async function handleSimulateScan() {
    if (!session?.user?.email) {
      showToast("Please log in first", "error");
      return;
    }
    setSimulating(true);
    try {
      const userEmail = session.user.email;
      const sampleSkus = [
        "CHHANDO_4_pieces",
        "KERI_6_piece",
        "kaka_kuva_4_pieces",
        "LOVE_BIRDS_4_pieces",
        "Lovender_Goto_7_pieces",
      ];
      const randomSku = sampleSkus[Math.floor(Math.random() * sampleSkus.length)];
      const randomOrder = `324${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;

      const res = await fetch(`${BACKEND_URL}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          orderNo: randomOrder,
          sku: randomSku,
          targetUrl: "https://www.meesho.com/themahirenterprise",
        }),
      });

      if (!res.ok) throw new Error("Simulation failed");

      showToast(`Live QR Scan recorded for SKU: ${randomSku}!`, "success");
      fetchAnalytics();
    } catch (err) {
      showToast(err.message || "Failed to record scan", "error");
    } finally {
      setSimulating(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "40px 0", color: "var(--text-silver)", fontSize: "0.9rem" }}>
        Aggregating QR scan analytics from MongoDB...
      </div>
    );
  }

  const maxDaily = Math.max(...(data?.dailyTimeline?.map((d) => d.count) || [1]), 1);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 60, position: "relative", width: "100%", maxWidth: "100%" }}>
      {/* Toast */}
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

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="heading-display" style={{ fontSize: "1.6rem", color: "var(--text-pure)", margin: 0 }}>
              QR Scan Analytics & Insights
            </h1>
            <span className="tag-pill active" style={{ fontSize: "0.72rem", padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-emerald)", boxShadow: "0 0 8px var(--accent-emerald)" }} />
              Live Tracking Engine
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0 }}>
            Real-time conversion metrics on how many buyers scan your package QR codes, date-wise engagement, and top-converting SKUs.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={handleSimulateScan}
            disabled={simulating}
            style={{ fontSize: "0.85rem", padding: "10px 18px", borderColor: "var(--aurora-2)", color: "var(--aurora-1)", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <SmartphoneIcon /> {simulating ? "Recording..." : "Test Simulate QR Scan"}
          </button>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 22px" }}>
            ← Back to Studio
          </Link>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total Scans */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total QR Scans
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-pure)", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.totalScans || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--aurora-1)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ZapIcon /> All-time customer engagements
          </span>
        </div>

        {/* Unique Orders Scanned */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Unique Orders Scanned
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.uniqueOrders || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <PackageIcon /> Distinct customer parcel scans
          </span>
        </div>

        {/* Today's Scans */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Today's Live Scans
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.todayScans || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon /> Scanned in the last 24 hours
          </span>
        </div>

        {/* Top Destination */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Primary Traffic Channel
          </span>
          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-pure)", marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Meesho Store
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--aurora-1)", marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <StoreIcon /> Highest customer repeat channel
          </span>
        </div>
      </div>

      {/* Date-wise Daily Scan Timeline Histogram */}
      {/* Date-wise Daily Scan Timeline Histogram */}
      <div className="premium-glass" style={{ marginBottom: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "#0F172A", margin: "0 0 4px 0", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <CalendarIcon /> Date-wise Scan Volume (Last 7 Days)
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
              Daily breakdown of how many buyers scanned parcel QR codes.
            </p>
          </div>
          <span className="tag-pill active" style={{ fontSize: "0.75rem" }}>
            Daily Timeline
          </span>
        </div>

        {/* Histogram Bars */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data?.dailyTimeline?.length || 7}, 1fr)`, gap: 12, alignItems: "flex-end", minHeight: 180, minWidth: 320, padding: "24px 16px 14px", background: "#F8FAFC", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          {data?.dailyTimeline?.map((day) => {
            const heightPercent = Math.max(14, Math.round((day.count / maxDaily) * 100));
            return (
              <div key={day.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: day.count > 0 ? "#4F46E5" : "#94A3B8" }}>
                  {day.count}
                </span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 44,
                    height: `${heightPercent}%`,
                    minHeight: 16,
                    background: day.count > 0 ? "linear-gradient(180deg, #4F46E5 0%, #0284C7 100%)" : "#E2E8F0",
                    borderRadius: "8px 8px 4px 4px",
                    boxShadow: day.count > 0 ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "#64748B", textAlign: "center", whiteSpace: "nowrap", marginTop: 4, fontWeight: 600 }}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Top Scanned SKUs (Left) & Channel Breakdown (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 20, marginBottom: 24 }}>
        {/* Top Scanned SKUs */}
        <div className="premium-glass">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "#0F172A", margin: "0 0 4px 0", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <TagIcon /> Top Converting SKUs
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                Products that generate the most repeat QR scans.
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
              By Scan Volume
            </span>
          </div>

          {(!data?.topSkus || data.topSkus.length === 0) ? (
            <div style={{ padding: "40px 10px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
              No SKU scan data recorded yet. Click "Test Simulate QR Scan" to log sample scans!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.topSkus.map((item, idx) => (
                <div key={item.sku} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>
                      #{idx + 1} {item.sku}
                    </span>
                    <strong style={{ color: "#4F46E5", fontFamily: "var(--font-mono)" }}>
                      {item.count} scans ({item.percent}%)
                    </strong>
                  </div>
                  <div style={{ width: "100%", height: 7, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${item.percent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #4F46E5, #0284C7)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Destination Channels */}
        <div className="premium-glass">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "#0F172A", margin: "0 0 4px 0", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <TargetIcon /> Destination Channels
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#64748B", margin: 0 }}>
                Distribution of where scanned customers are directed.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data?.destinations?.map((dest) => (
              <div key={dest.name} style={{ background: "#F8FAFC", padding: "14px 18px", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0F172A" }}>
                    {dest.name}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {dest.count} visits ({dest.percent}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: 7, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${dest.percent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #059669, #10B981)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Realtime Scans Feed Table */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ZapIcon /> Realtime Scan Feed
          </div>
          <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
            Showing recent parcel scans logged in MongoDB
          </span>
        </div>

        {(!data?.recentScans || data.recentScans.length === 0) ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
            No recent scans recorded yet.
          </div>
        ) : (
          <div className="table-responsive-container" style={{ border: "none" }}>
            <table className="custom-table" style={{ minWidth: "920px" }}>
              <thead>
                <tr>
                  <th style={{ width: "180px", paddingLeft: "16px" }}>Scan Time</th>
                  <th style={{ width: "210px" }}>Order Number</th>
                  <th style={{ width: "180px" }}>SKU Code</th>
                  <th style={{ width: "130px" }}>Device</th>
                  <th style={{ width: "220px" }}>Target URL</th>
                  <th style={{ width: "110px", paddingRight: "16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentScans.map((s) => {
                  const timeStr = s.createdAt ? new Date(s.createdAt).toLocaleString("en-IN") : "Just now";
                  return (
                    <tr key={s.id}>
                      <td style={{ color: "#64748B", fontSize: "0.82rem", fontFamily: "var(--font-mono)", paddingLeft: "16px" }}>
                        {timeStr}
                      </td>
                      <td style={{ fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                        {s.orderNo}
                      </td>
                      <td>
                        <span className="tag-pill badge-slate" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
                          {s.sku}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                        {s.isMobile ? <><SmartphoneIcon /> Mobile</> : <><MonitorIcon /> Desktop</>}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#0284C7", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.targetUrl}
                      </td>
                      <td style={{ paddingRight: "16px" }}>
                        <span className="tag-pill badge-emerald" style={{ fontSize: "0.72rem", padding: "3px 9px" }}>
                          Redirected
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
