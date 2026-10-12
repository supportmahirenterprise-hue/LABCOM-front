"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

  // Clean Mode: "clean_pdf1" (clean PDF 1 using PDF 2), "clean_pdf2" (clean PDF 2 using PDF 1), "merge_unique" (merge all unique)
  const [cleanMode, setCleanMode] = useState("clean_pdf1");

  // In-Memory Cached Parsed Data & Documents (for 0ms instant mode switching)
  const [cachedPdf1Pages, setCachedPdf1Pages] = useState(null);
  const [cachedPdf2Pages, setCachedPdf2Pages] = useState(null);
  const cachedPdf1DocRef = useRef(null);
  const cachedPdf2DocRef = useRef(null);

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

  // Clean up object URL on unmount or URL replacement
  useEffect(() => {
    return () => {
      if (cleanedPdfUrl) {
        URL.revokeObjectURL(cleanedPdfUrl);
      }
    };
  }, [cleanedPdfUrl]);

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
    setCachedPdf1Pages(null);
    cachedPdf1DocRef.current = null;
    setComparisonResults(null);
    if (cleanedPdfUrl) URL.revokeObjectURL(cleanedPdfUrl);
    setCleanedPdfBlob(null);
    setCleanedPdfUrl(null);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      cachedPdf1DocRef.current = pdf;
      const count = pdf.getPageCount();
      setFile1PagesCount(count);

      // Auto-set cleanMode based on page count if file2 already present
      if (file2) {
        if (count >= file2PagesCount) {
          setCleanMode("clean_pdf1");
        } else {
          setCleanMode("clean_pdf2");
        }
      } else {
        setCleanMode("clean_pdf1");
      }

      showToast(`Loaded "${f.name}" (${count} pages)`, "info");
    } catch (err) {
      console.error(err);
      showToast("Invalid PDF file for Batch 1", "error");
    }
  }

  // Handle PDF 2 selection
  async function handleFile2Change(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile2(f);
    setCachedPdf2Pages(null);
    cachedPdf2DocRef.current = null;
    setComparisonResults(null);
    if (cleanedPdfUrl) URL.revokeObjectURL(cleanedPdfUrl);
    setCleanedPdfBlob(null);
    setCleanedPdfUrl(null);
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      cachedPdf2DocRef.current = pdf;
      const count = pdf.getPageCount();
      setFile2PagesCount(count);

      // Smart cleanMode selection: user usually wants to clean the larger file or file1
      if (file1) {
        if (file1PagesCount >= count) {
          setCleanMode("clean_pdf1");
        } else {
          setCleanMode("clean_pdf2");
        }
      }

      showToast(`Loaded "${f.name}" (${count} pages)`, "info");
    } catch (err) {
      console.error(err);
      showToast("Invalid PDF file for Batch 2", "error");
    }
  }

  // Swap Files if user uploaded them in reverse
  function handleSwapFiles() {
    const tempFile = file1;
    const tempCount = file1PagesCount;
    const tempPages = cachedPdf1Pages;
    const tempDoc = cachedPdf1DocRef.current;

    setFile1(file2);
    setFile1PagesCount(file2PagesCount);
    setCachedPdf1Pages(cachedPdf2Pages);
    cachedPdf1DocRef.current = cachedPdf2DocRef.current;

    setFile2(tempFile);
    setFile2PagesCount(tempCount);
    setCachedPdf2Pages(tempPages);
    cachedPdf2DocRef.current = tempDoc;

    // Invert clean mode if it was specific
    if (cleanMode === "clean_pdf1") setCleanMode("clean_pdf2");
    else if (cleanMode === "clean_pdf2") setCleanMode("clean_pdf1");

    // If already computed, re-execute immediately with swapped values
    if (cachedPdf2Pages && tempPages) {
      executeDeduplication(
        cleanMode === "clean_pdf1" ? "clean_pdf2" : cleanMode === "clean_pdf2" ? "clean_pdf1" : "merge_unique",
        cachedPdf2Pages,
        tempPages,
        cachedPdf2DocRef.current,
        tempDoc,
        file2,
        tempFile
      );
    } else {
      setComparisonResults(null);
      if (cleanedPdfUrl) URL.revokeObjectURL(cleanedPdfUrl);
      setCleanedPdfBlob(null);
      setCleanedPdfUrl(null);
    }

    showToast("Swapped PDF 1 and PDF 2", "info");
  }

  // Normalized order keys generator to support both full sub-order IDs and base order IDs
  function getOrderKeys(orderNo) {
    if (!orderNo) return [];
    const norm = orderNo.toLowerCase().trim();
    const keys = [norm];
    // Remove marketplace prefixes if present (e.g. od1234567890)
    const cleanNum = norm.replace(/^(?:od|sub_|ord_|awb_)/, "");
    if (cleanNum && cleanNum !== norm && cleanNum.length >= 8) {
      keys.push(cleanNum);
    }
    // Handle sub-order suffixes only for long marketplace order numbers (8+ digits) like 123456789012_1
    const subOrderMatch = norm.match(/^(\d{8,20})[_\-](\d{1,3})$/);
    if (subOrderMatch && subOrderMatch[1]) {
      keys.push(subOrderMatch[1]);
    }
    return keys;
  }

  // Extract order information per page from a PDF file using client-side pdf.js
  async function extractPagesFromPdf(fileObj, sourceTag, onProgressUpdate, basePercent = 0, weight = 50) {
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
      const pageText = textContent.items.map((item) => item.str || "").join(" ");

      // Multi-marketplace order detection: Meesho, Flipkart, Amazon, Courier AWBs
      let cleanOrderNo = "";
      let isRealOrder = true;

      // 1. Meesho standard Sub Order / Order No with suffix: e.g. 123456789012_1 or 842918342111_1
      const meeshoSubMatch = pageText.match(/\b(\d{10,20}_\d+)\b/);
      // 2. Explicit Sub Order No / ID label
      const subOrderExplicit = pageText.match(/(?:Sub\s*Order|Sub-Order|SubOrder)\s*(?:No|ID|Number)?\.?\s*[:\s-]*([a-zA-Z0-9_\-]{8,40})/i);
      // 3. Explicit Order No / ID label
      const orderExplicit = pageText.match(/(?:Order\s*ID|Order\s*No|Order\s*Number|Purchase\s*Order\s*No)\.?\s*[:\s-]*([a-zA-Z0-9_\-]{8,40})/i);
      // 4. Amazon Order ID: 402-1234567-1234567
      const amazonMatch = pageText.match(/\b\d{3}-\d{7}-\d{7}\b/);
      // 5. Flipkart Order ID: OD123456789012345678
      const flipkartMatch = pageText.match(/\b(OD\d{16,22})\b/i);
      // 6. Generic pattern: Order ... 123456789012
      const genericOrder = pageText.match(/(?:Order|Sub\s*Order)[^\d]{1,25}(\d{10,20}(?:_\d+)?)/i);
      // 7. AWB / Tracking number
      const awbMatch = pageText.match(/(?:AWB|Tracking|Waybill|LR\s*No)[:\s#]*([A-Za-z0-9]{8,25})/i);
      // 8. Long standalone number: 12-20 digits
      const longNumMatch = pageText.match(/\b(\d{12,20})\b/);

      if (meeshoSubMatch && meeshoSubMatch[1]) {
        cleanOrderNo = meeshoSubMatch[1].trim();
      } else if (subOrderExplicit && subOrderExplicit[1]) {
        cleanOrderNo = subOrderExplicit[1].trim();
      } else if (orderExplicit && orderExplicit[1]) {
        cleanOrderNo = orderExplicit[1].trim();
      } else if (amazonMatch) {
        cleanOrderNo = amazonMatch[0].trim();
      } else if (flipkartMatch && flipkartMatch[1]) {
        cleanOrderNo = flipkartMatch[1].trim();
      } else if (genericOrder && genericOrder[1]) {
        cleanOrderNo = genericOrder[1].trim();
      } else if (awbMatch && awbMatch[1]) {
        cleanOrderNo = awbMatch[1].trim();
      } else if (longNumMatch && longNumMatch[1]) {
        cleanOrderNo = longNumMatch[1].trim();
      } else {
        // Fallback unique to prevent false duplicate collision
        cleanOrderNo = `UNIDENTIFIED_${sourceTag}_PAGE_${i}`;
        isRealOrder = false;
      }

      // SKU extraction
      const skuMatch =
        pageText.match(/SKU[:\s]+([^\s\n,]+)/i) ||
        pageText.match(/(?:SKU|Product|Item)[:\s]+([A-Za-z0-9_\-]+)/i);
      const sku = skuMatch ? skuMatch[1].trim() : "GENERAL-SKU";

      // Destination State extraction
      const stateMatch = pageText.match(
        /(?:Gujarat|Rajasthan|Maharashtra|Delhi|Uttar Pradesh|Punjab|Haryana|Karnataka|Tamil Nadu|West Bengal|Bihar|Assam|Kerala|Madhya Pradesh|Odisha|Telangana|Andhra Pradesh|Jharkhand|Uttarakhand|Goa|Chhattisgarh|Himachal Pradesh|Jammu)/i
      );
      const state = stateMatch ? stateMatch[0] : "";

      const qtyMatch = pageText.match(/(?:Qty|Quantity)[:\s]+(\d+)/i);
      const qty = qtyMatch ? qtyMatch[1] : "1";

      pagesData.push({
        sourceTag, // "pdf1" or "pdf2"
        sourceFileName: fileObj.name,
        pageIndex: i - 1, // 0-indexed for pdf-lib copyPages
        pageNumber: i,
        orderNo: cleanOrderNo,
        isRealOrder,
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

  // Core Pure In-Memory Deduplication & PDF Assembler
  const executeDeduplication = useCallback(
    async (mode, p1Data, p2Data, pdf1Doc, pdf2Doc, f1, f2) => {
      setIsProcessing(true);
      setProgressText("Executing duplicate removal & building clean unique PDF...");

      try {
        const uniquePagesToKeep = [];
        const duplicatePagesRemoved = [];

        // Build lookup map and set for PDF 1 (if available)
        const pdf1KeysSet = new Set();
        const pdf1KeyMap = new Map();
        if (p1Data && p1Data.length > 0) {
          p1Data.forEach((p) => {
            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);
              keys.forEach((k) => {
                pdf1KeysSet.add(k);
                if (!pdf1KeyMap.has(k)) pdf1KeyMap.set(k, p);
              });
            }
          });
        }

        // Build lookup map and set for PDF 2 (if available)
        const pdf2KeysSet = new Set();
        const pdf2KeyMap = new Map();
        if (p2Data && p2Data.length > 0) {
          p2Data.forEach((p) => {
            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);
              keys.forEach((k) => {
                pdf2KeysSet.add(k);
                if (!pdf2KeyMap.has(k)) pdf2KeyMap.set(k, p);
              });
            }
          });
        }

        // --- MODE 1: CLEAN PDF 1 (Remove PDF 2 duplicates & internal repeats from PDF 1) ---
        if (mode === "clean_pdf1") {
          const seenOrdersP1 = new Set();

          p1Data.forEach((p) => {
            let isDuplicate = false;
            let dupReason = "";

            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);

              // 1. Check against PDF 2 (Incoming/Comparison batch)
              if (p2Data && p2Data.length > 0) {
                const matchedKey = keys.find((k) => pdf2KeysSet.has(k));
                if (matchedKey) {
                  isDuplicate = true;
                  const refP2 = pdf2KeyMap.get(matchedKey);
                  dupReason = `Found in "${f2?.name || "PDF 2"}" (Page #${refP2?.pageNumber || "1"})`;
                }
              }

              // 2. Check internal repetition within PDF 1 itself
              if (!isDuplicate) {
                const matchedInternal = keys.find((k) => seenOrdersP1.has(k));
                if (matchedInternal) {
                  isDuplicate = true;
                  dupReason = `Same order repeated within "${f1?.name || "PDF 1"}"`;
                }
              }

              if (isDuplicate) {
                duplicatePagesRemoved.push({
                  ...p,
                  reason: dupReason,
                });
              } else {
                keys.forEach((k) => seenOrdersP1.add(k));
                uniquePagesToKeep.push(p);
              }
            } else {
              // Non-identifiable label kept as unique safe
              uniquePagesToKeep.push(p);
            }
          });
        }

        // --- MODE 2: CLEAN PDF 2 (Remove PDF 1 duplicates & internal repeats from PDF 2) ---
        else if (mode === "clean_pdf2") {
          const seenOrdersP2 = new Set();

          p2Data.forEach((p) => {
            let isDuplicate = false;
            let dupReason = "";

            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);

              // 1. Check against PDF 1 (Reference batch)
              if (p1Data && p1Data.length > 0) {
                const matchedKey = keys.find((k) => pdf1KeysSet.has(k));
                if (matchedKey) {
                  isDuplicate = true;
                  const refP1 = pdf1KeyMap.get(matchedKey);
                  dupReason = `Found in "${f1?.name || "PDF 1"}" (Page #${refP1?.pageNumber || "1"})`;
                }
              }

              // 2. Check internal repetition within PDF 2 itself
              if (!isDuplicate) {
                const matchedInternal = keys.find((k) => seenOrdersP2.has(k));
                if (matchedInternal) {
                  isDuplicate = true;
                  dupReason = `Same order repeated within "${f2?.name || "PDF 2"}"`;
                }
              }

              if (isDuplicate) {
                duplicatePagesRemoved.push({
                  ...p,
                  reason: dupReason,
                });
              } else {
                keys.forEach((k) => seenOrdersP2.add(k));
                uniquePagesToKeep.push(p);
              }
            } else {
              uniquePagesToKeep.push(p);
            }
          });
        }

        // --- MODE 3: MERGE BOTH & KEEP 1 UNIQUE PER ORDER ---
        else if (mode === "merge_unique") {
          const seenUniversalOrders = new Set();

          // Pass 1: Add from PDF 1
          if (p1Data) {
            p1Data.forEach((p) => {
              if (p.isRealOrder) {
                const keys = getOrderKeys(p.orderNo);
                const isRepeated = keys.some((k) => seenUniversalOrders.has(k));
                if (isRepeated) {
                  duplicatePagesRemoved.push({
                    ...p,
                    reason: `Repeated copy within "${f1?.name || "PDF 1"}"`,
                  });
                } else {
                  keys.forEach((k) => seenUniversalOrders.add(k));
                  uniquePagesToKeep.push(p);
                }
              } else {
                uniquePagesToKeep.push(p);
              }
            });
          }

          // Pass 2: Add from PDF 2 (remove any that match PDF 1 or repeated in PDF 2)
          if (p2Data) {
            p2Data.forEach((p) => {
              if (p.isRealOrder) {
                const keys = getOrderKeys(p.orderNo);
                const isRepeated = keys.some((k) => seenUniversalOrders.has(k));
                if (isRepeated) {
                  duplicatePagesRemoved.push({
                    ...p,
                    reason: `Duplicate copy already present in "${f1?.name || "PDF 1"}"`,
                  });
                } else {
                  keys.forEach((k) => seenUniversalOrders.add(k));
                  uniquePagesToKeep.push(p);
                }
              } else {
                uniquePagesToKeep.push(p);
              }
            });
          }
        }

        // --- SMART AUTO-SAFEGUARD ---
        // If the selected mode produced 0 unique labels, but the other file contains unique labels,
        // automatically switch to the file with unique labels so the user never gets an empty result!
        if (mode === "clean_pdf2" && uniquePagesToKeep.length === 0 && p1Data && p1Data.length > 0) {
          const altUnique = [];
          const altDups = [];
          const altSeen = new Set();
          p1Data.forEach((p) => {
            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);
              const matchedKey = keys.find((k) => pdf2KeysSet.has(k));
              if (matchedKey) {
                altDups.push({ ...p, reason: `Matches duplicate in "${f2?.name || "PDF 2"}"` });
              } else if (keys.some((k) => altSeen.has(k))) {
                altDups.push({ ...p, reason: `Repeated copy within "${f1?.name || "PDF 1"}"` });
              } else {
                keys.forEach((k) => altSeen.add(k));
                altUnique.push(p);
              }
            } else {
              altUnique.push(p);
            }
          });

          if (altUnique.length > 0) {
            mode = "clean_pdf1";
            setCleanMode("clean_pdf1");
            uniquePagesToKeep.length = 0;
            uniquePagesToKeep.push(...altUnique);
            duplicatePagesRemoved.length = 0;
            duplicatePagesRemoved.push(...altDups);
          }
        } else if (mode === "clean_pdf1" && uniquePagesToKeep.length === 0 && p2Data && p2Data.length > 0) {
          const altUnique = [];
          const altDups = [];
          const altSeen = new Set();
          p2Data.forEach((p) => {
            if (p.isRealOrder) {
              const keys = getOrderKeys(p.orderNo);
              const matchedKey = keys.find((k) => pdf1KeysSet.has(k));
              if (matchedKey) {
                altDups.push({ ...p, reason: `Matches duplicate in "${f1?.name || "PDF 1"}"` });
              } else if (keys.some((k) => altSeen.has(k))) {
                altDups.push({ ...p, reason: `Repeated copy within "${f2?.name || "PDF 2"}"` });
              } else {
                keys.forEach((k) => altSeen.add(k));
                altUnique.push(p);
              }
            } else {
              altUnique.push(p);
            }
          });

          if (altUnique.length > 0) {
            mode = "clean_pdf2";
            setCleanMode("clean_pdf2");
            uniquePagesToKeep.length = 0;
            uniquePagesToKeep.push(...altUnique);
            duplicatePagesRemoved.length = 0;
            duplicatePagesRemoved.push(...altDups);
          }
        }

        // --- 4. ASSEMBLE CLEAN PDF DOCUMENT IN BROWSER MEMORY ---
        let newCleanBlob = null;
        let newCleanUrl = null;

        if (uniquePagesToKeep.length > 0) {
          const cleanPdfDoc = await PDFDocument.create();

          // Separate pages by source for high-performance chunked copying
          const p1Indices = uniquePagesToKeep
            .filter((p) => p.sourceTag === "pdf1")
            .map((p) => p.pageIndex);
          const p2Indices = uniquePagesToKeep
            .filter((p) => p.sourceTag === "pdf2")
            .map((p) => p.pageIndex);

          let p1CopiedPages = [];
          let p2CopiedPages = [];

          if (p1Indices.length > 0 && pdf1Doc) {
            p1CopiedPages = await cleanPdfDoc.copyPages(pdf1Doc, p1Indices);
          }
          if (p2Indices.length > 0 && pdf2Doc) {
            p2CopiedPages = await cleanPdfDoc.copyPages(pdf2Doc, p2Indices);
          }

          let p1Ptr = 0;
          let p2Ptr = 0;

          // Preserve exact ordering of uniquePagesToKeep
          for (const item of uniquePagesToKeep) {
            if (item.sourceTag === "pdf1" && p1Ptr < p1CopiedPages.length) {
              cleanPdfDoc.addPage(p1CopiedPages[p1Ptr++]);
            } else if (item.sourceTag === "pdf2" && p2Ptr < p2CopiedPages.length) {
              cleanPdfDoc.addPage(p2CopiedPages[p2Ptr++]);
            }
          }

          const cleanPdfBytes = await cleanPdfDoc.save();
          newCleanBlob = new Blob([cleanPdfBytes], { type: "application/pdf" });
          newCleanUrl = URL.createObjectURL(newCleanBlob);
        } else {
          // If 0 unique labels remain, DO NOT create corrupt 0-page empty PDF!
          newCleanBlob = null;
          newCleanUrl = null;
        }

        // Revoke old URL if existing
        if (cleanedPdfUrl) {
          URL.revokeObjectURL(cleanedPdfUrl);
        }

        setCleanedPdfBlob(newCleanBlob);
        setCleanedPdfUrl(newCleanUrl);

        const summaryObj = {
          mode,
          file1Name: f1?.name || "PDF 1",
          file1Total: p1Data ? p1Data.length : 0,
          file2Name: f2?.name || "PDF 2",
          file2Total: p2Data ? p2Data.length : 0,
          totalDuplicates: duplicatePagesRemoved.length,
          totalUnique: uniquePagesToKeep.length,
          uniquePages: uniquePagesToKeep,
          duplicatePages: duplicatePagesRemoved,
        };

        setComparisonResults(summaryObj);
        setProgress(100);
        setProgressText("Deduplication complete!");

        if (uniquePagesToKeep.length > 0) {
          showToast(
            `Removed ${duplicatePagesRemoved.length} duplicate labels! ${uniquePagesToKeep.length} clean unique labels ready.`,
            "success"
          );
        } else {
          showToast(
            `All ${duplicatePagesRemoved.length} labels in this target were duplicates. Switch Clean Mode above if needed.`,
            "warning"
          );
        }
      } catch (err) {
        console.error("Deduplication assembly failed:", err);
        showToast(`Deduplication error: ${err.message}`, "error");
      } finally {
        setIsProcessing(false);
      }
    },
    [cleanedPdfUrl]
  );

  // Main Handle Click: "Find & Remove Duplicates"
  async function handleFindAndRemoveDuplicates() {
    if (!file1 && !file2) {
      showToast("Please upload at least one PDF to clean duplicate shipping labels", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setProgressText("Initializing 100% client-side engine in browser memory...");
    setComparisonResults(null);

    try {
      let p1Pages = cachedPdf1Pages;
      let p2Pages = cachedPdf2Pages;

      // 1. Ensure PDFDocument instances loaded in ref
      if (file1 && !cachedPdf1DocRef.current) {
        const buf1 = await file1.arrayBuffer();
        cachedPdf1DocRef.current = await PDFDocument.load(buf1, { ignoreEncryption: true });
      }
      if (file2 && !cachedPdf2DocRef.current) {
        const buf2 = await file2.arrayBuffer();
        cachedPdf2DocRef.current = await PDFDocument.load(buf2, { ignoreEncryption: true });
      }

      // 2. Extract PDF 1 if not cached
      if (file1 && !p1Pages) {
        p1Pages = await extractPagesFromPdf(
          file1,
          "pdf1",
          (p, txt) => {
            setProgress(p);
            setProgressText(txt);
          },
          5,
          file2 ? 40 : 80
        );
        setCachedPdf1Pages(p1Pages);
      }

      // 3. Extract PDF 2 if not cached
      if (file2 && !p2Pages) {
        p2Pages = await extractPagesFromPdf(
          file2,
          "pdf2",
          (p, txt) => {
            setProgress(p);
            setProgressText(txt);
          },
          45,
          40
        );
        setCachedPdf2Pages(p2Pages);
      }

      // Determine active target mode: if single PDF uploaded, force that target
      let targetMode = cleanMode;
      if (file1 && !file2) {
        targetMode = "clean_pdf1";
        setCleanMode("clean_pdf1");
      } else if (!file1 && file2) {
        targetMode = "clean_pdf2";
        setCleanMode("clean_pdf2");
      }

      setProgress(88);
      await executeDeduplication(
        targetMode,
        p1Pages,
        p2Pages,
        cachedPdf1DocRef.current,
        cachedPdf2DocRef.current,
        file1,
        file2
      );
    } catch (err) {
      console.error("Client-side deduplication failed:", err);
      showToast(`Error processing PDFs: ${err.message}`, "error");
      setIsProcessing(false);
    }
  }

  // Handle Mode Change (Re-calculates instantly if pages already extracted)
  function handleCleanModeChange(newMode) {
    setCleanMode(newMode);
    if (cachedPdf1Pages || cachedPdf2Pages) {
      executeDeduplication(
        newMode,
        cachedPdf1Pages,
        cachedPdf2Pages,
        cachedPdf1DocRef.current,
        cachedPdf2DocRef.current,
        file1,
        file2
      );
    }
  }

  // Action 1: Download Clean Unique PDF
  function handleDownloadUniquePdf() {
    if (!cleanedPdfUrl || !comparisonResults || comparisonResults.totalUnique === 0) {
      showToast("No unique labels available to download (0 labels)", "warning");
      return;
    }
    const targetFile =
      cleanMode === "clean_pdf1" && file1
        ? file1
        : cleanMode === "clean_pdf2" && file2
        ? file2
        : null;
    const baseName = targetFile ? targetFile.name.replace(/\.[^/.]+$/, "") : "unique_merged";
    const a = document.createElement("a");
    a.href = cleanedPdfUrl;
    a.download = `unique_labels_${baseName}_${comparisonResults.totalUnique}_orders.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${comparisonResults.totalUnique} unique clean labels!`, "success");
  }

  // Action 2: Process with Studio (Pass to Studio via IndexedDB & redirect)
  async function handleProcessWithStudio() {
    if (!cleanedPdfBlob || !comparisonResults || comparisonResults.totalUnique === 0) {
      showToast("No unique labels available to transfer to Studio (0 labels)", "warning");
      return;
    }
    try {
      const targetFile =
        cleanMode === "clean_pdf1" && file1
          ? file1
          : cleanMode === "clean_pdf2" && file2
          ? file2
          : null;
      const baseName = targetFile ? targetFile.name.replace(/\.[^/.]+$/, "") : "labels_cleaned";
      const fileName = `unique_${baseName}_${comparisonResults.totalUnique}.pdf`;
      await setPendingStudioPdf(cleanedPdfBlob, fileName);
      showToast(`Redirecting to Studio with ${comparisonResults.totalUnique} unique labels auto-loaded...`, "success");
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
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        (item.sourceFileName && item.sourceFileName.toLowerCase().includes(q))
    );
  }, [comparisonResults, activeTab, tableSearch]);

  const hasAnyFile = !!file1 || !!file2;

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
                : toast.type === "warning"
                ? "rgba(245, 158, 11, 0.95)"
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
              Remove repeated order labels within a PDF or across 2 PDF files. Clean unique labels ready in 0ms with zero blank pages.
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
          <strong>100% Client-Side In-Browser Engine:</strong> All PDF parsing, order comparison, internal repeat detection, and clean unique page assembly are executed entirely in your browser memory. No files are uploaded to any server.
        </span>
      </div>

      {/* Dual PDF Upload Cards Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 20, marginBottom: 20 }}>
        {/* PDF 1: Batch 1 / Master Batch */}
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
              PDF 1: Batch 1 (Master / Main Batch)
            </span>
            {file1 && (
              <span className="tag-pill badge-indigo" style={{ fontSize: "0.72rem" }}>
                {file1PagesCount} Labels
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 0, marginBottom: 14 }}>
            Upload your shipping labels PDF (e.g. 6 labels). Internal duplicate orders and matches with PDF 2 will be removed.
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
                Click to upload PDF 1 (Batch 1)
              </div>
              <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: 4 }}>
                Supports Meesho, Amazon, Flipkart, or any Courier shipping labels
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

        {/* PDF 2: Batch 2 / Comparison Batch */}
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
              PDF 2: Batch 2 (Comparison / Duplicate List)
            </span>
            {file2 && (
              <span className="tag-pill badge-sky" style={{ fontSize: "0.72rem" }}>
                {file2PagesCount} Labels
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 0, marginBottom: 14 }}>
            Optional: Upload a 2nd PDF containing duplicate or already-printed labels to cross-filter against PDF 1.
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
                Click to upload PDF 2 (Optional)
              </div>
              <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: 4 }}>
                Leave empty to clean internal duplicates inside PDF 1 only
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

      {/* Target Clean Mode Selector Card */}
      <div
        className="premium-glass"
        style={{
          padding: "16px 20px",
          background: "#FFFFFF",
          borderRadius: "16px",
          marginBottom: 20,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FilterIcon size={16} color="#4F46E5" />
            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0F172A" }}>
              Deduplication Output Target &amp; Mode:
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
            Choose which batch to keep unique labels from
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: 10 }}>
          {/* Option 1: Clean PDF 1 (The user's exact need: remove 2 duplicates from 6 labels -> 4 unique!) */}
          <button
            type="button"
            onClick={() => handleCleanModeChange("clean_pdf1")}
            disabled={!file1}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: cleanMode === "clean_pdf1" ? "2px solid #4F46E5" : "1px solid #E2E8F0",
              background: cleanMode === "clean_pdf1" ? "#EEF2FF" : "#F8FAFC",
              color: cleanMode === "clean_pdf1" ? "#312E81" : "#475569",
              textAlign: "left",
              cursor: !file1 ? "not-allowed" : "pointer",
              opacity: !file1 ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: "0.85rem", color: cleanMode === "clean_pdf1" ? "#4F46E5" : "#0F172A" }}>
                1. Clean PDF 1 {file1 ? `(${file1PagesCount} Labels)` : ""}
              </strong>
              {cleanMode === "clean_pdf1" && <CheckCircleIcon size={16} color="#4F46E5" />}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748B", lineHeight: 1.35 }}>
              {file2
                ? "Remove orders matching PDF 2 & internal repeated orders from PDF 1."
                : "Remove internal repeated orders within PDF 1."}
            </div>
          </button>

          {/* Option 2: Clean PDF 2 */}
          <button
            type="button"
            onClick={() => handleCleanModeChange("clean_pdf2")}
            disabled={!file2}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: cleanMode === "clean_pdf2" ? "2px solid #0284C7" : "1px solid #E2E8F0",
              background: cleanMode === "clean_pdf2" ? "#E0F2FE" : "#F8FAFC",
              color: cleanMode === "clean_pdf2" ? "#0369A1" : "#475569",
              textAlign: "left",
              cursor: !file2 ? "not-allowed" : "pointer",
              opacity: !file2 ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: "0.85rem", color: cleanMode === "clean_pdf2" ? "#0284C7" : "#0F172A" }}>
                2. Clean PDF 2 {file2 ? `(${file2PagesCount} Labels)` : ""}
              </strong>
              {cleanMode === "clean_pdf2" && <CheckCircleIcon size={16} color="#0284C7" />}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748B", lineHeight: 1.35 }}>
              {file1
                ? "Remove orders matching PDF 1 & internal repeated orders from PDF 2."
                : "Remove internal repeated orders within PDF 2."}
            </div>
          </button>

          {/* Option 3: Merge Both & Keep Unique */}
          <button
            type="button"
            onClick={() => handleCleanModeChange("merge_unique")}
            disabled={!file1 || !file2}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: cleanMode === "merge_unique" ? "2px solid #059669" : "1px solid #E2E8F0",
              background: cleanMode === "merge_unique" ? "#ECFDF5" : "#F8FAFC",
              color: cleanMode === "merge_unique" ? "#065F46" : "#475569",
              textAlign: "left",
              cursor: !file1 || !file2 ? "not-allowed" : "pointer",
              opacity: !file1 || !file2 ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: "0.85rem", color: cleanMode === "merge_unique" ? "#059669" : "#0F172A" }}>
                3. Merge Both &amp; Keep Unique
              </strong>
              {cleanMode === "merge_unique" && <CheckCircleIcon size={16} color="#059669" />}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748B", lineHeight: 1.35 }}>
              Combine all labels from both PDFs, keeping exactly 1 unique copy per order.
            </div>
          </button>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {file1 && file2 && (
            <button
              onClick={handleSwapFiles}
              disabled={isProcessing}
              className="btn-secondary"
              style={{ fontSize: "0.82rem", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCwIcon size={14} /> Swap PDF 1 ⇄ PDF 2
            </button>
          )}
          <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
            {file1 && file2
              ? `Comparing ${file1PagesCount} labels in PDF 1 vs ${file2PagesCount} labels in PDF 2 (Active Target: ${
                  cleanMode === "clean_pdf1" ? "Clean PDF 1" : cleanMode === "clean_pdf2" ? "Clean PDF 2" : "Merge Both"
                })`
              : file1
              ? `Ready to scan ${file1PagesCount} labels in PDF 1 for duplicate orders`
              : file2
              ? `Ready to scan ${file2PagesCount} labels in PDF 2 for duplicate orders`
              : "Upload at least one PDF to find and remove duplicates"}
          </span>
        </div>

        <button
          onClick={handleFindAndRemoveDuplicates}
          disabled={!hasAnyFile || isProcessing}
          className="btn-primary"
          style={{
            padding: "12px 28px",
            fontSize: "0.92rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: !hasAnyFile || isProcessing ? 0.6 : 1,
            cursor: !hasAnyFile || isProcessing ? "not-allowed" : "pointer",
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
                PDF 1 (Batch 1)
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0F172A", marginTop: 6 }}>
                {comparisonResults.file1Total}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#6366F1", fontWeight: 600 }}>
                {file1 ? file1.name : "Not uploaded"}
              </span>
            </div>

            {/* Total in PDF 2 */}
            <div className="premium-glass" style={{ padding: "20px", borderTop: "3px solid #0284C7", background: "#FFFFFF" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                PDF 2 (Batch 2)
              </span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0284C7", marginTop: 6 }}>
                {comparisonResults.file2Total}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#0284C7", fontWeight: 600 }}>
                {file2 ? file2.name : "Not uploaded"}
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
              background:
                comparisonResults.totalUnique > 0
                  ? "linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)"
                  : "#FEF2F2",
              border: comparisonResults.totalUnique > 0 ? "1px solid #C7D2FE" : "1px solid #FECACA",
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
                <span
                  className="tag-pill"
                  style={{
                    fontSize: "0.75rem",
                    background: comparisonResults.totalUnique > 0 ? "#D1FAE5" : "#FEE2E2",
                    color: comparisonResults.totalUnique > 0 ? "#065F46" : "#991B1B",
                    fontWeight: 700,
                  }}
                >
                  <CheckCircleIcon size={13} /> {comparisonResults.totalUnique} Unique Labels Ready
                </span>
                <span className="tag-pill badge-rose" style={{ fontSize: "0.75rem" }}>
                  <TrashIcon size={13} /> {comparisonResults.totalDuplicates} Duplicates Removed
                </span>
              </div>

              <h3 style={{ fontSize: "1.25rem", color: "#0F172A", margin: "8px 0 4px 0", fontWeight: 800 }}>
                {comparisonResults.totalUnique > 0
                  ? `Unique Cleaned PDF is Ready! (${comparisonResults.totalUnique} Labels)`
                  : "All Labels Were Duplicates in Selected Target"}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#475569", margin: 0 }}>
                {comparisonResults.totalUnique > 0
                  ? `Download the cleaned unique PDF directly or seamlessly send it to Studio for SKU sorting, QR stamping, and thermal cropping.`
                  : cleanMode === "clean_pdf2" && file1
                  ? `All labels in PDF 2 already exist in PDF 1. To get the remaining unique labels from PDF 1 (expected: ${comparisonResults.file1Total - comparisonResults.totalDuplicates} labels), switch to "Clean PDF 1" above!`
                  : "No unique labels left after duplicate removal. Select another clean mode above."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Button 1: Download Unique PDF */}
              <button
                onClick={handleDownloadUniquePdf}
                disabled={!cleanedPdfUrl || comparisonResults.totalUnique === 0}
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
                  opacity: !cleanedPdfUrl || comparisonResults.totalUnique === 0 ? 0.5 : 1,
                  cursor: !cleanedPdfUrl || comparisonResults.totalUnique === 0 ? "not-allowed" : "pointer",
                }}
              >
                <DownloadIcon size={18} color="#0284C7" />
                {comparisonResults.totalUnique > 0
                  ? `Download Cleaned PDF (${comparisonResults.totalUnique} Unique)`
                  : "No Unique Labels (0)"}
              </button>

              {/* Button 2: Process with Studio */}
              <button
                onClick={handleProcessWithStudio}
                disabled={!cleanedPdfBlob || comparisonResults.totalUnique === 0}
                className="btn-primary"
                style={{
                  padding: "12px 26px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background:
                    comparisonResults.totalUnique > 0
                      ? "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)"
                      : "#94A3B8",
                  boxShadow:
                    comparisonResults.totalUnique > 0
                      ? "0 6px 20px rgba(79, 70, 229, 0.35)"
                      : "none",
                  opacity: !cleanedPdfBlob || comparisonResults.totalUnique === 0 ? 0.5 : 1,
                  cursor: !cleanedPdfBlob || comparisonResults.totalUnique === 0 ? "not-allowed" : "pointer",
                }}
              >
                <ZapIcon size={18} color="#FFFFFF" />
                {comparisonResults.totalUnique > 0
                  ? `Process ${comparisonResults.totalUnique} in Studio`
                  : "Process with Studio"}
                <ArrowRightIcon size={16} />
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
                  placeholder="Filter by Order No, SKU, State, Reason..."
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
                    <th style={{ width: "20%" }}>SKU NAME</th>
                    <th style={{ width: "8%" }}>QTY</th>
                    <th style={{ width: "16%" }}>STATE / DESTINATION</th>
                    <th style={{ width: "24%" }}>STATUS &amp; ACTION / REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "#64748B" }}>
                        {activeTab === "unique" && comparisonResults.totalUnique === 0
                          ? "No unique labels remaining in this target. Switch Clean Mode to PDF 1 above to view unique labels."
                          : "No orders found matching the filter criteria."}
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
                          #{item.pageNumber}{" "}
                          <span style={{ fontSize: "0.68rem", color: item.sourceTag === "pdf1" ? "#4F46E5" : "#0284C7", fontWeight: 600 }}>
                            ({item.sourceTag === "pdf1" ? "PDF 1" : "PDF 2"})
                          </span>
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
