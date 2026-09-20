"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export default function ReturnsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  async function fetchReturnsData() {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const userEmail = session.user.email;
      const queryParams = new URLSearchParams({
        email: userEmail,
        search: search.trim(),
        type: selectedType,
        state: selectedState,
        page: String(currentPage),
        limit: String(pageSize),
      });

      const res = await fetch(
        `${BACKEND_URL}/api/returns?${queryParams.toString()}`,
        {
          headers: { "x-user-email": userEmail },
        }
      );

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showToast("Failed to load return records", "error");
      }
    } catch (err) {
      console.error("Failed to fetch returns:", err);
      showToast("Error connecting to backend server", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchReturnsData();
    }
  }, [status, session, selectedType, selectedState, currentPage, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReturnsData();
  };

  async function handleFileUpload(file) {
    if (!file) return;
    if (!session?.user?.email) {
      showToast("Please log in first to upload return CSV", "error");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${BACKEND_URL}/api/returns/upload`, {
        method: "POST",
        headers: { "x-user-email": session.user.email },
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        showToast(result.message || "Return CSV imported successfully!", "success");
        setShowUploadModal(false);
        setCurrentPage(1);
        fetchReturnsData();
      } else {
        showToast(result.error || "Failed to process return CSV file", "error");
      }
    } catch (err) {
      console.error("CSV Upload error:", err);
      showToast("Error uploading return CSV file", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteReturn(id) {
    if (!id || !confirm("Are you sure you want to delete this return record?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/returns?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-email": session?.user?.email || "" },
      });
      if (res.ok) {
        showToast("Return entry deleted successfully", "success");
        if (selectedReturn?.id === id) setSelectedReturn(null);
        fetchReturnsData();
      } else {
        showToast("Failed to delete return entry", "error");
      }
    } catch (err) {
      console.error("Delete return error:", err);
      showToast("Error deleting return entry", "error");
    }
  }

  const returnsList = data?.returns || [];
  const summary = data?.summary || {};
  const pagination = data?.pagination || {};

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
            zIndex: 99999,
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
                width: 44,
                height: 44,
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.2)",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>📦</span>
            </div>
            <div>
              <h1 className="heading-display" style={{ fontSize: "1.65rem", color: "var(--text-pure)", margin: 0, letterSpacing: "-0.01em" }}>
                Return Entry & Reverse Logistics Management
              </h1>
              <p style={{ fontSize: "0.83rem", color: "var(--text-silver)", marginTop: 4, marginBottom: 0 }}>
                Upload supplier return CSV files to auto-match Customer Delivery Addresses, SKUs, Reasons, and tracking links.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={() => setShowUploadModal(true)}
            style={{
              fontSize: "0.88rem",
              padding: "10px 22px",
              background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.35)",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Return CSV / Excel
          </button>

          <button
            className="btn-secondary"
            onClick={fetchReturnsData}
            style={{ fontSize: "0.85rem", padding: "10px 18px", borderColor: "var(--aurora-2)", color: "var(--aurora-1)", display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* 4 Premium Stat KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total Returns Logged */}
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
              Total Return Parcels
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(245, 158, 11, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.9rem" }}>📦</span>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#fbbf24", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.totalReturns || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#fbbf24", marginTop: 6, display: "block" }}>
            Total reverse logistics parcels stored
          </span>
        </div>

        {/* Customer Returns (First Return) */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid #ef4444",
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Customer Returns
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(239, 68, 68, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.9rem" }}>🔄</span>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "#f87171", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.customerReturnsCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#f87171", marginTop: 6, display: "block" }}>
            Buyer initiated customer returns
          </span>
        </div>

        {/* Courier Returns (RTO) */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid var(--aurora-1)",
            background: "linear-gradient(180deg, rgba(0, 242, 254, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Courier RTO (Undelivered)
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(0, 242, 254, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.9rem" }}>🚚</span>
            </div>
          </div>
          <div style={{ fontSize: "2.1rem", fontWeight: 800, color: "var(--aurora-1)", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.rtoCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--aurora-1)", marginTop: 6, display: "block" }}>
            Undelivered courier RTO returns
          </span>
        </div>

        {/* Top Returned SKU */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            borderTop: "2px solid #a855f7",
            background: "linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Top Returned SKU
            </span>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(168, 85, 247, 0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.9rem" }}>⚠️</span>
            </div>
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#c084fc", marginTop: 10, wordBreak: "break-all" }}>
            {summary.topReturnedSku?.name || "N/A"}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4, display: "block" }}>
            {summary.topReturnedSku ? `${summary.topReturnedSku.count} returns logged` : "No returns data"}
          </span>
        </div>
      </div>

      {/* Controls Section: Search Bar + Type Filter + Upload Button */}
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
                placeholder="Search Sub Order ID, Order No, SKU, Customer, Mobile, Reason, AWB..."
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

          {/* Type Filter Buttons */}
          <div style={{ display: "flex", gap: 6, background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
            <button
              onClick={() => { setSelectedType("ALL"); setCurrentPage(1); }}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: selectedType === "ALL" ? "rgba(0, 242, 254, 0.15)" : "transparent",
                color: selectedType === "ALL" ? "var(--aurora-1)" : "var(--text-silver)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              All Returns ({summary.totalReturns || 0})
            </button>
            <button
              onClick={() => { setSelectedType("Customer Return"); setCurrentPage(1); }}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: selectedType === "Customer Return" ? "rgba(239, 68, 68, 0.2)" : "transparent",
                color: selectedType === "Customer Return" ? "#f87171" : "var(--text-silver)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Customer Returns ({summary.customerReturnsCount || 0})
            </button>
            <button
              onClick={() => { setSelectedType("RTO"); setCurrentPage(1); }}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: selectedType === "RTO" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                color: selectedType === "RTO" ? "#fbbf24" : "var(--text-silver)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Courier RTO ({summary.rtoCount || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Returns Table Card */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.1rem" }}>📦</span>
            <span style={{ fontSize: "0.98rem", fontWeight: 700, color: "var(--text-pure)" }}>
              Return Shipments Directory
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-silver)" }}>
            Click on any row to view complete tracking links & customer address
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-silver)", fontSize: "0.9rem" }}>
            ⏳ Loading return shipment records...
          </div>
        ) : returnsList.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.88rem" }}>
            No return records found matching the criteria. Click "Upload Return CSV / Excel" above to import return data.
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", borderRadius: "0 0 16px 16px" }}>
            <table className="custom-table" style={{ width: "100%", minWidth: "1280px" }}>
              <thead>
                <tr>
                  <th style={{ width: "45px", minWidth: "45px" }}>#</th>
                  <th style={{ minWidth: "180px" }}>SUB ORDER ID / ORDER NO</th>
                  <th style={{ minWidth: "135px" }}>RETURN TYPE</th>
                  <th style={{ minWidth: "140px" }}>SKU / PRODUCT</th>
                  <th style={{ minWidth: "50px", textAlign: "center" }}>QTY</th>
                  <th style={{ minWidth: "190px" }}>RETURN REASON</th>
                  <th style={{ minWidth: "160px" }}>CUSTOMER NAME & MOBILE</th>
                  <th style={{ minWidth: "125px" }}>STATE / DISTRICT</th>
                  <th style={{ minWidth: "150px" }}>COURIER & AWB</th>
                  <th style={{ minWidth: "125px", whiteSpace: "nowrap", paddingRight: "24px" }}>RETURN DATE</th>
                </tr>
              </thead>
              <tbody>
                {returnsList.map((r, idx) => {
                  const globalIdx = (pagination.page - 1) * pagination.limit + idx + 1;
                  const isRto = /RTO|Courier/i.test(r.returnType || "");
                  return (
                    <tr
                      key={r.id || idx}
                      onClick={() => setSelectedReturn(r)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {globalIdx}
                      </td>

                      {/* Sub Order ID */}
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--aurora-1)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                          {r.subOrderNo}
                        </div>
                        {r.orderNo !== r.subOrderNo && (
                          <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", marginTop: 2 }}>
                            Order: {r.orderNo}
                          </div>
                        )}
                      </td>

                      {/* Return Type Badge */}
                      <td>
                        <span
                          className="tag-pill"
                          style={{
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            fontWeight: 700,
                            background: isRto ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            border: isRto ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                            color: isRto ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {isRto ? "🚚 Courier RTO" : "🔄 Customer Return"}
                        </span>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className="tag-pill" style={{ fontSize: "0.78rem", padding: "3px 8px", background: "rgba(255, 255, 255, 0.06)", fontWeight: 700 }}>
                          {r.sku}
                        </span>
                      </td>

                      {/* Qty */}
                      <td style={{ textAlign: "center", fontWeight: 700, color: "var(--text-pure)" }}>
                        {r.qty}
                      </td>

                      {/* Return Reason */}
                      <td style={{ fontSize: "0.82rem", color: "var(--text-silver)", whiteSpace: "normal", wordBreak: "break-word" }}>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{r.returnReason}</div>
                        {r.detailedReturnReason && r.detailedReturnReason !== r.returnReason && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 2 }}>
                            {r.detailedReturnReason}
                          </div>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-pure)", fontSize: "0.84rem" }}>
                          {r.customerName}
                        </div>
                        {r.customerMobile !== "N/A" && (
                          <div style={{ fontSize: "0.76rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            📞 {r.customerMobile}
                          </div>
                        )}
                      </td>

                      {/* State */}
                      <td>
                        <span className="tag-pill" style={{ fontSize: "0.75rem", padding: "3px 8px", background: "rgba(0, 242, 254, 0.08)", border: "1px solid rgba(0, 242, 254, 0.2)", color: "var(--aurora-1)" }}>
                          📍 {r.state}
                        </span>
                      </td>

                      {/* Courier & AWB */}
                      <td>
                        <div style={{ fontSize: "0.82rem", color: "#38bdf8", fontWeight: 600 }}>
                          {r.courierPartner}
                        </div>
                        {r.awbNumber !== "N/A" && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            AWB: {r.awbNumber}
                          </div>
                        )}
                      </td>

                      {/* Return Date */}
                      <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", paddingRight: "24px" }}>
                        {r.deliveredDate || r.returnCreatedDate || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive Pagination Bar */}
        {returnsList.length > 0 && (
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
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "var(--aurora-1)" }}>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of <strong style={{ color: "var(--text-pure)" }}>{pagination.total}</strong> return entries
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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

              {/* Navigation Buttons */}
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
                <span style={{ fontSize: "0.82rem", color: "var(--aurora-1)", padding: "0 8px", fontWeight: 700 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage >= pagination.totalPages ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage >= pagination.totalPages ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage >= pagination.totalPages ? "not-allowed" : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--glass-border)",
                    background: currentPage >= pagination.totalPages ? "transparent" : "rgba(255, 255, 255, 0.05)",
                    color: currentPage >= pagination.totalPages ? "var(--text-dim)" : "var(--text-pure)",
                    cursor: currentPage >= pagination.totalPages ? "not-allowed" : "pointer",
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

      {/* CSV Upload Modal */}
      {showUploadModal && (
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
              maxWidth: 540,
              padding: "28px 30px",
              borderRadius: "22px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(245,158,11,0.2)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              background: "rgba(18, 18, 24, 0.98)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 16 }}>
              <div>
                <h3 className="heading-display" style={{ fontSize: "1.25rem", color: "#fff", margin: 0 }}>
                  Upload Return CSV Report
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-silver)", margin: "4px 0 0 0" }}>
                  Imports Meesho / Valmo / Shadowfax / Xpressbees return reports and updates DB.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="csvFileInput"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "36px 20px",
                  border: "2px dashed rgba(245, 158, 11, 0.5)",
                  borderRadius: "16px",
                  background: "rgba(245, 158, 11, 0.05)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "2.4rem", marginBottom: 10 }}>📄</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fef08a" }}>
                  Click or drag Meesho Return CSV / Excel file here
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 6 }}>
                  Supports CSV reports containing Sub Order IDs, Return Reasons, and Tracking Links
                </span>
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: "1.5" }}>
              <strong>⚡ Automatic Overwrite:</strong> Existing return records with the same Sub Order ID will be automatically updated with new tracking and delivery details.
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                className="btn-secondary"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                style={{ padding: "8px 20px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Record Details Modal */}
      {selectedReturn && (
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
              maxWidth: 680,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 className="heading-display" style={{ fontSize: "1.3rem", color: "var(--text-pure)", margin: 0 }}>
                    Return Parcel Log Details
                  </h2>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      background: /RTO|Courier/i.test(selectedReturn.returnType) ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: /RTO|Courier/i.test(selectedReturn.returnType) ? "#f59e0b" : "#ef4444",
                      border: "1px solid var(--glass-border)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {selectedReturn.returnType}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--aurora-1)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  Sub Order ID: <strong>{selectedReturn.subOrderNo}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#ffffff",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Product Info */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
                  Product / SKU Info
                </span>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--aurora-1)", marginTop: 4 }}>
                  {selectedReturn.sku}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4 }}>
                  Qty: <strong>{selectedReturn.qty}</strong>
                </div>
                {selectedReturn.productName && (
                  <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4 }}>
                    {selectedReturn.productName}
                  </div>
                )}
              </div>

              {/* Return Reason */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
                  Return Reason
                </span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f87171", marginTop: 4 }}>
                  {selectedReturn.returnReason}
                </div>
                {selectedReturn.detailedReturnReason && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4 }}>
                    {selectedReturn.detailedReturnReason}
                  </div>
                )}
              </div>
            </div>

            {/* Matched Customer Info */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 18px", borderRadius: "14px", border: "1px solid var(--glass-border)", marginBottom: 20 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--aurora-1)", marginBottom: 8, textTransform: "uppercase" }}>
                👤 Matched Buyer & Delivery Address (From DB)
              </div>
              <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 700 }}>
                Buyer Name: {selectedReturn.customerName}
                {selectedReturn.customerMobile !== "N/A" && (
                  <span style={{ marginLeft: 12, color: "var(--aurora-1)", fontFamily: "var(--font-mono)" }}>
                    📞 {selectedReturn.customerMobile}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-silver)", marginTop: 6, lineHeight: 1.45 }}>
                📍 State: {selectedReturn.state} | District: {selectedReturn.district}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-silver)", marginTop: 4, lineHeight: 1.45 }}>
                🏠 Full Address: {selectedReturn.customerAddress}
              </div>
            </div>

            {/* Courier & Tracking Links */}
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px 18px", borderRadius: "14px", border: "1px solid var(--glass-border)", marginBottom: 20 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8", marginBottom: 8, textTransform: "uppercase" }}>
                🚚 Reverse Logistics & Courier Info
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--text-silver)" }}>
                Courier: <strong style={{ color: "#38bdf8" }}>{selectedReturn.courierPartner}</strong> | AWB: <strong style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{selectedReturn.awbNumber}</strong>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 4 }}>
                Return Delivered Date: {selectedReturn.deliveredDate || selectedReturn.returnCreatedDate || "N/A"}
              </div>

              {/* Action Links */}
              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                {selectedReturn.trackingLink && (
                  <a
                    href={selectedReturn.trackingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: "0.78rem", padding: "6px 14px", color: "#38bdf8", borderColor: "#38bdf8" }}
                  >
                    🔗 Track Courier Shipment
                  </a>
                )}
                {selectedReturn.proofOfDelivery && (
                  <a
                    href={selectedReturn.proofOfDelivery}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: "0.78rem", padding: "6px 14px", color: "#10b981", borderColor: "#10b981" }}
                  >
                    📄 View Proof of Delivery (POD)
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
              <button
                onClick={() => handleDeleteReturn(selectedReturn.id)}
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#f87171",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                🗑️ Delete Entry
              </button>

              <button
                className="btn-secondary"
                onClick={() => setSelectedReturn(null)}
                style={{ padding: "8px 22px", fontSize: "0.85rem" }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
