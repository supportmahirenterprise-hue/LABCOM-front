import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

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

    const client = await clientPromise;
    const db = client.db("labelpro");
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
    const {
      storeName,
      phone,
      supportEmail,
      storeUrl,
      instagramHandle,
      customNote,
      enableQr,
      qrText,
      detailText,
      qrX,
      qrY,
      qrSize,
      fontSize,
      sortBy,
      sortOrder,
      downloadSummary,
    } = body;

    const client = await clientPromise;
    const db = client.db("labelpro");

    const updateDoc = {
      email: cleanEmail,
      updatedAt: new Date(),
    };

    if (storeName !== undefined) updateDoc.storeName = storeName;
    if (phone !== undefined) updateDoc.phone = phone;
    if (supportEmail !== undefined) updateDoc.supportEmail = supportEmail;
    if (storeUrl !== undefined) updateDoc.storeUrl = storeUrl;
    if (instagramHandle !== undefined) updateDoc.instagramHandle = instagramHandle;
    if (customNote !== undefined) updateDoc.customNote = customNote;
    if (enableQr !== undefined) updateDoc.enableQr = enableQr;
    if (qrText !== undefined) updateDoc.qrText = qrText;
    if (detailText !== undefined) updateDoc.detailText = detailText;
    if (qrX !== undefined) updateDoc.qrX = qrX;
    if (qrY !== undefined) updateDoc.qrY = qrY;
    if (qrSize !== undefined) updateDoc.qrSize = qrSize;
    if (fontSize !== undefined) updateDoc.fontSize = fontSize;
    if (sortBy !== undefined) updateDoc.sortBy = sortBy;
    if (sortOrder !== undefined) updateDoc.sortOrder = sortOrder;
    if (downloadSummary !== undefined) updateDoc.downloadSummary = downloadSummary;

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
