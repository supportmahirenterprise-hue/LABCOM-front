"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../components/Modal";

function PackageIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function RefreshIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function TruckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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

function LocationIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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

function FileTextIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

function UserIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ZapIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

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
  const [selectedSku, setSelectedSku] = useState("ALL");
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
    if (!data) setLoading(true);
    try {
      const userEmail = session.user.email;
      const queryParams = new URLSearchParams({
        email: userEmail,
        search: search.trim(),
        type: selectedType,
        state: selectedState,
        sku: selectedSku,
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
  }, [status, session?.user?.email, selectedType, selectedState, selectedSku, currentPage, pageSize]);

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

  const returnsList = useMemo(() => {
    let list = data?.returns || [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.subOrderNo && r.subOrderNo.toLowerCase().includes(q)) ||
          (r.sku && r.sku.toLowerCase().includes(q)) ||
          (r.customerName && r.customerName.toLowerCase().includes(q)) ||
          (r.customerAddress && r.customerAddress.toLowerCase().includes(q)) ||
          (r.awbNumber && r.awbNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.returns, search]);

  const summary = data?.summary || {};
  const pagination = data?.pagination || {};

  useEffect(() => {
    if (showUploadModal || selectedReturn) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUploadModal, selectedReturn]);

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
              <PackageIcon size={22} />
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
        {/* Total Returns Count */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #D97706", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Total Return Parcels
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
              <PackageIcon size={16} />
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#D97706", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.totalReturns || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#B45309", fontWeight: 600, marginTop: 4, display: "block" }}>
            Total reverse logistics parcels stored
          </span>
        </div>

        {/* Customer Returns (First Return) */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #DC2626", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Customer Returns
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#FEE2E2", border: "1px solid #FCA5A5", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
              <RefreshIcon size={16} />
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#DC2626", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.customerReturnsCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#B91C1C", fontWeight: 600, marginTop: 4, display: "block" }}>
            Buyer initiated customer returns
          </span>
        </div>

        {/* Courier Returns (RTO) */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #0284C7", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Courier RTO (Undelivered)
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#E0F2FE", border: "1px solid #BAE6FD", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7" }}>
              <TruckIcon size={16} />
            </div>
          </div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0284C7", marginTop: 8, fontFamily: "var(--font-display)" }}>
            {summary.rtoCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#0369A1", fontWeight: 600, marginTop: 4, display: "block" }}>
            Undelivered courier RTO returns
          </span>
        </div>

        {/* Top Returned SKU */}
        <div className="premium-glass" style={{ padding: "22px 20px", borderTop: "3px solid #7C3AED", background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Top Returned SKU
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "10px", background: "#F3E8FF", border: "1px solid #E9D5FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>
              <AlertTriangleIcon size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#7C3AED", marginTop: 10, wordBreak: "break-all" }}>
            {summary.topReturnedSku?.name || "N/A"}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#6D28D9", fontWeight: 600, marginTop: 4, display: "block" }}>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ position: "absolute", left: 14, pointerEvents: "none" }}>
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

          {/* Type Filter Buttons */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div className="segmented-control">
              <button
                className={`segmented-tab ${selectedType === "ALL" ? "active" : ""}`}
                onClick={() => { setSelectedType("ALL"); setCurrentPage(1); }}
              >
                All Returns ({summary.totalReturns || 0})
              </button>
              <button
                className={`segmented-tab ${selectedType === "Customer Return" ? "active" : ""}`}
                onClick={() => { setSelectedType("Customer Return"); setCurrentPage(1); }}
              >
                Customer Returns ({summary.customerReturnsCount || 0})
              </button>
              <button
                className={`segmented-tab ${selectedType === "RTO" ? "active" : ""}`}
                onClick={() => { setSelectedType("RTO"); setCurrentPage(1); }}
              >
                Courier RTO ({summary.rtoCount || 0})
              </button>
            </div>

            {/* SKU Dropdown Filter */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <select
                className="select-light"
                value={selectedSku}
                onChange={(e) => {
                  setSelectedSku(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  maxWidth: "280px",
                }}
              >
                <option value="ALL">
                  All SKUs ({summary.totalReturns || 0})
                </option>
                {(summary.allSkusWithCounts || []).map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.label || `${s.name} (${s.count})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table Card */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PackageIcon size={18} />
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
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#64748B", fontSize: "0.88rem" }}>
            No return records found matching the criteria. Click "Upload Return CSV / Excel" above to import return data.
          </div>
        ) : (
          <div className="table-responsive-container" style={{ borderRadius: "0 0 16px 16px", border: "none" }}>
            <table className="custom-table" style={{ minWidth: "1100px" }}>
              <thead>
                <tr>
                  <th style={{ width: "45px", paddingLeft: "16px" }}>#</th>
                  <th style={{ width: "18%" }}>SUB ORDER ID / ORDER NO</th>
                  <th style={{ width: "13%" }}>RETURN TYPE</th>
                  <th style={{ width: "14%" }}>SKU / PRODUCT</th>
                  <th style={{ width: "6%", textAlign: "center" }}>QTY</th>
                  <th style={{ width: "18%" }}>RETURN REASON</th>
                  <th style={{ width: "15%" }}>CUSTOMER NAME & MOBILE</th>
                  <th style={{ width: "10%" }}>STATE</th>
                  <th style={{ width: "12%" }}>COURIER & AWB</th>
                  <th style={{ width: "10%", paddingRight: "16px" }}>DATE</th>
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
                      <td style={{ color: "#94A3B8", fontSize: "0.8rem", fontFamily: "var(--font-mono)", paddingLeft: "16px" }}>
                        {globalIdx}
                      </td>

                      {/* Sub Order ID */}
                      <td>
                        <div style={{ fontWeight: 700, color: "#4F46E5", fontSize: "0.84rem", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                          {r.subOrderNo}
                        </div>
                        {r.orderNo !== r.subOrderNo && (
                          <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 2, wordBreak: "break-all" }}>
                            Order: {r.orderNo}
                          </div>
                        )}
                      </td>

                      {/* Return Type Badge */}
                      <td>
                        <span
                          className={`tag-pill ${isRto ? "badge-amber" : "badge-rose"}`}
                          style={{
                            fontSize: "0.74rem",
                            padding: "3px 9px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {isRto ? <><TruckIcon size={12} /> Courier RTO</> : <><RefreshIcon size={12} /> Customer Return</>}
                        </span>
                      </td>

                      {/* SKU */}
                      <td>
                        <span className="tag-pill badge-slate" style={{ fontSize: "0.75rem", padding: "3px 8px", fontWeight: 700 }}>
                          {r.sku}
                        </span>
                      </td>

                      {/* Qty */}
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#0F172A", fontSize: "0.85rem" }}>
                        {r.qty}
                      </td>

                      {/* Return Reason */}
                      <td style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4, wordBreak: "break-word" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{r.returnReason}</div>
                        {r.detailedReturnReason && r.detailedReturnReason !== r.returnReason && (
                          <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: 2 }}>
                            {r.detailedReturnReason}
                          </div>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div style={{ fontWeight: 600, color: "#0F172A", fontSize: "0.84rem" }}>
                          {r.customerName}
                        </div>
                        {r.customerMobile !== "N/A" && (
                          <div style={{ fontSize: "0.76rem", color: "#0284C7", fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: 2, display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <PhoneIcon size={11} /> {r.customerMobile}
                          </div>
                        )}
                      </td>

                      {/* State */}
                      <td>
                        <span className="tag-pill badge-sky" style={{ fontSize: "0.74rem", padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <LocationIcon size={12} /> {r.state}
                        </span>
                      </td>

                      {/* Courier & AWB */}
                      <td>
                        <div style={{ fontSize: "0.82rem", color: "#0284C7", fontWeight: 600 }}>
                          {r.courierPartner}
                        </div>
                        {r.awbNumber !== "N/A" && (
                          <div style={{ fontSize: "0.74rem", color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            AWB: {r.awbNumber}
                          </div>
                        )}
                      </td>

                      {/* Return Date */}
                      <td style={{ fontSize: "0.8rem", color: "#64748B", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", paddingRight: "16px" }}>
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
            <div style={{ fontSize: "0.84rem", color: "#475569" }}>
              Showing{" "}
              <strong style={{ color: "#4F46E5" }}>
                {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "#4F46E5" }}>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of <strong style={{ color: "#0F172A" }}>{pagination.total}</strong> return entries
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "#475569" }}>
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="select-light"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.82rem",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="btn-secondary"
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.8rem",
                  }}
                >
                  «
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="btn-secondary"
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Prev
                </button>
                <span style={{ fontSize: "0.84rem", color: "#4F46E5", padding: "0 8px", fontWeight: 700 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  className="btn-secondary"
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  className="btn-secondary"
                  style={{
                    padding: "5px 10px",
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
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth={560}
        style={{ padding: "26px 30px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>
          <div>
            <h3 className="heading-display" style={{ fontSize: "1.25rem", color: "#0F172A", margin: 0 }}>
              Upload Return CSV Report
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "4px 0 0 0" }}>
              Imports Meesho / Valmo / Shadowfax / Xpressbees return reports and updates DB.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(false)}
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "50%", width: 34, height: 34, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CloseIcon />
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
              border: "2px dashed #CBD5E1",
              borderRadius: "16px",
              background: "#F8FAFC",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ color: "#D97706", marginBottom: 10 }}>
              <FileTextIcon size={36} />
            </div>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
              Click or drag Meesho Return CSV / Excel file here
            </span>
            <span style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 6 }}>
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

        <div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: "1.5" }}>
          <strong style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#4F46E5" }}><ZapIcon size={13} /> Automatic Overwrite:</strong> Existing return records with the same Sub Order ID will be automatically updated with new tracking and delivery details.
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
      </Modal>

      {/* Return Record Details Modal */}
      <Modal
        isOpen={Boolean(selectedReturn)}
        onClose={() => setSelectedReturn(null)}
        maxWidth={680}
        style={{ padding: "26px 30px" }}
      >
        {selectedReturn && (
          <>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid #E2E8F0", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 className="heading-display" style={{ fontSize: "1.3rem", color: "#0F172A", margin: 0 }}>
                    Return Parcel Log Details
                  </h2>
                  <span
                    className={/RTO|Courier/i.test(selectedReturn.returnType) ? "badge-amber" : "badge-rose"}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {selectedReturn.returnType}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#0284C7", marginTop: 6, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Sub Order ID: <strong>{selectedReturn.subOrderNo}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Product Info */}
              <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                  Product / SKU Info
                </span>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#4F46E5", marginTop: 4 }}>
                  {selectedReturn.sku}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                  Qty: <strong>{selectedReturn.qty}</strong>
                </div>
                {selectedReturn.productName && (
                  <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 4 }}>
                    {selectedReturn.productName}
                  </div>
                )}
              </div>

              {/* Return Reason */}
              <div style={{ background: "#FEE2E2", padding: "14px 16px", borderRadius: "12px", border: "1px solid #FCA5A5" }}>
                <span style={{ fontSize: "0.72rem", color: "#991B1B", textTransform: "uppercase", fontWeight: 700 }}>
                  Return Reason
                </span>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#B91C1C", marginTop: 4 }}>
                  {selectedReturn.returnReason}
                </div>
                {selectedReturn.detailedReturnReason && (
                  <div style={{ fontSize: "0.78rem", color: "#7F1D1D", marginTop: 4 }}>
                    {selectedReturn.detailedReturnReason}
                  </div>
                )}
              </div>
            </div>

            {/* Matched Customer Info */}
            <div style={{ background: "#F8FAFC", padding: "16px 18px", borderRadius: "14px", border: "1px solid #E2E8F0", marginBottom: 20 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4F46E5", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <UserIcon size={14} /> Matched Buyer & Delivery Address (From DB)
              </div>
              <div style={{ fontSize: "0.88rem", color: "#0F172A", fontWeight: 700, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <span>Buyer Name: {selectedReturn.customerName}</span>
                {selectedReturn.customerMobile !== "N/A" && (
                  <span style={{ color: "#0284C7", fontFamily: "var(--font-mono)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <PhoneIcon size={12} /> {selectedReturn.customerMobile}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <LocationIcon size={13} /> State: {selectedReturn.state} | District: {selectedReturn.district}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <HomeIcon size={13} /> Full Address: {selectedReturn.customerAddress}
              </div>
            </div>

            {/* Courier & Tracking Links */}
            <div style={{ background: "#F8FAFC", padding: "16px 18px", borderRadius: "14px", border: "1px solid #E2E8F0", marginBottom: 20 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0284C7", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <TruckIcon size={14} /> Reverse Logistics & Courier Info
              </div>
              <div style={{ fontSize: "0.84rem", color: "#475569" }}>
                Courier: <strong style={{ color: "#0284C7" }}>{selectedReturn.courierPartner}</strong> | AWB: <strong style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}>{selectedReturn.awbNumber}</strong>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>
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
                    style={{ fontSize: "0.78rem", padding: "6px 14px", color: "#0284C7", borderColor: "#BAE6FD", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <ExternalLinkIcon size={13} /> Track Courier Shipment
                  </a>
                )}
                {selectedReturn.proofOfDelivery && (
                  <a
                    href={selectedReturn.proofOfDelivery}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: "0.78rem", padding: "6px 14px", color: "#059669", borderColor: "#A7F3D0", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <FileTextIcon size={13} /> View Proof of Delivery (POD)
                  </a>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
              <button
                onClick={() => handleDeleteReturn(selectedReturn.id)}
                style={{
                  background: "#FEE2E2",
                  border: "1px solid #FCA5A5",
                  color: "#DC2626",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <TrashIcon size={14} /> Delete Entry
              </button>

              <button
                className="btn-secondary"
                onClick={() => setSelectedReturn(null)}
                style={{ padding: "8px 22px", fontSize: "0.85rem" }}
              >
                Close Details
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
