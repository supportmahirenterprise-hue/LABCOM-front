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
    const history = await db
      .collection("batch_history")
      .find({ email: session.user.email })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
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
    const { fileName, pageCount, isSample, sortBy, sortOrder, enableQr, qrText } = body;

    const client = await clientPromise;
    const db = client.db();
    await db.collection("batch_history").insertOne({
      email: session.user.email,
      fileName: fileName || "Untitled_Batch.pdf",
      pageCount: pageCount || 1,
      isSample: Boolean(isSample),
      sortBy: sortBy || "sku",
      sortOrder: sortOrder || "asc",
      enableQr: Boolean(enableQr),
      qrText: qrText || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating history log:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
