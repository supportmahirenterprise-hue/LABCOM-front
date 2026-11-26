import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../../lib/blockGuard";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
).replace(/\/+$/, "");

const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "veloura-labelpro-internal-secure-key-2026";

async function safeParseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || res.statusText || "Invalid backend response" };
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const res = await fetch(`${BACKEND_URL}/api/returns/upload`, {
      method: "POST",
      headers: {
        "x-user-email": userEmail,
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      body: formData,
    });

    const data = await safeParseJson(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
