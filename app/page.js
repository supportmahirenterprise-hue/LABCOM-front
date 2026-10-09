"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Modal from "./components/Modal";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

// Clean SVG Vector Icons
function FilePdfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function SortAscIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="19" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function SortDescIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SlashIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55A1 1 0 0 0 5.61 22h12.78a1 1 0 0 0 .89-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19x-13a4.5 4.5 0 0 1-.5-8.97A8 8 0 0 1 19.34 9 4.5 4.5 0 0 1 17.5 19z" />
    </svg>
  );
}


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

const DEFAULT_STAMP_SETTINGS = {
  qrX: 12,
  qrY: 10,
  qrSize: 142,
  fontSize: 29,
};

function ResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

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

/*
const POSITION_PRESETS = [
  { name: "Bottom Left Blank Area", x: 30, y: 30, size: 90, font: 8 },
  { name: "Bottom Right Corner", x: 180, y: 30, size: 85, font: 8 },
  { name: "Bottom Center", x: 95, y: 30, size: 85, font: 8 },
  { name: "Compact Corner", x: 20, y: 20, size: 70, font: 7 },
];
*/

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
    regionalThankYouLatin: "Aabhar! Tamara prem ane order badal khub khub aabhar!",
    regionalThankYouNative: "આભાર! તમારા પ્રેમ અને ઓર્ડર બદલ ખૂબ ખૂબ આભાર!",
    regionalThankYou: "Aabhar! Tamara prem ane order badal khub khub aabhar!",
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
    regionalThankYouLatin: "Dhanvaad ji! Tuhade vishwas aur order layi bahut dhanvaad!",
    regionalThankYouNative: "ਧੰਨਵਾਦ ਜੀ! ਤੁਹਾਡੇ ਵਿਸ਼ਵਾਸ ਅਤੇ ਆਰਡਰ ਲਈ ਬਹੁਤ ਧੰਨਵਾਦ!",
    regionalThankYou: "Dhanvaad ji! Tuhade vishwas aur order layi bahut dhanvaad!",
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
    state: "Maharashtra",
    regionalThankYouLatin: "Dhanyavaad! Aplya vishvasabaddal manapasun aabhar!",
    regionalThankYouNative: "धन्यवाद! आपल्या विश्वासाबद्दल मनापासून आभार!",
    regionalThankYou: "Dhanyavaad! Aplya vishvasabaddal manapasun aabhar!",
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
  const [pdfPage1DataUrl, setPdfPage1DataUrl] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [enableQr, setEnableQr] = useState(true);
  const [useNativeScript, setUseNativeScript] = useState(true);

  // QR Config with default Meesho Store URL requested by user
  const [qrText, setQrText] = useState("https://www.meesho.com/themahirenterprise");
  const [detailText, setDetailText] = useState(
    "Thank You for Shopping with Us!\n{regionalThankYou}\nOrder: {orderNo} | SKU: {sku}"
  );
  const [qrX, setQrX] = useState(DEFAULT_STAMP_SETTINGS.qrX);
  const [qrY, setQrY] = useState(DEFAULT_STAMP_SETTINGS.qrY);
  const [qrSize, setQrSize] = useState(DEFAULT_STAMP_SETTINGS.qrSize);
  const [fontSize, setFontSize] = useState(DEFAULT_STAMP_SETTINGS.fontSize);

  // Stamp Design Style Config (Badge vs Classic)
  const [stampStyle, setStampStyle] = useState("badge"); // "badge", "classic"
  const [storeName, setStoreName] = useState("VISHAL");

  // PDF Crop Config & Modal State (Matching Mayur.dev 1:1)
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropPreset, setCropPreset] = useState("label_only"); // "label_only", "trim_white", "manual"
  const [cropMode, setCropMode] = useState("none"); // "none", "top50", "bottom50", "custom"
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(50);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [previewMode, setPreviewMode] = useState("after"); // "after", "before"
  const [zoomLevel, setZoomLevel] = useState(100);

  function handleSelectCropPreset(preset) {
    setCropPreset(preset);
    setCropEnabled(true);
    if (preset === "label_only") {
      setCropTop(0);
      setCropBottom(50);
      setCropLeft(0);
      setCropRight(0);
      setCropMode("top50");
    } else if (preset === "trim_white") {
      setCropTop(4);
      setCropBottom(4);
      setCropLeft(4);
      setCropRight(4);
      setCropMode("custom");
    } else if (preset === "manual") {
      setCropMode("custom");
    }
  }

  function toggleCropEnabled() {
    if (cropEnabled) {
      setCropEnabled(false);
      showToast("PDF Cropping turned OFF. Labels will download as full-size sheets.", "info");
    } else {
      setCropEnabled(true);
      if (cropMode === "none") {
        setCropMode("top50");
      }
      showToast("PDF Cropping turned ON! Generated labels will be cropped.", "success");
    }
  }

  function handleSaveCrop() {
    setCropEnabled(true);
    if (cropPreset === "label_only") {
      setCropMode("top50");
    } else {
      setCropMode("custom");
    }
    setShowCropModal(false);
    showToast("Crop settings saved! Download will generate cropped thermal labels.", "success");
  }

  function handleDisableCrop() {
    setCropEnabled(false);
    showToast("Label cropping turned OFF.", "info");
  }

  function handleResetDefaults() {
    setQrX(DEFAULT_STAMP_SETTINGS.qrX);
    setQrY(DEFAULT_STAMP_SETTINGS.qrY);
    setQrSize(DEFAULT_STAMP_SETTINGS.qrSize);
    setFontSize(DEFAULT_STAMP_SETTINGS.fontSize);
    showToast("Stamp position & size reset to default (12pt, 10pt, 142pt, 29pt)", "success");
  }

  // Sorting & Filtering (Default: Sort by SKU with highest Qty first)
  const [sortBy, setSortBy] = useState("sku");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeInput, setActiveInput] = useState("qrText");
  const [downloadSummary, setDownloadSummary] = useState(false);

  // Return History Warning Modal State
  const [returnWarnings, setReturnWarnings] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarningIndex, setCurrentWarningIndex] = useState(0);

  // Duplicate Saved Order Warning Modal State
  const [duplicateOrderWarnings, setDuplicateOrderWarnings] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);

  const fileInputRef = useRef(null);
  const isInitialLoadDone = useRef(false);

  const isBusy = loadingPreview || loadingGenerate || loadingSample;

  function showToast(message, type = "error") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load user settings from Node.js backend on login (with instant localStorage fallback)
  useEffect(() => {
    // 1. Instant local cache read to eliminate initial flicker
    try {
      const cachedStr = typeof window !== "undefined" ? localStorage.getItem("user_stamp_settings") : null;
      if (cachedStr) {
        const s = JSON.parse(cachedStr);
        if (s.enableQr !== undefined) setEnableQr(s.enableQr);
        if (s.useNativeScript !== undefined) setUseNativeScript(s.useNativeScript);
        if (s.qrText !== undefined) setQrText(s.qrText);
        if (s.detailText !== undefined) setDetailText(s.detailText);
        if (s.qrX !== undefined) setQrX(s.qrX);
        if (s.qrY !== undefined) setQrY(s.qrY);
        if (s.qrSize !== undefined) setQrSize(s.qrSize);
        if (s.fontSize !== undefined) setFontSize(s.fontSize);
        if (s.sortBy !== undefined) setSortBy(s.sortBy);
        if (s.sortOrder !== undefined) setSortOrder(s.sortOrder);
        if (s.downloadSummary !== undefined) setDownloadSummary(s.downloadSummary);
      }
    } catch (e) {}

    if (status !== "authenticated" || !session?.user?.email) return;

    async function loadSettings() {
      try {
        const userEmail = session.user.email;
        const res = await fetch(
          `/api/user/settings?email=${encodeURIComponent(userEmail)}`,
          {
            headers: { "x-user-email": userEmail },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const s = data.settings;
            if (s.enableQr !== undefined) setEnableQr(s.enableQr);
            if (s.useNativeScript !== undefined) setUseNativeScript(s.useNativeScript);
            if (s.qrText !== undefined) setQrText(s.qrText);
            if (s.detailText !== undefined) setDetailText(s.detailText);
            if (s.qrX !== undefined) setQrX(s.qrX);
            if (s.qrY !== undefined) setQrY(s.qrY);
            if (s.qrSize !== undefined) setQrSize(s.qrSize);
            if (s.fontSize !== undefined) setFontSize(s.fontSize);
            if (s.sortBy !== undefined) setSortBy(s.sortBy);
            if (s.sortOrder !== undefined) setSortOrder(s.sortOrder);
            if (s.downloadSummary !== undefined) setDownloadSummary(s.downloadSummary);

            try {
              localStorage.setItem("user_stamp_settings", JSON.stringify(s));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Failed to load settings from Node backend:", err);
      } finally {
        isInitialLoadDone.current = true;
      }
    }

    loadSettings();
  }, [status, session?.user?.email]);

  // Debounced auto-save settings to Node.js backend
  useEffect(() => {
    if (!isInitialLoadDone.current || status !== "authenticated" || !session?.user?.email) return;

    const timer = setTimeout(async () => {
      setSavingSettings(true);
      try {
        const userEmail = session.user.email;
        await fetch(`/api/user/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
          body: JSON.stringify({
            email: userEmail,
            enableQr,
            useNativeScript,
            qrText,
            detailText,
            qrX,
            qrY,
            qrSize,
            fontSize,
            sortBy,
            sortOrder,
            downloadSummary,
          }),
        });
      } catch (err) {
        console.error("Auto-save settings failed:", err);
      } finally {
        setSavingSettings(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [enableQr, useNativeScript, qrText, detailText, qrX, qrY, qrSize, fontSize, sortBy, sortOrder, downloadSummary, status, session]);

  useEffect(() => {
    if (showWarningModal || showDuplicateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showWarningModal, showDuplicateModal]);

  // Filtered & Sorted preview row indices
  const filteredAndSortedIndexes = useMemo(() => {
    if (!pages || !Array.isArray(pages)) return [];
    let idx = pages.map((_, i) => i);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      idx = idx.filter((i) => {
        const p = pages[i] || {};
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
        const itemA = pages[a] || {};
        const itemB = pages[b] || {};

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
    if (!pages || !Array.isArray(pages) || !pages.length) return null;
    const totalPages = pages.length;
    const uniqueSkus = new Set(pages.map((p) => p?.sku).filter(Boolean)).size;
    const totalQty = pages.reduce((acc, p) => acc + (parseInt(p?.qty, 10) || 1), 0);
    return { totalPages, uniqueSkus, totalQty };
  }, [pages]);

  // Interactive Drag-to-Crop Handler for Mouse & Touch
  const handleCropDragStart = (e, dragTarget = "bottom") => {
    e.preventDefault();
    setCropPreset("manual");
    setCropMode("custom");

    const stageEl = e.currentTarget.closest(".crop-stage-container") || e.currentTarget.parentElement;
    const rect = stageEl ? stageEl.getBoundingClientRect() : { height: 470 };
    const containerHeight = rect.height || 470;
    const startY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    const initialBottom = cropBottom;
    const initialTop = cropTop;

    const onMove = (moveEvent) => {
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0]?.clientY) || startY;
      const deltaY = currentY - startY;
      const deltaPct = Math.round((deltaY / containerHeight) * 100);

      if (dragTarget === "bottom") {
        const newBottom = Math.max(0, Math.min(85, initialBottom - deltaPct));
        setCropBottom(newBottom);
      } else if (dragTarget === "top") {
        const newTop = Math.max(0, Math.min(85, initialTop + deltaPct));
        setCropTop(newTop);
      }
    };

    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  async function renderPdfPage1ToDataUrl(fileObj) {
    if (!fileObj || typeof window === "undefined") return null;
    try {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const arrayBuffer = await fileObj.arrayBuffer();
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Failed to render PDF page 1 for crop preview:", err);
      return null;
    }
  }

  async function handleFileSelect(f, nativeOverride) {
    if (!f || isBusy) return;
    const isNative = nativeOverride !== undefined ? nativeOverride : useNativeScript;
    setFile(f);
    setPages([]);
    setPdfPage1DataUrl(null);
    setError("");
    setSuccessMsg("");
    setLoadingPreview(true);
    setUploadProgress(0);

    // Asynchronously render Page 1 image of uploaded PDF for Crop Modal preview
    renderPdfPage1ToDataUrl(f).then((dataUrl) => {
      if (dataUrl) setPdfPage1DataUrl(dataUrl);
    });
    try {
      let totalPagesInPdf = 1;
      try {
        const fileBuffer = await f.arrayBuffer();
        const loadedPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        totalPagesInPdf = loadedPdf.getPageCount();
      } catch (e) {
        console.warn("Could not read page count client-side:", e);
      }

      const CHUNK_SIZE = 150;
      let allExtractedPages = [];
      let allReturnWarnings = [];
      let allDuplicateOrderWarnings = [];

      if (totalPagesInPdf <= CHUNK_SIZE) {
        const fd = new FormData();
        fd.append("pdf", f);
        fd.append("useNativeScript", isNative ? "true" : "false");
        const res = await fetch(`${BACKEND_URL}/api/preview`, {
          method: "POST",
          headers: { "x-user-email": session?.user?.email || "" },
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to read PDF preview");
        }
        const data = await res.json();
        allExtractedPages = data.pages || [];
        allReturnWarnings = data.returnWarnings || [];
        allDuplicateOrderWarnings = data.duplicateOrderWarnings || [];
        setUploadProgress(100);
      } else {
        const totalChunks = Math.ceil(totalPagesInPdf / CHUNK_SIZE);
        showToast(`Large PDF detected (${totalPagesInPdf} pages). Processing in ${totalChunks} fast chunks...`, "info");

        for (let c = 0; c < totalChunks; c++) {
          const startP = c * CHUNK_SIZE + 1;
          const endP = Math.min(totalPagesInPdf, (c + 1) * CHUNK_SIZE);
          showToast(`Reading pages ${startP}-${endP} of ${totalPagesInPdf}...`, "info");

          const fd = new FormData();
          fd.append("pdf", f);
          fd.append("useNativeScript", isNative ? "true" : "false");
          fd.append("startPage", String(startP));
          fd.append("endPage", String(endP));

          const res = await fetch(`${BACKEND_URL}/api/preview`, {
            method: "POST",
            headers: { "x-user-email": session?.user?.email || "" },
            body: fd,
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || `Failed to read PDF preview chunk ${c + 1}`);
          }
          const data = await res.json();
          allExtractedPages = [...allExtractedPages, ...(data.pages || [])];
          allReturnWarnings = [...allReturnWarnings, ...(data.returnWarnings || [])];
          allDuplicateOrderWarnings = [...allDuplicateOrderWarnings, ...(data.duplicateOrderWarnings || [])];
          setUploadProgress(Math.round(((c + 1) / totalChunks) * 100));
        }
      }

      setPages(allExtractedPages);

      if (allDuplicateOrderWarnings.length > 0) {
        setDuplicateOrderWarnings(allDuplicateOrderWarnings);
        setCurrentDuplicateIndex(0);
        setShowDuplicateModal(true);
        showToast(`Notice: Found ${allDuplicateOrderWarnings.length} order(s) already saved in database!`, "info");
      }

      if (allReturnWarnings.length > 0) {
        setReturnWarnings(allReturnWarnings);
        setCurrentWarningIndex(0);
        setShowWarningModal(true);
        showToast(`Warning: Found ${allReturnWarnings.length} order(s) in this PDF with past return history!`, "error");
      }

      if (allDuplicateOrderWarnings.length === 0 && allReturnWarnings.length === 0) {
        showToast(`Successfully extracted ${allExtractedPages.length} label pages!`, "success");
      }
    } catch (err) {
      showToast(err.message || "Error connecting to backend server", "error");
      setError(err.message || "Error connecting to backend server");
    } finally {
      setLoadingPreview(false);
      setUploadProgress(0);
    }
  }

  function handleNativeScriptToggle(val) {
    setUseNativeScript(val);
    if (file) {
      handleFileSelect(file, val);
    } else {
      setPages((prev) => {
        const targetList = prev && prev.length ? prev : MOCK_PAGES;
        return targetList.map((p) => {
          if (p.regionalThankYouNative && p.regionalThankYouLatin) {
            return {
              ...p,
              regionalThankYou: val ? p.regionalThankYouNative : p.regionalThankYouLatin,
            };
          }
          return p;
        });
      });
    }
  }

  function updateCell(pageIdx, key, value) {
    setPages((prev) => {
      const copy = [...prev];
      copy[pageIdx] = { ...copy[pageIdx], [key]: value, _modified: true };
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

/*
  function applyPreset(p) {
    setQrX(p.x);
    setQrY(p.y);
    setQrSize(p.size);
    setFontSize(p.font);
  }
*/

  async function handleGenerate(options = {}) {
    if (isBusy) return;
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
      showToast("Generating labels in browser (0ms instant speed)...", "info");
      const fileBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      const totalPdfPages = srcDoc.getPageCount();

      const numPagesToProcess = isSample ? 1 : totalPdfPages;
      const fields = pages && pages.length ? pages : [];

      if (enableQr) {
        const font = await srcDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await srcDoc.embedFont(StandardFonts.HelveticaBold);
        const x = parseFloat(qrX) || 0;
        const y = parseFloat(qrY) || 0;
        const size = parseFloat(qrSize) || 90;
        const fSize = parseFloat(fontSize) || 8;
        const isBadgeMode = stampStyle === "badge";
        const cleanStoreName = (storeName || "STORE").trim().toUpperCase();

        const qrImageCache = new Map();
        const unicodeCanvasCache = new Map();

        // Helper to safely render Indic/Unicode (e.g. Gujarati 'અ') or WinAnsi text on PDF without crashes
        const drawSafeTextOnPdf = async (pdfDoc, pageObj, textStr, textX, textY, fontSizeVal, fontObj, isBold = false) => {
          if (!textStr || !textStr.trim()) return 0;
          const isUnicode = /[^\x00-\x7F]/.test(textStr);

          if (isUnicode) {
            try {
              const cacheKey = `${textStr}_${fontSizeVal}_${isBold}`;
              let cachedImg = unicodeCanvasCache.get(cacheKey);

              if (!cachedImg) {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const scaleFactor = 3.5;
                const fontSizePx = Math.round(fontSizeVal * scaleFactor);
                const fontCss = `${isBold ? "bold" : "normal"} ${fontSizePx}px "Nirmala UI", "Segoe UI", Arial, sans-serif`;

                ctx.font = fontCss;
                const metrics = ctx.measureText(textStr);
                const canvasW = Math.max(20, Math.ceil(metrics.width + 12 * scaleFactor));
                const canvasH = Math.max(16, Math.ceil(fontSizePx * 1.4 + 4 * scaleFactor));

                canvas.width = canvasW;
                canvas.height = canvasH;

                ctx.font = fontCss;
                ctx.fillStyle = "#000000";
                ctx.textBaseline = "middle";
                ctx.fillText(textStr, 4 * scaleFactor, canvasH / 2);

                const dataUrl = canvas.toDataURL("image/png");
                const pngBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
                const embeddedPng = await pdfDoc.embedPng(pngBytes);

                cachedImg = {
                  image: embeddedPng,
                  width: canvasW / scaleFactor,
                  height: canvasH / scaleFactor,
                };
                unicodeCanvasCache.set(cacheKey, cachedImg);
              }

              pageObj.drawImage(cachedImg.image, {
                x: textX,
                y: textY - 2,
                width: cachedImg.width,
                height: cachedImg.height,
              });

              return cachedImg.width;
            } catch (e) {
              console.error("Canvas unicode text draw error:", e);
              textStr = textStr.replace(/[^\x00-\x7F]/g, "");
            }
          }

          if (textStr.trim()) {
            try {
              pageObj.drawText(textStr, {
                x: textX,
                y: textY,
                size: fontSizeVal,
                font: fontObj,
                color: rgb(0, 0, 0),
              });
              return fontObj.widthOfTextAtSize(textStr, fontSizeVal);
            } catch (err) {
              const safeAscii = textStr.replace(/[^\x00-\x7F]/g, "");
              if (safeAscii.trim()) {
                try {
                  pageObj.drawText(safeAscii, {
                    x: textX,
                    y: textY,
                    size: fontSizeVal,
                    font: fontObj,
                    color: rgb(0, 0, 0),
                  });
                  return fontObj.widthOfTextAtSize(safeAscii, fontSizeVal);
                } catch (e) {}
              }
            }
          }
          return 0;
        };

        const getSafeStoreWidth = (str, fontObj, fontSz) => {
          if (!str) return 0;
          if (/[^\x00-\x7F]/.test(str)) {
            return str.length * fontSz * 0.7;
          }
          try {
            return fontObj.widthOfTextAtSize(str, fontSz);
          } catch (e) {
            return str.length * fontSz * 0.7;
          }
        };

        for (let i = 0; i < numPagesToProcess; i++) {
          const page = srcDoc.getPage(i);
          const data = fields[i] || {};

          let qrContent = qrText || "{orderNo}";
          TAG_PLACEHOLDERS.forEach((tag) => {
            const key = tag.replace(/[{}]/g, "");
            qrContent = qrContent.replace(new RegExp(tag, "g"), data[key] || "");
          });
          qrContent = qrContent.trim() || `Page-${i + 1}`;

          let qrImage = qrImageCache.get(qrContent);
          if (!qrImage) {
            const qrPngDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 300 });
            const qrPngBytes = await fetch(qrPngDataUrl).then((res) => res.arrayBuffer());
            qrImage = await srcDoc.embedPng(qrPngBytes);
            qrImageCache.set(qrContent, qrImage);
          }

          let actualQrX = x;
          let actualTextX = x + size + 10;

          if (isBadgeMode) {
            const storeWidth = getSafeStoreWidth(cleanStoreName, boldFont, Math.max(9, fSize * 0.9));
            const boxHeight = Math.max(size + 10, fSize * 2.2 + 14);
            const textMaxWidthCalc = 120;
            const boxWidth = 14 + storeWidth + 12 + 1 + 10 + size + 8 + textMaxWidthCalc + 12;

            page.drawRectangle({
              x: x - 4,
              y: y - 4,
              width: boxWidth,
              height: boxHeight,
              color: rgb(1, 1, 1),
              borderColor: rgb(0, 0, 0),
              borderWidth: 1.5,
            });

            await drawSafeTextOnPdf(
              srcDoc,
              page,
              cleanStoreName,
              x + 6,
              y + boxHeight / 2 - fSize * 0.45,
              Math.max(9, fSize * 0.9),
              boldFont,
              true
            );

            const divX = x + 6 + storeWidth + 10;
            page.drawLine({
              start: { x: divX, y: y - 1 },
              end: { x: divX, y: y + boxHeight - 7 },
              thickness: 1.2,
              color: rgb(0, 0, 0),
            });

            actualQrX = divX + 10;
            actualTextX = actualQrX + size + 8;
          }

          page.drawImage(qrImage, { x: actualQrX, y, width: size, height: size });

          let detailFilled = detailText || "";
          TAG_PLACEHOLDERS.forEach((tag) => {
            const key = tag.replace(/[{}]/g, "");
            detailFilled = detailFilled.replace(new RegExp(tag, "g"), data[key] || "");
          });

          if (detailFilled.trim()) {
            const lines = detailFilled.split("\n");
            const lineHeight = fSize + 3;
            const totalTextHeight = (lines.length - 1) * lineHeight + fSize;
            const qrCenterY = y + size / 2;
            const startY = qrCenterY + totalTextHeight / 2 - fSize * 0.85;

            for (let li = 0; li < lines.length; li++) {
              const line = lines[li];
              if (line && line.trim()) {
                const textY = startY - li * lineHeight;
                if (textY >= 0) {
                  await drawSafeTextOnPdf(srcDoc, page, line, actualTextX, textY, fSize, font, false);
                }
              }
            }
          }
        }
      }

      // Sort Page Order Client-Side
      let order = Array.from({ length: numPagesToProcess }, (_, i) => i);
      if (!isSample && sortBy && sortBy !== "none") {
        order.sort((a, b) => {
          const itemA = fields[a] || {};
          const itemB = fields[b] || {};

          if (sortBy === "sku") {
            const skuA = (itemA.sku || "").toString().toLowerCase();
            const skuB = (itemB.sku || "").toString().toLowerCase();
            if (skuA < skuB) return sortOrder === "asc" ? -1 : 1;
            if (skuA > skuB) return sortOrder === "asc" ? 1 : -1;
            const qtyA = parseFloat(itemA.qty) || 0;
            const qtyB = parseFloat(itemB.qty) || 0;
            return qtyB - qtyA;
          }

          let va = itemA[sortBy] ?? "";
          let vb = itemB[sortBy] ?? "";
          if (sortBy === "qty") {
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

      // Create Output Document Client-Side
      const outDoc = await PDFDocument.create();
      const copiedPages = await outDoc.copyPages(srcDoc, order);

      // Apply PDF Crop Box & Media Box Client-Side if cropEnabled
      if (cropEnabled) {
        copiedPages.forEach((p) => {
          const { width, height } = p.getSize();
          let cropX = 0, cropY = 0, cropW = width, cropH = height;
          const activeCropMode = cropMode === "none" ? "top50" : cropMode;

          if (activeCropMode === "top50") {
            cropY = height / 2;
            cropH = height / 2;
          } else if (activeCropMode === "bottom50") {
            cropY = 0;
            cropH = height / 2;
          } else {
            const topPct = (parseFloat(cropTop) || 0) / 100;
            const botPct = (parseFloat(cropBottom) || 0) / 100;
            const leftPct = (parseFloat(cropLeft) || 0) / 100;
            const rightPct = (parseFloat(cropRight) || 0) / 100;
            cropX = width * leftPct;
            cropW = width * Math.max(0.05, 1 - leftPct - rightPct);
            cropY = height * botPct;
            cropH = height * Math.max(0.05, 1 - topPct - botPct);
          }
          p.setCropBox(cropX, cropY, cropW, cropH);
          p.setMediaBox(cropX, cropY, cropW, cropH);
        });
      }

      copiedPages.forEach((p) => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const finalPdfBlob = new Blob([outBytes], { type: "application/pdf" });

      // Trigger Instant Browser Download
      const url = URL.createObjectURL(finalPdfBlob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
      const pageCount = isSample ? 1 : (pages?.length || totalPagesInPdf || 1);
      a.download = isSample ? `1_${dateStr}_sample_test_page_1.pdf` : `${pageCount}_${dateStr}_stamped.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Async Background Server Sync (Zero delay on download speed)
      const userEmail = session?.user?.email || "";
      fetch(`${BACKEND_URL}/api/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": userEmail },
        body: JSON.stringify({ email: userEmail, fileName: file.name, pageCount: isSample ? 1 : pages.length, isSample, sortBy, sortOrder, enableQr, qrText }),
      }).catch((e) => console.error("Async history save error:", e));

      if (isSample) {
        const msg = "Test Sample (Page 1) downloaded! Check QR alignment & print preview.";
        setSuccessMsg(msg);
        showToast(msg, "success");
      } else {
        const msg = "Stamped & Cropped PDF generated instantly in browser and downloaded!";
        setSuccessMsg(msg);
        showToast(msg, "success");
      }
    } catch (err) {
      const msg = err.message || "Failed to generate PDF client-side";
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


  async function handleDownloadSummaryOnly() {
    if (!file || pages.length === 0) {
      showToast("Please upload a PDF file first to download summary.", "error");
      return;
    }
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
      const pageCount = pages?.length || 1;
      const res = await fetch(`${BACKEND_URL}/api/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages, fileName: file.name }),
      });
      if (!res.ok) throw new Error("Failed to generate summary PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pageCount}_${dateStr}_summary.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Summary PDF downloaded successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to download summary", "error");
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

  const numQrX = parseFloat(qrX) || 0;
  const numQrY = parseFloat(qrY) || 0;
  const numQrSize = parseFloat(qrSize) || 90;
  const numFontSize = parseFloat(fontSize) || 8;

  const simQrSize = Math.max(16, numQrSize * scale);
  const simQrX = Math.max(0, Math.min(canvasW - simQrSize, numQrX * scale));
  const simQrY = Math.max(0, Math.min(canvasH - simQrSize, canvasH - (numQrY * scale) - simQrSize));

  const numTextX = numQrX + numQrSize + 10;
  const simTextX = numTextX * scale;
  const simTextMaxWidth = Math.max(20, (412 - numTextX - 15) * scale);
  const simFontSize = numFontSize * scale;
  const simLineHeight = (numFontSize + 3) * scale;

  const previewLines = useMemo(() => {
    if (!previewText) return ["QR Stamp"];
    return previewText.split("\n");
  }, [previewText]);

  const totalTextHeightPt = (previewLines.length - 1) * (numFontSize + 3) + numFontSize;
  const qrCenterYPt = numQrY + numQrSize / 2;
  const startYPt = qrCenterYPt + totalTextHeightPt / 2 - numFontSize * 0.85;
  const simTextTop = Math.max(0, Math.min(canvasH - simFontSize, canvasH - (startYPt * scale) - simFontSize));

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
          <span style={{ display: "flex", alignItems: "center" }}>
            {toast.type === "error" ? <AlertTriangleIcon /> : <CheckIcon />}
          </span>
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
                  padding: "4px 10px",
                  borderRadius: "var(--radius-full)",
                  background: savingSettings ? "#EEF2FF" : "#F1F5F9",
                  color: savingSettings ? "#4F46E5" : "#64748B",
                  border: "1px solid #E2E8F0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                <CloudIcon /> {savingSettings ? "Syncing..." : "Saved to Account"}
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
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            <AlertTriangleIcon /> {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #6EE7B7",
              color: "#065F46",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            <CheckIcon /> {successMsg}
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
                <div style={{ color: "#4F46E5", marginBottom: 12 }}>
                  <FilePdfIcon />
                </div>
                {file ? (
                  <div style={{ textAlign: "center", wordBreak: "break-all" }}>
                    <p style={{ fontWeight: 600, color: "#4F46E5", fontSize: "0.95rem" }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-silver)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {pages.length > 0 ? <><CheckIcon /> {pages.length} Pages Extracted & Ready</> : "Click to replace PDF file"}
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontWeight: 600, color: "var(--text-pure)", fontSize: "0.95rem" }}>
                      Drop PDF shipping label here or <span style={{ color: "#4F46E5" }}>Browse</span>
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
                      Supports Meesho, Xpressbees, and Delhivery label sheets
                    </p>
                  </div>
                )}

                {loadingPreview && (
                  <div style={{ marginTop: 24, width: "100%", maxWidth: "340px", margin: "24px auto 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem", color: "var(--aurora-1)", fontWeight: 600 }}>
                      <span>Extracting label fields & metadata...</span>
                      <span>${uploadProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg, var(--aurora-1), var(--aurora-2))", transition: "width 0.4s ease" }} />
                    </div>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span className="tag-pill active" style={{ fontSize: "0.72rem", padding: "4px 10px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--aurora-1)", boxShadow: "var(--shadow-glow)" }} />
                  4" × 6" Thermal Canvas
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetDefaults}
                  title="Reset stamp position & font size to default settings (12pt, 10pt, 142pt, 29pt)"
                  style={{
                    padding: "4px 12px",
                    fontSize: "0.72rem",
                    borderRadius: "var(--radius-full)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    borderColor: "rgba(255, 255, 255, 0.18)",
                    color: "var(--text-silver)",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <ResetIcon /> Reset Default
                </button>
              </div>
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

                {/* DYNAMIC QR STAMP OVERLAY - 1:1 PDF Output Matching */}
                {enableQr ? (
                  stampStyle === "badge" ? (
                    /* Ultra-Clean Store Pill Badge Design matching user image */
                    <div
                      style={{
                        position: "absolute",
                        left: simQrX,
                        top: simQrY,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        border: "2px solid #000000",
                        borderRadius: 12,
                        padding: "5px 10px",
                        background: "#ffffff",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        zIndex: 20,
                        userSelect: "none",
                        transition: "all 0.1s ease-out",
                      }}
                    >
                      {/* Left: Store Icon + Store Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, paddingRight: 4 }}>
                        <StoreIcon />
                        <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: "#000000" }}>
                          {storeName || "VISHAL"}
                        </span>
                      </div>

                      {/* Vertical Divider Line */}
                      <div style={{ width: 1.5, height: 22, background: "#000000", flexShrink: 0 }} />

                      {/* Right: QR Code + Text Details */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: Math.min(32, simQrSize),
                            height: Math.min(32, simQrSize),
                            background: "repeating-conic-gradient(#000000 0% 25%, #ffffff 0% 50%) 50% / 4px 4px",
                            border: "1px solid #000000",
                            borderRadius: 2,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ fontSize: Math.max(6, simFontSize * 0.85), fontWeight: 800, color: "#000000", lineHeight: 1.15 }}>
                          <div>Follow our page</div>
                          <div style={{ fontSize: 5, fontWeight: 600, color: "#444444" }}>{previewLines[0] || ""}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Classic Minimal Mode */
                    <>
                      <div
                        style={{
                          position: "absolute",
                          left: simQrX,
                          top: simQrY,
                          width: simQrSize,
                          height: simQrSize,
                          background: "repeating-conic-gradient(#EA580C 0% 25%, #FFF7ED 0% 50%) 50% / 6px 6px",
                          border: "1px solid #EA580C",
                          borderRadius: 1,
                          boxSizing: "border-box",
                          zIndex: 20,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: simTextX,
                          top: simTextTop,
                          width: simTextMaxWidth,
                          fontSize: simFontSize,
                          lineHeight: `${simLineHeight}px`,
                          fontFamily: "'Times New Roman', Times, 'Nirmala UI', serif",
                          fontStyle: "italic",
                          color: "#C2410C",
                          fontWeight: 700,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          zIndex: 20,
                        }}
                      >
                        {previewLines.map((line, i) => (
                          <div key={i} style={{ height: `${simLineHeight}px`, overflow: "hidden" }}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </>
                  )
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
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <SlashIcon /> QR Stamper Disabled (Sorting Only)
                    </span>
                  </div>
                )}
              </div>

              {/* Commented out Position Shortcuts as requested */}
              {/*
              <div className="position-shortcuts-wrap" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
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
                    <LocationIcon /> {p.name}
                  </button>
                ))}
              </div>
              */}

              {/* Position & Size Adjustment Sliders directly next to Live Stamp Preview */}
              <div className="stamp-sliders-wrap" style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 240 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-silver)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  Stamp Position & Size Setup
                </span>

                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
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

                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
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

                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
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

                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "12px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)" }}>Font Size</span>
                    <span style={{ background: "rgba(0, 242, 254, 0.1)", border: "1px solid rgba(0, 242, 254, 0.25)", color: "var(--aurora-1)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    className="range-slider"
                    min="4"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crop out the tax invoice Card (Exact Mayur.dev matching) */}
        <div className="premium-glass" style={{ marginBottom: 24, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 6px 0" }}>
                Crop out the tax invoice
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0, maxWidth: 450, lineHeight: 1.45 }}>
                Print labels only — smaller, cleaner sheets. Only the download changes.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Toggle Badge OFF/ON */}
              <button
                type="button"
                onClick={toggleCropEnabled}
                style={{
                  background: cropEnabled ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${cropEnabled ? "#10B981" : "var(--glass-border)"}`,
                  color: cropEnabled ? "#10B981" : "var(--text-silver)",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {cropEnabled ? "ON" : "OFF"}
              </button>

              {/* Set up crop Action Button */}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCropModal(true)}
                style={{
                  padding: "8px 18px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderColor: "rgba(255, 255, 255, 0.25)",
                  color: "var(--text-pure)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                Set up crop
              </button>
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
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                  background: useNativeScript ? "rgba(168, 85, 247, 0.14)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${useNativeScript ? "#a855f7" : "var(--glass-border)"}`,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  transition: "all 0.2s ease",
                }}
                title="Tick to print regional greetings in their native language script (e.g. Gujarati/Marathi/Tamil/Punjabi font)"
              >
                <input
                  type="checkbox"
                  disabled={isBusy}
                  checked={useNativeScript}
                  onChange={(e) => handleNativeScriptToggle(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#a855f7",
                    cursor: isBusy ? "not-allowed" : "pointer",
                  }}
                />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: useNativeScript ? "#c084fc" : "var(--text-silver)" }}>
                  {useNativeScript ? "Regional Script (Lipi): ON" : "Regional Script (Lipi): OFF"}
                </span>
              </label>

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
                  disabled={isBusy}
                  checked={enableQr}
                  onChange={(e) => setEnableQr(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "var(--aurora-1)",
                    cursor: isBusy ? "not-allowed" : "pointer",
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

          {/* Stamp Design Style Selector */}
          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "14px", padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-silver)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Select Stamp Design Layout
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStampStyle("badge")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${stampStyle === "badge" ? "#6366f1" : "var(--glass-border)"}`,
                    background: stampStyle === "badge" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    color: stampStyle === "badge" ? "#ffffff" : "var(--text-silver)",
                    fontWeight: stampStyle === "badge" ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  🏷️ Modern Store Pill Badge
                </button>

                <button
                  type="button"
                  onClick={() => setStampStyle("classic")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${stampStyle === "classic" ? "#6366f1" : "var(--glass-border)"}`,
                    background: stampStyle === "classic" ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    color: stampStyle === "classic" ? "#ffffff" : "var(--text-silver)",
                    fontWeight: stampStyle === "classic" ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  📄 Classic Minimal Stamp
                </button>
              </div>
            </div>

            {stampStyle === "badge" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", minWidth: 120 }}>
                  Store / Brand Name:
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. VISHAL STORE"
                  style={{ maxWidth: 300, padding: "8px 12px", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.03em" }}
                />
              </div>
            )}
          </div>

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
                <StoreIcon /> Default Meesho Store (themahirenterprise)
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
                <InstagramIcon /> Instagram Page (@mahir.enterprise_)
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
                <HeartIcon /> State-Smart Regional Thank You
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
              <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <CheckIcon /> Valid URL: Scanning QR directly opens this web page.
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


        </div>
      </div>

        {/* Batch Sorter & Filter Control */}
        <div className="premium-glass" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h3 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Multi-Field Batch Sorter & Search Filter
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-silver)", margin: 0 }}>
                Automatically group and sort label pages by SKU, Quantity, Order Date, or Customer Name.
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {analytics && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="tag-pill"><PackageIcon /> {analytics.totalPages} Total Labels</span>
                  <span className="tag-pill"><TagIcon /> {analytics.uniqueSkus} Unique SKUs</span>
                  <span className="tag-pill"><CheckIcon /> {analytics.totalQty} Total Items</span>
                </div>
              )}

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                  background: downloadSummary ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${downloadSummary ? "rgba(16, 185, 129, 0.5)" : "var(--glass-border)"}`,
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  boxShadow: downloadSummary ? "0 0 15px rgba(16, 185, 129, 0.2)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  disabled={isBusy}
                  checked={downloadSummary}
                  onChange={(e) => setDownloadSummary(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#10b981", cursor: isBusy ? "not-allowed" : "pointer" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: downloadSummary ? "#059669" : "var(--text-silver)", display: "flex", alignItems: "center", gap: 6 }}>
                  <DownloadIcon /> Download Summary
                </span>
              </label>
            </div>
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
                    justifyContent: "center",
                  }}
                  onClick={() => setSortOrder("asc")}
                >
                  <SortAscIcon /> Ascending
                </button>
                <button
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    background: sortOrder === "desc" ? "rgba(79, 172, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: sortOrder === "desc" ? "var(--aurora-2)" : "var(--glass-border)",
                    color: sortOrder === "desc" ? "var(--aurora-1)" : "var(--text-silver)",
                    padding: "10px",
                    justifyContent: "center",
                  }}
                  onClick={() => setSortOrder("desc")}
                >
                  <SortDescIcon /> Descending
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
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent-cyan)" }}>
                                  Page {row[c.key]}
                                </span>
                                {row.customerReturnAlert && (
                                  <span
                                    style={{
                                      background: "rgba(245, 158, 11, 0.18)",
                                      border: "1px solid rgba(245, 158, 11, 0.4)",
                                      color: "#d97706",
                                      borderRadius: "999px",
                                      padding: "2px 8px",
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      whiteSpace: "nowrap",
                                      cursor: "help",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                    title={`Buyer (${row.customerName || "Customer"}) has ${row.customerReturnAlert.returnCount} past return record(s) in DB.`}
                                  >
                                    <AlertTriangleIcon /> Buyer Return Risk ({row.customerReturnAlert.returnCount})
                                  </span>
                                )}
                              </div>
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

        <div className="action-dock-buttons" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn-secondary"
            disabled={!file || isBusy}
            style={{
              minWidth: 190,
              opacity: file && !isBusy ? 1 : 0.5,
              cursor: file && !isBusy ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: true })}
          >
            {loadingSample ? "Generating Sample..." : <><FlaskIcon /> Download Test Sample (Page 1)</>}
          </button>

          <button
            className="btn-primary"
            disabled={!file || isBusy}
            style={{
              minWidth: 220,
              opacity: file && !isBusy ? 1 : 0.5,
              cursor: file && !isBusy ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: false })}
          >
            {loadingGenerate ? (
              <>Processing All {pages.length} Pages...</>
            ) : (
              <><ZapIcon /> Generate Full PDF ({pages.length > 0 ? `${pages.length} Pages` : "Batch"})</>
            )}
          </button>
        </div>
      </footer>

      {/* Return Warning Notice Modal Popup */}
      <Modal
        isOpen={showWarningModal && returnWarnings.length > 0}
        onClose={() => setShowWarningModal(false)}
        maxWidth={720}
        style={{
          borderRadius: "22px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(239, 68, 68, 0.3)",
          border: "1px solid rgba(239, 68, 68, 0.4)",
          background: "rgba(18, 18, 24, 0.98)",
          color: "#fff",
          padding: "26px 30px",
        }}
      >
        {showWarningModal && returnWarnings.length > 0 && (
          <>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#f87171", display: "flex", alignItems: "center" }}><AlertTriangleIcon /></span>
                  <h2 className="heading-display" style={{ fontSize: "1.3rem", color: "#f87171", margin: 0 }}>
                    Past Return Warning Notice
                  </h2>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(239, 68, 68, 0.25)",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.5)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    Order {currentWarningIndex + 1} of {returnWarnings.length}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-silver)", margin: "4px 0 0 0" }}>
                  Label Page #{returnWarnings[currentWarningIndex]?.page} in uploaded PDF has prior return records in DB!
                </p>
              </div>
              <button
                onClick={() => setShowWarningModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Current Label Details Card */}
            <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <PackageIcon /> Uploaded Label Page #{returnWarnings[currentWarningIndex]?.page}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  Sub Order: {returnWarnings[currentWarningIndex]?.subOrderNo}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 700 }}>
                    Buyer: {returnWarnings[currentWarningIndex]?.customerName}
                  </div>
                  {returnWarnings[currentWarningIndex]?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.78rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      Mobile: {returnWarnings[currentWarningIndex]?.customerMobile}
                    </div>
                  )}
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <LocationIcon /> State: {returnWarnings[currentWarningIndex]?.state}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-silver)" }}>
                    SKU: <strong style={{ color: "#fff" }}>{returnWarnings[currentWarningIndex]?.sku}</strong>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 2 }}>
                    Qty: <strong style={{ color: "#fff" }}>{returnWarnings[currentWarningIndex]?.qty}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 4, lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <StoreIcon /> Address: {returnWarnings[currentWarningIndex]?.customerAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Prior Returns Breakdown */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fbbf24", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangleIcon /> Previous Return Records Found ({returnWarnings[currentWarningIndex]?.returnCount})
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                {returnWarnings[currentWarningIndex]?.previousReturns?.map((pr, pIdx) => (
                  <div
                    key={pr.id || pIdx}
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontWeight: 700,
                          background: /RTO|Courier/i.test(pr.returnType) ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: /RTO|Courier/i.test(pr.returnType) ? "#fbbf24" : "#f87171",
                        }}
                      >
                        {pr.returnType}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-silver)", fontFamily: "var(--font-mono)" }}>
                        Return Date: {pr.deliveredDate}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginTop: 8 }}>
                      Reason: {pr.returnReason}
                    </div>
                    {pr.detailedReturnReason && pr.detailedReturnReason !== pr.returnReason && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-silver)", marginTop: 2 }}>
                        {pr.detailedReturnReason}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: "0.76rem", color: "var(--text-dim)" }}>
                      <span>Returned SKU: <strong style={{ color: "#a855f7" }}>{pr.sku}</strong> (Qty: {pr.qty})</span>
                      <span>Courier: <strong style={{ color: "#38bdf8" }}>{pr.courierPartner}</strong> ({pr.awbNumber})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  disabled={currentWarningIndex === 0}
                  onClick={() => setCurrentWarningIndex((prev) => Math.max(0, prev - 1))}
                  className="btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    opacity: currentWarningIndex === 0 ? 0.4 : 1,
                    cursor: currentWarningIndex === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous Order
                </button>

                <button
                  disabled={currentWarningIndex >= returnWarnings.length - 1}
                  onClick={() => setCurrentWarningIndex((prev) => Math.min(returnWarnings.length - 1, prev + 1))}
                  className="btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    opacity: currentWarningIndex >= returnWarnings.length - 1 ? 0.4 : 1,
                    cursor: currentWarningIndex >= returnWarnings.length - 1 ? "not-allowed" : "pointer",
                    borderColor: "var(--aurora-1)",
                    color: "var(--aurora-1)",
                  }}
                >
                  Next Order →
                </button>
              </div>

              <button
                className="btn-primary"
                onClick={() => setShowWarningModal(false)}
                style={{
                  padding: "9px 24px",
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Dismiss & Continue
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Duplicate Saved Order Warning Notice Modal Popup */}
      <Modal
        isOpen={showDuplicateModal && duplicateOrderWarnings.length > 0}
        onClose={() => setShowDuplicateModal(false)}
        maxWidth={720}
        style={{
          borderRadius: "22px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(245, 158, 11, 0.3)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          background: "rgba(18, 18, 24, 0.98)",
          color: "#fff",
          padding: "26px 30px",
        }}
      >
        {showDuplicateModal && duplicateOrderWarnings.length > 0 && (
          <>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--glass-border)", paddingBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#fbbf24", display: "flex", alignItems: "center" }}><PackageIcon /></span>
                  <h2 className="heading-display" style={{ fontSize: "1.3rem", color: "#fbbf24", margin: 0 }}>
                    Previously Saved Order Notice
                  </h2>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      background: "rgba(245, 158, 11, 0.25)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245, 158, 11, 0.5)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    Order {currentDuplicateIndex + 1} of {duplicateOrderWarnings.length}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-silver)", margin: "4px 0 0 0" }}>
                  Sub Order ID on Label Page #{duplicateOrderWarnings[currentDuplicateIndex]?.page} was previously saved in DB!
                </p>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Current Label Details Card */}
            <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "16px 18px", borderRadius: "14px", border: "1px solid rgba(245, 158, 11, 0.3)", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <TagIcon /> Current Uploaded Label (Page #{duplicateOrderWarnings[currentDuplicateIndex]?.page})
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  Sub Order: {duplicateOrderWarnings[currentDuplicateIndex]?.subOrderNo}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.88rem", color: "#fff", fontWeight: 700 }}>
                    Buyer: {duplicateOrderWarnings[currentDuplicateIndex]?.customerName}
                  </div>
                  {duplicateOrderWarnings[currentDuplicateIndex]?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.78rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      Mobile: {duplicateOrderWarnings[currentDuplicateIndex]?.customerMobile}
                    </div>
                  )}
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <LocationIcon /> State: {duplicateOrderWarnings[currentDuplicateIndex]?.state}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-silver)" }}>
                    SKU: <strong style={{ color: "#fff" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.sku}</strong>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 2 }}>
                    Qty: <strong style={{ color: "#fff" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.qty}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: 4, lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <StoreIcon /> Address: {duplicateOrderWarnings[currentDuplicateIndex]?.customerAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Previously Saved DB Order Record */}
            <div style={{ background: "rgba(0,0,0,0.4)", padding: "16px 18px", borderRadius: "14px", border: "1px solid var(--glass-border)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--aurora-1)", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <CloudIcon /> Database Record (Already Saved)
                </span>
                <span style={{ fontSize: "0.76rem", color: "#fbbf24", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                  Saved On: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.savedAt}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-silver)" }}>
                    Saved Order No: <strong style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.orderNo}</strong>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-silver)", marginTop: 4 }}>
                    Saved Buyer: <strong style={{ color: "#fff" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerName}</strong>
                  </div>
                  {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.76rem", color: "var(--aurora-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerMobile}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-silver)" }}>
                    Saved SKU: <strong style={{ color: "#a855f7" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.sku}</strong> (Qty: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.qty})
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4 }}>
                    Payment Type: <strong style={{ color: "#10b981" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.paymentType}</strong>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", marginTop: 4 }}>
                    Original Order Date: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.orderDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  disabled={currentDuplicateIndex === 0}
                  onClick={() => setCurrentDuplicateIndex((prev) => Math.max(0, prev - 1))}
                  className="btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    opacity: currentDuplicateIndex === 0 ? 0.4 : 1,
                    cursor: currentDuplicateIndex === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Previous Order
                </button>

                <button
                  disabled={currentDuplicateIndex >= duplicateOrderWarnings.length - 1}
                  onClick={() => setCurrentDuplicateIndex((prev) => Math.min(duplicateOrderWarnings.length - 1, prev + 1))}
                  className="btn-secondary"
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    opacity: currentDuplicateIndex >= duplicateOrderWarnings.length - 1 ? 0.4 : 1,
                    cursor: currentDuplicateIndex >= duplicateOrderWarnings.length - 1 ? "not-allowed" : "pointer",
                    borderColor: "#fbbf24",
                    color: "#fbbf24",
                  }}
                >
                  Next Order →
                </button>
              </div>

              <button
                className="btn-primary"
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  padding: "9px 24px",
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#fff",
                  border: "none",
                }}
              >
                Dismiss & Continue
              </button>
            </div>
          </>
        )}
      </Modal>
      {/* Crop your labels Modal Popup (Exact Mayur.dev 1:1 Matching) */}
      <Modal isOpen={showCropModal} onClose={() => setShowCropModal(false)} maxWidth="780px">
        <div style={{ padding: "4px 8px" }}>
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-pure)", margin: "0 0 6px 0" }}>
              Crop your labels
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-silver)", margin: 0 }}>
              Pick one. You'll see the result before you download — nothing changes until then.
            </p>
          </div>

          {/* 3 Preset Option Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            {/* Preset 1: Label only */}
            <div
              onClick={() => handleSelectCropPreset("label_only")}
              style={{
                border: `2px solid ${cropPreset === "label_only" ? "#10B981" : "var(--glass-border)"}`,
                background: cropPreset === "label_only" ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.03)",
                borderRadius: 14,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ width: "100%", height: 50, border: "1px solid var(--glass-border)", borderRadius: 6, background: "rgba(0,0,0,0.2)", padding: 4, marginBottom: 12 }}>
                  <div style={{ width: "100%", height: "50%", background: "#10B981", borderRadius: 3, border: "1.5px solid #059669" }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-pure)" }}>Label only</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4, lineHeight: 1.35 }}>
                  Cuts the tax invoice off.
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: "0.68rem", fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                MOST SELLERS PICK THIS
              </div>
            </div>

            {/* Preset 2: Trim white edges */}
            <div
              onClick={() => handleSelectCropPreset("trim_white")}
              style={{
                border: `2px solid ${cropPreset === "trim_white" ? "#10B981" : "var(--glass-border)"}`,
                background: cropPreset === "trim_white" ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.03)",
                borderRadius: 14,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ width: "100%", height: 50, border: "1px solid var(--glass-border)", borderRadius: 6, background: "rgba(0,0,0,0.2)", padding: 5, marginBottom: 12 }}>
                  <div style={{ width: "100%", height: "100%", border: "1.5px dashed #10B981", background: "rgba(16,185,129,0.12)", borderRadius: 3 }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-pure)" }}>Trim white edges</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4, lineHeight: 1.35 }}>
                  Keeps everything, removes the blank margin.
                </div>
              </div>
            </div>

            {/* Preset 3: I'll set it myself */}
            <div
              onClick={() => handleSelectCropPreset("manual")}
              style={{
                border: `2px solid ${cropPreset === "manual" ? "#10B981" : "var(--glass-border)"}`,
                background: cropPreset === "manual" ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.03)",
                borderRadius: 14,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ width: "100%", height: 50, border: "1px solid var(--glass-border)", borderRadius: 6, background: "rgba(0,0,0,0.2)", padding: "6px 12px", marginBottom: 12 }}>
                  <div style={{ width: "80%", height: "70%", border: "1.5px solid #10B981", background: "rgba(16,185,129,0.2)", borderRadius: 3 }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-pure)" }}>I'll set it myself</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-silver)", marginTop: 4, lineHeight: 1.35 }}>
                  Drag the box, or fine-tune below.
                </div>
              </div>
            </div>
          </div>

          {/* Stage Header Controls: PREVIEW - PAGE 1 | Before/After | Zoom */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-silver)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              PREVIEW - PAGE 1
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Before / After Switcher */}
              <div style={{ background: "rgba(255,255,255,0.06)", padding: 3, borderRadius: "var(--radius-full)", display: "flex", gap: 2, border: "1px solid var(--glass-border)" }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode("before")}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: previewMode === "before" ? 800 : 600,
                    background: previewMode === "before" ? "var(--aurora-1)" : "transparent",
                    color: previewMode === "before" ? "#000000" : "var(--text-silver)",
                    cursor: "pointer",
                  }}
                >
                  Before
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("after")}
                  style={{
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: previewMode === "after" ? 800 : 600,
                    background: previewMode === "after" ? "#10B981" : "transparent",
                    color: previewMode === "after" ? "#ffffff" : "var(--text-silver)",
                    cursor: "pointer",
                  }}
                >
                  After
                </button>
              </div>

              {/* Zoom Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontWeight: 700, color: "var(--text-silver)" }}>
                <span>Zoom</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontWeight: 800 }}
                >
                  -
                </button>
                <span style={{ minWidth: 36, textAlign: "center" }}>{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  style={{ border: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontWeight: 800 }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Stage Frame with Interactive Green Resizable Crop Box */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxHeight: 480,
              overflow: "auto",
              background: "#090d16",
              borderRadius: 14,
              padding: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.6)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Actual Uploaded Shipping Label Sheet or Fallback Mock */}
            <div
              style={{
                width: 330 * (zoomLevel / 100),
                height: 470 * (zoomLevel / 100),
                position: "relative",
                background: "#ffffff",
                borderRadius: 6,
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                overflow: "hidden",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Real Uploaded PDF Page 1 Image Preview with Natural Aspect Ratio */}
              {pdfPage1DataUrl ? (
                <img
                  src={pdfPage1DataUrl}
                  alt="Uploaded Label Page 1"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#ffffff",
                    display: "block",
                  }}
                />
              ) : (
                /* Fallback Mock Label Content */
                <div style={{ padding: 10, fontSize: 8, fontFamily: "Arial, sans-serif", color: "#000", height: "100%" }}>
                  <div style={{ borderBottom: "2px solid #000", paddingBottom: 6, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 12 }}>Delhivery</div>
                      <div style={{ fontSize: 7, fontWeight: 700 }}>Prepaid: Do not collect cash</div>
                      <div style={{ fontSize: 7, marginTop: 4 }}><b>Destination:</b> Amreli, Gujarat</div>
                    </div>
                    <div style={{ width: 40, height: 40, border: "1px solid #000", background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 4px 4px" }} />
                  </div>

                  <div style={{ marginTop: 8, textAlign: "center" }}>
                    <div style={{ height: 24, background: "repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)" }} />
                    <div style={{ fontWeight: 800, fontSize: 8, marginTop: 2 }}>1490842209153146</div>
                  </div>

                  <div style={{ marginTop: 10, borderTop: "1px solid #000", paddingTop: 4, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", fontSize: 7, fontWeight: 700 }}>
                    <span>SKU: UvgvFO2z</span>
                    <span>Size: Free</span>
                    <span>Qty: 1</span>
                    <span>Order: 33903404040000304_1</span>
                  </div>

                  <div style={{ marginTop: 14, borderTop: "2px dashed #666", paddingTop: 8, background: "#f8fafc" }}>
                    <div style={{ fontWeight: 800, fontSize: 8, color: "#333" }}>TAX INVOICE (Original For Recipient)</div>
                    <div style={{ fontSize: 6.5, color: "#666", marginTop: 4, lineHeight: 1.3 }}>
                      Sold by: The Mahir Enterprise | Inv: INV-9876543<br />
                      Description: Cotton Printed Saree | Amount: Rs 120.00
                    </div>
                  </div>
                </div>
              )}

              {/* OVERLAY: GREEN RESIZABLE CROP BOX (Visible when previewMode === "after") */}
              {previewMode === "after" && (
                <>
                  {/* Top Dimmed Area */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${cropTop}%`, background: "rgba(15,23,42,0.65)", pointerEvents: "none" }} />
                  {/* Bottom Dimmed Area */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${cropBottom}%`, background: "rgba(15,23,42,0.65)", pointerEvents: "none" }} />
                  {/* Left Dimmed Area */}
                  <div style={{ position: "absolute", top: `${cropTop}%`, bottom: `${cropBottom}%`, left: 0, width: `${cropLeft}%`, background: "rgba(15,23,42,0.65)", pointerEvents: "none" }} />
                  {/* Right Dimmed Area */}
                  <div style={{ position: "absolute", top: `${cropTop}%`, bottom: `${cropBottom}%`, right: 0, width: `${cropRight}%`, background: "rgba(15,23,42,0.65)", pointerEvents: "none" }} />

                  {/* Green Bounding Box */}
                  <div
                    style={{
                      position: "absolute",
                      top: `${cropTop}%`,
                      bottom: `${cropBottom}%`,
                      left: `${cropLeft}%`,
                      right: `${cropRight}%`,
                      border: "2.5px solid #10B981",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.8) inset, 0 4px 20px rgba(16,185,129,0.45)",
                      zIndex: 10,
                    }}
                  >
                    {/* Interactive Top Border Drag Zone */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "top")}
                      onTouchStart={(e) => handleCropDragStart(e, "top")}
                      style={{
                        position: "absolute",
                        top: -8,
                        left: 0,
                        right: 0,
                        height: 16,
                        cursor: "ns-resize",
                        zIndex: 25,
                      }}
                    />

                    {/* Interactive Bottom Border Drag Zone */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom")}
                      style={{
                        position: "absolute",
                        bottom: -8,
                        left: 0,
                        right: 0,
                        height: 16,
                        cursor: "ns-resize",
                        zIndex: 25,
                      }}
                    />

                    {/* Corner Drag Handles */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "top")}
                      onTouchStart={(e) => handleCropDragStart(e, "top")}
                      style={{ position: "absolute", top: -8, left: -8, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", border: "3px solid #10B981", cursor: "ns-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", zIndex: 30 }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "top")}
                      onTouchStart={(e) => handleCropDragStart(e, "top")}
                      style={{ position: "absolute", top: -8, right: -8, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", border: "3px solid #10B981", cursor: "ns-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", zIndex: 30 }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom")}
                      style={{ position: "absolute", bottom: -8, left: -8, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", border: "3px solid #10B981", cursor: "ns-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", zIndex: 30 }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom")}
                      style={{ position: "absolute", bottom: -8, right: -8, width: 16, height: 16, borderRadius: "50%", background: "#ffffff", border: "3px solid #10B981", cursor: "ns-resize", boxShadow: "0 2px 8px rgba(0,0,0,0.4)", zIndex: 30 }}
                    />

                    {/* Interactive Dimensions Badge (Drag Handle) */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom")}
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: -14,
                        transform: "translateX(-50%)",
                        background: "#10B981",
                        color: "#ffffff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 12px",
                        borderRadius: "var(--radius-full)",
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.5)",
                        cursor: "ns-resize",
                        zIndex: 35,
                        userSelect: "none",
                      }}
                    >
                      {cropPreset === "label_only"
                        ? "Label Only (Top 50%) — Drag to Adjust"
                        : cropPreset === "trim_white"
                        ? "Trim White Edges — Drag to Adjust"
                        : `Custom Crop: Top ${cropTop}% | Bottom ${cropBottom}% (Drag Handle)`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fine-tune the edges sliders section */}
          <div style={{ marginTop: 18, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid var(--glass-border)" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-silver)", marginBottom: 12 }}>
              Fine-tune the edges (optional)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-silver)", marginBottom: 4 }}>
                  <span>Top Crop</span>
                  <span style={{ color: "#10B981", fontWeight: 800 }}>{cropTop}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={cropTop}
                  onChange={(e) => {
                    setCropTop(Number(e.target.value));
                    setCropPreset("manual");
                  }}
                  className="range-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-silver)", marginBottom: 4 }}>
                  <span>Bottom Crop</span>
                  <span style={{ color: "#10B981", fontWeight: 800 }}>{cropBottom}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={cropBottom}
                  onChange={(e) => {
                    setCropBottom(Number(e.target.value));
                    setCropPreset("manual");
                  }}
                  className="range-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-silver)", marginBottom: 4 }}>
                  <span>Left Crop</span>
                  <span style={{ color: "#10B981", fontWeight: 800 }}>{cropLeft}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={cropLeft}
                  onChange={(e) => {
                    setCropLeft(Number(e.target.value));
                    setCropPreset("manual");
                  }}
                  className="range-slider"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-silver)", marginBottom: 4 }}>
                  <span>Right Crop</span>
                  <span style={{ color: "#10B981", fontWeight: 800 }}>{cropRight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={cropRight}
                  onChange={(e) => {
                    setCropRight(Number(e.target.value));
                    setCropPreset("manual");
                  }}
                  className="range-slider"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons matching Mayur.dev */}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderTop: "1px solid var(--glass-border)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={handleSaveCrop}
                style={{
                  background: "#10B981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 24px",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
                  transition: "all 0.15s ease",
                }}
              >
                Use this crop
              </button>

              <button
                type="button"
                onClick={handleDisableCrop}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text-silver)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 20px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Don't crop
              </button>
            </div>

            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", fontStyle: "italic" }}>
              Remembered for next time.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
