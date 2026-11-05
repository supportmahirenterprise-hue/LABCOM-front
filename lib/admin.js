export const SUPERADMIN_EMAILS = [
  "vishal.nexios@gmail.com",
];

export const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "veloura-labelpro-internal-secure-key-2026";

export function isSuperAdmin(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.toLowerCase().trim();
  return SUPERADMIN_EMAILS.includes(clean);
}

export async function getVerifiedSuperAdmin(session, req) {
  // 1. Verified NextAuth session token check (Mandatory for production)
  const sessionEmail = session?.user?.email?.toLowerCase().trim();
  if (sessionEmail && isSuperAdmin(sessionEmail)) {
    return sessionEmail;
  }

  // 2. Allow development overrides strictly on localhost for local manual testing
  if (process.env.NODE_ENV !== "production" && req) {
    try {
      const host = req.headers?.get ? req.headers.get("host") || "" : "";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      if (isLocalhost) {
        let queryEmail = "";
        try {
          const url = new URL(req.url);
          queryEmail = url.searchParams.get("email") || "";
        } catch (e) {}
        const headerEmail = req.headers?.get ? req.headers.get("x-user-email") || "" : "";
        const devEmail = (queryEmail || headerEmail || "").toLowerCase().trim();
        if (devEmail && isSuperAdmin(devEmail)) {
          return devEmail;
        }
      }
    } catch (e) {}
  }

  return null;
}
