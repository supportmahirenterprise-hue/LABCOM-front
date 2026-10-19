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

    const db = await getDb();

    // Fetch collections
    const [rawUsers, rawSettings, customerAgg, returnsAgg, returnEntriesAgg, ordersAgg, scansAgg] =
      await Promise.all([
        db.collection("users").find({}).toArray(),
        db.collection("user_settings").find({}).toArray(),
        db
          .collection("customers")
          .aggregate([{ $group: { _id: "$userEmail", count: { $sum: 1 } } }])
          .toArray()
          .catch(() => []),
        db
          .collection("returns")
          .aggregate([{ $group: { _id: "$userEmail", count: { $sum: 1 } } }])
          .toArray()
          .catch(() => []),
        db
          .collection("return_entries")
          .aggregate([{ $group: { _id: "$userEmail", count: { $sum: 1 } } }])
          .toArray()
          .catch(() => []),
        db
          .collection("orders")
          .aggregate([{ $group: { _id: "$userEmail", count: { $sum: 1 } } }])
          .toArray()
          .catch(() => []),
        db
          .collection("qr_scans")
          .aggregate([{ $group: { _id: "$sellerEmail", count: { $sum: 1 } } }])
          .toArray()
          .catch(() => []),
      ]);

    const customerCountMap = new Map();
    customerAgg.forEach((c) => {
      if (c._id) customerCountMap.set(c._id.toLowerCase().trim(), c.count);
    });

    const returnCountMap = new Map();
    returnsAgg.forEach((r) => {
      if (r._id) {
        const k = r._id.toLowerCase().trim();
        returnCountMap.set(k, (returnCountMap.get(k) || 0) + r.count);
      }
    });
    returnEntriesAgg.forEach((r) => {
      if (r._id) {
        const k = r._id.toLowerCase().trim();
        returnCountMap.set(k, (returnCountMap.get(k) || 0) + r.count);
      }
    });

    const orderCountMap = new Map();
    ordersAgg.forEach((o) => {
      if (o._id) orderCountMap.set(o._id.toLowerCase().trim(), o.count);
    });

    const scanCountMap = new Map();
    scansAgg.forEach((s) => {
      if (s._id) scanCountMap.set(s._id.toLowerCase().trim(), s.count);
    });

    const settingsMap = new Map();
    rawSettings.forEach((s) => {
      if (s.email) {
        settingsMap.set(s.email.toLowerCase().trim(), s);
      }
    });

    const usersMap = new Map();
    rawUsers.forEach((u) => {
      if (u.email) {
        usersMap.set(u.email.toLowerCase().trim(), u);
      }
    });

    // Make sure every email present in settings is registered in usersMap
    rawSettings.forEach((s) => {
      if (s.email) {
        const clean = s.email.toLowerCase().trim();
        if (!usersMap.has(clean)) {
          usersMap.set(clean, {
            email: clean,
            name: s.storeName || clean.split("@")[0],
            isBlocked: Boolean(s.isBlocked),
            role: isSuperAdmin(clean) ? "superadmin" : "user",
            createdAt: s.updatedAt || new Date(),
          });
        }
      }
    });

    // Ensure any user email that has data in collections is recognized as a user
    const allAggs = [...customerAgg, ...returnsAgg, ...returnEntriesAgg, ...ordersAgg, ...scansAgg];
    allAggs.forEach((agg) => {
      if (agg._id && typeof agg._id === "string") {
        const clean = agg._id.toLowerCase().trim();
        if (clean && clean.includes("@") && !usersMap.has(clean)) {
          usersMap.set(clean, {
            email: clean,
            name: clean.split("@")[0],
            isBlocked: false,
            role: isSuperAdmin(clean) ? "superadmin" : "user",
            createdAt: null,
          });
        }
      }
    });

    const enrichedUsers = Array.from(usersMap.values()).map((user) => {
      const cleanEmail = (user.email || "").toLowerCase().trim();
      const settings = settingsMap.get(cleanEmail) || {};
      const isSuper = isSuperAdmin(cleanEmail);
      const isBlocked = Boolean(user.isBlocked || settings.isBlocked);

      return {
        id: user._id ? user._id.toString() : cleanEmail,
        email: cleanEmail,
        name: user.name || settings.storeName || cleanEmail.split("@")[0],
        image: user.image || "",
        role: isSuper ? "superadmin" : (user.role || "user"),
        isSuperAdmin: isSuper,
        isBlocked: isBlocked,
        createdAt: user.createdAt || settings.updatedAt || null,
        lastLoginAt: user.lastLoginAt || null,
        storeName: settings.storeName || "Not set",
        stats: {
          customersCount: customerCountMap.get(cleanEmail) || 0,
          returnsCount: returnCountMap.get(cleanEmail) || 0,
          ordersCount: orderCountMap.get(cleanEmail) || 0,
          scansCount: scanCountMap.get(cleanEmail) || 0,
        },
        settings: {
          storeName: settings.storeName || "",
          phone: settings.phone || "",
          supportEmail: settings.supportEmail || "",
          storeUrl: settings.storeUrl || "",
          instagramHandle: settings.instagramHandle || "",
          customNote: settings.customNote || "",
          enableQr: settings.enableQr !== undefined ? Boolean(settings.enableQr) : true,
          useNativeScript: Boolean(settings.useNativeScript),
          stampStyle: settings.stampStyle || "badge",
          qrText: settings.qrText || "",
          detailText: settings.detailText || "",
          qrX: settings.qrX !== undefined ? settings.qrX : 14,
          qrY: settings.qrY !== undefined ? settings.qrY : 14,
          qrSize: settings.qrSize !== undefined ? settings.qrSize : 70,
          fontSize: settings.fontSize !== undefined ? settings.fontSize : 8,
          sortBy: settings.sortBy || "sku",
          sortOrder: settings.sortOrder || "asc",
          downloadSummary: Boolean(settings.downloadSummary),
          enableWhatsApp: Boolean(settings.enableWhatsApp || settings.sendWhatsApp),
          sendWhatsApp: Boolean(settings.enableWhatsApp || settings.sendWhatsApp),
          waApiKey: settings.waApiKey || "",
          waReceiverNumber: settings.waReceiverNumber || "",
          pdfReceiverNumber: settings.pdfReceiverNumber || "",
          imageReceiverNumber: settings.imageReceiverNumber || "",
          cropEnabled: Boolean(settings.cropEnabled),
          cropPreset: settings.cropPreset || "label_only",
          cropMode: settings.cropMode || "custom",
          cropTop: settings.cropTop !== undefined ? settings.cropTop : 0,
          cropBottom: settings.cropBottom !== undefined ? settings.cropBottom : 58,
          cropLeft: settings.cropLeft !== undefined ? settings.cropLeft : 0,
          cropRight: settings.cropRight !== undefined ? settings.cropRight : 0,
          updatedAt: settings.updatedAt || null,
        },
      };
    });

    // Sort: SuperAdmin first, then real users by date
    enrichedUsers.sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
      if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
      const dateA = new Date(a.lastLoginAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.lastLoginAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    console.error("SuperAdmin users API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
