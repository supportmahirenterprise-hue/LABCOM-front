import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { DEFAULT_ADS_CONFIG } from "../../../lib/adsConfig";

export const dynamic = "force-dynamic";
export { DEFAULT_ADS_CONFIG };

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection("system_settings").findOne({ key: "ads_config" });

    if (!doc) {
      return NextResponse.json({
        success: true,
        adsConfig: DEFAULT_ADS_CONFIG,
      });
    }

    // Merge with defaults so new fields are always present
    const merged = {
      ...DEFAULT_ADS_CONFIG,
      ...doc,
      slots: {
        ...DEFAULT_ADS_CONFIG.slots,
        ...(doc.slots || {}),
        rightSkyscraper: {
          ...DEFAULT_ADS_CONFIG.slots.rightSkyscraper,
          ...(doc.slots?.rightSkyscraper || {}),
        },
        bottomBanner: {
          ...DEFAULT_ADS_CONFIG.slots.bottomBanner,
          ...(doc.slots?.bottomBanner || {}),
        },
        sidebarBanner: {
          ...DEFAULT_ADS_CONFIG.slots.sidebarBanner,
          ...(doc.slots?.sidebarBanner || {}),
        },
      },
    };

    return NextResponse.json({
      success: true,
      adsConfig: merged,
    });
  } catch (err) {
    console.error("Public ads config error:", err);
    return NextResponse.json({
      success: true,
      adsConfig: DEFAULT_ADS_CONFIG,
    });
  }
}
