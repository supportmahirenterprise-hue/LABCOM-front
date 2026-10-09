"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { setPendingStudioPdf } from "../../lib/pdfTransfer";
import {
  FilePdfIcon,
  CopyIcon,
  TrashIcon,
  DownloadIcon,
  ZapIcon,
  SparklesIcon,
  UploadCloudIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  FilterIcon,
  LayersIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  SearchIcon,
  PackageIcon,
  TagIcon,
  InfoIcon,
} from "../components/Icons";

export default function RemoveDuplicatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Dual PDF Upload State
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file1PagesCount, setFile1PagesCount] = useState(0);
  const [file2PagesCount, setFile2PagesCount] = useState(0);

  // Processing & Results State (100% Client-Side In Browser Memory)
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [comparisonResults, setComparisonResults] = useState(null);
  const [cleanedPdfBlob, setCleanedPdfBlob] = useState(null);
  const [cleanedPdfUrl, setCleanedPdfUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("unique"); // "unique", "duplicate"
  const [tableSearch, setTableSearch] = useState("");

  const file1InputRef = useRef(null);
  const file2InputRef = useRef(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load PDF.js dynamically on client side for fast text extraction
  async function ensurePdfJsLoaded() {
    if (typeof window === "undefined") return null;
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    if (window.pdfjsLib) {
      try {
        const workerBlob = new Blob(
          ['importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js");'],
          { type: "application/javascript" }
        );
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
      } catch (e) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    }
    return window.pdfjsLib;
  }

  // Handle PDF 1 selection
  async function handleFile1Change(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile1(f);
    setComparisonResults(null);
    setCleanedPdfBlob(null);
    setCleanedPdfUrl(null);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      setFile1PagesCount(pdf.getPageCount());
      showToast(`Loaded "${f.name}" (${pdf.getPageCount()} pages)`, "info");
    } catch (err) {
      showToast("Invalid PDF file for Batch 1", "error");
    }
  }

  // Handle PDF 2 selection
  async function handleFile2Change(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile2(f);
    setComparisonResults(null);
    setCleanedPdfBlob(null);
    setCleanedPdfUrl(null);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      setFile2PagesCount(pdf.getPageCount());
      showToast(`Loaded "${f.name}" (${pdf.getPageCount()} pages)`, "info");
    } catch (err) {
      showToast("Invalid PDF file for Batch 2", "error");
    }
  }

  // Swap Files if user uploaded them in reverse
  function handleSwapFiles() {
    const tempFile = file1;
    const tempCount = file1PagesCount;
    setFile1(file2);
    setFile1PagesCount(file2PagesCount);
    setFile2(tempFile);
    setFile2PagesCount(tempCount);
    setComparisonResults(null);
    setCleanedPdfBlob(null);
    setCleanedPdfUrl(null);
    showToast("Swapped PDF 1 and PDF 2", "info");
  }

  // Extract order information per page from a PDF file using client-side pdf.js
  async function extractPagesFromPdf(fileObj, onProgressUpdate, basePercent = 0, weight = 50) {
    await ensurePdfJsLoaded();
    const arrayBuffer = await fileObj.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pagesData = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => (item.str || "")).join(" ");

      // Multi-marketplace order & sub-order ID detection regex
      const orderMatch =
        pageText.match(/(?:Order|Sub\s*Order|Order\s*ID|Order\s*No)[^\d]*(\d{10,20}(?:_\d+)?)/i) ||
        pageText.match(/\b(\d{14,19}(?:_\d+)?)\b/) ||
        pageText.match(/(?:AWB|Tracking|Waybill)[:\s]*([A-Za-z0-9]{8,22})/i);

      let cleanOrderNo = orderMatch ? orderMatch[1].trim() : "";
      if (!cleanOrderNo) {
        // Fallback to searching any long numeric string
        const fallbackMatch = pageText.match(/\b\d{10,20}\b/);
        cleanOrderNo = fallbackMatch ? fallbackMatch[0] : `PAGE-${i}`;
      }

      // SKU extraction
      const skuMatch =
        pageText.match(/SKU[:\s]+([^\s\n,]+)/i) ||
        pageText.match(/(?:SKU|Product|Item)[:\s]+([A-Za-z0-9_\-]+)/i);
      const sku = skuMatch ? skuMatch[1].trim() : "GENERAL-SKU";

      // Customer Name / State extraction
      const stateMatch = pageText.match(
        /(?:Gujarat|Rajasthan|Maharashtra|Delhi|Uttar Pradesh|Punjab|Haryana|Karnataka|Tamil Nadu|West Bengal|Bihar|Assam|Kerala|Madhya Pradesh|Odisha|Telangana|Andhra Pradesh|Jharkhand|Uttarakhand|Goa|Chhattisgarh|Himachal Pradesh|Jammu)/i
      );
      const state = stateMatch ? stateMatch[0] : "";

      const qtyMatch = pageText.match(/(?:Qty|Quantity)[:\s]+(\d+)/i);
      const qty = qtyMatch ? qtyMatch[1] : "1";

      pagesData.push({
        pageIndex: i - 1, // 0-indexed for pdf-lib copyPages
        pageNumber: i,
        orderNo: cleanOrderNo,
        sku,
        qty,
        state,
        rawSnippet: pageText.slice(0, 100),
      });

      if (onProgressUpdate) {
        const currentPct = basePercent + Math.round((i / numPages) * weight);
        onProgressUpdate(currentPct, `Scanning ${fileObj.name} (Page ${i} of ${numPages})...`);
      }
    }

    return pagesData;
  }

  // Main 100% Client-Side Comparison & Deduplication Engine
  async function handleFindAndRemoveDuplicates() {
    if (!file1 || !file2) {
      showToast("Please upload both PDF 1 (Reference Batch) and PDF 2 (New Batch)", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setProgressText("Initializing 100% client-side engine in browser memory...");
    setComparisonResults(null);

    try {
      // 1. Extract PDF 1 (Reference Batch)
      const pdf1Pages = await extractPagesFromPdf(file1, (p, txt) => {
        setProgress(p);
        setProgressText(txt);
      }, 5, 40);

      // Create lookup set for PDF 1 order numbers
      const pdf1OrderSet = new Set();
      const pdf1OrderDetails = new Map();
      pdf1Pages.forEach((p) => {
        if (p.orderNo) {
          const normKey = p.orderNo.toLowerCase().trim();
          pdf1OrderSet.add(normKey);
          pdf1OrderDetails.set(normKey, p);
        }
      });

      // 2. Extract PDF 2 (New Batch to Clean)
      const pdf2Pages = await extractPagesFromPdf(file2, (p, txt) => {
        setProgress(p);
        setProgressText(txt);
      }, 45, 40);

      setProgress(88);
      setProgressText("Filtering duplicates & assembling clean unique PDF...");

      // 3. Compare PDF 2 against PDF 1 and remove internal duplicates
      const uniquePagesToKeep = [];
      const duplicatePagesRemoved = [];
      const pdf2SeenOrders = new Set();

      pdf2Pages.forEach((p) => {
        const normKey = p.orderNo.toLowerCase().trim();
        let isDuplicate = false;
        let dupReason = "";

        if (pdf1OrderSet.has(normKey)) {
          isDuplicate = true;
          const refPage = pdf1OrderDetails.get(normKey);
          dupReason = `Already printed in "${file1.name}" (Page #${refPage?.pageNumber || "1"})`;
        } else if (pdf2SeenOrders.has(normKey)) {
          isDuplicate = true;
          dupReason = `Repeated copy within "${file2.name}"`;
        }

        if (isDuplicate) {
          duplicatePagesRemoved.push({
            ...p,
            reason: dupReason,
          });
        } else {
          pdf2SeenOrders.add(normKey);
          uniquePagesToKeep.push(p);
        }
      });

      // 4. Generate Clean Unique PDF via pdf-lib in browser memory
      const pdf2Buffer = await file2.arrayBuffer();
      const sourcePdf2Doc = await PDFDocument.load(pdf2Buffer, { ignoreEncryption: true });
      const cleanPdfDoc = await PDFDocument.create();

      if (uniquePagesToKeep.length > 0) {
        const pageIndicesToCopy = uniquePagesToKeep.map((p) => p.pageIndex);
        const copiedPages = await cleanPdfDoc.copyPages(sourcePdf2Doc, pageIndicesToCopy);
        copiedPages.forEach((cp) => cleanPdfDoc.addPage(cp));
      }

      const cleanPdfBytes = await cleanPdfDoc.save();
      const cleanBlob = new Blob([cleanPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(cleanBlob);

      setCleanedPdfBlob(cleanBlob);
      setCleanedPdfUrl(url);

      const summaryObj = {
        file1Name: file1.name,
        file1Total: pdf1Pages.length,
        file2Name: file2.name,
        file2Total: pdf2Pages.length,
        totalDuplicates: duplicatePagesRemoved.length,
        totalUnique: uniquePagesToKeep.length,
        uniquePages: uniquePagesToKeep,
        duplicatePages: duplicatePagesRemoved,
      };

      setComparisonResults(summaryObj);
      setProgress(100);
      setProgressText("Deduplication complete!");
      showToast(
        `Successfully removed ${duplicatePagesRemoved.length} duplicate orders! ${uniquePagesToKeep.length} unique labels ready.`,
        "success"
      );
    } catch (err) {
      console.error("Client-side deduplication failed:", err);
      showToast(`Error processing PDFs: ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  }

  // Action 1: Download Clean Unique PDF
  function handleDownloadUniquePdf() {
    if (!cleanedPdfUrl) return;
    const a = document.createElement("a");
    a.href = cleanedPdfUrl;
    a.download = `unique_labels_${file2 ? file2.name.replace(/\.[^/.]+$/, "") : "cleaned"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Cleaned unique PDF download started!", "success");
  }

  // Action 2: Process with Studio (Pass to Studio via IndexedDB & redirect)
  async function handleProcessWithStudio() {
    if (!cleanedPdfBlob) return;
    try {
      const fileName = `unique_${file2 ? file2.name : "labels_cleaned.pdf"}`;
      await setPendingStudioPdf(cleanedPdfBlob, fileName);
      showToast("Redirecting to Studio with unique labels auto-loaded...", "success");
      setTimeout(() => {
        router.push("/");
      }, 300);
    } catch (err) {
      console.error("Failed to pass PDF to Studio:", err);
      showToast("Failed to transfer PDF to Studio", "error");
    }
  }

  // Filtered rows for table search
  const displayedRows = useMemo(() => {
    if (!comparisonResults) return [];
    const sourceList = activeTab === "unique" ? comparisonResults.uniquePages : comparisonResults.duplicatePages;
    if (!tableSearch.trim()) return sourceList;
    const q = tableSearch.trim().toLowerCase();
    return sourceList.filter(
      (item) =>
        (item.orderNo && item.orderNo.toLowerCase().includes(q)) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.state && item.state.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q))
    );
  }, [comparisonResults, activeTab, tableSearch]);

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
            background:
              toast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : toast.type === "info"
                ? "rgba(79, 70, 229, 0.95)"
                : "rgba(239, 68, 68, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 9999,
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 6px 18px rgba(79, 70, 229, 0.25)",
            }}
          >
            <CopyIcon size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="heading-display" style={{ fontSize: "1.65rem", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
              Duplicate Shipping Label Remover
            </h1>
            <p style={{ fontSize: "0.83rem", color: "#64748B", marginTop: 3, marginBottom: 0 }}>
              Cross-compare 2 PDF files by Order Number, eliminate duplicate labels in 0ms browser memory, and process unique labels in Studio.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/"
            className="btn-secondary"
            style={{ textDecoration: "none", fontSize: "0.85rem", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}
          >
            <LayersIcon size={15} /> Back to Studio
          </Link>
        </div>
      </div>

      {/* 100% Client-Side Privacy Badge */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "12px",
          padding: "10px 16px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: "0.82rem",
          color: "#166534",
        }}
      >
        <SparklesIcon size={16} color="#16A34A" />
        <span>
          <strong>100% Client-Side Zero Server Load:</strong> All PDF parsing, order number comparison, and duplicate label removal are processed instantly inside your browser. No files are uploaded to any server.
        </span>
      </div>

      {/* Dual PDF Upload Cards Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, marginBottom: 24 }}>
        {/* PDF 1: Reference / Already Printed Batch */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            background: "#FFFFFF",
            border: file1 ? "2px solid #6366F1" : "1px dashed #CBD5E1",
            borderRadius: "18px",
            boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              PDF 1: Reference Batch (Old / Already Printed)
            </span>
            {file1 && (
              <span className="tag-pill badge-indigo" style={{ fontSize: "0.72rem" }}>
                {file1PagesCount} Labels
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 0, marginBottom: 14 }}>
            Upload the previous PDF containing orders you already dispatched or printed yesterday.
          </p>

          <input
            type="file"
            accept="application/pdf"
            ref={file1InputRef}
            onChange={handleFile1Change}
            style={{ display: "none" }}
          />

          {!file1 ? (
            <div
              onClick={() => file1InputRef.current?.click()}
              style={{
                background: "#F8FAFC",
                border: "2px dashed #CBD5E1",
                borderRadius: "14px",
                padding: "30px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366F1")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EEF2FF", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UploadCloudIcon size={22} color="#4F46E5" />
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                Click to upload PDF 1 (Reference Batch)
              </div>
              <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: 4 }}>
                Supports standard Meesho / Courier shipping label PDFs
              </div>
            </div>
          ) : (
            <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <FilePdfIcon size={24} color="#4F46E5" />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {file1.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#4F46E5", fontWeight: 600 }}>
                    {file1PagesCount} pages detected
                  </div>
                </div>
              </div>
              <button
                onClick={() => file1InputRef.current?.click()}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.75rem", background: "#FFFFFF" }}
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* PDF 2: Incoming / New Batch to Deduplicate */}
        <div
          className="premium-glass"
          style={{
            padding: "22px 20px",
            background: "#FFFFFF",
            border: file2 ? "2px solid #0284C7" : "1px dashed #CBD5E1",
            borderRadius: "18px",
            boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0284C7", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              PDF 2: New Batch (Incoming to Clean)
            </span>
            {file2 && (
              <span className="tag-pill badge-sky" style={{ fontSize: "0.72rem" }}>
                {file2PagesCount} Labels
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 0, marginBottom: 14 }}>
            Upload today&apos;s new label PDF. Duplicate orders matching PDF 1 will be automatically removed.
          </p>

          <input
            type="file"
            accept="application/pdf"
            ref={file2InputRef}
            onChange={handleFile2Change}
            style={{ display: "none" }}
          />

          {!file2 ? (
            <div
              onClick={() => file2InputRef.current?.click()}
              style={{
                background: "#F8FAFC",
                border: "2px dashed #CBD5E1",
                borderRadius: "14px",
                padding: "30px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#0284C7")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
            >
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#E0F2FE", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UploadCloudIcon size={22} color="#0284C7" />
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>
                Click to upload PDF 2 (New Batch)
              </div>
              <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: 4 }}>
                New orders to be cleaned & deduplicated
              </div>
            </div>
          ) : (
            <div style={{ background: "#E0F2FE", border: "1px solid #BAE6FD", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                <FilePdfIcon size={24} color="#0284C7" />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                    {file2.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#0284C7", fontWeight: 600 }}>
                    {file2PagesCount} pages detected
                  </div>
                </div>
              </div>
              <button
                onClick={() => file2InputRef.current?.click()}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.75rem", background: "#FFFFFF" }}
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Compare Action Bar */}
      <div
        className="premium-glass"
        style={{
          padding: "16px 22px",
          background: "#FFFFFF",
          borderRadius: "16px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleSwapFiles}
            disabled={!file1 || !file2 || isProcessing}
            className="btn-secondary"
            style={{ fontSize: "0.82rem", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, opacity: (!file1 || !file2) ? 0.6 : 1 }}
          >
            <RefreshCwIcon size={14} /> Swap PDF 1 ⇄ PDF 2
          </button>
          <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
            {file1 && file2 ? `Comparing ${file1PagesCount} ref orders vs ${file2PagesCount} new orders` : "Upload both PDF 1 and PDF 2 to start"}
          </span>
        </div>

        <button
          onClick={handleFindAndRemoveDuplicates}
          disabled={!file1 || !file2 || isProcessing}
          className="btn-primary"
          style={{
            padding: "12px 28px",
            fontSize: "0.92rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: (!file1 || !file2 || isProcessing) ? 0.6 : 1,
            cursor: (!file1 || !file2 || isProcessing) ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(79, 70, 229, 0.3)",
          }}
        >
          {isProcessing ? (
            <>
              <RefreshCwIcon size={16} className="spin-icon" /> Comparing Orders...
            </>
          ) : (
            <>
              <SparklesIcon size={18} /> Find &amp; Remove Duplicates
            </>
          )}
        </button>
      </div>

      {/* Live Processing Progress Bar */}
      {isProcessing && (
        <div className="premium-glass" style={{ padding: "20px 24px", marginBottom: 24, background: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#4F46E5" }}>
              {progressText}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0F172A" }}>
              {progress}%
            </span>
          </div>
          <div style={{ width: "100%", height: 8, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #4F46E5 0%, #0284C7 100%)",
                borderRadius: 99,
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Comparison Results & Statistics Dashboard */}
      {comparisonResults && (
        <>
          {/* 4 Summary Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16, marginBottom: 24 }}>
            {/* Total in PDF 1 */}
            <div className="premium-glass" style={{ padding: "20px", borderTop: "3px solid #6366F1", background: "#FFFFFF" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                PDF 1 (Ref Orders)
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", marginTop: 6 }}>
                {comparisonResults.file1Total}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#6366F1", fontWeight: 600 }}>
                Existing master labels
              </span>
            </div>

            {/* Total in PDF 2 */}
            <div className="premium-glass" style={{ padding: "20px", borderTop: "3px solid #0284C7", background: "#FFFFFF" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                PDF 2 (Incoming)
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0284C7", marginTop: 6 }}>
                {comparisonResults.file2Total}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#0284C7", fontWeight: 600 }}>
                Total new labels uploaded
              </span>
            </div>

            {/* Duplicates Removed */}
            <div className="premium-glass" style={{ padding: "20px", borderTop: "3px solid #DC2626", background: "#FFFFFF" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#DC2626", textTransform: "uppercase" }}>
                Duplicates Removed
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#DC2626", marginTop: 6 }}>
                {comparisonResults.totalDuplicates}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#DC2626", fontWeight: 600 }}>
                Filtered out to prevent double-print
              </span>
            </div>

            {/* Clean Unique Labels */}
            <div className="premium-glass" style={{ padding: "20px", borderTop: "3px solid #059669", background: "#FFFFFF" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                Clean Unique Labels
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#059669", marginTop: 6 }}>
                {comparisonResults.totalUnique}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                100% unique &amp; ready to print
              </span>
            </div>
          </div>

          {/* Action Hub: Download Unique PDF vs Process with Studio */}
          <div
            className="premium-glass"
            style={{
              padding: "24px 28px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)",
              border: "1px solid #C7D2FE",
              marginBottom: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              boxShadow: "0 10px 30px -5px rgba(79, 70, 229, 0.12)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="tag-pill badge-emerald" style={{ fontSize: "0.75rem" }}>
                  <CheckCircleIcon size={13} /> {comparisonResults.totalUnique} Unique Labels Ready
                </span>
                <span className="tag-pill badge-rose" style={{ fontSize: "0.75rem" }}>
                  <TrashIcon size={13} /> {comparisonResults.totalDuplicates} Duplicates Removed
                </span>
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "#0F172A", margin: "8px 0 4px 0", fontWeight: 800 }}>
                Unique Cleaned PDF is Ready!
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#475569", margin: 0 }}>
                Download the cleaned unique PDF directly or seamlessly send it to Studio for SKU sorting, QR stamping, and thermal cropping.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Button 1: Download Unique PDF */}
              <button
                onClick={handleDownloadUniquePdf}
                className="btn-secondary"
                style={{
                  padding: "12px 22px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  background: "#FFFFFF",
                  borderColor: "#CBD5E1",
                  color: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <DownloadIcon size={18} color="#0284C7" /> Download Unique PDF
              </button>

              {/* Button 2: Process with Studio */}
              <button
                onClick={handleProcessWithStudio}
                className="btn-primary"
                style={{
                  padding: "12px 26px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
                  boxShadow: "0 6px 20px rgba(79, 70, 229, 0.35)",
                }}
              >
                <ZapIcon size={18} color="#FFFFFF" /> Process with Studio <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>

          {/* Detailed Verification Table */}
          <div className="premium-glass" style={{ padding: "20px 24px", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              {/* Tabs: Unique vs Duplicates */}
              <div className="segmented-control" style={{ background: "#F1F5F9", padding: "4px", borderRadius: "10px", display: "inline-flex", gap: 4 }}>
                <button
                  onClick={() => setActiveTab("unique")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === "unique" ? "#FFFFFF" : "transparent",
                    color: activeTab === "unique" ? "#059669" : "#64748B",
                    fontWeight: activeTab === "unique" ? 700 : 500,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    boxShadow: activeTab === "unique" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <CheckCircleIcon size={14} color="#059669" /> Unique Labels ({comparisonResults.totalUnique})
                </button>
                <button
                  onClick={() => setActiveTab("duplicate")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: activeTab === "duplicate" ? "#FFFFFF" : "transparent",
                    color: activeTab === "duplicate" ? "#DC2626" : "#64748B",
                    fontWeight: activeTab === "duplicate" ? 700 : 500,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    boxShadow: activeTab === "duplicate" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <TrashIcon size={14} color="#DC2626" /> Removed Duplicates ({comparisonResults.totalDuplicates})
                </button>
              </div>

              {/* Search in table */}
              <div style={{ position: "relative", minWidth: 260, display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: 10, pointerEvents: "none", display: "flex" }}>
                  <SearchIcon size={15} color="#64748B" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by Order No, SKU, State..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 14px 8px 34px",
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    color: "#0F172A",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive-container">
              <table className="custom-table" style={{ minWidth: "850px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "8%", paddingLeft: "16px" }}>PAGE #</th>
                    <th style={{ width: "24%" }}>ORDER NO / SUB ORDER ID</th>
                    <th style={{ width: "22%" }}>SKU NAME</th>
                    <th style={{ width: "10%" }}>QTY</th>
                    <th style={{ width: "16%" }}>STATE / DESTINATION</th>
                    <th style={{ width: "20%" }}>STATUS &amp; ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#64748B" }}>
                        No orders found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: activeTab === "duplicate" ? "#FFF5F5" : "transparent",
                        }}
                      >
                        <td style={{ color: "#64748B", fontWeight: 700, paddingLeft: "16px", fontSize: "0.82rem" }}>
                          #{item.pageNumber}
                        </td>
                        <td style={{ fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          {item.orderNo}
                        </td>
                        <td>
                          <span className="tag-pill badge-indigo" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <TagIcon size={12} /> {item.sku}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: "#0284C7" }}>
                          {item.qty}
                        </td>
                        <td style={{ color: "#475569", fontSize: "0.82rem" }}>
                          {item.state || "India"}
                        </td>
                        <td>
                          {activeTab === "unique" ? (
                            <span className="tag-pill badge-emerald" style={{ fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CheckIcon size={12} /> Unique Ready
                            </span>
                          ) : (
                            <span className="tag-pill badge-rose" style={{ fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CloseIcon size={12} /> {item.reason || "Duplicate Removed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
