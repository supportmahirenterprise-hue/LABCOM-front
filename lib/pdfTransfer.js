// frontend/lib/pdfTransfer.js
// High-performance IndexedDB store to transfer large multi-page PDFs across pages

const DB_NAME = "labelpro_transfer_db";
const STORE_NAME = "pending_pdfs";
const KEY = "studio_pending_pdf";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setPendingStudioPdf(fileOrBlob, filename = "unique_labels_cleaned.pdf") {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const data = {
        blob: fileOrBlob,
        name: filename,
        timestamp: Date.now(),
      };
      const req = store.put(data, KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to store pending PDF in IndexedDB:", err);
    return false;
  }
}

export async function getPendingStudioPdf() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onsuccess = () => {
        const res = req.result;
        if (!res) return resolve(null);
        // Only valid within 1 hour
        if (Date.now() - res.timestamp > 3600000) {
          clearPendingStudioPdf();
          return resolve(null);
        }
        resolve(res);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to get pending PDF from IndexedDB:", err);
    return null;
  }
}

export async function clearPendingStudioPdf() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to clear pending PDF from IndexedDB:", err);
    return false;
  }
}
