import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { isSuperAdmin } from "../../../../lib/admin";
import { DEFAULT_ADS_CONFIG } from "../../../../lib/adsConfig";

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
    const doc = await db.collection("system_settings").findOne({ key: "ads_config" });

    const merged = {
      ...DEFAULT_ADS_CONFIG,
      ...(doc || {}),
      slots: {
        ...DEFAULT_ADS_CONFIG.slots,
        ...(doc?.slots || {}),
        rightSkyscraper: {
          ...DEFAULT_ADS_CONFIG.slots.rightSkyscraper,
          ...(doc?.slots?.rightSkyscraper || {}),
        },
        bottomBanner: {
          ...DEFAULT_ADS_CONFIG.slots.bottomBanner,
          ...(doc?.slots?.bottomBanner || {}),
        },
      },
    };

    return NextResponse.json({
      success: true,
      adsConfig: merged,
    });
  } catch (err) {
    console.error("SuperAdmin GET ads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load ads configuration." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const body = await req.json().catch(() => ({}));
    const incoming = body.adsConfig || body;

    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json(
        { error: "Invalid payload: adsConfig object required." },
        { status: 400 }
      );
    }

    // Clean and validate inputs
    const publisherId = typeof incoming.publisherId === "string" ? incoming.publisherId.trim() : DEFAULT_ADS_CONFIG.publisherId;
    const adsEnabled = Boolean(incoming.adsEnabled);
    const autoAdsEnabled = incoming.autoAdsEnabled !== undefined ? Boolean(incoming.autoAdsEnabled) : true;

    const slots = {
      rightSkyscraper: {
        id: "rightSkyscraper",
        name: "Right Side Skyscraper",
        description: "Appears on wide desktop screens (1400px+) in the right gutter without shifting workspace content.",
        enabled: Boolean(incoming.slots?.rightSkyscraper?.enabled),
        mode: incoming.slots?.rightSkyscraper?.mode === "custom" ? "custom" : "adsense",
        slotId: typeof incoming.slots?.rightSkyscraper?.slotId === "string" ? incoming.slots.rightSkyscraper.slotId.trim() : "",
        customCode: typeof incoming.slots?.rightSkyscraper?.customCode === "string" ? incoming.slots.rightSkyscraper.customCode : "",
        minWidth: 1400,
      },
      bottomBanner: {
        id: "bottomBanner",
        name: "Bottom Results Banner",
        description: "Appears below tool actions and results with 24px policy safety spacing.",
        enabled: Boolean(incoming.slots?.bottomBanner?.enabled),
        mode: incoming.slots?.bottomBanner?.mode === "custom" ? "custom" : "adsense",
        slotId: typeof incoming.slots?.bottomBanner?.slotId === "string" ? incoming.slots.bottomBanner.slotId.trim() : "",
        customCode: typeof incoming.slots?.bottomBanner?.customCode === "string" ? incoming.slots.bottomBanner.customCode : "",
        minWidth: 0,
      },
    };

    const updateDoc = {
      key: "ads_config",
      adsEnabled,
      publisherId,
      autoAdsEnabled,
      slots,
      updatedAt: new Date().toISOString(),
      updatedBy: email,
    };

    const db = await getDb();
    await db.collection("system_settings").updateOne(
      { key: "ads_config" },
      { $set: updateDoc },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Ads configuration saved successfully.",
      adsConfig: updateDoc,
    });
  } catch (err) {
    console.error("SuperAdmin POST ads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update ads configuration." },
      { status: 500 }
    );
  }
}
