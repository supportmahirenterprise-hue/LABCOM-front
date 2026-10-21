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

    const email = (session?.user?.email || headerEmail || queryEmail || "").toLowerCase().trim();

    if (!isSuperAdmin(email)) {
      return NextResponse.json(
        { error: "Access Denied: SuperAdmin privileges required." },
        { status: 403 }
      );
    }

    const BACKEND_URL = (
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
    ).replace(/\/+$/, "");

    // 1. Try fetching from core backend engine first for instant response
    try {
      const backendRes = await fetch(
        `${BACKEND_URL}/api/admin/stats?email=${encodeURIComponent(email)}`,
        {
          headers: { "x-user-email": email },
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
      // Fallback to direct database query below
    }

    const db = await getDb();

    // Query collections in parallel for maximum speed
    const [
      usersList,
      userSettingsList,
      totalCustomers,
      totalReturns1,
      totalReturns2,
      totalOrders,
      totalScans,
      totalTemplates,
    ] = await Promise.all([
      db.collection("users").find({}).toArray(),
      db.collection("user_settings").find({}).toArray(),
      db.collection("customers").countDocuments(),
      db.collection("returns").countDocuments(),
      db.collection("return_entries").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("qr_scans").countDocuments(),
      db.collection("templates").countDocuments(),
    ]);

    // Unique emails set across users and user_settings
    const userEmails = new Set();
    usersList.forEach((u) => {
      if (u.email) userEmails.add(u.email.toLowerCase().trim());
    });
    userSettingsList.forEach((s) => {
      if (s.email) userEmails.add(s.email.toLowerCase().trim());
    });

    const blockedMap = new Map();
    usersList.forEach((u) => {
      if (u.email) blockedMap.set(u.email.toLowerCase().trim(), Boolean(u.isBlocked));
    });
    userSettingsList.forEach((s) => {
      if (s.email && s.isBlocked) {
        blockedMap.set(s.email.toLowerCase().trim(), true);
      }
    });

    let activeUsers = 0;
    let blockedUsers = 0;
    userEmails.forEach((em) => {
      if (blockedMap.get(em) === true) {
        blockedUsers++;
      } else {
        activeUsers++;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userEmails.size,
        activeUsers,
        blockedUsers,
        totalCustomers,
        totalReturns: totalReturns1 + totalReturns2,
        totalOrders,
        totalScans,
        totalTemplates,
      },
    });
  } catch (error) {
    console.error("SuperAdmin stats API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
