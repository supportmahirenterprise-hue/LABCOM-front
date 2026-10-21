"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Modal from "./components/Modal";
import { ButtonSpinner, PageLoader } from "./components/Loader";
import { getPendingStudioPdf, clearPendingStudioPdf } from "../lib/pdfTransfer";
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
  PlusIcon,
  PlusCircleIcon,
} from "./components/Icons";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
).replace(/\/+$/, "");

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
  const [showAuthModal, setShowAuthModal] = useState(false);

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
  const [storeName, setStoreName] = useState("");
  const displayStoreName = useMemo(() => {
    if (status !== "authenticated") {
      return storeName && storeName.trim() ? storeName.trim() : "YOUR STORE";
    }
    return storeName && storeName.trim() ? storeName.trim() : (session?.user?.name || "YOUR STORE");
  }, [status, storeName, session]);
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
  const [detectedLabelFormat, setDetectedLabelFormat] = useState(null); // "thermal_4x6" | "a4_sheet" | "custom"

  function handleSelectCropPreset(preset) {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
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
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    const nextVal = !cropEnabled;
    setCropEnabled(nextVal);
    if (!nextVal) {
      showToast("PDF Cropping turned OFF. Labels will download as full-size sheets.", "info");
    } else {
      setCropMode("custom");
      showToast("PDF Cropping turned ON! Generated labels will be cropped.", "success");
    }
    if (session?.user?.email && typeof window !== "undefined") {
      try {
        const cachedStr = localStorage.getItem("user_stamp_settings_" + session.user.email);
        const parsed = cachedStr ? JSON.parse(cachedStr) : {};
        parsed.cropEnabled = nextVal;
        if (nextVal) parsed.cropMode = "custom";
        localStorage.setItem("user_stamp_settings_" + session.user.email, JSON.stringify(parsed));
      } catch (e) {}
    }
  }

  function handleSaveCrop() {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    setCropEnabled(true);
    setCropMode("custom");
    setShowCropModal(false);
    showToast("Crop settings saved! Download will generate cropped thermal labels.", "success");
    if (session?.user?.email && typeof window !== "undefined") {
      try {
        const cachedStr = localStorage.getItem("user_stamp_settings_" + session.user.email);
        const parsed = cachedStr ? JSON.parse(cachedStr) : {};
        parsed.cropEnabled = true;
        parsed.cropMode = "custom";
        parsed.cropPreset = cropPreset;
        parsed.cropTop = cropTop;
        parsed.cropBottom = cropBottom;
        parsed.cropLeft = cropLeft;
        parsed.cropRight = cropRight;
        localStorage.setItem("user_stamp_settings_" + session.user.email, JSON.stringify(parsed));
      } catch (e) {}
    }
  }

  function handleDisableCrop() {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    setCropEnabled(false);
    setShowCropModal(false);
    showToast("Label cropping turned OFF.", "info");
    if (session?.user?.email && typeof window !== "undefined") {
      try {
        const cachedStr = localStorage.getItem("user_stamp_settings_" + session.user.email);
        const parsed = cachedStr ? JSON.parse(cachedStr) : {};
        parsed.cropEnabled = false;
        localStorage.setItem("user_stamp_settings_" + session.user.email, JSON.stringify(parsed));
      } catch (e) {}
    }
  }

  function handleResetDefaults() {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
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
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Return History Warning Modal State
  const [returnWarnings, setReturnWarnings] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentWarningIndex, setCurrentWarningIndex] = useState(0);

  // Duplicate Saved Order Warning Modal State
  const [duplicateOrderWarnings, setDuplicateOrderWarnings] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [currentDuplicateIndex, setCurrentDuplicateIndex] = useState(0);

  // Multi-Marketplace Auto-Detection States
  const [detectedMarketplaces, setDetectedMarketplaces] = useState([]);
  const [marketplaceCounts, setMarketplaceCounts] = useState({ meesho: 0, flipkart: 0, amazon: 0 });
  const [activeMarketplace, setActiveMarketplace] = useState("meesho");
  const [showMixedMarketplaceModal, setShowMixedMarketplaceModal] = useState(false);

  const fileInputRef = useRef(null);
  const addMoreFileInputRef = useRef(null);
  const isInitialLoadDone = useRef(false);

  // LaterPro WhatsApp Configuration Modal & State
  const [showLaterProModal, setShowLaterProModal] = useState(false);
  const [userWaApiKey, setUserWaApiKey] = useState("");
  const [userWaReceiverNumber, setUserWaReceiverNumber] = useState("");
  const [laterProApiKeyInput, setLaterProApiKeyInput] = useState("");
  const [laterProReceiverInput, setLaterProReceiverInput] = useState("");
  const [savingLaterPro, setSavingLaterPro] = useState(false);

  const isBusy = loadingPreview || loadingGenerate || loadingSample || loadingHdGenerate;

  function showToast(message, type = "error") {
    setToast({ message, type });
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load user settings from Node.js backend on login (strictly scoped to authenticated user)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_stamp_settings"); // purge legacy shared cache
      }
      if (session?.user?.email && typeof window !== "undefined") {
        const cachedStr = localStorage.getItem("user_stamp_settings_" + session.user.email);
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
          if (s.sendWhatsApp !== undefined) setSendWhatsApp(s.sendWhatsApp);
          else if (s.enableWhatsApp !== undefined) setSendWhatsApp(s.enableWhatsApp);
          if (s.cropEnabled !== undefined) setCropEnabled(s.cropEnabled);
          if (s.cropPreset !== undefined) setCropPreset(s.cropPreset);
          if (s.cropMode !== undefined) setCropMode(s.cropMode);
          if (s.cropTop !== undefined) setCropTop(s.cropTop);
          if (s.cropBottom !== undefined) setCropBottom(s.cropBottom);
          if (s.cropLeft !== undefined) setCropLeft(s.cropLeft);
          if (s.cropRight !== undefined) setCropRight(s.cropRight);
        }
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
            if (s.sendWhatsApp !== undefined) setSendWhatsApp(s.sendWhatsApp);
            else if (s.enableWhatsApp !== undefined) setSendWhatsApp(s.enableWhatsApp);
            if (s.cropEnabled !== undefined) setCropEnabled(s.cropEnabled);
            if (s.cropPreset !== undefined) setCropPreset(s.cropPreset);
            if (s.cropMode !== undefined) setCropMode(s.cropMode);
            if (s.cropTop !== undefined) setCropTop(s.cropTop);
            if (s.cropBottom !== undefined) setCropBottom(s.cropBottom);
            if (s.cropLeft !== undefined) setCropLeft(s.cropLeft);
            if (s.cropRight !== undefined) setCropRight(s.cropRight);

            if (s.waApiKey) {
              setUserWaApiKey(s.waApiKey);
              setLaterProApiKeyInput(s.waApiKey);
            }
            if (s.pdfReceiverNumber || s.waReceiverNumber) {
              const num = s.pdfReceiverNumber || s.waReceiverNumber;
              setUserWaReceiverNumber(num);
              setLaterProReceiverInput(num);
            }

            try {
              localStorage.setItem("user_stamp_settings_" + userEmail, JSON.stringify(s));
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

  // Debounced auto-save settings to Node.js backend & localStorage
  useEffect(() => {
    if (!isInitialLoadDone.current || status !== "authenticated" || !session?.user?.email) return;

    const timer = setTimeout(async () => {
      setSavingSettings(true);
      try {
        const userEmail = session.user.email;
        const payload = {
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
          enableWhatsApp: sendWhatsApp,
          sendWhatsApp,
          cropEnabled,
          cropPreset,
          cropMode,
          cropTop,
          cropBottom,
          cropLeft,
          cropRight,
        };

        try {
          localStorage.setItem("user_stamp_settings_" + userEmail, JSON.stringify(payload));
        } catch (e) {}

        await fetch(`/api/user/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": userEmail,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Auto-save settings failed:", err);
      } finally {
        setSavingSettings(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
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
    sendWhatsApp,
    cropEnabled,
    cropPreset,
    cropMode,
    cropTop,
    cropBottom,
    cropLeft,
    cropRight,
    status,
    session,
  ]);
  // Modal scroll lock is handled centrally by Modal.js

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

  async function handleSaveLaterProCredentials(e) {
    if (e) e.preventDefault();
    if (!laterProApiKeyInput.trim()) {
      showToast("Please enter your Personal Secret API Key from LaterPro", "error");
      return;
    }
    setSavingLaterPro(true);
    try {
      const userEmail = session?.user?.email || "";
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          email: userEmail,
          waApiKey: laterProApiKeyInput.trim(),
          waReceiverNumber: laterProReceiverInput.trim(),
          pdfReceiverNumber: laterProReceiverInput.trim(),
          enableWhatsApp: true,
          sendWhatsApp: true,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save LaterPro settings");
      }
      setUserWaApiKey(laterProApiKeyInput.trim());
      setUserWaReceiverNumber(laterProReceiverInput.trim());
      setSendWhatsApp(true);
      setShowLaterProModal(false);
      showToast("LaterPro WhatsApp API connected successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to save LaterPro settings", "error");
    } finally {
      setSavingLaterPro(false);
    }
  }

  async function handleAddMoreFiles(fileInputOrList) {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    if (!fileInputOrList || isBusy) return;
    const rawFiles = Array.isArray(fileInputOrList)
      ? fileInputOrList
      : (fileInputOrList instanceof FileList ? Array.from(fileInputOrList) : [fileInputOrList]);
    if (rawFiles.length === 0) return;

    // Filter only PDF files
    const pdfFiles = rawFiles.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfFiles.length === 0) {
      showToast("Please select valid PDF shipping label file(s).", "error");
      return;
    }

    const currentFiles = files && files.length > 0 ? files : (file ? [file] : []);
    const existingFileNames = new Set(currentFiles.map((f) => f.name.toLowerCase()));
    const existingFileKeys = new Set(
      currentFiles.map((f) => `${f.name.toLowerCase()}___${f.size}`)
    );

    const duplicateFileNames = [];
    const uniqueNewFiles = [];

    for (const f of pdfFiles) {
      const key = `${f.name.toLowerCase()}___${f.size}`;
      if (existingFileKeys.has(key) || existingFileNames.has(f.name.toLowerCase())) {
        duplicateFileNames.push(f.name);
      } else {
        uniqueNewFiles.push(f);
        existingFileKeys.add(key);
        existingFileNames.add(f.name.toLowerCase());
      }
    }

    if (duplicateFileNames.length > 0) {
      const dupMsg =
        duplicateFileNames.length === 1
          ? `Duplicate PDF: "${duplicateFileNames[0]}" is already uploaded!`
          : `Duplicate PDFs skipped: ${duplicateFileNames.join(", ")} already uploaded!`;
      setError(dupMsg);
      showToast(dupMsg, "error");
    }

    if (uniqueNewFiles.length === 0) {
      return;
    }

    const combinedFiles = [...currentFiles, ...uniqueNewFiles];
    showToast(`Adding ${uniqueNewFiles.length} new PDF(s)... Total: ${combinedFiles.length} PDFs`, "info");
    await handleFileSelect(combinedFiles);
  }

  async function handleFileSelect(fileInputOrList, nativeOverride) {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
    if (!fileInputOrList || isBusy) return;
    const rawList = Array.isArray(fileInputOrList)
      ? fileInputOrList
      : (fileInputOrList instanceof FileList ? Array.from(fileInputOrList) : [fileInputOrList]);
    if (rawList.length === 0) return;

    // Filter valid PDFs
    const pdfOnly = rawList.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfOnly.length === 0) {
      showToast("Please upload valid PDF file(s).", "error");
      return;
    }

    // Deduplicate within the incoming batch itself
    const seenIncoming = new Set();
    const cleanFileList = [];
    const internalDuplicates = [];
    for (const f of pdfOnly) {
      const key = `${f.name.toLowerCase()}___${f.size}`;
      if (seenIncoming.has(key)) {
        internalDuplicates.push(f.name);
      } else {
        seenIncoming.add(key);
        cleanFileList.push(f);
      }
    }
    if (internalDuplicates.length > 0) {
      const dupNotice = `Duplicate file(s) skipped in batch: ${internalDuplicates.join(", ")}`;
      setError(dupNotice);
      showToast(dupNotice, "error");
    }

    const fileList = cleanFileList;
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

          if (fIdx === 0 && totalPagesInPdf > 0) {
            const p1 = loadedPdf.getPage(0);
            const { width: p1W, height: p1H } = p1.getSize();
            if (p1W > 380 || p1H > 550) {
              setDetectedLabelFormat("a4_sheet");
            } else if (p1W >= 240 && p1W <= 360 && p1H >= 360 && p1H <= 520) {
              setDetectedLabelFormat("thermal_4x6");
            } else {
              setDetectedLabelFormat("custom");
            }
          }
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

        const mCounts = { meesho: 0, flipkart: 0, amazon: 0 };
        allExtractedPages.forEach((p) => {
          const pl = (p.platform || "meesho").toLowerCase();
          if (mCounts[pl] !== undefined) mCounts[pl]++;
          else mCounts[pl] = 1;
        });
        const mPresent = Object.keys(mCounts).filter((k) => mCounts[k] > 0);
        const dominant =
          mPresent.sort((a, b) => mCounts[b] - mCounts[a])[0] || "meesho";

        setMarketplaceCounts(mCounts);
        setDetectedMarketplaces(mPresent);
        setActiveMarketplace(dominant);

        if (mPresent.length > 1) {
          setShowMixedMarketplaceModal(true);
        }
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

  // Auto-load transferred PDF from Remove Duplicate or other tools
  useEffect(() => {
    async function checkPendingTransfer() {
      try {
        const pending = await getPendingStudioPdf();
        if (pending && pending.blob) {
          const fileObj = new File([pending.blob], pending.name || "unique_labels_cleaned.pdf", { type: "application/pdf" });
          handleFileSelect([fileObj]);
          showToast(`Cleaned unique PDF (${pending.name}) auto-loaded into Studio!`, "success");
          clearPendingStudioPdf();
        }
      } catch (err) {
        console.warn("Studio auto-load check error:", err);
      }
    }
    const t = setTimeout(checkPendingTransfer, 250);
    return () => clearTimeout(t);
  }, []);

  function handleNativeScriptToggle(val) {
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
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
    if (status !== "authenticated") {
      setShowAuthModal(true);
      return;
    }
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
        const cleanStoreName = (displayStoreName || "YOUR STORE").trim().toUpperCase();

        const badgeImageCache = new Map();

        const renderStampBadgeCanvas = async (
          storeNameStr,
          qrContentStr,
          detailTextStr,
          qrSizeVal,
          fontSizeVal,
          targetAvailableWidthPt = 272,
          isA4Format = false
        ) => {
          const scale = isHd ? 6 : 4; // High DPI (300+ to 600 DPI Ultra-HD for crisp thermal printing)
          const cleanStore = (storeNameStr || "STORE").trim().toUpperCase();

          // Target width to fill the visible label footer cleanly with symmetric margins
          const targetWidthPt = isA4Format
            ? Math.min(targetAvailableWidthPt - 28, 540)
            : Math.min(targetAvailableWidthPt - 16, 272);
          const targetWidthPx = Math.round(targetWidthPt * scale);

          // Setup measuring canvas
          const measureCanvas = document.createElement("canvas");
          const mCtx = measureCanvas.getContext("2d");

          // Determine Store Font Size (Larger & more prominent)
          const baseScaleMultiplier = isA4Format ? 1.8 : 1.45;

          let storeFontSizePt = Math.round(Math.max(15 * baseScaleMultiplier, fontSizeVal * 1.55 * baseScaleMultiplier));
          let storeFontCss = `bold ${Math.round(storeFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
          mCtx.font = storeFontCss;
          let storeTextWidth = mCtx.measureText(cleanStore).width;

          // Auto-shrink store name if it is very long
          const maxStoreWidthPx = Math.round((isA4Format ? 180 : 112) * scale);
          while (storeTextWidth > maxStoreWidthPx && storeFontSizePt > 9.5) {
            storeFontSizePt -= 0.5;
            storeFontCss = `bold ${Math.round(storeFontSizePt * scale)}px "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
            mCtx.font = storeFontCss;
            storeTextWidth = mCtx.measureText(cleanStore).width;
          }

          // Dynamic Sizing for Icon and QR (More prominent & larger)
          const iconSizePx = Math.round((isA4Format ? 46 : 35) * scale);
          const qrScaledSizePx = Math.round((isA4Format ? 64 : 48) * scale);

          // Layout spacing
          const padXPx = Math.round((isA4Format ? 16 : 12) * scale);
          const padYPx = Math.round((isA4Format ? 12 : 9.5) * scale);
          const iconTextGapPx = Math.round((isA4Format ? 10 : 8) * scale);
          const dividerGapPx = Math.round((isA4Format ? 14 : 10) * scale);
          const dividerWidthPx = Math.round((isA4Format ? 2.5 : 2) * scale);
          const qrTextGapPx = Math.round((isA4Format ? 12 : 9) * scale);

          const leftSectionWidthPx = iconSizePx + iconTextGapPx + storeTextWidth;

          // Calculate available width for text column
          const fixedWidthBeforeDetailPx = padXPx + leftSectionWidthPx + dividerGapPx + dividerWidthPx + dividerGapPx + qrScaledSizePx + qrTextGapPx + padXPx;
          const maxAvailableTextWidthPx = Math.max(Math.round(70 * scale), targetWidthPx - fixedWidthBeforeDetailPx);

          // Auto-fit detail text
          let detailFontSizePt = Math.max(isA4Format ? 11 : 9.2, fontSizeVal * (isA4Format ? 1.2 : 1.0));
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
          const borderRadiusPx = Math.round((isA4Format ? 16 : 12) * scale);
          const borderWidthPx = Math.round((isA4Format ? 2.5 : 2) * scale);

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
          const { width: pageWidth, height: pageHeight } = page.getSize();

          // Automatic format & size detection per page
          const isThermalPage = pageWidth >= 240 && pageWidth <= 360 && pageHeight >= 360 && pageHeight <= 520;
          const isA4Page = pageWidth > 380 || pageHeight > 550;

          // Crop safeguard: If the page is already a 4x6 thermal label, do NOT apply A4 receipt crop!
          const shouldApplyCrop = cropEnabled && !(isThermalPage && cropPreset === "label_only");

          let pageCropX = 0;
          let pageCropY = 0;
          let pageCropW = pageWidth;
          let pageCropH = pageHeight;

          if (shouldApplyCrop) {
            const topPct = (parseFloat(cropTop) || 0) / 100;
            const botPct = (parseFloat(cropBottom) || 0) / 100;
            const leftPct = (parseFloat(cropLeft) || 0) / 100;
            const rightPct = (parseFloat(cropRight) || 0) / 100;

            pageCropX = pageWidth * leftPct;
            pageCropW = pageWidth * Math.max(0.05, 1 - leftPct - rightPct);
            pageCropY = pageHeight * botPct;
            pageCropH = pageHeight * Math.max(0.05, 1 - topPct - botPct);
          }

          const effectiveIsA4 = !shouldApplyCrop && isA4Page;
          const targetBadgeWidthPt = effectiveIsA4
            ? Math.min(pageCropW - 28, 540)
            : Math.min(pageCropW - 16, 272);

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

          const cacheKey = `${cleanStoreName}__${qrContent}__${detailFilled}__${size}__${fSize}__${Math.round(targetBadgeWidthPt)}__${effectiveIsA4 ? "a4" : "thermal"}__${isHd ? "hd" : "std"}`;
          let badgeObj = badgeImageCache.get(cacheKey);

          if (!badgeObj) {
            const { pngBytes, widthPt, heightPt } = await renderStampBadgeCanvas(
              cleanStoreName,
              qrContent,
              detailFilled,
              size,
              fSize,
              targetBadgeWidthPt,
              effectiveIsA4
            );
            const embeddedImg = await srcDoc.embedPng(pngBytes);
            badgeObj = {
              image: embeddedImg,
              widthPt,
              heightPt,
            };
            badgeImageCache.set(cacheKey, badgeObj);
          }

          // Horizontal Alignment: Centered symmetrically inside the visible cropped/page area
          const centeredX = pageCropX + Math.max(4, Math.round((pageCropW - badgeObj.widthPt) / 2));
          const finalX = stampStyle === "badge" ? centeredX : Math.max(pageCropX + 4, pageCropX + x);

          // Vertical Alignment: Positioned cleanly relative to the bottom of the visible cropped/page area
          // On cropped A4 (e.g. cropBottom 58%), pageCropY is 488pt. y is 10pt. finalY = 488 + 10 = 498pt!
          // On 4x6 thermal (cropBottom 0%), pageCropY is 0. y is 10pt. finalY = 0 + 10 = 10pt!
          const baseOffsetY = parseFloat(qrY) || 10;
          const finalY = pageCropY + Math.max(4, baseOffsetY);

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
          const { width: pWidth, height: pHeight } = p.getSize();
          const isThermalPage = pWidth >= 240 && pWidth <= 360 && pHeight >= 360 && pHeight <= 520;
          const shouldApplyCrop = !(isThermalPage && cropPreset === "label_only");

          if (shouldApplyCrop) {
            const topPct = (parseFloat(cropTop) || 0) / 100;
            const botPct = (parseFloat(cropBottom) || 0) / 100;
            const leftPct = (parseFloat(cropLeft) || 0) / 100;
            const rightPct = (parseFloat(cropRight) || 0) / 100;

            const cropX = pWidth * leftPct;
            const cropW = pWidth * Math.max(0.05, 1 - leftPct - rightPct);
            const cropY = pHeight * botPct;
            const cropH = pHeight * Math.max(0.05, 1 - topPct - botPct);

            p.setCropBox(cropX, cropY, cropW, cropH);
            p.setMediaBox(cropX, cropY, cropW, cropH);
          }
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

      // Send final PDF to WhatsApp via /api/whatsapp/dispatch-final only if sendWhatsApp is enabled
      if (!isSample && sendWhatsApp) {
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

      {/* Visitor Preview Mode CTA Banner */}
      {status !== "authenticated" && (
        <div
          style={{
            background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
            border: "1px solid #C7D2FE",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <SparklesIcon size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1E1B4B" }}>
                India&apos;s #1 E-Commerce Label Studio (Free Forever)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#4338CA", marginTop: 2 }}>
                Auto-crop 4x6 thermal shipping labels, sort SKUs, add marketing QR codes, and remove duplicates for Meesho, Flipkart &amp; Amazon.
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              padding: "10px 20px",
              fontSize: "0.86rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Sign In / Register Free →
          </Link>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 className="heading-display" style={{ fontSize: "1.65rem", color: "var(--text-pure)", margin: 0, letterSpacing: "-0.02em" }}>
              India&apos;s First E-Commerce Label Studio
            </h1>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(2, 132, 199, 0.12) 100%)",
                color: "#4F46E5",
                border: "1px solid rgba(79, 70, 229, 0.28)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              All-in-One Studio
            </span>
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
          <p style={{ fontSize: "0.86rem", color: "var(--text-silver)", marginTop: 6, marginBottom: 0, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Link href="/remove-duplicate" style={{ color: "#DC2626", fontWeight: 700, textDecoration: "none" }}>
              Duplicate Remover
            </Link>
            <span>•</span>
            <span style={{ color: "#0F172A", fontWeight: 600 }}>Label Cropper</span>
            <span>•</span>
            <span style={{ color: "#0F172A", fontWeight: 600 }}>Label Sorter</span>
            <span>•</span>
            <Link href="/customer-analysis" style={{ color: "#4F46E5", fontWeight: 700, textDecoration: "none" }}>
              Buyer &amp; Return Analyser
            </Link>
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
                <h2 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>
                  Shipping Label PDF
                  {pages.length > 0 && (
                    <>
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: activeMarketplace === "flipkart" ? "#EFF6FF" : activeMarketplace === "amazon" ? "#FFFBEB" : "#FDF2F8",
                          color: activeMarketplace === "flipkart" ? "#1D4ED8" : activeMarketplace === "amazon" ? "#B45309" : "#BE185D",
                          border: activeMarketplace === "flipkart" ? "1px solid #BFDBFE" : activeMarketplace === "amazon" ? "1px solid #FDE68A" : "1px solid #FBCFE8",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeMarketplace === "flipkart" ? "#2563EB" : activeMarketplace === "amazon" ? "#D97706" : "#DB2777" }} />
                        {activeMarketplace.toUpperCase()}
                      </span>
                      {detectedLabelFormat && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: detectedLabelFormat === "thermal_4x6" ? "#ECFDF5" : "#F8FAFC",
                            color: detectedLabelFormat === "thermal_4x6" ? "#065F46" : "#475569",
                            border: detectedLabelFormat === "thermal_4x6" ? "1px solid #A7F3D0" : "1px solid #CBD5E1",
                          }}
                        >
                          {detectedLabelFormat === "thermal_4x6" ? "📐 4x6\" Thermal" : "📄 A4 Format"}
                        </span>
                      )}
                    </>
                  )}
                </h2>
                <span className="tag-pill" style={{ fontSize: "0.72rem" }}>
                  Step 1: Upload
                </span>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                multiple
                aria-label="Upload PDF shipping labels"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files);
                  }
                }}
              />

              <div
                className={`dropzone ${files.length > 0 || file ? "active" : ""}`}
                onClick={() => {
                  if (status !== "authenticated") {
                    setShowAuthModal(true);
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (status !== "authenticated") {
                    setShowAuthModal(true);
                    return;
                  }
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

            {/* Add More PDF Button Action Area */}
            {(file || files.length > 0) && (
              <div style={{ marginTop: 14 }}>
                <input
                  type="file"
                  ref={addMoreFileInputRef}
                  accept="application/pdf"
                  multiple
                  aria-label="Add more PDF shipping labels"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleAddMoreFiles(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  id="add-more-pdf-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (status !== "authenticated") {
                      setShowAuthModal(true);
                      return;
                    }
                    addMoreFileInputRef.current?.click();
                  }}
                  disabled={loadingPreview || isBusy}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "11px 18px",
                    background: "rgba(79, 70, 229, 0.08)",
                    border: "1.5px dashed #4F46E5",
                    borderRadius: "12px",
                    color: "#4F46E5",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: (loadingPreview || isBusy) ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingPreview && !isBusy) {
                      e.currentTarget.style.background = "rgba(79, 70, 229, 0.16)";
                      e.currentTarget.style.borderColor = "#4338CA";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(79, 70, 229, 0.08)";
                    e.currentTarget.style.borderColor = "#4F46E5";
                  }}
                >
                  <PlusCircleIcon size={18} color="#4F46E5" />
                  <span>+ Add More PDF Files</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      background: "rgba(79, 70, 229, 0.18)",
                      color: "#4F46E5",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Multi-PDF Supported
                  </span>
                </button>
              </div>
            )}

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
              <h2 className="heading-display" style={{ fontSize: "1.1rem", color: "var(--text-pure)", margin: 0 }}>
                Live Stamp Preview
              </h2>
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
                          <div style={{ fontWeight: 700, fontSize: 6.5 }}>{displayStoreName}</div>
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
                          <b>Sold by:</b> {displayStoreName}<br />
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
                            fontSize: (displayStoreName || "").length > 18 ? 7.2 : (displayStoreName || "").length > 12 ? 8.2 : 9.2,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                            color: "#000000",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {(displayStoreName || "YOUR STORE").toUpperCase()}
                        </span>
                      </div>

                      {/* Middle: Vertical Divider Line */}
                      <div style={{ width: 1.6, height: 32, background: "#000000", margin: "0 8px", flexShrink: 0 }} />

                      {/* Right: QR Code + Multi-Line Text */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                        {previewQrDataUrl ? (
                          <img
                            src={previewQrDataUrl}
                            alt="Marketing QR Code Preview"
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
                        <img src={previewQrDataUrl} alt="Marketing QR Code Preview" style={{ width: Math.min(32, simQrSize), height: Math.min(32, simQrSize), objectFit: "contain", flexShrink: 0 }} />
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
                    aria-label="QR Code Horizontal Position X"
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
                    aria-label="QR Code Vertical Position Y"
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
                    aria-label="QR Code Size Dimension"
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
                    aria-label="Store Name Font Size"
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
              <h2 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 6px 0" }}>
                Crop out the tax invoice
              </h2>
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
              <h2 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Store Growth & QR Stamp Setup
              </h2>
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
                  aria-label="Print regional greetings in native language script"
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
                  aria-label="Enable Dynamic QR Code on Labels"
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
                <label htmlFor="store-name-input" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-silver)", minWidth: 120 }}>
                  Store / Brand Name:
                </label>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <input
                    type="text"
                    id="store-name-input"
                    aria-label="Store or Brand Name"
                    maxLength={25}
                    className="input-field"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={status === "authenticated" ? "e.g. YOUR STORE NAME" : "e.g. YOUR STORE"}
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
              <label htmlFor="qr-text-input" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-pure)", marginBottom: 8 }}>
                QR Code Scannable URL / Content
              </label>
              <input
                id="qr-text-input"
                aria-label="QR Code Scannable URL or Text Content"
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
                      fontSize: (displayStoreName || "").length > 18 ? "1.15rem" : (displayStoreName || "").length > 12 ? "1.32rem" : "1.52rem",
                      fontWeight: 900,
                      color: "#000000",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {(displayStoreName || "YOUR STORE").toUpperCase()}
                  </span>
                </div>

                {/* Middle: Vertical Divider */}
                <div style={{ width: 2.5, height: 54, background: "#000000", margin: "0 20px", flexShrink: 0 }} />

                {/* Right: QR Code + Text */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {previewQrDataUrl ? (
                    <img src={previewQrDataUrl} alt="Marketing QR Code Preview" style={{ width: 54, height: 54, objectFit: "contain", flexShrink: 0 }} />
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
              <h2 className="heading-display" style={{ fontSize: "1.15rem", color: "var(--text-pure)", margin: "0 0 4px 0" }}>
                Multi-Field Batch Sorter & Search Filter
              </h2>
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
                  cursor: isBusy ? "not-allowed" : "pointer",
                  userSelect: "none",
                  background: sendWhatsApp ? "rgba(37, 211, 102, 0.12)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${sendWhatsApp ? "rgba(37, 211, 102, 0.45)" : "var(--glass-border)"}`,
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  boxShadow: sendWhatsApp ? "0 0 15px rgba(37, 211, 102, 0.18)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  disabled={isBusy}
                  checked={sendWhatsApp}
                  aria-label="Pre-fill WhatsApp reorder link"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSendWhatsApp(checked);
                    if (checked && !userWaApiKey) {
                      setShowLaterProModal(true);
                    }
                  }}
                  style={{ width: 16, height: 16, accentColor: "#16a34a", cursor: isBusy ? "not-allowed" : "pointer" }}
                />
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: sendWhatsApp ? "#15803d" : "var(--text-silver)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <WhatsAppIcon size={16} color={sendWhatsApp ? "#16a34a" : "var(--text-silver)"} /> Send WhatsApp
                </span>
              </label>

              {/* LaterPro WhatsApp Setup Guide & Credential Trigger */}
              <button
                type="button"
                id="laterpro-guide-trigger-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLaterProModal(true);
                }}
                title="LaterPro WhatsApp Setup & API Key Guide"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  background: userWaApiKey ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.12)",
                  border: `1px solid ${userWaApiKey ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.4)"}`,
                  borderRadius: "var(--radius-full)",
                  color: userWaApiKey ? "#059669" : "#D97706",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: userWaApiKey ? "#10B981" : "#F59E0B" }} />
                <span>{userWaApiKey ? "LaterPro Connected" : "LaterPro Setup"}</span>
                <ExternalLinkIcon size={12} color={userWaApiKey ? "#059669" : "#D97706"} />
              </button>

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
                  aria-label="Download Summary Excel or Sheet"
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
              <label htmlFor="sort-by-select" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Sort Pages By Field
              </label>
              <select
                id="sort-by-select"
                aria-label="Sort Pages By Field"
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
                  type="button"
                  aria-label="Sort Ascending"
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
                  type="button"
                  aria-label="Sort Descending"
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
              <label htmlFor="instant-search-input" style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-silver)", marginBottom: 8 }}>
                Instant Search Filter
              </label>
              <input
                id="instant-search-input"
                aria-label="Instant Search Filter SKU, Order No, Customer"
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
        maxWidth={740}
        style={{
          borderRadius: "20px",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.15)",
          border: "1px solid #FECACA",
          background: "#FFFFFF",
          color: "#0F172A",
          padding: "24px 28px",
        }}
      >
        {showWarningModal && returnWarnings.length > 0 && (
          <>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "#FEE2E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#DC2626",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangleIcon size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                      Past Return Warning Notice
                    </h2>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                      }}
                    >
                      Order {currentWarningIndex + 1} of {returnWarnings.length}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "4px 0 0 0" }}>
                    Label Page #{returnWarnings[currentWarningIndex]?.page} in uploaded PDF has prior return records in DB!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                title="Close Modal"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Current Label Details Card */}
            <div style={{ background: "#FEF2F2", padding: "14px 16px", borderRadius: "14px", border: "1px solid #FECACA", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#DC2626", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #FCA5A5" }}>
                  <PackageIcon size={13} /> Uploaded Label Page #{returnWarnings[currentWarningIndex]?.page}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#4F46E5", fontFamily: "var(--font-mono)", fontWeight: 700, background: "#EEF2FF", border: "1px solid #E0E7FF", padding: "3px 8px", borderRadius: "6px" }}>
                  Sub Order: {returnWarnings[currentWarningIndex]?.subOrderNo}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: "0.9rem", color: "#0F172A", fontWeight: 700 }}>
                    Buyer: {returnWarnings[currentWarningIndex]?.customerName}
                  </div>
                  {returnWarnings[currentWarningIndex]?.customerMobile && returnWarnings[currentWarningIndex]?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.78rem", color: "#4F46E5", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      Mobile: {returnWarnings[currentWarningIndex]?.customerMobile}
                    </div>
                  )}
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <LocationIcon size={13} /> State: {returnWarnings[currentWarningIndex]?.state || "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                    SKU: <strong style={{ color: "#0F172A", background: "#FFFFFF", padding: "2px 6px", borderRadius: "4px", border: "1px solid #E2E8F0" }}>{returnWarnings[currentWarningIndex]?.sku}</strong>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                    Qty: <strong style={{ color: "#0F172A" }}>{returnWarnings[currentWarningIndex]?.qty}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 4, lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <StoreIcon size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {returnWarnings[currentWarningIndex]?.customerAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Prior Returns Breakdown */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#D97706", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangleIcon size={15} /> Previous Return Records Found ({returnWarnings[currentWarningIndex]?.returnCount})
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                {returnWarnings[currentWarningIndex]?.previousReturns?.map((pr, pIdx) => (
                  <div
                    key={pr.id || pIdx}
                    style={{
                      background: "#F8FAFC",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontWeight: 700,
                          background: /RTO|Courier/i.test(pr.returnType) ? "#FEF3C7" : "#FEE2E2",
                          color: /RTO|Courier/i.test(pr.returnType) ? "#B45309" : "#DC2626",
                          border: `1px solid ${/RTO|Courier/i.test(pr.returnType) ? "#FDE68A" : "#FECACA"}`,
                        }}
                      >
                        {pr.returnType}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#64748B", fontFamily: "var(--font-mono)" }}>
                        Return Date: {pr.deliveredDate}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0F172A", marginTop: 8 }}>
                      Reason: {pr.returnReason}
                    </div>
                    {pr.detailedReturnReason && pr.detailedReturnReason !== pr.returnReason && (
                      <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>
                        {pr.detailedReturnReason}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: "0.76rem", color: "#64748B" }}>
                      <span>Returned SKU: <strong style={{ color: "#7C3AED", background: "#F5F3FF", padding: "1px 6px", borderRadius: "4px", border: "1px solid #DDD6FE" }}>{pr.sku}</strong> (Qty: {pr.qty})</span>
                      <span>Courier: <strong style={{ color: "#0284C7" }}>{pr.courierPartner}</strong> ({pr.awbNumber})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  disabled={currentWarningIndex === 0}
                  onClick={() => setCurrentWarningIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    color: currentWarningIndex === 0 ? "#94A3B8" : "#334155",
                    opacity: currentWarningIndex === 0 ? 0.5 : 1,
                    cursor: currentWarningIndex === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  ← Previous Order
                </button>

                <button
                  type="button"
                  disabled={currentWarningIndex >= returnWarnings.length - 1}
                  onClick={() => setCurrentWarningIndex((prev) => Math.min(returnWarnings.length - 1, prev + 1))}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#DC2626",
                    opacity: currentWarningIndex >= returnWarnings.length - 1 ? 0.5 : 1,
                    cursor: currentWarningIndex >= returnWarnings.length - 1 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Next Order →
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                style={{
                  padding: "9px 24px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.28)",
                  transition: "all 0.15s ease",
                }}
              >
                Dismiss & Continue
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Mixed Marketplace Detected Modal Popup */}
      <Modal
        isOpen={showMixedMarketplaceModal && detectedMarketplaces.length > 1}
        onClose={() => setShowMixedMarketplaceModal(false)}
        maxWidth={580}
        style={{
          borderRadius: "20px",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.15)",
          border: "1px solid #FDE68A",
          background: "#FFFFFF",
          color: "#0F172A",
          padding: "26px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "#FEF3C7",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D97706",
                flexShrink: 0,
              }}
            >
              <AlertTriangleIcon size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>
                Multiple Marketplaces Detected
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
                Found labels from more than one platform in this upload
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMixedMarketplaceModal(false)}
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Platform Breakdown Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, margin: "18px 0" }}>
          {marketplaceCounts.meesho > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#FDF2F8", border: "1px solid #FBCFE8", textAlign: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#BE185D", textTransform: "uppercase" }}>Meesho</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#9D174D", marginTop: 2 }}>{marketplaceCounts.meesho} Pages</div>
            </div>
          )}
          {marketplaceCounts.flipkart > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", textAlign: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1D4ED8", textTransform: "uppercase" }}>Flipkart</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1E40AF", marginTop: 2 }}>{marketplaceCounts.flipkart} Pages</div>
            </div>
          )}
          {marketplaceCounts.amazon > 0 && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FDE68A", textAlign: "center" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#B45309", textTransform: "uppercase" }}>Amazon</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#92400E", marginTop: 2 }}>{marketplaceCounts.amazon} Pages</div>
            </div>
          )}
        </div>

        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5, margin: 0 }}>
            <strong>Recommendation:</strong> Different marketplaces (Meesho, Flipkart, Amazon) print different label dimensions and thermal invoice cuts. Mixing them in a single batch can cause print alignment issues. We strongly recommend processing labels from <strong>one marketplace at a time</strong>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => setShowMixedMarketplaceModal(false)}
            className="btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.86rem" }}
          >
            Understood, Continue
          </button>
        </div>
      </Modal>

      {/* LaterPro WhatsApp API Configuration & Onboarding Modal */}
      <Modal
        isOpen={showLaterProModal}
        onClose={() => setShowLaterProModal(false)}
        maxWidth={640}
        style={{
          borderRadius: "20px",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          background: "#FFFFFF",
          padding: "24px 28px",
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WhatsAppIcon size={24} color="#059669" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0F172A" }}>
                  Connect WhatsApp Auto-Dispatch via LaterPro
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#64748B" }}>
                  Send generated Stamped Label PDFs & Summary sheets directly to your WhatsApp
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLaterProModal(false)}
              style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {/* 3 Step Guide Cards matching User Request */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#065F46", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ background: "#059669", color: "#FFFFFF", padding: "2px 7px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>3 EASY STEPS</span>
              Follow these steps to connect your WhatsApp in 1 minute:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Step 1 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px 14px" }}>
                <span style={{ minWidth: 24, height: 24, borderRadius: "50%", background: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800 }}>1</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0F172A" }}>Go to laterpro.in & Log In</span>
                    <a
                      href="https://laterpro.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.76rem", fontWeight: 700, color: "#0284C7", textDecoration: "none", background: "#FFFFFF", border: "1px solid #BAE6FD", padding: "3px 10px", borderRadius: "6px" }}
                    >
                      Open laterpro.in <ExternalLinkIcon size={12} color="#0284C7" />
                    </a>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#64748B", lineHeight: 1.4 }}>
                    Visit <b>https://laterpro.in/</b> and sign in or create your free account using Google or Email.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px 14px" }}>
                <span style={{ minWidth: 24, height: 24, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800 }}>2</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0F172A" }}>Scan WhatsApp QR in "Session & QR"</span>
                  <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#64748B", lineHeight: 1.4 }}>
                    In the left sidebar, click <b>Session & QR</b>. Open WhatsApp on your phone &rarr; <b>Linked Devices &rarr; Link a Device</b>, and point camera at the QR code.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px 14px" }}>
                <span style={{ minWidth: 24, height: 24, borderRadius: "50%", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800 }}>3</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0F172A" }}>Copy Personal Secret Key from "API Key & Docs"</span>
                  <p style={{ margin: "4px 0 0", fontSize: "0.76rem", color: "#64748B", lineHeight: 1.4 }}>
                    In the left sidebar, click <b>API Key & Docs</b>. Under <i>Personal API Credentials</i>, click <b>Copy Key</b> (starts with <code style={{ background: "#F1F5F9", padding: "1px 4px", borderRadius: "3px" }}>wa_...</code>) and paste it below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={handleSaveLaterProCredentials} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Personal Secret API Key (x-api-key) <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="wa_c6854599bd4b7a54cad78edbdd6ace51"
                value={laterProApiKeyInput}
                onChange={(e) => setLaterProApiKeyInput(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 14px", fontSize: "0.86rem", borderRadius: "8px", border: "1px solid #CBD5E1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Receiver WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 919664720473"
                value={laterProReceiverInput}
                onChange={(e) => setLaterProReceiverInput(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", fontSize: "0.86rem", borderRadius: "8px", border: "1px solid #CBD5E1" }}
              />
              <span style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 4, display: "block" }}>
                Target phone number to receive your final Stamped Label PDFs & Summary report.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 14, borderTop: "1px solid #F1F5F9" }}>
              <Link
                href="/settings"
                onClick={() => setShowLaterProModal(false)}
                style={{ fontSize: "0.82rem", color: "#4F46E5", textDecoration: "none", fontWeight: 600 }}
              >
                Go to Full Settings &rarr;
              </Link>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowLaterProModal(false)}
                  style={{ padding: "8px 18px", fontSize: "0.84rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingLaterPro}
                  style={{ padding: "8px 24px", fontSize: "0.84rem", background: "#059669", borderColor: "#059669" }}
                >
                  {savingLaterPro ? "Connecting..." : "Save & Connect WhatsApp"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Duplicate Saved Order Warning Notice Modal Popup */}
      <Modal
        isOpen={showDuplicateModal && duplicateOrderWarnings.length > 0}
        onClose={() => setShowDuplicateModal(false)}
        maxWidth={740}
        style={{
          borderRadius: "20px",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.15)",
          border: "1px solid #FDE68A",
          background: "#FFFFFF",
          color: "#0F172A",
          padding: "24px 28px",
        }}
      >
        {showDuplicateModal && duplicateOrderWarnings.length > 0 && (
          <>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: "1px solid #F1F5F9", paddingBottom: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D97706",
                    flexShrink: 0,
                  }}
                >
                  <PackageIcon size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                      Already Inserted Order Notice
                    </h2>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "#FFFBEB",
                        color: "#B45309",
                        border: "1px solid #FDE68A",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                      }}
                    >
                      Order {currentDuplicateIndex + 1} of {duplicateOrderWarnings.length}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "4px 0 0 0" }}>
                    Sub Order ID on Label Page #{duplicateOrderWarnings[currentDuplicateIndex]?.page} was already saved in DB!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                title="Close Modal"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {/* Current Label Details Card */}
            <div style={{ background: "#FFFBEB", padding: "14px 16px", borderRadius: "14px", border: "1px solid #FDE68A", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#B45309", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", padding: "3px 8px", borderRadius: "6px", border: "1px solid #FCD34D" }}>
                  <TagIcon size={13} /> Current Uploaded Label (Page #{duplicateOrderWarnings[currentDuplicateIndex]?.page})
                </span>
                <span style={{ fontSize: "0.78rem", color: "#4F46E5", fontFamily: "var(--font-mono)", fontWeight: 700, background: "#EEF2FF", border: "1px solid #E0E7FF", padding: "3px 8px", borderRadius: "6px" }}>
                  Sub Order: {duplicateOrderWarnings[currentDuplicateIndex]?.subOrderNo}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: "0.9rem", color: "#0F172A", fontWeight: 700 }}>
                    Buyer: {duplicateOrderWarnings[currentDuplicateIndex]?.customerName}
                  </div>
                  {duplicateOrderWarnings[currentDuplicateIndex]?.customerMobile && duplicateOrderWarnings[currentDuplicateIndex]?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.78rem", color: "#4F46E5", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      Mobile: {duplicateOrderWarnings[currentDuplicateIndex]?.customerMobile}
                    </div>
                  )}
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <LocationIcon size={13} /> State: {duplicateOrderWarnings[currentDuplicateIndex]?.state || "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                    SKU: <strong style={{ color: "#0F172A", background: "#FFFFFF", padding: "2px 6px", borderRadius: "4px", border: "1px solid #E2E8F0" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.sku}</strong>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                    Qty: <strong style={{ color: "#0F172A" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.qty}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 4, lineHeight: 1.35, display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <StoreIcon size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {duplicateOrderWarnings[currentDuplicateIndex]?.customerAddress || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Previously Saved DB Order Record */}
            <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: "14px", border: "1px solid #CBD5E1", marginBottom: 18, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#047857", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6, background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "3px 8px", borderRadius: "6px" }}>
                  <CloudIcon size={13} /> Database Record (Already Inserted)
                </span>
                <span style={{ fontSize: "0.76rem", color: "#B45309", fontFamily: "var(--font-mono)", fontWeight: 700, background: "#FEF3C7", border: "1px solid #FDE68A", padding: "3px 8px", borderRadius: "6px" }}>
                  Saved On: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.savedAt || "Prior Batch"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: "0.84rem", color: "#475569" }}>
                    Saved Order No: <strong style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.orderNo}</strong>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>
                    Saved Buyer: <strong style={{ color: "#0F172A" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerName}</strong>
                  </div>
                  {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerMobile && duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerMobile !== "N/A" && (
                    <div style={{ fontSize: "0.76rem", color: "#4F46E5", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.customerMobile}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: "0.82rem", color: "#475569" }}>
                    Saved SKU: <strong style={{ color: "#7C3AED", background: "#F5F3FF", border: "1px solid #DDD6FE", padding: "1px 6px", borderRadius: "4px" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.sku}</strong> (Qty: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.qty})
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
                    Payment Type: <strong style={{ color: "#047857", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "1px 6px", borderRadius: "4px" }}>{duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.paymentType}</strong>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 4 }}>
                    Original Order Date: {duplicateOrderWarnings[currentDuplicateIndex]?.existingOrder?.orderDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  disabled={currentDuplicateIndex === 0}
                  onClick={() => setCurrentDuplicateIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    color: currentDuplicateIndex === 0 ? "#94A3B8" : "#334155",
                    opacity: currentDuplicateIndex === 0 ? 0.5 : 1,
                    cursor: currentDuplicateIndex === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  ← Previous Order
                </button>

                <button
                  type="button"
                  disabled={currentDuplicateIndex >= duplicateOrderWarnings.length - 1}
                  onClick={() => setCurrentDuplicateIndex((prev) => Math.min(duplicateOrderWarnings.length - 1, prev + 1))}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    borderRadius: "10px",
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    color: "#D97706",
                    opacity: currentDuplicateIndex >= duplicateOrderWarnings.length - 1 ? 0.5 : 1,
                    cursor: currentDuplicateIndex >= duplicateOrderWarnings.length - 1 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Next Order →
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                style={{
                  padding: "9px 24px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.28)",
                  transition: "all 0.15s ease",
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
                      Sold by: {displayStoreName} | Inv: INV-9876543<br />
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
                  aria-label="Top Crop Percentage"
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
                  aria-label="Bottom Crop Percentage"
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
                  aria-label="Left Crop Percentage"
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
                  aria-label="Right Crop Percentage"
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

      {/* Semantic SEO & Knowledge Hub Section for Search Engines & Marketplace Sellers */}
      <section
        style={{
          marginTop: 64,
          paddingTop: 48,
          borderTop: "1px solid #E2E8F0",
          color: "#334155",
        }}
        aria-label="E-Commerce Shipping Label Information & Guides"
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#4F46E5",
                background: "#EEF2FF",
                padding: "4px 12px",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Seller Workflow Automation
            </span>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#0F172A",
                marginTop: 12,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              India&apos;s #1 E-Commerce Shipping Label Studio & Duplicate Remover
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#64748B", maxWidth: 760, margin: "0 auto" }}>
              Automate 4x6 thermal label cropping for Meesho, Flipkart &amp; Amazon, eliminate costly double dispatches, and sort warehouse batches in 1-click with 100% in-browser privacy.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginTop: 0, marginBottom: 10 }}>
                Zero Double-Dispatches
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Cross-compare two PDF label batches or scan internal order repetitions. Eliminate duplicate orders before printing to save packaging material, courier penalty fees, and double delivery inventory losses.
              </p>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginTop: 0, marginBottom: 10 }}>
                4x6 Thermal Vector Cropping
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Crop full-page A4 marketplace PDFs into standardized 4x6 inch (101.6mm x 152.4mm) thermal rolls. Preserves vector sharpness so courier barcodes and tracking numbers scan flawlessly.
              </p>
            </div>

            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginTop: 0, marginBottom: 10 }}>
                Smart SKU &amp; Courier Sorting
              </h3>
              <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                Automatically group identical SKUs together in your PDF sequence. Pick items in bulk from warehouse shelves and pack identical orders continuously for 10x fulfillment velocity.
              </p>
            </div>
          </div>

          {/* Seller Frequently Asked Questions */}
          <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 32, border: "1px solid #E2E8F0" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0F172A", marginTop: 0, marginBottom: 20 }}>
              Frequently Asked Questions (FAQ)
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
                  How does LabelPro remove duplicate shipping labels?
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                  LabelPro reads the embedded text layer of your PDF shipping labels directly inside your browser. It extracts marketplace order identifiers (such as Meesho order numbers or Flipkart OD tracking IDs) and cross-references them against previous batches, stripping duplicate occurrences instantly.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
                  Is my customer address data safe and secure?
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                  Yes, 100%. All PDF processing, text extraction, cropping, and QR stamping take place locally inside your browser memory using WebAssembly and PDF-Lib. Your customer names, phone numbers, and delivery addresses never leave your computer or get uploaded to any external server.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
                  Which thermal barcode printers are supported?
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                  LabelPro standardizes output to standard 4x6 inch thermal format (203 DPI and 300 DPI). It is compatible with all leading thermal barcode printers including TVS (LP 46), Zebra (ZD220, ZD230), Xprinter (XP-420B), TSC (DA210, DA220), Everycom, Rollo, and HPRT.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>
                  Can I crop labels for multiple marketplaces in the same session?
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                  Yes. LabelPro includes intelligent marketplace detection that auto-recognizes Meesho, Flipkart (eKart, Instakart), and Amazon (ATS, Easy Ship) label formats and applies the exact crop boundaries required for each.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign In Required Modal (Centered Portal Dialog) */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        maxWidth={440}
        style={{
          borderRadius: "20px",
          padding: "26px 28px",
          background: "#FFFFFF",
          border: "1px solid #C7D2FE",
          boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.38)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowAuthModal(false)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748B",
            transition: "all 0.15s ease",
          }}
          aria-label="Close"
        >
          <CloseIcon size={14} />
        </button>

        {/* Header: Icon + Title inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, paddingRight: 24 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4F46E5 0%, #0284C7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.28)",
            }}
          >
            <SparklesIcon size={22} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.12rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>
              Sign In to LabelPro Studio
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
              Instant access to crop, sort &amp; stamp labels
            </span>
          </div>
        </div>

        {/* Quick Trust Badges in 1 Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "8px 12px",
            margin: "12px 0 16px",
            fontSize: "0.73rem",
            color: "#334155",
            fontWeight: 600,
          }}
        >
          <span>🔒 100% In-Browser</span>
          <span>⚡ 0ms Fast</span>
          <span>✨ Free Forever</span>
        </div>

        {/* Actions: 1-Click Google Sign In */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Primary 1-Click Google Sign In */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 16px",
              fontSize: "0.92rem",
              fontWeight: 600,
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1.5px solid #CBD5E1",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => setShowAuthModal(false)}
            style={{
              padding: "8px 12px",
              fontSize: "0.8rem",
              background: "transparent",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            Cancel &amp; Explore Studio First
          </button>
        </div>
      </Modal>
    </div>
  );
}
