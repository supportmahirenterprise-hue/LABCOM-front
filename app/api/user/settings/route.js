import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import clientPromise from "../../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const settings = await db
      .collection("user_settings")
      .findOne({ email: session.user.email });

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error("Error fetching settings:", error);
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

    const client = await clientPromise;
    const db = client.db();
    await db.collection("user_settings").updateOne(
      { email: session.user.email },
      {
        $set: {
          email: session.user.email,
          enableQr: enableQr !== undefined ? enableQr : true,
          qrText,
          detailText,
          qrX,
          qrY,
          qrSize,
          fontSize,
          sortBy,
          sortOrder,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
