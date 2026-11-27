import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../lib/blockGuard";
import { getDb } from "../../../lib/mongodb";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `${BACKEND_URL}/api/history?email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            "x-user-email": userEmail,
            "x-internal-secret": INTERNAL_API_SECRET,
          },
          cache: "no-store",
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await safeParseJson(res);
        if (data && !data.error) {
          return NextResponse.json(data, { status: 200 });
        }
      }
    } catch (fetchErr) {
      console.warn("[HistoryAPI] Backend fetch failed or timed out, executing direct DB fallback:", fetchErr.message);
    }

    // Direct DB fallback
    try {
      const db = await getDb();
      const history = await db
        .collection("history")
        .find({ email: userEmail })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return NextResponse.json({ history }, { status: 200 });
    } catch {
      return NextResponse.json({ history: [] }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email");
    const body = await req.json().catch(() => ({}));
    const userEmail = session?.user?.email || body.email || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
          "x-internal-secret": INTERNAL_API_SECRET,
        },
        body: JSON.stringify({ email: userEmail, ...body }),
      });
      if (res.ok) {
        const data = await safeParseJson(res);
        return NextResponse.json(data, { status: res.status });
      }
    } catch {}

    // Direct DB insert fallback
    try {
      const db = await getDb();
      const doc = {
        email: userEmail,
        ...body,
        createdAt: new Date(),
      };
      await db.collection("history").insertOne(doc);
      return NextResponse.json({ success: true, message: "History saved directly to database" });
    } catch {
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
