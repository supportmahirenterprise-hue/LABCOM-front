import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../../lib/blockGuard";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
).replace(/\/+$/, "");

const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "veloura-labelpro-internal-secure-key-2026";

const EMPTY_INSIGHTS_FALLBACK = {
  totalOrders: 0,
  totalReturns: 0,
  totalCustomers: 0,
  totalScans: 0,
  summary: {
    totalSkusTracked: 0,
    totalPausedProducts: 0,
    totalWinnerProducts: 0,
    totalHighVolumeDistricts: 0,
    totalOrders: 0,
    totalReturns: 0,
    totalCustomers: 0,
    totalScans: 0,
  },
  actionCards: [],
  skuPerformanceMatrix: [],
  districtIntelligence: {
    highVolume: [],
    highGrowthPotential: [],
    highRiskRegions: [],
  },
};

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "seller@labelpro.in";

    if (session?.user?.email && isUserBlockedSync(session.user.email)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${BACKEND_URL}/api/insights/dashboard?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          "x-user-email": userEmail,
          "x-internal-secret": INTERNAL_API_SECRET,
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && !data.error) {
            return NextResponse.json(data, { status: 200 });
          }
        } catch {}
      }
    } catch (fetchErr) {
      console.warn("[InsightsDashboardAPI] Upstream fetch failed, serving resilient fallback:", fetchErr.message);
    }

    // Fail-safe fallback: return valid structure so UI never crashes or shows error toasts
    return NextResponse.json(EMPTY_INSIGHTS_FALLBACK, { status: 200 });
  } catch (error) {
    return NextResponse.json(EMPTY_INSIGHTS_FALLBACK, { status: 200 });
  }
}
