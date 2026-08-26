"use client";

import { useMemo, useState, useRef } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const FIELD_COLUMNS = [
  { key: "page", label: "Page", editable: false, width: "60px" },
  { key: "orderNo", label: "Order No", width: "150px" },
  { key: "orderDate", label: "Order Date", width: "110px" },
  { key: "sku", label: "SKU", width: "140px" },
  { key: "size", label: "Size", width: "80px" },
  { key: "qty", label: "Qty", width: "70px" },
  { key: "color", label: "Color", width: "90px" },
  { key: "customerName", label: "Customer", width: "160px" },
  { key: "invoiceNo", label: "Invoice No", width: "140px" },
];

const SORT_OPTIONS = [
  { value: "none", label: "Original PDF Sequence" },
  { value: "orderDate", label: "Order Date (DD/MM/YYYY)" },
  { value: "sku", label: "SKU Code" },
  { value: "orderNo", label: "Order Number" },
  { value: "qty", label: "Quantity" },
  { value: "size", label: "Size" },
  { value: "color", label: "Color" },
];

const TAG_PLACEHOLDERS = [
  "{orderNo}",
  "{sku}",
  "{orderDate}",
  "{qty}",
  "{size}",
  "{color}",
  "{customerName}",
  "{invoiceNo}",
];

const POSITION_PRESETS = [
  { name: "Bottom Left Blank Area", x: 30, y: 30, size: 90, font: 8 },
  { name: "Bottom Right Corner", x: 280, y: 30, size: 90, font: 8 },
  { name: "Top Right Header", x: 280, y: 480, size: 75, font: 7 },
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
  },
  {
    page: 2,
    orderNo: "OD-398241030_2",
    orderDate: "25/08/2026",
    sku: "SAMPLE-SKU-DENIM-JACKET",
    size: "L",
    qty: "2",
    color: "Royal Blue",
    customerName: "Sample Customer B",
    invoiceNo: "INV-9876542",
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
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // QR Config with default Meesho Store URL requested by user
  const [qrText, setQrText] = useState("https://www.meesho.com/themahirenterprise");
  const [detailText, setDetailText] = useState(
    "Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}"
  );
  const [qrX, setQrX] = useState(30);
  const [qrY, setQrY] = useState(30);
  const [qrSize, setQrSize] = useState(90);
  const [fontSize, setFontSize] = useState(8);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState("none");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInput, setActiveInput] = useState("qrText");

  const fileInputRef = useRef(null);

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
        let va = pages[a][sortBy] ?? "";
        let vb = pages[b][sortBy] ?? "";
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
      setSuccessMsg(`Extracted data from ${data.pages?.length || 0} label pages.`);
    } catch (err) {
      setError(err.message || "Error connecting to backend server");
    } finally {
      setLoadingPreview(false);
    }
  }

  function loadSampleData() {
    setFile({ name: "sample_meesho_labels.pdf", size: 1048576, isMock: true });
    setPages(MOCK_PAGES);
    setError("");
    setSuccessMsg("Loaded sample Meesho labels for instant demonstration!");
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

  async function handleGenerate() {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setLoadingGenerate(true);

    try {
      if (file.isMock) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setSuccessMsg("Sample labels processed! Upload a real PDF to download the final stamped output.");
        setLoadingGenerate(false);
        return;
      }

      const fd = new FormData();
      fd.append("pdf", file);
      fd.append("qrText", qrText);
      fd.append("detailText", detailText);
      fd.append("sortBy", sortBy);
      fd.append("sortOrder", sortOrder);
      fd.append("qrX", String(qrX));
      fd.append("qrY", String(qrY));
      fd.append("qrSize", String(qrSize));
      fd.append("fontSize", String(fontSize));
      fd.append("overrides", JSON.stringify(pages));

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
      a.download = `stamped_${file.name.replace(/\.pdf$/i, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSuccessMsg("PDF generated and downloaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to generate PDF");
    } finally {
      setLoadingGenerate(false);
    }
  }

  // Label simulator canvas coordinates mapping (412 x 595 pt PDF page ratio)
  const canvasW = 280;
  const canvasH = 404;
  const scale = canvasW / 412; // ~0.6796

  const simQrSize = Math.max(20, Math.min(140, qrSize * scale));
  const simQrX = Math.max(0, Math.min(canvasW - simQrSize, qrX * scale));
  const simQrY = Math.max(0, Math.min(canvasH - simQrSize, canvasH - (qrY * scale) - simQrSize));

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {/* Studio Header */}
      <header
        style={{
          background: "rgba(9, 9, 11, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "#fafafa",
                color: "#09090b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              V
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                  Veloura Engine
                </h1>
                <span className="tag-pill" style={{ fontSize: "0.68rem" }}>
                  Label Studio
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", margin: 0 }}>
                Meesho & E-Commerce Shipping Label QR Stamper & Sorter
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-secondary" onClick={loadSampleData}>
              ⚡ Load Sample Demo
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "#18181b",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary-emerald)" }} />
              <span>Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1280, margin: "24px auto", padding: "0 16px" }}>
        
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20, marginBottom: 20 }}>
          
          {/* File Ingestion Dropzone */}
          <div className="glass-card">
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 14, color: "var(--text-main)" }}>
              Shipping Label PDF Upload
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
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: "2rem", marginBottom: 6 }}>📄</div>
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--primary-emerald)", fontSize: "0.9rem" }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                    {pages.length > 0 ? `${pages.length} Pages Extracted` : "Click to change file"}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.9rem" }}>
                    Drop PDF file here or <span style={{ color: "var(--primary-emerald)" }}>Browse</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 4 }}>
                    Supports Meesho, Xpressbees, Delhivery label sheets
                  </p>
                </div>
              )}

              {loadingPreview && (
                <div style={{ marginTop: 10, color: "var(--accent-cyan)", fontSize: "0.82rem", fontWeight: 600 }}>
                  ⏳ Extracting label fields...
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                  style={{ padding: "3px 8px", fontSize: "0.72rem" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Thermal Label Studio Canvas */}
          <div className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                Thermal Print Studio Preview
              </div>
              <span className="tag-pill" style={{ fontSize: "0.68rem" }}>
                Live Canvas
              </span>
            </div>

            <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
              {/* Thermal Label Sheet Frame */}
              <div
                style={{
                  width: canvasW,
                  height: canvasH,
                  background: "#ffffff",
                  borderRadius: 4,
                  position: "relative",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
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
                <div
                  style={{
                    position: "absolute",
                    left: simQrX,
                    top: simQrY,
                    width: simQrSize,
                    height: simQrSize,
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1.5px solid #10b981",
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.1s ease-out",
                    overflow: "hidden",
                    padding: 2,
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      width: "65%",
                      height: "65%",
                      background: "repeating-conic-gradient(#059669 0% 25%, #ecfdf5 0% 50%) 50% / 6px 6px",
                      borderRadius: 1,
                    }}
                  />
                  <div
                    style={{
                      fontSize: Math.max(5, fontSize * scale),
                      fontFamily: "var(--font-mono)",
                      color: "#047857",
                      fontWeight: 700,
                      marginTop: 2,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    QR Stamp
                  </div>
                </div>
              </div>

              {/* Preset Position Shortcuts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Stamp Position Shortcuts:
                </span>
                {POSITION_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    className="btn-secondary"
                    onClick={() => applyPreset(p)}
                    style={{ justifyContent: "flex-start", padding: "6px 10px", fontSize: "0.76rem" }}
                  >
                    📍 {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Store Growth Engine & QR Stamp Config */}
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                Meesho Store Growth & QR Configuration
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 2 }}>
                Encode your store URL into every parcel QR code to boost followers and repeat orders.
              </p>
            </div>
            <span className="tag-pill" style={{ background: "rgba(16, 185, 129, 0.12)", color: "var(--primary-emerald)" }}>
              Active Link: themahirenterprise
            </span>
          </div>

          {/* Preset Bar */}
          <div style={{ background: "#18181b", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 16 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>
              Store Link Presets:
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn-secondary"
                style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "var(--border-accent)", color: "#fff", fontSize: "0.76rem" }}
                onClick={() => {
                  setQrText("https://www.meesho.com/themahirenterprise");
                  setDetailText("Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}");
                  setActiveInput("qrText");
                }}
              >
                🏬 Default Meesho Store (https://www.meesho.com/themahirenterprise)
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.76rem" }}
                onClick={() => {
                  setQrText("https://instagram.com/your_brand_name");
                  setDetailText("Scan to Follow us on Instagram!\nSKU: {sku}");
                  setActiveInput("qrText");
                }}
              >
                📸 Instagram Page (https://instagram.com/...)
              </button>

              <button
                className="btn-secondary"
                style={{ fontSize: "0.76rem" }}
                onClick={() => {
                  setQrText("{orderNo}");
                  setDetailText("Order: {orderNo}\nSKU: {sku}\nDate: {orderDate}");
                  setActiveInput("qrText");
                }}
              >
                🆔 Order Number Only ({"{orderNo}"})
              </button>
            </div>
          </div>

          {/* Variable Chips */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Insert Variable:
              </span>
              {TAG_PLACEHOLDERS.map((t) => (
                <span key={t} className="tag-pill" onClick={() => insertTag(t)}>
                  + {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
            {/* QR Content */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: 6 }}>
                QR Code Scannable URL / Content
              </label>
              <input
                className="input-field input-field-mono"
                value={qrText}
                onFocus={() => setActiveInput("qrText")}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="https://www.meesho.com/themahirenterprise"
              />
              <span style={{ fontSize: "0.72rem", color: qrText.startsWith("http") ? "var(--primary-emerald)" : "var(--text-dim)", marginTop: 4, display: "block" }}>
                {qrText.startsWith("http") ? "✓ Valid URL: Scanning QR directly opens this web page." : "Active focus: QR Content input"}
              </span>
            </div>

            {/* Printed Detail Lines */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", marginBottom: 6 }}>
                Printed Text Lines (Next to QR)
              </label>
              <textarea
                className="input-field input-field-mono"
                style={{ height: 68, resize: "vertical" }}
                value={detailText}
                onFocus={() => setActiveInput("detailText")}
                onChange={(e) => setDetailText(e.target.value)}
                placeholder="Scan to follow store!\nOrder: {orderNo}"
              />
            </div>
          </div>

          {/* Coordinate Tuning Sliders */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, background: "#18181b", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                <span>X Offset (Left)</span>
                <strong style={{ color: "var(--primary-emerald)" }}>{qrX} pt</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0"
                max="350"
                value={qrX}
                onChange={(e) => setQrX(Number(e.target.value))}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Y Offset (Bottom)</span>
                <strong style={{ color: "var(--primary-emerald)" }}>{qrY} pt</strong>
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

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                <span>QR Size</span>
                <strong style={{ color: "var(--accent-cyan)" }}>{qrSize} pt</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min="40"
                max="160"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Font Size</span>
                <strong style={{ color: "var(--accent-cyan)" }}>{fontSize} pt</strong>
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

        {/* Batch Sorter & Filter Control */}
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
              Multi-Field Batch Sorter & Search Filter
            </div>
            {analytics && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="tag-pill">📦 {analytics.totalPages} Total Labels</span>
                <span className="tag-pill">🏷️ {analytics.uniqueSkus} Unique SKUs</span>
                <span className="tag-pill">🔢 {analytics.totalQty} Total Units</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                Sort Pages By Field
              </label>
              <select
                className="input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#18181b", color: "#fff" }}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
                Order Direction
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "asc" ? "#27272a" : "#18181b",
                    borderColor: sortOrder === "asc" ? "var(--border-strong)" : "var(--border-subtle)",
                    color: sortOrder === "asc" ? "#ffffff" : "var(--text-muted)",
                  }}
                  onClick={() => setSortOrder("asc")}
                >
                  ⬆️ Ascending
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "desc" ? "#27272a" : "#18181b",
                    borderColor: sortOrder === "desc" ? "var(--border-strong)" : "var(--border-subtle)",
                    color: sortOrder === "desc" ? "#ffffff" : "var(--text-muted)",
                  }}
                  onClick={() => setSortOrder("desc")}
                >
                  ⬇️ Descending
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
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
          <div className="glass-card" style={{ marginBottom: 40, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                Extracted Fields Preview Grid
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                Showing {filteredAndSortedIndexes.length} of {pages.length} pages
              </span>
            </div>

            <div style={{ overflowX: "auto", maxHeight: 400 }}>
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

      {/* Floating Action Bar */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(9, 9, 11, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border-subtle)",
          padding: "12px 24px",
          zIndex: 900,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {file ? (
                <>Ready to process <strong>{pages.length} pages</strong> from <code style={{ color: "var(--text-main)" }}>{file.name}</code></>
              ) : (
                "Upload a PDF or click 'Load Sample Demo' to begin"
              )}
            </span>
          </div>

          <button
            className="btn-primary"
            disabled={!file || loadingGenerate}
            onClick={handleGenerate}
            style={{ minWidth: 220 }}
          >
            {loadingGenerate ? (
              <>⏳ Processing & Sorting PDF...</>
            ) : (
              <>Generate & Download PDF</>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
