import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/mongodb";
import { isSuperAdmin } from "../../../../../lib/admin";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email");
    const adminEmail = (session?.user?.email || headerEmail || "").toLowerCase().trim();

    if (!isSuperAdmin(adminEmail)) {
      return NextResponse.json(
        { error: "Access Denied: SuperAdmin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = (body.email || "").toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json({ error: "Target user email is required." }, { status: 400 });
    }

    const userSettingsInput = body.settings || body;

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
      email: targetEmail,
      updatedAt: new Date(),
    };

    for (const key of allowedFields) {
      if (userSettingsInput[key] !== undefined) {
        updateDoc[key] = userSettingsInput[key];
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
      { email: targetEmail },
      { $set: updateDoc },
      { upsert: true }
    );

    // If storeName was updated, also update name in users collection
    if (updateDoc.storeName) {
      await db.collection("users").updateOne(
        { email: targetEmail },
        { $set: { storeName: updateDoc.storeName } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Settings updated successfully for ${targetEmail}`,
      settings: updateDoc,
    });
  } catch (error) {
    console.error("SuperAdmin update user settings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
