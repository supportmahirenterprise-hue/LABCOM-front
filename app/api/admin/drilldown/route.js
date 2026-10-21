import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { isSuperAdmin } from "../../../../lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email");
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const callerEmail = (session?.user?.email || headerEmail || queryEmail || "").toLowerCase().trim();

    if (!isSuperAdmin(callerEmail)) {
      return NextResponse.json(
        { error: "Access Denied: SuperAdmin privileges required." },
        { status: 403 }
      );
    }

    const targetEmail = (searchParams.get("targetEmail") || "").toLowerCase().trim();
    const type = (searchParams.get("type") || "customers").toLowerCase().trim();
    const isUnassigned =
      targetEmail === "unassigned@system" ||
      targetEmail === "unassigned" ||
      targetEmail === "guest" ||
      targetEmail === "legacy.imports";

    const BACKEND_URL = (
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
    ).replace(/\/+$/, "");

    try {
      const backendRes = await fetch(
        `${BACKEND_URL}/api/admin/drilldown?targetEmail=${encodeURIComponent(targetEmail)}&type=${encodeURIComponent(type)}&email=${encodeURIComponent(callerEmail)}`,
        {
          headers: { "x-user-email": callerEmail },
          cache: "no-store",
        }
      );
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData && backendData.success) {
          return NextResponse.json(backendData);
        }
      }
    } catch (e) {
      // Fallback to local DB
    }

    const db = await getDb();
    let records = [];

    if (type === "customers") {
      let filter = {};
      if (isUnassigned) {
        filter = {
          $or: [
            { userEmail: "guest" },
            { userEmail: "resilience_auditor@labelpro.in" },
            { userEmail: { $exists: false } },
            { userEmail: null },
            { userEmail: "" },
          ],
        };
      } else {
        filter = { userEmail: targetEmail };
      }
      records = await db
        .collection("customers")
        .find(filter)
        .sort({ orderCount: -1, updatedAt: -1, createdAt: -1 })
        .limit(1000)
        .toArray();
    } else if (type === "orders") {
      let filter = {};
      if (isUnassigned) {
        filter = {
          $or: [
            { userEmail: "guest" },
            { userEmail: "csv_import" },
            { userEmail: "resilience_auditor@labelpro.in" },
            { userEmail: { $exists: false } },
            { userEmail: null },
            { userEmail: "" },
          ],
        };
      } else {
        filter = { userEmail: targetEmail };
      }
      records = await db
        .collection("orders")
        .find(filter)
        .sort({ createdAt: -1, orderDate: -1 })
        .limit(2000)
        .toArray();
    } else if (type === "returns") {
      let filter = {};
      if (isUnassigned) {
        filter = {
          $or: [
            { userEmail: "test@labelpro.in" },
            { userEmail: "csv_import" },
            { userEmail: { $exists: false } },
            { userEmail: null },
            { userEmail: "" },
          ],
        };
      } else {
        filter = { userEmail: targetEmail };
      }
      const [r1, r2] = await Promise.all([
        db.collection("returns").find(filter).sort({ createdAt: -1 }).limit(1000).toArray(),
        db.collection("return_entries").find(filter).sort({ createdAt: -1 }).limit(1000).toArray(),
      ]);
      records = [...r1, ...r2];
    } else if (type === "scans") {
      let filter = {};
      if (isUnassigned) {
        filter = {
          $or: [
            { sellerEmail: "guest" },
            { sellerEmail: { $exists: false } },
            { sellerEmail: null },
            { sellerEmail: "" },
          ],
        };
      } else {
        filter = { $or: [{ sellerEmail: targetEmail }, { userEmail: targetEmail }] };
      }
      records = await db
        .collection("qr_scans")
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray();
    }

    return NextResponse.json({
      success: true,
      targetEmail,
      type,
      total: records.length,
      records,
    });
  } catch (error) {
    console.error("SuperAdmin drilldown API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
