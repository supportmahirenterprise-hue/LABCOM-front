import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const DEFAULT_TEMPLATES = [
  {
    name: "Meesho Store Follower Booster",
    description: "Encodes Meesho store page with Order No & SKU to grow followers and repeat orders.",
    enableQr: true,
    qrText: "https://www.meesho.com/themahirenterprise",
    detailText: "Scan to Follow Meesho Store!\nOrder: {orderNo}\nSKU: {sku}",
    qrX: 30,
    qrY: 30,
    qrSize: 90,
    fontSize: 8,
    sortBy: "sku",
    sortOrder: "asc",
  },
  {
    name: "Instagram Direct QR Stamp",
    description: "Directs customers to Instagram profile to claim warranty or discount coupons.",
    enableQr: true,
    qrText: "https://instagram.com/mahir.enterprise_",
    detailText: "Scan to Follow on Instagram!\n@mahir.enterprise_\nSKU: {sku}",
    qrX: 95,
    qrY: 30,
    qrSize: 85,
    fontSize: 8,
    sortBy: "sku",
    sortOrder: "asc",
  },
  {
    name: "Pure Multi-Field Sorter (No QR)",
    description: "Cleans and sorts high-volume batch labels strictly by SKU and highest Quantity first.",
    enableQr: false,
    qrText: "{orderNo}",
    detailText: "Order: {orderNo}\nSKU: {sku}",
    qrX: 30,
    qrY: 30,
    qrSize: 90,
    fontSize: 8,
    sortBy: "sku",
    sortOrder: "asc",
  },
];

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    let templates = await db
      .collection("templates")
      .find({ email: session.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    // If user has no templates yet, seed with defaults
    if (templates.length === 0) {
      const seeded = DEFAULT_TEMPLATES.map((t) => ({
        ...t,
        email: session.user.email,
        createdAt: new Date(),
      }));
      await db.collection("templates").insertMany(seeded);
      templates = await db
        .collection("templates")
        .find({ email: session.user.email })
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      enableQr,
      qrText,
      detailText,
      qrX,
      qrY,
      qrSize,
      fontSize,
      sortBy,
      sortOrder,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("templates").insertOne({
      email: session.user.email,
      name: name.trim(),
      description: description || "",
      enableQr: Boolean(enableQr),
      qrText: qrText || "https://www.meesho.com/themahirenterprise",
      detailText: detailText || "",
      qrX: parseFloat(qrX) || 30,
      qrY: parseFloat(qrY) || 30,
      qrSize: parseFloat(qrSize) || 90,
      fontSize: parseFloat(fontSize) || 8,
      sortBy: sortBy || "sku",
      sortOrder: sortOrder || "asc",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    await db.collection("templates").deleteOne({
      _id: new ObjectId(id),
      email: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
