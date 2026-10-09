"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Modal from "./components/Modal";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

import {
  FilePdfIcon,
  FileTextIcon,
  FileCheckIcon,
  ImageIcon,
  DownloadIcon,
  UploadCloudIcon,
  CloudIcon,
  SparklesIcon,
  ZapIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  CloseIcon,
  XCircleIcon,
  SlashIcon,
  LocationIcon,
  StorefrontIcon,
  StoreIcon,
  InstagramIcon,
  HeartIcon,
  PackageIcon,
  TagIcon,
  FlaskIcon,
  ResetIcon,
  RefreshIcon,
  SortAscIcon,
  SortDescIcon,
  FilterIcon,
  SearchIcon,
  CropIcon,
  EyeIcon,
  EyeOffIcon,
  QrCodeIcon,
  CopyIcon,
  TrashIcon,
  LayersIcon,
  ShieldIcon,
  ShieldCheckIcon,
  LockIcon,
  InfoIcon,
  PhoneIcon,
  MailIcon,
  ScaleIcon,
  BarChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  UserIcon,
  TruckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExternalLinkIcon,
  BuildingIcon,
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  TargetIcon,
  SendIcon,
  SettingsIcon,
  WhatsAppIcon,
  RefreshCwIcon,
} from "./components/Icons";

function drawShopIconCanvas(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.max(2, size * 0.075);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const w = size;
  const h = size;

  // Awning Roof Trapezoid
  const roofTopY = y + h * 0.05;
  const roofBotY = y + h * 0.38;
  const roofLeftTop = x + w * 0.22;
  const roofRightTop = x + w * 0.78;
  const roofLeftBot = x + w * 0.08;
  const roofRightBot = x + w * 0.92;

  ctx.beginPath();
  ctx.moveTo(roofLeftTop, roofTopY);
  ctx.lineTo(roofRightTop, roofTopY);
  ctx.lineTo(roofRightBot, roofBotY);
  ctx.lineTo(roofLeftBot, roofBotY);
  ctx.closePath();
  ctx.stroke();

  // Awning Scallops
  const numScallops = 4;
  const scallopW = (roofRightBot - roofLeftBot) / numScallops;
  ctx.beginPath();
  for (let i = 0; i < numScallops; i++) {
    const sx = roofLeftBot + i * scallopW;
    const mx = sx + scallopW / 2;
    ctx.arc(mx, roofBotY, scallopW / 2, Math.PI, 0, true);
  }
  ctx.stroke();

  // Shop Walls and Bottom Platform
  const wallLeft = x + w * 0.12;
  const wallRight = x + w * 0.88;
  const wallTop = roofBotY + scallopW * 0.25;
  const wallBot = y + h * 0.92;

  // Bottom Platform / Floor
  ctx.beginPath();
  ctx.moveTo(x + w * 0.05, wallBot);
  ctx.lineTo(x + w * 0.95, wallBot);
  ctx.stroke();

  // Left & Right Walls
  ctx.beginPath();
  ctx.moveTo(wallLeft, wallTop);
  ctx.lineTo(wallLeft, wallBot);
  ctx.moveTo(wallRight, wallTop);
  ctx.lineTo(wallRight, wallBot);
  ctx.stroke();

  // Left Door (with rounded top)
  const doorLeft = wallLeft + w * 0.1;
  const doorWidth = w * 0.26;
  const doorHeight = h * 0.36;
  const doorTop = wallBot - doorHeight;
  const doorRadius = doorWidth * 0.3;

  ctx.beginPath();
  ctx.moveTo(doorLeft, wallBot);
  ctx.lineTo(doorLeft, doorTop + doorRadius);
  ctx.arcTo(doorLeft, doorTop, doorLeft + doorRadius, doorTop, doorRadius);
  ctx.arcTo(doorLeft + doorWidth, doorTop, doorLeft + doorWidth, doorTop + doorRadius, doorRadius);
  ctx.lineTo(doorLeft + doorWidth, wallBot);
  ctx.stroke();

  // Right Window
  const winLeft = wallRight - w * 0.36;
  const winWidth = w * 0.26;
  const winHeight = h * 0.26;
  const winTop = doorTop + (doorHeight - winHeight) / 2;

  ctx.beginPath();
  ctx.rect(winLeft, winTop, winWidth, winHeight);
  ctx.stroke();

  ctx.restore();
}

/**
 * Robust word wrapper for Canvas text rendering
 */
function wrapCanvasText(ctx, text, maxLineWidth) {
  if (!text) return [];
  const paragraphs = String(text).split("\n");
  const lines = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      continue;
    }
    const words = para.trim().split(/\s+/);
    let curLine = "";

    for (const word of words) {
      const testLine = curLine ? `${curLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxLineWidth && curLine) {
        lines.push(curLine);
        curLine = word;
      } else {
        curLine = testLine;
      }
    }
    if (curLine) {
      lines.push(curLine);
    }
  }

  return lines.length > 0 ? lines : [" "];
}


const FIELD_COLUMNS = [
  { key: "page", label: "Page", editable: false, width: "130px" },
  { key: "sku", label: "SKU", width: "180px" },
  { key: "orderNo", label: "Order No", width: "180px" },
  { key: "orderDate", label: "Order Date", width: "130px" },
  { key: "qty", label: "Qty", width: "90px" },
  { key: "customerName", label: "Customer", width: "200px" },
  { key: "invoiceNo", label: "Invoice No", width: "160px" },
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
  qrX: 14,
  qrY: 14,
  qrSize: 70,
  fontSize: 8,
};



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
  const [files, setFiles] = useState([]);
  const [pdfPage1DataUrl, setPdfPage1DataUrl] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingHdGenerate, setLoadingHdGenerate] = useState(false);
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
  const [storeName, setStoreName] = useState("MAHIR ENTERPRISE");
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrText || "https://www.meesho.com", { margin: 0, width: 140 })
      .then((url) => {
        if (isMounted) setPreviewQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [qrText]);

  // PDF Crop Config & Modal State (Matching Mayur.dev 1:1)
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropPreset, setCropPreset] = useState("label_only"); // "label_only", "trim_white", "manual"
  const [cropMode, setCropMode] = useState("custom"); // "custom", "none"
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(58);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [previewMode, setPreviewMode] = useState("after"); // "after", "before"
  const [zoomLevel, setZoomLevel] = useState(100);

  function handleSelectCropPreset(preset) {
    setCropPreset(preset);
    setCropEnabled(true);
    setCropMode("custom");
    if (preset === "label_only") {
      setCropTop(0);
      setCropBottom(58);
      setCropLeft(0);
      setCropRight(0);
    } else if (preset === "trim_white") {
      setCropTop(1);
      setCropBottom(24);
      setCropLeft(1);
      setCropRight(1);
    } else if (preset === "manual") {
      // keep current slider adjustments
    }
  }

  function toggleCropEnabled() {
    if (cropEnabled) {
      setCropEnabled(false);
      showToast("PDF Cropping turned OFF. Labels will download as full-size sheets.", "info");
    } else {
      setCropEnabled(true);
      setCropMode("custom");
      showToast("PDF Cropping turned ON! Generated labels will be cropped.", "success");
    }
  }

  function handleSaveCrop() {
    setCropEnabled(true);
    setCropMode("custom");
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

  const isBusy = loadingPreview || loadingGenerate || loadingSample || loadingHdGenerate;

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
        if (s.storeName !== undefined) setStoreName(s.storeName);
        if (s.stampStyle !== undefined) setStampStyle(s.stampStyle);
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
            if (s.storeName !== undefined) setStoreName(s.storeName);
            if (s.stampStyle !== undefined) setStampStyle(s.stampStyle);
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
            storeName,
            stampStyle,
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
  }, [enableQr, useNativeScript, storeName, stampStyle, qrText, detailText, qrX, qrY, qrSize, fontSize, sortBy, sortOrder, downloadSummary, status, session]);

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

  // Interactive Drag-to-Crop Handler for Mouse & Touch (Supports 8 Directions: Top, Bottom, Left, Right & All 4 Corners)
  const handleCropDragStart = (e, dragTarget = "bottom") => {
    e.preventDefault();
    setCropPreset("manual");
    setCropMode("custom");

    const stageEl = document.getElementById("crop-stage-preview-box") || e.currentTarget.closest(".crop-stage-container") || e.currentTarget.parentElement;
    const rect = stageEl ? stageEl.getBoundingClientRect() : { width: 330, height: 470 };
    const containerWidth = rect.width || 330;
    const containerHeight = rect.height || 470;

    const startX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const startY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

    const initialTop = cropTop;
    const initialBottom = cropBottom;
    const initialLeft = cropLeft;
    const initialRight = cropRight;

    const onMove = (moveEvent) => {
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0]?.clientX) || startX;
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0]?.clientY) || startY;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      const deltaXPct = Math.round((deltaX / containerWidth) * 100);
      const deltaYPct = Math.round((deltaY / containerHeight) * 100);

      if (dragTarget.includes("top")) {
        const newTop = Math.max(0, Math.min(85 - initialBottom, initialTop + deltaYPct));
        setCropTop(newTop);
      }
      if (dragTarget.includes("bottom")) {
        const newBottom = Math.max(0, Math.min(85 - initialTop, initialBottom - deltaYPct));
        setCropBottom(newBottom);
      }
      if (dragTarget.includes("left")) {
        const newLeft = Math.max(0, Math.min(45 - initialRight, initialLeft + deltaXPct));
        setCropLeft(newLeft);
      }
      if (dragTarget.includes("right")) {
        const newRight = Math.max(0, Math.min(45 - initialLeft, initialRight - deltaXPct));
        setCropRight(newRight);
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

      const arrayBuffer = await fileObj.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
      });
      const pdfDoc = await loadingTask.promise;
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 2.2 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      return dataUrl;
    } catch (err) {
      console.error("Failed to render PDF page 1 for preview:", err);
      return null;
    }
  }

  async function extractFieldsClientSide(fileObjOrList) {
    if (!fileObjOrList || typeof window === "undefined") return [];
    const fileList = Array.isArray(fileObjOrList)
      ? fileObjOrList
      : (fileObjOrList instanceof FileList ? Array.from(fileObjOrList) : [fileObjOrList]);
    if (fileList.length === 0) return [];

    try {
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

      const extractedPages = [];
      let globalPageNum = 1;

      for (const fileObj of fileList) {
        const arrayBuffer = await fileObj.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");

          const orderMatch = pageText.match(/(?:Order|Sub\s*Order|Order\s*ID|Order\s*No)[^\d]*(\d{10,20}(?:_\d+)?)/i) || pageText.match(/\b(\d{14,19}(?:_\d+)?)\b/);
          const orderNo = orderMatch ? orderMatch[1] : `ORDER-${globalPageNum}`;

          const skuMatch = pageText.match(/SKU[:\s]+([^\s\n,]+)/i) || pageText.match(/(?:SKU|Product|Item)[:\s]+([A-Za-z0-9_\-]+)/i);
          const sku = skuMatch ? skuMatch[1] : "LABEL-ITEM";

          const dateMatch = pageText.match(/(\d{2}[.\/]\d{2}[.\/]\d{4})/);
          const orderDate = dateMatch ? dateMatch[1] : "";

          const qtyMatch = pageText.match(/(?:Qty|Quantity)[:\s]+(\d+)/i);
          const qty = qtyMatch ? qtyMatch[1] : "1";

          const stateMatch = pageText.match(/(?:Gujarat|Rajasthan|Maharashtra|Delhi|Uttar Pradesh|Punjab|Haryana|Karnataka|Tamil Nadu|West Bengal|Bihar|Assam|Kerala|Madhya Pradesh|Odisha|Telangana|Andhra Pradesh)/i);
          const state = stateMatch ? stateMatch[0] : "";

          extractedPages.push({
            page: globalPageNum,
            filePageIndex: i,
            sourceFile: fileObj.name,
            orderNo,
            orderDate,
            sku,
            qty,
            state,
            customerName: `Customer Page #${globalPageNum}`,
            invoiceNo: `INV-${100000 + globalPageNum}`,
          });
          globalPageNum++;
        }
      }

      return extractedPages;
    } catch (err) {
      console.warn("Client-side fast extraction fallback:", err);
      return [];
    }
  }

  async function handleFileSelect(fileInputOrList, nativeOverride) {
    if (!fileInputOrList || isBusy) return;
    const fileList = Array.isArray(fileInputOrList)
      ? fileInputOrList
      : (fileInputOrList instanceof FileList ? Array.from(fileInputOrList) : [fileInputOrList]);
    if (fileList.length === 0) return;

    const isNative = nativeOverride !== undefined ? nativeOverride : useNativeScript;
    setFiles(fileList);
    setFile(fileList[0]);
    setPages([]);
    setPdfPage1DataUrl(null);
    setError("");
    setSuccessMsg("");
    setLoadingPreview(true);
    setUploadProgress(20);

    // Asynchronously render Page 1 image of uploaded PDF for Crop / Live Stamp preview
    renderPdfPage1ToDataUrl(fileList[0]).then((dataUrl) => {
      if (dataUrl) setPdfPage1DataUrl(dataUrl);
    });

    // Instant Client-Side Field Extraction in Browser Memory (0ms - 200ms)
    extractFieldsClientSide(fileList).then((clientPages) => {
      if (clientPages && clientPages.length > 0) {
        setPages(clientPages);
        setUploadProgress(100);
        setLoadingPreview(false);
      }
    });

    try {
      let allExtractedPages = [];
      let allReturnWarnings = [];
      let allDuplicateOrderWarnings = [];
      let currentGlobalPageOffset = 0;

      for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
        const curFile = fileList[fIdx];
        let totalPagesInPdf = 1;
        try {
          const fileBuffer = await curFile.arrayBuffer();
          const loadedPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
          totalPagesInPdf = loadedPdf.getPageCount();
        } catch (e) {
          console.warn("Could not read page count client-side:", e);
        }

        const CHUNK_SIZE = 150;
        if (totalPagesInPdf <= CHUNK_SIZE) {
          const fd = new FormData();
          fd.append("pdf", curFile);
          fd.append("useNativeScript", isNative ? "true" : "false");
          const res = await fetch(`${BACKEND_URL}/api/preview`, {
            method: "POST",
            headers: { "x-user-email": session?.user?.email || "" },
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            const reindexedPages = (data.pages || []).map((p, idx) => ({
              ...p,
              page: currentGlobalPageOffset + (p.page || idx + 1),
              sourceFile: curFile.name,
            }));
            allExtractedPages = [...allExtractedPages, ...reindexedPages];
            allReturnWarnings = [...allReturnWarnings, ...(data.returnWarnings || [])];
            allDuplicateOrderWarnings = [...allDuplicateOrderWarnings, ...(data.duplicateOrderWarnings || [])];
          }
        } else {
          const totalChunks = Math.ceil(totalPagesInPdf / CHUNK_SIZE);
          for (let c = 0; c < totalChunks; c++) {
            const startP = c * CHUNK_SIZE + 1;
            const endP = Math.min(totalPagesInPdf, (c + 1) * CHUNK_SIZE);
            const fd = new FormData();
            fd.append("pdf", curFile);
            fd.append("useNativeScript", isNative ? "true" : "false");
            fd.append("startPage", String(startP));
            fd.append("endPage", String(endP));

            const res = await fetch(`${BACKEND_URL}/api/preview`, {
              method: "POST",
              headers: { "x-user-email": session?.user?.email || "" },
              body: fd,
            });
            if (res.ok) {
              const data = await res.json();
              const reindexedPages = (data.pages || []).map((p, idx) => ({
                ...p,
                page: currentGlobalPageOffset + (p.page || idx + 1),
                sourceFile: curFile.name,
              }));
              allExtractedPages = [...allExtractedPages, ...reindexedPages];
              allReturnWarnings = [...allReturnWarnings, ...(data.returnWarnings || [])];
              allDuplicateOrderWarnings = [...allDuplicateOrderWarnings, ...(data.duplicateOrderWarnings || [])];
            }
          }
        }
        currentGlobalPageOffset += totalPagesInPdf;
        setUploadProgress(Math.round(((fIdx + 1) / fileList.length) * 100));
      }

      if (allExtractedPages && allExtractedPages.length > 0) {
        setPages(allExtractedPages);
      }

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
    } catch (err) {
      console.warn("Backend return check background notice:", err.message);
    } finally {
      setLoadingPreview(false);
      setUploadProgress(0);
    }
  }

  function handleNativeScriptToggle(val) {
    setUseNativeScript(val);
    const targetFiles = files && files.length > 0 ? files : (file ? [file] : []);
    if (targetFiles.length > 0) {
      handleFileSelect(targetFiles, val);
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

  async function handleGenerate(options = {}) {
    if (isBusy) return;
    const isSample = Boolean(options.sampleOnly);
    const isHd = Boolean(options.hdQuality);
    const targetFiles = files && files.length > 0 ? files : (file ? [file] : []);
    if (targetFiles.length === 0) {
      const msg = isSample
        ? "Please upload a PDF file first to download a test sample."
        : "Please upload PDF file(s) first to generate labels.";
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
    } else if (isHd) {
      setLoadingHdGenerate(true);
    } else {
      setLoadingGenerate(true);
    }

    try {
      showToast(
        isHd
          ? `Generating Standard Ultra-HD Quality (${targetFiles.length > 1 ? `${targetFiles.length} files` : "labels"})...`
          : targetFiles.length > 1
          ? `Merging & generating ${targetFiles.length} PDF files in browser...`
          : "Generating labels in browser (0ms instant speed)...",
        "info"
      );

      // Merge all input PDF files into a single in-memory source document
      const srcDoc = await PDFDocument.create();
      for (const f of targetFiles) {
        const fileBuffer = await f.arrayBuffer();
        const subDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        const copiedSubPages = await srcDoc.copyPages(subDoc, subDoc.getPageIndices());
        copiedSubPages.forEach((p) => srcDoc.addPage(p));
      }
      const totalPdfPages = srcDoc.getPageCount();

      const numPagesToProcess = isSample ? 1 : totalPdfPages;
      const fields = pages && pages.length ? pages : [];

      if (enableQr) {
        const x = parseFloat(qrX) || 0;
        const y = parseFloat(qrY) || 0;
        const size = parseFloat(qrSize) || 65;
        const fSize = parseFloat(fontSize) || 9;
        const cleanStoreName = (storeName || "VISHAL").trim().toUpperCase();

        const badgeImageCache = new Map();

        const renderStampBadgeCanvas = async (storeNameStr, qrContentStr, detailTextStr, qrSizeVal, fontSizeVal, pageWidthPt = 288) => {
          const scale = isHd ? 6 : 4; // High DPI (300+ to 600 DPI Ultra-HD for crisp thermal printing)
          const cleanStore = (storeNameStr || "STORE").trim().toUpperCase();

          const isA4 = pageWidthPt > 400;
          // Target width to fill the label footer cleanly with symmetric left/right margins matching the table
          const targetWidthPt = isA4 ? Math.min(pageWidthPt - 28, 540) : Math.min(pageWidthPt - 16, 272);
          const targetWidthPx = Math.round(targetWidthPt * scale);

          // Setup measuring canvas
          const measureCanvas = document.createElement("canvas");
          const mCtx = measureCanvas.getContext("2d");

          // Determine Store Font Size (Larger & more prominent)
          const baseScaleMultiplier = isA4 ? 1.8 : 1.45;

          let storeFontSizePt = Math.round(Math.max(15 * baseScaleMultiplier, fontSizeVal * 1.55 * baseScaleMultiplier));
          let storeFontCss = `bold ${Math.round(storeFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
          mCtx.font = storeFontCss;
          let storeTextWidth = mCtx.measureText(cleanStore).width;

          // Auto-shrink store name if it is very long
          const maxStoreWidthPx = Math.round((isA4 ? 180 : 112) * scale);
          while (storeTextWidth > maxStoreWidthPx && storeFontSizePt > 9.5) {
            storeFontSizePt -= 0.5;
            storeFontCss = `bold ${Math.round(storeFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
            mCtx.font = storeFontCss;
            storeTextWidth = mCtx.measureText(cleanStore).width;
          }

          // Dynamic Sizing for Icon and QR (More prominent & larger)
          const iconSizePx = Math.round((isA4 ? 46 : 35) * scale);
          const qrScaledSizePx = Math.round((isA4 ? 64 : 48) * scale);

          // Layout spacing
          const padXPx = Math.round((isA4 ? 16 : 12) * scale);
          const padYPx = Math.round((isA4 ? 12 : 9.5) * scale);
          const iconTextGapPx = Math.round((isA4 ? 10 : 8) * scale);
          const dividerGapPx = Math.round((isA4 ? 14 : 10) * scale);
          const dividerWidthPx = Math.round((isA4 ? 2.5 : 2) * scale);
          const qrTextGapPx = Math.round((isA4 ? 12 : 9) * scale);

          const leftSectionWidthPx = iconSizePx + iconTextGapPx + storeTextWidth;

          // Calculate available width for text column
          const fixedWidthBeforeDetailPx = padXPx + leftSectionWidthPx + dividerGapPx + dividerWidthPx + dividerGapPx + qrScaledSizePx + qrTextGapPx + padXPx;
          const maxAvailableTextWidthPx = Math.max(Math.round(70 * scale), targetWidthPx - fixedWidthBeforeDetailPx);

          // Auto-fit detail text
          let detailFontSizePt = Math.max(isA4 ? 11 : 9.2, fontSizeVal * (isA4 ? 1.2 : 1.0));
          let detailFontCss = `bold ${Math.round(detailFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
          mCtx.font = detailFontCss;

          let wrappedLines = wrapCanvasText(mCtx, detailTextStr || "Follow\nour page", maxAvailableTextWidthPx);

          // If text creates more than 4 lines, shrink font size to fit cleanly
          while (wrappedLines.length > 4 && detailFontSizePt > 6.5) {
            detailFontSizePt -= 0.5;
            detailFontCss = `bold ${Math.round(detailFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
            mCtx.font = detailFontCss;
            wrappedLines = wrapCanvasText(mCtx, detailTextStr || "Follow\nour page", maxAvailableTextWidthPx);
          }

          // Max line width
          let maxDetailLineWidthPx = 0;
          for (const line of wrappedLines) {
            const w = mCtx.measureText(line).width;
            if (w > maxDetailLineWidthPx) maxDetailLineWidthPx = w;
          }

          // Total dimensions - expand badge to targetWidthPx for a symmetrical, prominent card that spans footer evenly
          const contentTotalWidthPx = fixedWidthBeforeDetailPx + maxDetailLineWidthPx - padXPx;
          const totalWidthPx = Math.max(contentTotalWidthPx + padXPx, targetWidthPx);

          const detailFontSizePx = Math.round(detailFontSizePt * scale);
          const textLineHeightPx = Math.round(detailFontSizePx * 1.25);
          const totalTextHeightPx = wrappedLines.length * textLineHeightPx;
          const contentHeightPx = Math.max(iconSizePx, qrScaledSizePx, totalTextHeightPx, Math.round(storeFontSizePt * scale));
          const totalHeightPx = padYPx + contentHeightPx + padYPx;

          // Draw on Canvas
          const canvas = document.createElement("canvas");
          canvas.width = totalWidthPx;
          canvas.height = totalHeightPx;
          const ctx = canvas.getContext("2d");

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 1. White Background with Rounded Outer Border (Exact Match)
          const borderRadiusPx = Math.round((isA4 ? 16 : 12) * scale);
          const borderWidthPx = Math.round((isA4 ? 2.5 : 2) * scale);

          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = borderWidthPx;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(borderWidthPx / 2, borderWidthPx / 2, totalWidthPx - borderWidthPx, totalHeightPx - borderWidthPx, borderRadiusPx);
          } else {
            ctx.rect(borderWidthPx / 2, borderWidthPx / 2, totalWidthPx - borderWidthPx, totalHeightPx - borderWidthPx);
          }
          ctx.fill();
          ctx.stroke();

          const centerYPx = totalHeightPx / 2;

          // 2. Draw Store Icon
          let curXPx = padXPx;
          const iconYPx = centerYPx - iconSizePx / 2;
          drawShopIconCanvas(ctx, curXPx, iconYPx, iconSizePx);

          // 3. Draw Store Name
          curXPx += iconSizePx + iconTextGapPx;
          ctx.font = storeFontCss;
          ctx.fillStyle = "#000000";
          ctx.textBaseline = "middle";
          ctx.fillText(cleanStore, curXPx, centerYPx);

          // 4. Draw Vertical Divider Line
          curXPx += storeTextWidth + dividerGapPx;
          ctx.beginPath();
          ctx.moveTo(curXPx, padYPx + Math.round(2.5 * scale));
          ctx.lineTo(curXPx, totalHeightPx - padYPx - Math.round(2.5 * scale));
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = dividerWidthPx;
          ctx.stroke();

          // 5. Draw QR Code
          curXPx += dividerGapPx;
          const qrPngDataUrl = await QRCode.toDataURL(qrContentStr || "https://www.meesho.com", {
            margin: 0,
            width: qrScaledSizePx,
            errorCorrectionLevel: "M",
          });
          const qrImg = new Image();
          await new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.src = qrPngDataUrl;
          });
          const qrYPx = centerYPx - qrScaledSizePx / 2;
          ctx.drawImage(qrImg, curXPx, qrYPx, qrScaledSizePx, qrScaledSizePx);

          // 6. Draw Wrapped Detail Text beside QR
          curXPx += qrScaledSizePx + qrTextGapPx;
          ctx.font = detailFontCss;
          ctx.fillStyle = "#000000";
          ctx.textBaseline = "top";
          const textStartYPx = centerYPx - (wrappedLines.length * textLineHeightPx) / 2;

          wrappedLines.forEach((line, idx) => {
            ctx.fillText(line, curXPx, textStartYPx + idx * textLineHeightPx);
          });

          const pngDataUrl = canvas.toDataURL("image/png");
          const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());

          return {
            pngBytes,
            widthPt: totalWidthPx / scale,
            heightPt: totalHeightPx / scale,
          };
        };

        for (let i = 0; i < numPagesToProcess; i++) {
          const page = srcDoc.getPage(i);
          const pageWidth = page.getWidth();
          const data = fields[i] || {};

          let qrContent = qrText || "{orderNo}";
          TAG_PLACEHOLDERS.forEach((tag) => {
            const key = tag.replace(/[{}]/g, "");
            qrContent = qrContent.replace(new RegExp(tag, "g"), data[key] || "");
          });
          qrContent = qrContent.trim() || `Page-${i + 1}`;

          let detailFilled = detailText || "Follow\nour page";
          TAG_PLACEHOLDERS.forEach((tag) => {
            const key = tag.replace(/[{}]/g, "");
            detailFilled = detailFilled.replace(new RegExp(tag, "g"), data[key] || "");
          });

          const cacheKey = `${cleanStoreName}__${qrContent}__${detailFilled}__${size}__${fSize}__${pageWidth}__${isHd ? "hd" : "std"}`;
          let badgeObj = badgeImageCache.get(cacheKey);

          if (!badgeObj) {
            const { pngBytes, widthPt, heightPt } = await renderStampBadgeCanvas(
              cleanStoreName,
              qrContent,
              detailFilled,
              size,
              fSize,
              pageWidth
            );
            const embeddedImg = await srcDoc.embedPng(pngBytes);
            badgeObj = {
              image: embeddedImg,
              widthPt,
              heightPt,
            };
            badgeImageCache.set(cacheKey, badgeObj);
          }

          // Center horizontally on page so both left & right margins are equal
          const centeredX = Math.max(6, Math.round((pageWidth - badgeObj.widthPt) / 2));
          const finalX = stampStyle === "badge" ? centeredX : x;
          const finalY = y;

          page.drawImage(badgeObj.image, {
            x: finalX,
            y: finalY,
            width: badgeObj.widthPt,
            height: badgeObj.heightPt,
          });
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
          const topPct = (parseFloat(cropTop) || 0) / 100;
          const botPct = (parseFloat(cropBottom) || 0) / 100;
          const leftPct = (parseFloat(cropLeft) || 0) / 100;
          const rightPct = (parseFloat(cropRight) || 0) / 100;

          const cropX = width * leftPct;
          const cropW = width * Math.max(0.05, 1 - leftPct - rightPct);
          const cropY = height * botPct;
          const cropH = height * Math.max(0.05, 1 - topPct - botPct);

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
      const pageCount = isSample ? 1 : (pages?.length || totalPdfPages || 1);
      const mainBaseName = targetFiles.length > 1 ? `${targetFiles.length}_files_batch` : targetFiles[0].name.replace(/\.pdf$/i, "");
      const qualityTag = isHd ? "_standard_HD_quality" : "_stamped";
      const stampedFileName = isSample ? `1_${dateStr}_sample_test_page_1.pdf` : `${pageCount}_${dateStr}_${mainBaseName}${qualityTag}.pdf`;
      a.download = stampedFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Async Background Server Sync (Zero delay on download speed)
      const userEmail = session?.user?.email || "";
      const historyFileName = targetFiles.length > 1 ? `${targetFiles.length} PDFs (${targetFiles.map(f => f.name).join(", ")})` : targetFiles[0].name;
      fetch(`${BACKEND_URL}/api/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-email": userEmail },
        body: JSON.stringify({ email: userEmail, fileName: historyFileName, pageCount: isSample ? 1 : pages.length, isSample, sortBy, sortOrder, enableQr, qrText, pages: isSample ? [] : pages }),
      }).catch((e) => console.error("Async history save error:", e));

      // Auto-download summary PDF if downloadSummary is enabled
      if (!isSample && downloadSummary && pages && pages.length > 0) {
        try {
          const today2 = new Date();
          const dateStr2 = `${String(today2.getDate()).padStart(2, "0")}.${String(today2.getMonth() + 1).padStart(2, "0")}.${today2.getFullYear()}`;
          const summaryRes = await fetch(`${BACKEND_URL}/api/generate-summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-email": userEmail },
            body: JSON.stringify({ pages, fileName: historyFileName }),
          });
          if (summaryRes.ok) {
            const summaryBlob = await summaryRes.blob();
            const summaryUrl = URL.createObjectURL(summaryBlob);
            const sa = document.createElement("a");
            sa.href = summaryUrl;
            sa.download = `${pages.length}_${dateStr2}_summary.pdf`;
            document.body.appendChild(sa);
            sa.click();
            sa.remove();
            URL.revokeObjectURL(summaryUrl);
          } else {
            console.warn("Summary download failed:", await summaryRes.text());
          }
        } catch (sumErr) {
          console.warn("Summary auto-download error:", sumErr.message);
        }
      }

      // Send final PDF to WhatsApp via /api/whatsapp/dispatch-final
      if (!isSample) {
        (async () => {
          try {
            const waFormData = new FormData();
            waFormData.append("pdf", finalPdfBlob, stampedFileName);
            waFormData.append("pages", JSON.stringify(pages));
            waFormData.append("fileName", historyFileName);
            const waRes = await fetch(`${BACKEND_URL}/api/whatsapp/dispatch-final`, {
              method: "POST",
              headers: { "x-user-email": userEmail },
              body: waFormData,
            });
            if (!waRes.ok) {
              const waErr = await waRes.json().catch(() => ({}));
              console.warn("WhatsApp dispatch failed:", waErr.error || waRes.status);
            }
          } catch (waErr) {
            console.warn("WhatsApp dispatch error (non-critical):", waErr.message);
          }
        })();
      }

      if (isSample) {
        const msg = "Test Sample (Page 1) downloaded! Check QR alignment & print preview.";
        setSuccessMsg(msg);
        showToast(msg, "success");
      } else if (isHd) {
        const summaryNote = downloadSummary ? " + Summary PDF" : "";
        const msg = `Standard HD Quality PDF${summaryNote} generated and downloaded!`;
        setSuccessMsg(msg);
        showToast(msg, "success");
      } else {
        const summaryNote = downloadSummary ? " + Summary PDF" : "";
        const msg = `Stamped & Cropped PDF${summaryNote} generated instantly and downloaded!`;
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
      } else if (isHd) {
        setLoadingHdGenerate(false);
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
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files);
                  }
                }}
              />

              <div
                className={`dropzone ${files.length > 0 || file ? "active" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                    handleFileSelect(e.dataTransfer.files);
                  }
                }}
                style={{
                  minHeight: 280,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "16px",
                  padding: "24px 16px",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ color: "#4F46E5", marginBottom: 12 }}>
                  <FilePdfIcon />
                </div>
                {files.length > 1 ? (
                  <div style={{ textAlign: "center", width: "100%", maxWidth: "92%" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(79, 70, 229, 0.1)", color: "#4F46E5", padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.9rem", marginBottom: 10 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><PackageIcon size={14} /> {files.length} PDF Files Selected</span>
                    </div>
                    <div style={{ maxHeight: "88px", overflowY: "auto", margin: "6px 0", display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                      {files.map((f, idx) => (
                        <span key={idx} style={{ fontSize: "0.74rem", background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)", padding: "3px 8px", borderRadius: 6, color: "var(--text-pure)", maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><FileTextIcon size={12} /> {f.name}</span>
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "#16A34A", marginTop: 8, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {pages.length > 0 ? <><CheckIcon /> Total {pages.length} Pages Extracted & Ready</> : "Extracting pages..."}
                    </p>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-dim)", marginTop: 4 }}>
                      Click to choose different PDFs or replace
                    </p>
                  </div>
                ) : file ? (
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
                      Drop multiple PDF shipping labels here or <span style={{ color: "#4F46E5" }}>Browse</span>
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: 6 }}>
                      Select multiple PDFs at once (Meesho, Xpressbees, Delhivery)
                    </p>
                  </div>
                )}

                {loadingPreview && (
                  <div style={{ marginTop: 20, width: "100%", maxWidth: "340px", margin: "20px auto 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.82rem", color: "var(--aurora-1)", fontWeight: 600 }}>
                      <span>Extracting label fields across all PDFs...</span>
                      <span>{uploadProgress}%</span>
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
              {(file || files.length > 0) && (
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setFiles([]);
                    setPages([]);
                    setPdfPage1DataUrl(null);
                  }}
                  style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                >
                  Clear All
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
                    borderColor: "#CBD5E1",
                    color: "#475569",
                    cursor: "pointer",
                    background: "#FFFFFF",
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
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                  border: "1.5px solid #CBD5E1",
                  overflow: "hidden",
                  userSelect: "none",
                  color: "#000",
                  fontSize: 6.5,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Real Uploaded PDF Page 1 Image Preview or Fallback Mock */}
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
                  <div style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column" }}>
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
                          <div style={{ fontWeight: 700, fontSize: 6.5 }}>{storeName || "Mahir Enterprise"}</div>
                          <div style={{ fontSize: 5.5, color: "#333", lineHeight: 1.1 }}>
                            Ratanvav, Gujarat, India - 360575
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
                          <b>Sold by:</b> {storeName || "Mahir Enterprise"}<br />
                          <b>Invoice No:</b> {pages[0]?.invoiceNo || "INV-9876541"} | <b>Date:</b> {pages[0]?.orderDate || "24.08.2026"}
                        </div>
                      </div>

                      <div style={{ fontSize: 4.5, color: "#555", marginTop: 2, lineHeight: 1.1 }}>
                        Tax is not payable on reverse charge basis. Computer generated invoice for logistics.
                      </div>
                    </div>

                    {/* Blank Label Area */}
                    <div style={{ padding: "4px", fontSize: 5.5, color: "#aaa", fontStyle: "italic", textAlign: "center", marginTop: 6 }}>
                      -- Blank Stamp Area --
                    </div>
                  </div>
                )}

                {/* DYNAMIC QR STAMP OVERLAY - 1:1 PDF Output Matching */}
                {enableQr ? (
                  stampStyle === "badge" ? (
                    /* Ultra-Clean Store Pill Badge Design matching PDF Output 1:1 */
                    <div
                      style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: Math.max(6, (numQrY || 14) * scale * 0.6),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#FFFFFF",
                        border: "1.8px solid #000000",
                        borderRadius: 8,
                        padding: "5px 10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        zIndex: 20,
                        userSelect: "none",
                      }}
                    >
                      {/* Left: Storefront Icon + Store Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <StorefrontIcon size={22} />
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: (storeName || "").length > 18 ? 7.2 : (storeName || "").length > 12 ? 8.2 : 9.2,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            color: "#000000",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {(storeName || "MAHIR ENTERPRISE").trim().toUpperCase()}
                        </span>
                      </div>

                      {/* Middle: Vertical Divider Line */}
                      <div style={{ width: 1.6, height: 32, background: "#000000", margin: "0 8px", flexShrink: 0 }} />

                      {/* Right: QR Code + Multi-Line Text */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        {previewQrDataUrl ? (
                          <img
                            src={previewQrDataUrl}
                            alt="QR"
                            style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              background: "#000000",
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#FFF",
                              fontSize: 7,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            QR
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                          {(previewText || "Thank You for Shopping with Us!\nFollow our page").split("\n").slice(0, 3).map((line, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: (previewText || "").length > 35 ? 5.8 : 6.6,
                                fontWeight: 800,
                                color: "#000000",
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {line || " "}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Classic Minimal Mode matching PDF Output 1:1 */
                    <div
                      style={{
                        position: "absolute",
                        left: simQrX,
                        top: simQrY,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        border: "1px solid #000000",
                        borderRadius: 4,
                        padding: "4px 8px",
                        background: "#ffffff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        zIndex: 20,
                        userSelect: "none",
                        maxWidth: "calc(100% - 10px)",
                      }}
                    >
                      {previewQrDataUrl ? (
                        <img src={previewQrDataUrl} alt="QR" style={{ width: Math.min(32, simQrSize), height: Math.min(32, simQrSize), objectFit: "contain", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: Math.min(32, simQrSize), height: Math.min(32, simQrSize), background: "#000", borderRadius: 2, flexShrink: 0 }} />
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                        {(previewText || "Follow\nour page").split("\n").slice(0, 4).map((line, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: idx === 0 ? Math.max(6, simFontSize) : Math.max(5.5, simFontSize * 0.9),
                              fontWeight: idx === 0 ? 800 : 500,
                              color: idx === 0 ? "#000000" : "#333333",
                              lineHeight: 1.2,
                              wordBreak: "break-word",
                            }}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><TagIcon size={14} /> Modern Store Pill Badge</span>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FileTextIcon size={14} /> Classic Minimal Stamp</span>
                </button>
              </div>
            </div>

            {stampStyle === "badge" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", minWidth: 120 }}>
                  Store / Brand Name:
                </label>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={25}
                    className="input-field"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. MAHIR ENTERPRISE"
                    style={{ width: 280, padding: "8px 54px 8px 12px", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.03em" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: 10,
                      fontSize: "0.72rem",
                      fontFamily: "var(--font-mono)",
                      color: (storeName || "").length >= 22 ? "#f59e0b" : "var(--text-dim)",
                      fontWeight: 600,
                      pointerEvents: "none",
                    }}
                  >
                    {(storeName || "").length}/25
                  </span>
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                  (Max 25 characters for perfect thermal label fitting)
                </span>
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
                placeholder="Follow\nour page"
              />
            </div>
          </div>

          {/* Live Real-Time Stamp Design Preview (Exact 1:1 Matching User Screenshot) */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "20px 24px", marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagIcon size={18} color="#4F46E5" />
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0F172A" }}>
                  Live Real-Time Stamp Preview (Client-Side Stamp Engine)
                </span>
                <span style={{ fontSize: "0.72rem", background: "#EEF2FF", color: "#4F46E5", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>
                  0ms Client-Side • Auto-Scaling Prominent Size
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748B", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                Offset: ({qrX}pt, {qrY}pt) • Scale: {qrSize}pt • Font: {fontSize}pt
              </span>
            </div>

            {/* Visual Badge Card matching screenshot */}
            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 10px", overflowX: "auto" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#FFFFFF",
                  border: "2.5px solid #000000",
                  borderRadius: "16px",
                  padding: "14px 26px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  gap: 0,
                  maxWidth: "100%",
                }}
              >
                {/* Left: Storefront Icon + Store Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <StorefrontIcon size={44} />
                  <span
                    style={{
                      fontSize: (storeName || "").length > 18 ? "1.15rem" : (storeName || "").length > 12 ? "1.32rem" : "1.52rem",
                      fontWeight: 900,
                      color: "#000000",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(storeName || "MAHIR ENTERPRISE").trim().toUpperCase()}
                  </span>
                </div>

                {/* Middle: Vertical Divider */}
                <div style={{ width: 2.5, height: 54, background: "#000000", margin: "0 20px", flexShrink: 0 }} />

                {/* Right: QR Code + Text */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {previewQrDataUrl ? (
                    <img src={previewQrDataUrl} alt="QR" style={{ width: 54, height: 54, objectFit: "contain", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 54, height: 54, background: "#000000", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      QR
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 300 }}>
                    {(detailText || "Follow\nour page").split("\n").map((line, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: (detailText || "").length > 30 ? "0.98rem" : "1.08rem",
                          fontWeight: 800,
                          color: "#000000",
                          lineHeight: 1.25,
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {line || " "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
          <span style={{ fontSize: "0.85rem", color: "var(--text-silver)" }}>
            {file || files.length > 0 ? (
              <>Ready to process <strong>{pages.length} pages</strong></>
            ) : (
              "Upload PDF file(s) to preview, test sample, and sort labels"
            )}
          </span>
        </div>

        <div className="action-dock-buttons" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn-secondary"
            disabled={(!file && files.length === 0) || isBusy}
            style={{
              minWidth: 180,
              opacity: (file || files.length > 0) && !isBusy ? 1 : 0.5,
              cursor: (file || files.length > 0) && !isBusy ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: true })}
          >
            {loadingSample ? "Generating Sample..." : <><FlaskIcon /> Download Test Sample (Page 1)</>}
          </button>

          <button
            className="btn-primary"
            disabled={(!file && files.length === 0) || isBusy}
            style={{
              minWidth: 195,
              opacity: (file || files.length > 0) && !isBusy ? 1 : 0.5,
              cursor: (file || files.length > 0) && !isBusy ? "pointer" : "not-allowed",
            }}
            onClick={() => handleGenerate({ sampleOnly: false, hdQuality: false })}
          >
            {loadingGenerate ? (
              <>Processing All {pages.length} Pages...</>
            ) : (
              <><ZapIcon /> Generate Full PDF ({pages.length > 0 ? `${pages.length} Pages` : "Batch"})</>
            )}
          </button>

          <button
            type="button"
            disabled={(!file && files.length === 0) || isBusy}
            style={{
              minWidth: 215,
              background: "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "var(--radius-full)",
              padding: "10px 20px",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.01em",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: (file || files.length > 0) && !isBusy ? "pointer" : "not-allowed",
              opacity: (file || files.length > 0) && !isBusy ? 1 : 0.5,
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
              transition: "all 0.2s ease",
            }}
            onClick={() => handleGenerate({ sampleOnly: false, hdQuality: true })}
          >
            {loadingHdGenerate ? (
              <>Enhancing Quality ({pages.length} Pages)...</>
            ) : (
              <><SparklesIcon /> Standard HD Quality PDF ({pages.length > 0 ? `${pages.length} Pages` : "HD"})</>
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
              background: "#F1F5F9",
              borderRadius: 16,
              padding: 24,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "inset 0 2px 8px rgba(15, 23, 42, 0.05)",
              border: "1px solid #E2E8F0",
            }}
          >
            {/* Actual Uploaded Shipping Label Sheet or Fallback Mock */}
            <div
              id="crop-stage-preview-box"
              className="crop-stage-container"
              style={{
                width: 330 * (zoomLevel / 100),
                height: 470 * (zoomLevel / 100),
                position: "relative",
                background: "#ffffff",
                borderRadius: 8,
                boxShadow: "0 12px 35px rgba(15, 23, 42, 0.15)",
                border: "1px solid #CBD5E1",
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
                      title="Drag to crop top edge"
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
                      title="Drag to crop bottom edge"
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

                    {/* Interactive Left Border Drag Zone */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "left")}
                      onTouchStart={(e) => handleCropDragStart(e, "left")}
                      title="Drag to crop left edge"
                      style={{
                        position: "absolute",
                        left: -8,
                        top: 0,
                        bottom: 0,
                        width: 16,
                        cursor: "ew-resize",
                        zIndex: 25,
                      }}
                    />

                    {/* Interactive Right Border Drag Zone */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "right")}
                      onTouchStart={(e) => handleCropDragStart(e, "right")}
                      title="Drag to crop right edge"
                      style={{
                        position: "absolute",
                        right: -8,
                        top: 0,
                        bottom: 0,
                        width: 16,
                        cursor: "ew-resize",
                        zIndex: 25,
                      }}
                    />

                    {/* Corner Drag Handles (All 4 Corners with 2D Resizing) */}
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "top-left")}
                      onTouchStart={(e) => handleCropDragStart(e, "top-left")}
                      title="Drag Top-Left corner"
                      style={{
                        position: "absolute",
                        top: -8,
                        left: -8,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "3px solid #10B981",
                        cursor: "nwse-resize",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 30,
                      }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "top-right")}
                      onTouchStart={(e) => handleCropDragStart(e, "top-right")}
                      title="Drag Top-Right corner"
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "3px solid #10B981",
                        cursor: "nesw-resize",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 30,
                      }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom-left")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom-left")}
                      title="Drag Bottom-Left corner"
                      style={{
                        position: "absolute",
                        bottom: -8,
                        left: -8,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "3px solid #10B981",
                        cursor: "nesw-resize",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 30,
                      }}
                    />
                    <div
                      onMouseDown={(e) => handleCropDragStart(e, "bottom-right")}
                      onTouchStart={(e) => handleCropDragStart(e, "bottom-right")}
                      title="Drag Bottom-Right corner"
                      style={{
                        position: "absolute",
                        bottom: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "3px solid #10B981",
                        cursor: "nwse-resize",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 30,
                      }}
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
                      {`Crop: Top ${cropTop}% | Bottom ${cropBottom}%${cropLeft > 0 || cropRight > 0 ? ` | Left ${cropLeft}% | Right ${cropRight}%` : ""}`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fine-tune the edges sliders section */}
          <div style={{ marginTop: 18, background: "#F8FAFC", borderRadius: 14, padding: 18, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: 12 }}>
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
