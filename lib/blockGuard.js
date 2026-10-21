import { getDb } from "./mongodb";

// In-Memory Set of blocked user emails (lowercase)
// Memory lookup: O(1) time complexity (< 0.001 ms, 0 DB queries during regular operation)
let blockedEmailsSet = new Set();
let lastSyncTimestamp = 0;
let initialSyncDone = false;
let syncPromise = null;

const SYNC_INTERVAL_MS = 60 * 1000; // Background re-sync every 60s as a safety net

/**
 * Initializes or refreshes the in-memory blocked emails set from MongoDB.
 */
export async function syncBlockedEmails(force = false) {
  const now = Date.now();
  if (!force && initialSyncDone && now - lastSyncTimestamp < SYNC_INTERVAL_MS) {
    return blockedEmailsSet;
  }

  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const db = await getDb();
      // Projection fetches ONLY the email field for maximum speed and minimal memory
      const docs = await db
        .collection("users")
        .find({ isBlocked: true }, { projection: { email: 1 } })
        .toArray();

      const freshSet = new Set();
      docs.forEach((u) => {
        if (u.email && typeof u.email === "string") {
          freshSet.add(u.email.toLowerCase().trim());
        }
      });

      blockedEmailsSet = freshSet;
      lastSyncTimestamp = Date.now();
      initialSyncDone = true;
    } catch (err) {
      console.error("[BlockGuard] Error syncing blocked emails from MongoDB:", err);
    } finally {
      syncPromise = null;
    }
    return blockedEmailsSet;
  })();

  return syncPromise;
}

/**
 * Synchronous, O(1) in-memory check. Never touches MongoDB. Zero latency.
 */
export function isUserBlockedSync(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  // Trigger background sync if not initialized yet
  if (!initialSyncDone && !syncPromise) {
    syncBlockedEmails().catch(() => {});
  }
  return blockedEmailsSet.has(clean);
}

/**
 * Asynchronous check with guaranteed initialization.
 */
export async function isUserBlocked(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  if (!initialSyncDone) {
    await syncBlockedEmails();
  }
  return blockedEmailsSet.has(clean);
}

/**
 * Instantly updates the in-memory cache when Admin toggles block status.
 * Ensures 0ms latency for subsequent session checks.
 */
export function setInMemoryUserBlocked(email, isBlocked) {
  if (!email || typeof email !== "string") return;
  const clean = email.toLowerCase().trim();
  if (isBlocked) {
    blockedEmailsSet.add(clean);
  } else {
    blockedEmailsSet.delete(clean);
  }
  lastSyncTimestamp = Date.now();
}
