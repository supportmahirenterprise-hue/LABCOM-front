import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const email = session.user.email;

    // Fetch all scans for this seller
    const scans = await db
      .collection("qr_scans")
      .find({ sellerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    // 1. Total Scans & Unique Orders
    const totalScans = scans.length;
    const uniqueOrders = new Set(scans.map((s) => s.orderNo).filter(Boolean)).size;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayScans = scans.filter((s) => s.date === todayStr).length;

    // 2. Daily Timeline (Last 7 Days)
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      dailyMap[key] = { date: key, label: dayName, count: 0 };
    }

    scans.forEach((s) => {
      if (dailyMap[s.date]) {
        dailyMap[s.date].count += 1;
      }
    });

    const dailyTimeline = Object.values(dailyMap);

    // 3. Top SKUs Breakdown
    const skuCountMap = {};
    scans.forEach((s) => {
      const sku = s.sku || "General / Unknown";
      skuCountMap[sku] = (skuCountMap[sku] || 0) + 1;
    });

    const topSkus = Object.entries(skuCountMap)
      .map(([sku, count]) => ({
        sku,
        count,
        percent: totalScans > 0 ? Math.round((count / totalScans) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Destination Breakdown (Meesho vs Instagram vs Custom)
    let meeshoCount = 0;
    let instagramCount = 0;
    let otherCount = 0;

    scans.forEach((s) => {
      const url = (s.targetUrl || "").toLowerCase();
      if (url.includes("meesho")) meeshoCount++;
      else if (url.includes("instagram")) instagramCount++;
      else otherCount++;
    });

    const destinations = [
      { name: "Meesho Store", count: meeshoCount, percent: totalScans > 0 ? Math.round((meeshoCount / totalScans) * 100) : 0 },
      { name: "Instagram Profile", count: instagramCount, percent: totalScans > 0 ? Math.round((instagramCount / totalScans) * 100) : 0 },
      { name: "Direct / Other Link", count: otherCount, percent: totalScans > 0 ? Math.round((otherCount / totalScans) * 100) : 0 },
    ];

    // 5. Recent Scans (Latest 20)
    const recentScans = scans.slice(0, 20).map((s) => ({
      id: s._id,
      orderNo: s.orderNo || "N/A",
      sku: s.sku || "General",
      targetUrl: s.targetUrl,
      isMobile: s.isMobile !== false,
      createdAt: s.createdAt,
      date: s.date,
    }));

    return NextResponse.json({
      totalScans,
      uniqueOrders,
      todayScans,
      dailyTimeline,
      topSkus,
      destinations,
      recentScans,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST endpoint to simulate/record a test scan
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderNo, sku, targetUrl } = body;

    const client = await clientPromise;
    const db = client.db();
    const now = new Date();

    await db.collection("qr_scans").insertOne({
      sellerEmail: session.user.email,
      orderNo: orderNo || "OD-398241029_1",
      sku: sku || "SAMPLE-SKU-COTTON-SHIRT",
      targetUrl: targetUrl || "https://www.meesho.com/themahirenterprise",
      isMobile: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      createdAt: now,
      date: now.toISOString().split("T")[0],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log scan:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
