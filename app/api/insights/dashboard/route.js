import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../../lib/blockGuard";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.labelpro.in"
).replace(/\/+$/, "");

const INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "veloura-labelpro-internal-secure-key-2026";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "seller@labelpro.in";

    if (session?.user?.email && isUserBlockedSync(session.user.email)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/api/insights/dashboard`, {
      headers: {
        "x-user-email": userEmail,
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend server temporarily unreachable" },
        { status: 502 }
      );
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "Invalid response from backend server" };
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
