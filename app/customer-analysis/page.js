"use client";

import { useState, useEffect } from "react";
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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

  async function fetchCustomerAnalysis() {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const userEmail = session.user.email;
      const queryParams = new URLSearchParams({
        email: userEmail,
        search: search.trim(),
        repeatOnly: repeatOnly ? "true" : "false",
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
  }, [status, session, repeatOnly]);

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

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="heading-display" style={{ fontSize: "1.6rem", color: "var(--text-pure)", margin: 0 }}>
              👥 Customer Analysis & Repeat Order Insights
            </h1>
            <span className="tag-pill active" style={{ fontSize: "0.72rem", padding: "4px 12px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--aurora-1)", boxShadow: "0 0 8px var(--aurora-1)" }} />
              Live DB Sync
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0 }}>
            Automatically tracks buyer names, addresses, phone numbers, and repeat order frequencies across all past & present shipping labels.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={fetchCustomerAnalysis}
            style={{ fontSize: "0.85rem", padding: "10px 18px", borderColor: "var(--aurora-2)", color: "var(--aurora-1)" }}
          >
            🔄 Refresh List
          </button>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 22px" }}>
            ← Back to Studio
          </Link>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total Unique Customers */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Unique Customers
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-pure)", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalCustomers || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--aurora-1)", marginTop: 4, display: "block" }}>
            👤 Total buyers stored in database
          </span>
        </div>

        {/* Repeat Customers Count */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Repeat Buyers (2+ Orders)
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatCustomersCount || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "#fbbf24", marginTop: 4, display: "block" }}>
            🔥 Multi-order repeat buyers
          </span>
        </div>

        {/* Repeat Rate % */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Repeat Customer Rate
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.summary?.repeatRate || 0}%
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4, display: "block" }}>
            📈 Lifetime buyer retention %
          </span>
        </div>

        {/* Total Orders Processed */}
        <div className="premium-glass" style={{ padding: "20px 20px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Orders Logged
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#38bdf8", marginTop: 6, fontFamily: "var(--font-display)" }}>
            {data?.summary?.totalOrdersProcessed || 0}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4, display: "block" }}>
            📦 Total label parcels processed
          </span>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="premium-glass" style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="🔍 Search by Customer Name, Phone, Address, State, or Order No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-md)",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: "10px 18px", fontSize: "0.85rem" }}
            >
              Search
            </button>
          </form>

          {/* Repeat Only Toggle */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setRepeatOnly(false)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid",
                borderColor: !repeatOnly ? "var(--aurora-1)" : "var(--glass-border)",
                background: !repeatOnly ? "rgba(0, 242, 254, 0.12)" : "rgba(0,0,0,0.2)",
                color: !repeatOnly ? "var(--aurora-1)" : "var(--text-silver)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              All Customers ({data?.summary?.totalCustomers || 0})
            </button>
            <button
              onClick={() => setRepeatOnly(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid",
                borderColor: repeatOnly ? "#f59e0b" : "var(--glass-border)",
                background: repeatOnly ? "rgba(245, 158, 11, 0.15)" : "rgba(0,0,0,0.2)",
                color: repeatOnly ? "#fbbf24" : "var(--text-silver)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔥 Repeat Buyers Only ({data?.summary?.repeatCustomersCount || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="premium-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-pure)" }}>
            📋 Customer Master Directory & Repeat History
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-silver)" }}>
            Click on any order count badge to view date-wise order history
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-silver)", fontSize: "0.9rem" }}>
            ⏳ Loading customer records from database...
          </div>
        ) : (!data?.customers || data.customers.length === 0) ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: "0.88rem" }}>
            No customer records found. Process shipping labels in Studio to automatically save customers!
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th style={{ width: "200px" }}>Customer Name</th>
                  <th style={{ width: "140px" }}>Mobile Number</th>
                  <th style={{ width: "130px" }}>State</th>
                  <th style={{ width: "280px" }}>Delivery Address</th>
                  <th style={{ width: "160px", textAlign: "center" }}>Orders Count (Click to View)</th>
                  <th style={{ width: "120px" }}>Last Order Date</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((c, idx) => {
                  return (
                    <tr key={c.id || idx}>
                      <td style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-pure)", fontSize: "0.88rem" }}>
                        {c.name}
                      </td>
                      <td style={{ fontSize: "0.82rem", color: c.mobileNumber !== "N/A" ? "var(--aurora-1)" : "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {c.mobileNumber !== "N/A" ? `📞 ${c.mobileNumber}` : "N/A"}
                      </td>
                      <td>
                        <span className="tag-pill" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
                          📍 {c.state}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--text-silver)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                            padding: "6px 14px",
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
                            boxShadow: c.isRepeat ? "0 0 12px rgba(245, 158, 11, 0.3)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span>{c.isRepeat ? "🔥" : "📦"}</span>
                          <span>{c.ordersCountText}</span>
                          <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>🔍</span>
                        </button>
                      </td>

                      <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)" }}>
                        {c.lastOrderDate || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History Modal / Drawer */}
      {selectedCustomer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
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
              maxWidth: 750,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px 28px",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,242,254,0.2)",
              border: "1px solid var(--glass-border-hover)",
              background: "rgba(18, 18, 24, 0.98)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 className="heading-display" style={{ fontSize: "1.3rem", color: "var(--text-pure)", margin: 0 }}>
                    📜 Customer Order History
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
                  Customer: <strong style={{ color: "#fff" }}>{selectedCustomer.name}</strong>
                  {selectedCustomer.mobileNumber !== "N/A" && (
                    <span style={{ marginLeft: 12, color: "var(--aurora-1)" }}>
                      📞 {selectedCustomer.mobileNumber}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 2 }}>
                  📍 Address: {selectedCustomer.address} ({selectedCustomer.state})
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
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
                      <th style={{ width: "160px" }}>Order Number</th>
                      <th style={{ width: "110px" }}>Order Date</th>
                      <th style={{ width: "180px" }}>SKU Code</th>
                      <th style={{ width: "60px" }}>Qty</th>
                      <th style={{ width: "110px" }}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.orders.map((ord, i) => (
                      <tr key={ord.orderNo || i}>
                        <td style={{ color: "var(--text-dim)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                          {i + 1}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--aurora-1)", fontFamily: "var(--font-mono)" }}>
                          {ord.orderNo || "N/A"}
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)" }}>
                          📅 {ord.orderDate || "N/A"}
                        </td>
                        <td>
                          <span className="tag-pill" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>
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
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
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
