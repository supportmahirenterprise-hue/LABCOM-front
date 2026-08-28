"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

const FIELD_COLUMNS = [
  { key: "page", label: "Page", editable: false, width: "90px" },
  { key: "sku", label: "SKU", width: "160px" },
  { key: "orderNo", label: "Order No", width: "160px" },
  { key: "orderDate", label: "Order Date", width: "120px" },
  { key: "qty", label: "Qty", width: "80px" },
  { key: "customerName", label: "Customer", width: "180px" },
  { key: "invoiceNo", label: "Invoice No", width: "150px" },
];

const SORT_OPTIONS = [
  { value: "none", label: "Original PDF Sequence" },
  { value: "orderDate", label: "Order Date (DD/MM/YYYY)" },
  { value: "sku", label: "SKU Code" },
  { value: "orderNo", label: "Order Number" },
  { value: "qty", label: "Quantity" },
  { value: "customerName", label: "Customer Name" },
];

const TAG_PLACEHOLDERS = [
  "{regionalThankYou}",
  "{orderNo}",
  "{sku}",
  "{orderDate}",
  "{qty}",
  "{customerName}",
  "{state}",
  "{invoiceNo}",
];

const POSITION_PRESETS = [
  { name: "Bottom Left Blank Area", x: 30, y: 30, size: 90, font: 8 },
  { name: "Bottom Right Corner", x: 180, y: 30, size: 85, font: 8 },
  { name: "Bottom Center", x: 95, y: 30, size: 85, font: 8 },
  { name: "Compact Corner", x: 20, y: 20, size: 70, font: 7 },
];

const MOCK_PAGES = [
  {
    page: 1,
    orderNo: "OD-398241029_1",
    orderDate: "24/08/2026",
    sku: "SAMPLE-SKU-COTTON-SHIRT",
    size: "Free Size",
    qty: "1",
    color: "NA",
    customerName: "Sample Customer A",
    invoiceNo: "INV-9876541",
    state: "Gujarat",
    regionalThankYou: "Aabhar! Tamara prem ane order badal khub khub aabhar! ❤️",
  },
  {
    page: 2,
    orderNo: "OD-782194012_2",
    orderDate: "23/08/2026",
    sku: "SAMPLE-SKU-SILK-SAREE",
    size: "Free Size",
    qty: "2",
    color: "Red",
    customerName: "Sample Customer B",
    invoiceNo: "INV-9876542",
    state: "Punjab",
    regionalThankYou: "Dhanvaad ji! Tuhade vishwas aur order layi bahut dhanvaad! ❤️",
  },
  {
    page: 3,
    orderNo: "OD-398241031_3",
    orderDate: "26/08/2026",
    sku: "SAMPLE-SKU-SILK-KURTI",
    size: "S",
    qty: "3",
    color: "Crimson Red",
    customerName: "Sample Customer C",
    invoiceNo: "INV-9876543",
  },
];

function parseDdMmYyyy(str) {
  const m = (str || "").match(/(\d{2})[.\/](\d{2})[.\/](\d{4})/);
  if (!m) return 0;
  return new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime();
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [enableQr, setEnableQr] = useState(true);

  // QR Config with default Meesho Store URL requested by user
  const [qrText, setQrText] = useState("https://www.meesho.com/themahirenterprise");
  const [detailText, setDetailText] = useState(
    "Thank You for Shopping with Us!\n{regionalThankYou}\nOrder: {orderNo} | SKU: {sku}"
  );
  const [qrX, setQrX] = useState(30);
  const [qrY, setQrY] = useState(30);
  const [qrSize, setQrSize] = useState(90);
  const [fontSize, setFontSize] = useState(8);

  // Sorting & Filtering (Default: Sort by SKU with highest Qty first)
  const [sortBy, setSortBy] = useState("sku");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInput, setActiveInput] = useState("qrText");

  const fileInputRef = useRef(null);
  const isInitialLoadDone = useRef(false);

  function showToast(message, type = "error") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load user settings from Node.js backend on login
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    async function loadSettings() {
      try {
        const userEmail = session.user.email;
        const res = await fetch(
          `${BACKEND_URL}/api/user/settings?email=${encodeURIComponent(userEmail)}`,
          {
            headers: { "x-user-email": userEmail },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const s = data.settings;
            if (s.enableQr !== undefined) setEnableQr(s.enableQr);
            if (s.qrText !== undefined) setQrText(s.qrText);
            if (s.detailText !== undefined) setDetailText(s.detailText);
            if (s.qrX !== undefined) setQrX(s.qrX);
            if (s.qrY !== undefined) setQrY(s.qrY);
            if (s.qrSize !== undefined) setQrSize(s.qrSize);
            if (s.fontSize !== undefined) setFontSize(s.fontSize);
            if (s.sortBy !== undefined) setSortBy(s.sortBy);
            if (s.sortOrder !== undefined) setSortOrder(s.sortOrder);
          }
        }
      } catch (err) {
        console.error("Failed to load settings from Node backend:", err);
      } finally {
        isInitialLoadDone.current = true;
      }
    }

    loadSettings();
  }, [status, session]);

  // Debounced auto-save settings to Node.js backend
  useEffect(() => {
    if (!isInitialLoadDone.current || status !== "authenticated" || !session?.user?.email) return;

    const timer = setTimeout(async () => {
      setSavingSettings(true);
      try {
        const userEmail = session.user.email;
        await fetch(`${BACKEND_URL}/api/user/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
          body: JSON.stringify({
            email: userEmail,
            enableQr,
            qrText,
            detailText,
            qrX,
            qrY,
            qrSize,
            fontSize,
            sortBy,
            sortOrder,
          }),
        });
      } catch (err) {
        console.error("Auto-save settings failed:", err);
      } finally {
        setSavingSettings(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [enableQr, qrText, detailText, qrX, qrY, qrSize, fontSize, sortBy, sortOrder, status]);

  // Filtered & Sorted preview row indices
  const filteredAndSortedIndexes = useMemo(() => {
    let idx = pages.map((_, i) => i);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      idx = idx.filter((i) => {
        const p = pages[i];
        return (
          (p.orderNo || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.customerName || "").toLowerCase().includes(q) ||
          (p.invoiceNo || "").toLowerCase().includes(q)
        );
      });
    }

    if (sortBy !== "none") {
      idx.sort((a, b) => {
        const itemA = pages[a];
        const itemB = pages[b];

        if (sortBy === "sku") {
          const skuA = (itemA.sku || "").toString().toLowerCase();
          const skuB = (itemB.sku || "").toString().toLowerCase();
          if (skuA < skuB) return sortOrder === "asc" ? -1 : 1;
          if (skuA > skuB) return sortOrder === "asc" ? 1 : -1;
          // Secondary Sort: Higher Quantity comes first
          const qtyA = parseFloat(itemA.qty) || 0;
          const qtyB = parseFloat(itemB.qty) || 0;
          return qtyB - qtyA;
        }

        let va = itemA[sortBy] ?? "";
        let vb = itemB[sortBy] ?? "";
        if (sortBy === "orderDate") {
          va = parseDdMmYyyy(va);
          vb = parseDdMmYyyy(vb);
        } else if (sortBy === "qty") {
          va = parseFloat(va) || 0;
          vb = parseFloat(vb) || 0;
        } else {
          va = va.toString().toLowerCase();
          vb = vb.toString().toLowerCase();
        }
        if (va < vb) return sortOrder === "asc" ? -1 : 1;
        if (va > vb) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return idx;
  }, [pages, sortBy, sortOrder, searchQuery]);

  // Analytics
  const analytics = useMemo(() => {
    if (!pages.length) return null;
    const totalPages = pages.length;
    const uniqueSkus = new Set(pages.map((p) => p.sku).filter(Boolean)).size;
    const totalQty = pages.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 1), 0);
    return { totalPages, uniqueSkus, totalQty };
  }, [pages]);

  async function handleFileSelect(f) {
    if (!f) return;
    setFile(f);
    setPages([]);
    setError("");
    setSuccessMsg("");
    setLoadingPreview(true);
    try {
      const fd = new FormData();
      fd.append("pdf", f);
      const res = await fetch(`${BACKEND_URL}/api/preview`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to read PDF preview");
      }
      const data = await res.json();
      setPages(data.pages || []);
      showToast(`Successfully extracted ${data.pages?.length || 0} label pages!`, "success");
    } catch (err) {
      showToast(err.message || "Error connecting to backend server", "error");
      setError(err.message || "Error connecting to backend server");
    } finally {
      setLoadingPreview(false);
    }
  }

  function updateCell(pageIdx, key, value) {
    setPages((prev) => {
      const copy = [...prev];
      copy[pageIdx] = { ...copy[pageIdx], [key]: value };
      return copy;
    });
  }

  function insertTag(tag) {
    if (activeInput === "qrText") {
      setQrText((prev) => (prev ? `${prev} ${tag}` : tag));
    } else {
      setDetailText((prev) => (prev ? `${prev}\n${tag}` : tag));
    }
  }

  function applyPreset(p) {
    setQrX(p.x);
    setQrY(p.y);
    setQrSize(p.size);
    setFontSize(p.font);
  }

  async function handleGenerate(options = {}) {
    const isSample = Boolean(options.sampleOnly);
    if (!file) {
      const msg = isSample
        ? "Please upload a PDF file first to download a test sample."
        : "Please upload a PDF file first to generate labels.";
      showToast(msg, "error");
      setError(msg);
      if (fileInputRef.current) {
        fileInputRef.current.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setError("");
    setSuccessMsg("");
    if (isSample) {
      setLoadingSample(true);
    } else {
      setLoadingGenerate(true);
    }

    try {
      const fd = new FormData();
      fd.append("pdf", file);
      fd.append("enableQr", enableQr ? "true" : "false");
      fd.append("qrText", qrText);
      fd.append("detailText", detailText);
      fd.append("sortBy", sortBy);
      fd.append("sortOrder", sortOrder);
      fd.append("qrX", String(qrX));
      fd.append("qrY", String(qrY));
      fd.append("qrSize", String(qrSize));
      fd.append("fontSize", String(fontSize));
      fd.append("overrides", JSON.stringify(pages));
      fd.append("sampleOnly", String(isSample));

      const res = await fetch(`${BACKEND_URL}/api/generate`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          throw new Error((await res.json()).error || "Generation failed");
        }
        throw new Error("PDF processing failed on server");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = isSample ? `sample_test_page_1_${baseName}.pdf` : `stamped_${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      // Log generation run to Node.js Backend History
      const userEmail = session?.user?.email || "";
      fetch(`${BACKEND_URL}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          fileName: file.name,
          pageCount: isSample ? 1 : pages.length,
          isSample,
          sortBy,
          sortOrder,
          enableQr,
          qrText,
        }),
      }).catch((e) => console.error("Failed to log history to Node backend:", e));

      if (isSample) {
        const msg = "🧪 Test Sample (Page 1) downloaded! Check QR alignment & print preview.";
        setSuccessMsg(msg);
        showToast(msg, "success");
      } else {
        const msg = "✅ Full batch PDF generated and downloaded successfully!";
        setSuccessMsg(msg);
        showToast(msg, "success");
      }
    } catch (err) {
      const msg = err.message || "Failed to generate PDF";
      setError(msg);
      showToast(msg, "error");
    } finally {
      if (isSample) {
        setLoadingSample(false);
      } else {
        setLoadingGenerate(false);
      }
    }
  }

  // Label simulator canvas coordinates mapping (412 x 595 pt PDF page ratio)
  const canvasW = 280;
  const canvasH = 404;
  const scale = canvasW / 412; // ~0.6796

  const previewText = useMemo(() => {
    let text = detailText;
    if (!text) return "QR Stamp";
    const p = pages[0] || MOCK_PAGES[0];
    if (p) {
      TAG_PLACEHOLDERS.forEach(tag => {
        const key = tag.replace(/[{}]/g, "");
        text = text.replace(new RegExp(tag, "g"), p[key] || "");
      });
    }
    return text;
  }, [detailText, pages]);

  const simQrSize = Math.max(20, Math.min(140, qrSize * scale));
  const simQrX = Math.max(0, Math.min(canvasW - simQrSize, qrX * scale));
  const simQrY = Math.max(0, Math.min(canvasH - simQrSize, canvasH - (qrY * scale) - simQrSize));

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 40, position: "relative", width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: toast.type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(16, 185, 129, 0.95)",
            backdropFilter: "blur(16px)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "var(--radius-full)",
            boxShadow: toast.type === "error" ? "0 10px 30px rgba(239, 68, 68, 0.4)" : "0 10px 30px rgba(16, 185, 129, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.88rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            animation: "fadeInDown 0.3s ease-out",
          }}
        >
          <span>{toast.type === "error" ? "⚠️" : "🎉"}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
              padding: "0 0 0 8px",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Workspace Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          padding: "4px 0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="heading-display" style={{ fontSize: "1.5rem", color: "var(--text-pure)", margin: 0, letterSpacing: "-0.02em" }}>
              Thermal Label Studio
            </h1>
            {session && (
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-full)",
                  background: savingSettings ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  color: savingSettings ? "var(--aurora-1)" : "var(--text-dim)",
                  border: "1px solid var(--glass-border)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s ease",
                }}
              >
                {savingSettings ? "☁️ Syncing..." : "☁️ Saved to Account"}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", marginTop: 4, marginBottom: 0 }}>
            Upload Meesho, Xpressbees, or Delhivery labels to stamp QR codes and sort batches.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <main style={{ width: "100%" }}>
        
        {/* Banner Alert Messages */}
        {error && (
          <div
            style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid var(--accent-rose)",
              color: "#fecdd3",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.85rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid var(--border-accent)",
              color: "#a7f3d0",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.85rem",
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* Top 2-Column Workspace: File Ingestion (Left) & Thermal Studio Canvas (Right) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 20, marginBottom: 24, alignItems: "stretch" }}>
          
          {/* File Ingestion Dropzone */}
          <div className="premium-glass" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>
                  Shipping Label PDF
                </h3>
                <span className="tag-pill" style={{ fontSize: "0.72rem" }}>
                  Step 1: Upload
                </span>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              <div
                className={`dropzone ${file ? "active" : ""}`}
                style={{
                  minHeight: 280,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  padding: "28px 16px",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📄</div>
                {file ? (
                  <div style={{ textAlign: "center", wordBreak: "break-all" }}>
                    <p style={{ fontWeight: 600, color: "var(--aurora-1)", fontSize: "0.95rem" }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-silver)", marginTop: 6 }}>
                      {pages.length > 0 ? `✅ ${pages.length} Pages Extracted & Ready` : "Click to replace PDF file"}
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 600, color: "var(--text-pure)", fontSize: "0.95rem" }}>
                      Drop PDF shipping label here or <span style={{ color: "var(--aurora-1)" }}>Browse</span>
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
                      Supports Meesho, Xpressbees, and Delhivery label sheets
                    </p>
                  </div>
                )}

                {loadingPreview && (
                  <div style={{ marginTop: 14, color: "var(--aurora-1)", fontSize: "0.85rem", fontWeight: 600 }}>
                    ⏳ Extracting label fields & metadata...
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Auto-regex parses Order ID, SKU, Date & Quantity
              </span>
              {file && (
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPages([]);
                  }}
                  style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Thermal Label Studio Canvas */}
          <div className="premium-glass">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
              <h3 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>
                Live Stamp Preview
              </h3>
              <span className="tag-pill active" style={{ fontSize: "0.72rem", padding: "4px 10px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--aurora-1)", boxShadow: "var(--shadow-glow)" }} />
                4" × 6" Thermal Canvas
              </span>
            </div>

            <div className="simulator-layout-wrap" style={{ display: "flex", gap: 20, alignItems: "flex-start", justifyContent: "space-between" }}>
              {/* Thermal Label Sheet Frame */}
              <div
                style={{
                  width: canvasW,
                  height: canvasH,
                  flexShrink: 0,
                  background: "#ffffff",
                  borderRadius: 6,
                  position: "relative",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
                  border: "1px solid #111",
                  overflow: "hidden",
                  userSelect: "none",
                  color: "#000",
                  fontSize: 6.5,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Top Section: Customer Address & Courier Info */}
                <div style={{ display: "flex", borderBottom: "1.5px solid #000", height: 130 }}>
                  {/* Left: Customer Address */}
                  <div style={{ width: "45%", borderRight: "1.5px solid #000", padding: "3px 4px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 6.5 }}>Customer Address</div>
                      <div style={{ fontWeight: 800, fontSize: 8, marginTop: 1 }}>{pages[0]?.customerName || "Sample Customer"}</div>
                      <div style={{ fontSize: 5.5, color: "#222", lineHeight: 1.15, marginTop: 1 }}>
                        123, Sample Colony, Landmark Area, City Name, State Name, 500001
                      </div>
                    </div>
                    <div style={{ borderTop: "1px solid #000", paddingTop: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 6 }}>If undelivered, return to:</div>
                      <div style={{ fontWeight: 700, fontSize: 6.5 }}>Sample Seller Enterprise</div>
                      <div style={{ fontSize: 5.5, color: "#333", lineHeight: 1.1 }}>
                        Plot 45, Sample Industrial Estate, City, State, 395001
                      </div>
                    </div>
                  </div>

                  {/* Right: XpressBees Courier Header */}
                  <div style={{ width: "55%", display: "flex", flexDirection: "column" }}>
                    <div style={{ background: "#000", color: "#fff", padding: "1px 4px", fontSize: 6, fontWeight: 700, textAlign: "left" }}>
                      Prepaid: Do not collect cash
                    </div>
                    <div style={{ padding: "3px 4px", flex: 1, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: -0.2 }}>Xpress Bees</div>
                          <span style={{ background: "#000", color: "#fff", fontSize: 5.5, padding: "0px 3px", fontWeight: 700, borderRadius: 1 }}>Pickup</span>
                          <div style={{ fontSize: 5.5, marginTop: 2 }}>
                            Dest Code: <b>XX/X-00/0A/000</b><br/>
                            Return Code: <b>000000,0000000</b>
                          </div>
                        </div>

                        {/* DataMatrix Mock */}
                        <div style={{ width: 28, height: 28, border: "1px solid #000", background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 / 4px 4px" }} />
                      </div>

                      {/* 1D Barcode */}
                      <div style={{ marginTop: 4, textAlign: "center" }}>
                        <div style={{ height: 16, background: "repeating-linear-gradient(90deg, #000 0px, #000 1.5px, #fff 1.5px, #fff 3px)" }} />
                        <div style={{ fontSize: 6.5, fontWeight: 800, letterSpacing: 0.5, marginTop: 1 }}>
                          999096131786000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Product Details */}
                <div style={{ borderBottom: "1.5px solid #000", padding: "2px 4px", background: "#fff" }}>
                  <div style={{ fontWeight: 800, fontSize: 7, marginBottom: 1 }}>Product Details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 0.8fr 2fr", fontSize: 5.5, fontWeight: 700, color: "#111" }}>
                    <span>SKU</span>
                    <span>Size</span>
                    <span>Qty</span>
                    <span>Color</span>
                    <span>Order No.</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 0.8fr 0.8fr 2fr", fontSize: 5.5, color: "#222", marginTop: 1 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pages[0]?.sku || "SAMPLE-SKU-COTTON-SHIRT"}
                    </span>
                    <span>{pages[0]?.size || "Free Size"}</span>
                    <span>{pages[0]?.qty || "1"}</span>
                    <span>{pages[0]?.color || "NA"}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {pages[0]?.orderNo || "OD-398241029_1"}
                    </span>
                  </div>
                </div>

                {/* Lower Section: Tax Invoice */}
                <div style={{ borderBottom: "1.5px solid #000", padding: "2px 4px", background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #000", paddingBottom: 1, fontWeight: 800, fontSize: 6 }}>
                    <span>TAX INVOICE</span>
                    <span style={{ fontSize: 5, color: "#444" }}>Original For Recipient</span>
                  </div>

                  <div style={{ display: "flex", fontSize: 5, borderBottom: "1px solid #ddd", padding: "2px 0" }}>
                    <div style={{ width: "50%", borderRight: "1px solid #ddd", paddingRight: 2 }}>
                      <b>BILL TO / SHIP TO:</b><br />
                      {pages[0]?.customerName || "Sample Customer"} - City, 500001
                    </div>
                    <div style={{ width: "50%", paddingLeft: 2 }}>
                      <b>Sold by:</b> Sample Seller Enterprise<br />
                      <b>Invoice No:</b> {pages[0]?.invoiceNo || "INV-9876541"} | <b>Date:</b> {pages[0]?.orderDate || "24.08.2026"}
                    </div>
                  </div>

                  <div style={{ fontSize: 4.5, color: "#555", marginTop: 2, lineHeight: 1.1 }}>
                    Tax is not payable on reverse charge basis. Computer generated invoice for logistics.
                  </div>
                </div>

                {/* Blank Label Area */}
                <div style={{ padding: "4px", fontSize: 5.5, color: "#aaa", fontStyle: "italic", textAlign: "center", marginTop: 10 }}>
                  -- Blank Stamp Area --
                </div>

                {/* DYNAMIC QR STAMP OVERLAY */}
                {enableQr ? (
                  <div
                    style={{
                      position: "absolute",
                      left: simQrX,
                      top: simQrY,
                      maxWidth: canvasW - simQrX,
                      maxHeight: canvasH - simQrY,
                      background: "rgba(249, 115, 22, 0.15)",
                      border: "1.5px solid #F97316",
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      transition: "all 0.1s ease-out",
                      padding: 4,
                      gap: 6,
                      zIndex: 20,
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* QR Code Graphic */}
                    <div
                      style={{
                        width: simQrSize,
                        height: simQrSize,
                        background: "repeating-conic-gradient(#EA580C 0% 25%, #FFF7ED 0% 50%) 50% / 6px 6px",
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />
                    {/* Text Details next to QR */}
                    <div
                      style={{
                        fontSize: Math.max(5, fontSize * scale),
                        fontFamily: '"Times New Roman", Times, serif',
                        fontStyle: "italic",
                        color: "#C2410C",
                        fontWeight: 700,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.2,
                      }}
                    >
                      {previewText}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: 20,
                      bottom: 20,
                      border: "1px dashed #bbb",
                      borderRadius: 3,
                      padding: "4px 8px",
                      color: "#888",
                      fontSize: 5.5,
                      fontStyle: "italic",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    🚫 QR Stamper Disabled (Sorting Only)
                  </div>
                )}
              </div>

              {/* Preset Position Shortcuts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  Position Shortcuts
                </span>
                {POSITION_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    className="btn-secondary"
                    onClick={() => applyPreset(p)}
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      padding: "10px 14px",
                      fontSize: "0.82rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    📍 {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Store Growth Engine & QR Stamp Config */}
        <div className="premium-glass" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Store Growth & QR Stamp Setup
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0 }}>
                {enableQr
                  ? "Encode your Meesho or Instagram store link into every parcel label to boost followers and repeat orders."
                  : "QR stamping is currently disabled. Label pages will only be sorted and organized."}
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                  background: enableQr ? "rgba(79, 172, 254, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${enableQr ? "var(--aurora-2)" : "var(--glass-border)"}`,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={enableQr}
                  onChange={(e) => setEnableQr(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "var(--aurora-1)",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: enableQr ? "var(--aurora-1)" : "var(--text-silver)" }}>
                  {enableQr ? "QR Stamper: Enabled" : "QR Stamper: Disabled (Sort Only)"}
                </span>
              </label>

              {enableQr && (
                <span className="tag-pill active" style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
                  Active: Meesho Store
                </span>
              )}
            </div>
          </div>

          <div style={{ opacity: enableQr ? 1 : 0.4, pointerEvents: enableQr ? "auto" : "none", transition: "all 0.2s ease" }}>

          {/* Preset Bar */}
          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "14px", padding: "18px 20px", marginBottom: 24 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)", display: "block", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Store Link Presets
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="btn-secondary"
                style={{ background: "rgba(79, 172, 254, 0.12)", borderColor: "var(--aurora-2)", color: "var(--aurora-1)", fontSize: "0.82rem", padding: "8px 16px" }}
                onClick={() => {
                  setQrText("https://www.meesho.com/themahirenterprise");
                  setDetailText("Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}");
                  setActiveInput("qrText");
                }}
              >
                🏬 Default Meesho Store (themahirenterprise)
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                onClick={() => {
                  setQrText("https://instagram.com/mahir.enterprise_");
                  setDetailText("Scan to Follow on Instagram!\n@mahir.enterprise_\nSKU: {sku}");
                  setActiveInput("qrText");
                }}
              >
                📸 Instagram Page (@mahir.enterprise_)
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.82rem", padding: "8px 16px", borderColor: "rgba(236, 72, 153, 0.4)", color: "#f472b6" }}
                onClick={() => {
                  setQrText("https://www.meesho.com/themahirenterprise");
                  setDetailText("Thank You for Shopping with Us!\n{regionalThankYou}\nOrder: {orderNo} | SKU: {sku}");
                  setActiveInput("qrText");
                }}
              >
                ❤️ State-Smart Regional Thank You
              </button>
            </div>
          </div>

          {/* Variable Chips */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", fontWeight: 600, display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Insert Variable
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {TAG_PLACEHOLDERS.map((t) => (
                <span key={t} className="tag-pill" onClick={() => insertTag(t)} style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
                  + {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, marginBottom: 24 }}>
            {/* QR Content */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-pure)", marginBottom: 8 }}>
                QR Code Scannable URL / Content
              </label>
              <input
                className="input-field input-field-mono"
                value={qrText}
                onFocus={() => setActiveInput("qrText")}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="https://www.meesho.com/themahirenterprise"
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 6, display: "block" }}>
                ✓ Valid URL: Scanning QR directly opens this web page.
              </span>
            </div>

            {/* Detail Lines */}
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-pure)", marginBottom: 8 }}>
                Printed Text Lines (Next to QR)
              </label>
              <textarea
                className="input-field input-field-mono"
                style={{ height: 74, resize: "vertical" }}
                value={detailText}
                onFocus={() => setActiveInput("detailText")}
                onChange={(e) => setDetailText(e.target.value)}
                placeholder="Scan to Follow!\nSKU: {sku}\nOrder: {orderNo}"
              />
            </div>
          </div>

          {/* Interactive Range Sliders */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 16, paddingTop: 20, borderTop: "1px solid var(--glass-border)" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)" }}>X Offset (Left)</span>
                <span style={{ background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "var(--aurora-1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{qrX} pt</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0"
                max="300"
                value={qrX}
                onChange={(e) => setQrX(Number(e.target.value))}
              />
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)" }}>Y Offset (Bottom)</span>
                <span style={{ background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "var(--aurora-1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{qrY} pt</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0"
                max="500"
                value={qrY}
                onChange={(e) => setQrY(Number(e.target.value))}
              />
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)" }}>QR Size</span>
                <span style={{ background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "var(--aurora-1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{qrSize} pt</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="30"
                max="180"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)" }}>Font Size</span>
                <span style={{ background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "var(--aurora-1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fontSize} pt</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="5"
                max="16"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

        {/* Batch Sorter & Filter Control */}
        <div className="premium-glass" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Multi-Field Batch Sorter & Search Filter
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0 }}>
                Automatically group and sort label pages by SKU, Quantity, Order Date, or Customer Name.
              </p>
            </div>
            {analytics && (
              <div style={{ display: "flex", gap: 8 }}>
                <span className="tag-pill">📦 {analytics.totalPages} Total Labels</span>
                <span className="tag-pill">🏷️ {analytics.uniqueSkus} Unique SKUs</span>
                <span className="tag-pill">🔢 {analytics.totalQty} Total Items</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Sort Pages By Field
              </label>
              <select
                className="input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="none">Original PDF Sequence (No Sorting)</option>
                <option value="sku">Sort by SKU / Product Name</option>
                <option value="qty">Sort by Item Quantity</option>
                <option value="orderDate">Sort by Order Date</option>
                <option value="orderNo">Sort by Order ID / Number</option>
                <option value="customerName">Sort by Customer Name</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Order Direction
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "asc" ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sortOrder === "asc" ? "var(--aurora-2)" : "var(--glass-border)",
                    color: sortOrder === "asc" ? "var(--aurora-1)" : "var(--text-silver)",
                    padding: "10px",
                  }}
                  onClick={() => setSortOrder("asc")}
                >
                  ⬆️ Ascending
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "desc" ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sortOrder === "desc" ? "var(--aurora-2)" : "var(--glass-border)",
                    color: sortOrder === "desc" ? "var(--aurora-1)" : "var(--text-silver)",
                    padding: "10px",
                  }}
                  onClick={() => setSortOrder("desc")}
                >
                  ⬇️ Descending
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Instant Search Filter
              </label>
              <input
                className="input-field"
                placeholder="Search SKU, Order No, Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Grid */}
        {pages.length > 0 && (
          <div className="premium-glass" style={{ marginBottom: 24, padding: 0, overflow: "hidden", maxWidth: "100%" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-pure)" }}>
                Extracted Fields Preview Grid
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-silver)" }}>
                Showing {filteredAndSortedIndexes.length} of {pages.length} pages
              </span>
            </div>

            <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", maxHeight: 420 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    {FIELD_COLUMNS.map((c) => (
                      <th key={c.key} style={{ width: c.width }}>
                        {c.label} {sortBy === c.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedIndexes.map((pIdx) => {
                    const row = pages[pIdx];
                    return (
                      <tr key={row.page || pIdx}>
                        {FIELD_COLUMNS.map((c) => (
                          <td key={c.key}>
                            {c.editable === false ? (
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent-cyan)" }}>
                                Page {row[c.key]}
                              </span>
                            ) : (
                              <input
                                className="table-input"
                                value={row[c.key] || ""}
                                onChange={(e) => updateCell(pIdx, c.key, e.target.value)}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Sticky Action Bar */}
      <footer className="action-dock premium-glass">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-silver)" }}>
            {file ? (
              <>Ready to process <strong>{pages.length} pages</strong> from <code style={{ color: "var(--text-pure)" }}>{file.name}</code></>
            ) : (
              "Upload a PDF file to preview, test sample, and sort labels"
            )}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn-secondary"
            style={{
              minWidth: 190,
              opacity: file ? 1 : 0.6,
              cursor: file ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: true })}
          >
            {loadingSample ? "⏳ Generating Sample..." : "🧪 Download Test Sample (Page 1)"}
          </button>

          <button
            className="btn-primary"
            style={{
              minWidth: 220,
              opacity: file ? 1 : 0.5,
              cursor: file ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: false })}
          >
            {loadingGenerate ? (
              <>⏳ Processing All {pages.length} Pages...</>
            ) : (
              <>⚡ Generate Full PDF ({pages.length > 0 ? `${pages.length} Pages` : "Batch"})</>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
