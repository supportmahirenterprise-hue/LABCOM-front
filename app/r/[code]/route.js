import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { code } = params;
    if (!code) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const client = await clientPromise;
    const db = client.db();

    // 1. Look up tracked QR code metadata
    let track = await db.collection("qr_tracks").findOne({ code });

    // Fallback: If code is base64 encoded URL/data
    let targetUrl = "https://www.meesho.com/themahirenterprise";
    let sellerEmail = "vishal.nexios@gmail.com";
    let orderNo = "DIRECT_SCAN";
    let sku = "GENERAL";

    if (track) {
      targetUrl = track.targetUrl || targetUrl;
      sellerEmail = track.sellerEmail || sellerEmail;
      orderNo = track.orderNo || orderNo;
      sku = track.sku || sku;
    } else {
      // Try decoding base64 if applicable
      try {
        const decoded = Buffer.from(code, "base64").toString("utf-8");
        if (decoded.startsWith("http")) {
          targetUrl = decoded;
        } else {
          const parsed = JSON.parse(decoded);
          if (parsed.u) targetUrl = parsed.u;
          if (parsed.e) sellerEmail = parsed.e;
          if (parsed.o) orderNo = parsed.o;
          if (parsed.s) sku = parsed.s;
        }
      } catch (e) {
        // use default fallback
      }
    }

    // 2. Log Scan Event in MongoDB
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const userAgent = req.headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);

    await db.collection("qr_scans").insertOne({
      code,
      sellerEmail,
      orderNo,
      sku,
      targetUrl,
      isMobile,
      userAgent: userAgent.substring(0, 150),
      createdAt: now,
      date: dateStr,
    });

    // Update total scans count on tracking document
    if (track) {
      await db.collection("qr_tracks").updateOne(
        { code },
        { $inc: { scanCount: 1 }, $set: { lastScannedAt: now } }
      );
    }

    // 3. Fast Instant Redirect to seller's store
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    return NextResponse.redirect(targetUrl, 302);
  } catch (error) {
    console.error("QR Redirect & Tracking Error:", error);
    return NextResponse.redirect("https://www.meesho.com", 302);
  }
}
