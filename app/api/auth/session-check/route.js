import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlocked } from "../../../../lib/blockGuard";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const headerEmail = req.headers.get("x-user-email");
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");

    const email = (session?.user?.email || headerEmail || queryEmail || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ authenticated: false, blocked: false });
    }

    // High-performance in-memory O(1) blocked check (< 0.001 ms, 0 DB queries)
    const blocked = await isUserBlocked(email);

    if (blocked) {
      return NextResponse.json(
        {
          authenticated: true,
          blocked: true,
          error: "ACCOUNT_SUSPENDED",
          message: "Your account has been restricted by an administrator.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      blocked: false,
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
