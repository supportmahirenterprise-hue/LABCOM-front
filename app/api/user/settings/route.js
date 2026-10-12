import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized / Missing email" }, { status: 401 });
    }

    const db = await getDb();
    const settings = await db.collection("user_settings").findOne({ email: userEmail.toLowerCase().trim() });

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error("GET user settings error:", error);
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
      return NextResponse.json({ error: "Unauthorized / Missing email" }, { status: 401 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    const allowedFields = [
      "storeName",
      "phone",
      "supportEmail",
      "storeUrl",
      "instagramHandle",
      "customNote",
      "enableQr",
      "useNativeScript",
      "stampStyle",
      "qrText",
      "detailText",
      "qrX",
      "qrY",
      "qrSize",
      "fontSize",
      "sortBy",
      "sortOrder",
      "downloadSummary",
      "enableWhatsApp",
      "sendWhatsApp",
      "cropEnabled",
      "cropPreset",
      "cropMode",
      "cropTop",
      "cropBottom",
      "cropLeft",
      "cropRight",
      "waApiKey",
      "waReceiverNumber",
      "pdfReceiverNumber",
      "imageReceiverNumber",
    ];

    const updateDoc = {
      email: cleanEmail,
      updatedAt: new Date(),
    };

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateDoc[key] = body[key];
      }
    }

    // Keep enableWhatsApp & sendWhatsApp in sync
    if (updateDoc.sendWhatsApp !== undefined && updateDoc.enableWhatsApp === undefined) {
      updateDoc.enableWhatsApp = updateDoc.sendWhatsApp;
    } else if (updateDoc.enableWhatsApp !== undefined && updateDoc.sendWhatsApp === undefined) {
      updateDoc.sendWhatsApp = updateDoc.enableWhatsApp;
    }

    const db = await getDb();

    await db.collection("user_settings").updateOne(
      { email: cleanEmail },
      { $set: updateDoc },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings: updateDoc });
  } catch (error) {
    console.error("POST user settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
