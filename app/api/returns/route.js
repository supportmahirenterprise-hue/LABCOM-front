import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../lib/blockGuard";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
).replace(/\/+$/, "");

const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "veloura-labelpro-internal-secure-key-2026";

async function safeParseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || res.statusText || "Invalid backend response" };
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized / Missing user email" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    // 1. Try fetching from core backend engine first
    try {
      const backendUrl = new URL(`${BACKEND_URL}/api/returns`);
      searchParams.forEach((val, key) => {
        backendUrl.searchParams.set(key, val);
      });
      backendUrl.searchParams.set("email", userEmail);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(backendUrl.toString(), {
        headers: {
          "x-user-email": userEmail,
          "x-internal-secret": INTERNAL_API_SECRET,
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await safeParseJson(res);
        if (data && !data.error && data.returns) {
          return NextResponse.json(data, { status: 200 });
        }
      }
    } catch (fetchErr) {
      console.warn("[ReturnsAPI] Backend fetch failed or timed out, executing direct DB fallback:", fetchErr.message);
    }

    // 2. Resilient Database Fallback
    try {
      const db = await getDb();
      const returnsCol = db.collection("returns");
      const list = await returnsCol.find({ userEmail }).sort({ createdAt: -1 }).limit(100).toArray();

      const total = list.length;
      const customerReturns = list.filter((r) => r.returnType === "Customer Return").length;
      const rtos = list.filter((r) => r.returnType === "Courier RTO").length;

      return NextResponse.json({
        returns: list.map((r) => ({ ...r, id: r._id.toString() })),
        pagination: { total, page: 1, limit: 100, totalPages: 1 },
        summary: {
          total,
          totalReturns: total,
          customerReturns,
          customerReturnsCount: customerReturns,
          rtos,
          rtoCount: rtos,
          topSku: null,
          topReturnedSku: null,
          topReason: null,
          topReturnReason: null,
          topState: null,
          topReturnState: null,
          allSkus: [],
          allSkusWithCounts: [],
        },
      }, { status: 200 });
    } catch (dbErr) {
      return NextResponse.json({
        returns: [],
        pagination: { total: 0, page: 1, limit: 25, totalPages: 0 },
        summary: {
          total: 0,
          totalReturns: 0,
          customerReturns: 0,
          customerReturnsCount: 0,
          rtos: 0,
          rtoCount: 0,
        },
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const id = searchParams.get("id");
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/returns?id=${encodeURIComponent(id || "")}&email=${encodeURIComponent(userEmail)}`,
        {
          method: "DELETE",
          headers: {
            "x-user-email": userEmail,
            "x-internal-secret": INTERNAL_API_SECRET,
          },
        }
      );
      if (res.ok) {
        const data = await safeParseJson(res);
        return NextResponse.json(data, { status: res.status });
      }
    } catch {}

    // Direct DB delete fallback
    if (id && ObjectId.isValid(id)) {
      const db = await getDb();
      await db.collection("returns").deleteOne({ _id: new ObjectId(id), userEmail });
      return NextResponse.json({ success: true, message: "Deleted successfully" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
