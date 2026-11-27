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

// Fallback direct DB calculation if backend service is unreachable
async function calculateFromDb(userEmail, searchParams) {
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const repeatOnly = searchParams.get("repeatOnly") === "true";
  const selectedState = (searchParams.get("state") || "ALL").trim();
  const selectedDistrict = (searchParams.get("district") || "ALL").trim();
  const selectedPlatform = (searchParams.get("platform") || "ALL").trim().toLowerCase();

  const db = await getDb();
  const customersCol = db.collection("customers");
  const returnsCol1 = db.collection("return_entries");
  const returnsCol2 = db.collection("returns");

  const userFilter = { userEmail };
  const [allCustomers, returnEntries1, returnEntries2] = await Promise.all([
    customersCol.find(userFilter).sort({ orderCount: -1, updatedAt: -1 }).toArray(),
    returnsCol1.find(userFilter).toArray(),
    returnsCol2.find(userFilter).toArray(),
  ]);

  const returnLookup = {};
  [...returnEntries1, ...returnEntries2].forEach((r) => {
    const keys = [
      r.subOrderNo,
      r.orderNo,
      r.awbNumber,
      r.courierAwb,
      r.subOrderId,
      r.trackingNo,
    ].filter(Boolean);
    keys.forEach((k) => {
      const norm = String(k).trim().toLowerCase();
      if (norm) returnLookup[norm] = r;
    });
  });

  let meeshoCount = 0;
  let flipkartCount = 0;
  let amazonCount = 0;

  allCustomers.forEach((c) => {
    const p = (c.platform || "").toLowerCase();
    const plist = (c.platforms || (p ? [p] : [])).map((x) => x.toLowerCase());
    const hasOrderPlatform = (plat) =>
      (c.orders || []).some((o) => (o.platform || "").toLowerCase() === plat);

    if (plist.includes("meesho") || p === "meesho" || (!p && plist.length === 0) || hasOrderPlatform("meesho")) {
      meeshoCount++;
    }
    if (plist.includes("flipkart") || p === "flipkart" || hasOrderPlatform("flipkart")) {
      flipkartCount++;
    }
    if (plist.includes("amazon") || p === "amazon" || hasOrderPlatform("amazon")) {
      amazonCount++;
    }
  });

  const stateCountsMap = {};
  allCustomers.forEach((c) => {
    const st = (c.state || "India").trim();
    const cnt = c.orderCount || c.orders?.length || 1;
    stateCountsMap[st] = (stateCountsMap[st] || 0) + cnt;
  });

  const allStatesWithCounts = Object.keys(stateCountsMap)
    .map((st) => ({
      name: st,
      count: stateCountsMap[st],
      label: `${st} (${stateCountsMap[st]})`,
    }))
    .sort((a, b) => b.count - a.count);

  const totalOrdersAll = Object.values(stateCountsMap).reduce((a, b) => a + b, 0);

  let platformFiltered = [...allCustomers];
  if (selectedPlatform && selectedPlatform !== "all") {
    platformFiltered = platformFiltered.filter((c) => {
      const p = (c.platform || "meesho").toLowerCase();
      const plist = (c.platforms || [p]).map((x) => x.toLowerCase());
      const hasOrder = (c.orders || []).some(
        (o) => (o.platform || "meesho").toLowerCase() === selectedPlatform
      );
      return p === selectedPlatform || plist.includes(selectedPlatform) || hasOrder;
    });
  }

  let stateFiltered = [...platformFiltered];
  if (selectedState && selectedState.toUpperCase() !== "ALL") {
    stateFiltered = stateFiltered.filter(
      (c) => (c.state || "").toLowerCase() === selectedState.toLowerCase()
    );
  }

  const districtCountsMap = {};
  stateFiltered.forEach((c) => {
    const dist = (c.district || "Central").trim();
    const cnt = c.orderCount || c.orders?.length || 1;
    districtCountsMap[dist] = (districtCountsMap[dist] || 0) + cnt;
  });

  const allDistrictsWithCounts = Object.keys(districtCountsMap)
    .map((dist) => ({
      name: dist,
      count: districtCountsMap[dist],
      label: `${dist} (${districtCountsMap[dist]})`,
    }))
    .sort((a, b) => b.count - a.count);

  const totalOrdersForSelectedState = Object.values(districtCountsMap).reduce((a, b) => a + b, 0);

  let customers = [...stateFiltered];
  if (selectedDistrict && selectedDistrict.toUpperCase() !== "ALL") {
    customers = customers.filter(
      (c) => (c.district || "").toLowerCase() === selectedDistrict.toLowerCase()
    );
  }

  const totalCustomers = customers.length;
  const repeatCustomersCount = customers.filter((c) => (c.orderCount || 1) > 1).length;
  const repeatRate = totalCustomers > 0 ? ((repeatCustomersCount / totalCustomers) * 100).toFixed(1) : "0.0";
  const totalOrdersProcessed = customers.reduce((sum, c) => sum + (c.orderCount || 1), 0);

  if (search) {
    customers = customers.filter((c) => {
      const nameMatch = (c.name || "").toLowerCase().includes(search);
      const mobMatch = (c.mobileNumber || "").toLowerCase().includes(search);
      const addrMatch = (c.address || "").toLowerCase().includes(search);
      const stateMatch = (c.state || "").toLowerCase().includes(search);
      const distMatch = (c.district || "").toLowerCase().includes(search);
      const cleanSearch = search.replace(/_\d+$/, "");

      const orderMatch = (c.orders || []).some((o) => {
        const oNo = (o.orderNo || "").toLowerCase();
        const subId = (o.subOrderId || o.subOrderNo || "").toLowerCase();
        const skuStr = (o.sku || "").toLowerCase();
        const invStr = (o.invoiceNo || "").toLowerCase();
        const awbStr = (o.awbNumber || o.courierAwb || "").toLowerCase();
        return (
          oNo.includes(search) ||
          oNo.includes(cleanSearch) ||
          subId.includes(search) ||
          subId.includes(cleanSearch) ||
          skuStr.includes(search) ||
          invStr.includes(search) ||
          awbStr.includes(search)
        );
      });
      return nameMatch || mobMatch || addrMatch || stateMatch || distMatch || orderMatch;
    });
  }

  if (repeatOnly) {
    customers = customers.filter((c) => (c.orderCount || 1) > 1);
  }

  const formattedList = customers
    .map((c) => {
      const cnt = c.orderCount || c.orders?.length || 1;
      const custPlat = c.platform || c.orders?.[0]?.platform || "meesho";
      const custPlatforms = c.platforms || [custPlat];

      const enrichedOrders = (c.orders || []).map((o) => {
        const oNo = String(o.orderNo || "").trim().toLowerCase();
        const subId = String(o.subOrderId || o.subOrderNo || "").trim().toLowerCase();
        const awb = String(o.awbNumber || o.courierAwb || "").trim().toLowerCase();
        const retRecord = returnLookup[subId] || returnLookup[oNo] || (awb ? returnLookup[awb] : null);
        const hasReturn = Boolean(retRecord || o.hasReturn || o.returnStatus || o.returnType);
        const rawType = retRecord?.returnType || retRecord?.subType || o.returnType || "";
        const isRto = /rto|courier/i.test(rawType);
        const isPostDeliveryReturn = hasReturn && !isRto;

        return {
          ...o,
          platform: o.platform || custPlat,
          hasReturn,
          isPostDeliveryReturn,
          returnType: isPostDeliveryReturn
            ? "Customer Return (Post-Delivery)"
            : hasReturn
            ? "Courier RTO"
            : null,
          returnReason: retRecord?.returnReason || retRecord?.detailedReturnReason || o.returnReason || "N/A",
          returnDate: retRecord?.returnCreatedDate || retRecord?.deliveredDate || retRecord?.createdAt || o.returnDate || "",
        };
      });

      const postDeliveryReturnCount = enrichedOrders.filter((o) => o.isPostDeliveryReturn).length;
      const rtoCount = enrichedOrders.filter((o) => o.hasReturn && !o.isPostDeliveryReturn).length;

      return {
        id: c._id?.toString() || Math.random().toString(),
        name: c.name || "Customer",
        mobileNumber: c.mobileNumber || "N/A",
        address: c.address || "N/A",
        state: c.state || "India",
        district: c.district || "Central",
        platform: custPlat,
        platforms: custPlatforms,
        orderCount: cnt,
        isRepeat: cnt > 1,
        firstOrderDate: c.firstOrderDate || "",
        lastOrderDate: c.lastOrderDate || "",
        ordersCountText: cnt > 1 ? `${cnt} Orders` : "1 Order",
        postDeliveryReturnCount,
        rtoCount,
        orders: enrichedOrders,
      };
    })
    .sort((a, b) => b.orderCount - a.orderCount);

  return {
    summary: {
      totalCustomers,
      totalUniqueBuyers: totalCustomers,
      repeatBuyersCount: repeatCustomersCount,
      repeatCustomersCount,
      repeatRate,
      repeatRetentionRate: `${repeatRate}%`,
      totalOrdersProcessed,
      totalOrdersCount: totalOrdersProcessed,
      totalOrdersAll,
      totalOrdersForSelectedState,
      meeshoCustomersCount: meeshoCount,
      flipkartCustomersCount: flipkartCount,
      amazonCustomersCount: amazonCount,
      selectedPlatform: searchParams.get("platform") || "ALL",
      allStatesWithCounts: allStatesWithCounts || [],
      allDistrictsWithCounts: allDistrictsWithCounts || [],
    },
    customers: formattedList,
  };
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
      const backendUrl = new URL(`${BACKEND_URL}/api/customer-analysis`);
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
        if (data && !data.error && data.summary) {
          return NextResponse.json(data, { status: 200 });
        }
      }
    } catch (fetchErr) {
      console.warn("[CustomerAnalysisAPI] Backend fetch failed or timed out, executing direct DB fallback:", fetchErr.message);
    }

    // 2. Resilient Database Fallback: Query MongoDB directly so user never encounters an error
    try {
      const dbData = await calculateFromDb(userEmail, searchParams);
      return NextResponse.json(dbData, { status: 200 });
    } catch (dbErr) {
      console.error("[CustomerAnalysisAPI] Direct DB calculation error:", dbErr);
      return NextResponse.json({
        summary: {
          totalCustomers: 0,
          totalUniqueBuyers: 0,
          repeatBuyersCount: 0,
          repeatCustomersCount: 0,
          repeatRate: "0.0",
          repeatRetentionRate: "0.0%",
          totalOrdersProcessed: 0,
          totalOrdersCount: 0,
          totalOrdersAll: 0,
          totalOrdersForSelectedState: 0,
          meeshoCustomersCount: 0,
          flipkartCustomersCount: 0,
          amazonCustomersCount: 0,
          selectedPlatform: searchParams.get("platform") || "ALL",
          allStatesWithCounts: [],
          allDistrictsWithCounts: [],
        },
        customers: [],
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
