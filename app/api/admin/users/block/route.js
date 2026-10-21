import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/mongodb";
import { isSuperAdmin } from "../../../../../lib/admin";
import { setInMemoryUserBlocked } from "../../../../../lib/blockGuard";

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
    const shouldBlock = Boolean(body.isBlocked);

    if (!targetEmail) {
      return NextResponse.json({ error: "Target user email is required." }, { status: 400 });
    }

    // Safety guard: Cannot block SuperAdmin
    if (isSuperAdmin(targetEmail)) {
      return NextResponse.json(
        { error: "Action prohibited: The primary SuperAdmin account cannot be blocked." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Update in users collection
    await db.collection("users").updateOne(
      { email: targetEmail },
      {
        $set: {
          isBlocked: shouldBlock,
          blockedAt: shouldBlock ? new Date() : null,
          blockedBy: shouldBlock ? adminEmail : null,
        },
      },
      { upsert: true }
    );

    // Also update in user_settings collection
    await db.collection("user_settings").updateOne(
      { email: targetEmail },
      {
        $set: {
          isBlocked: shouldBlock,
          blockedAt: shouldBlock ? new Date() : null,
        },
      },
      { upsert: true }
    );

    // Also update in-memory cache instantly for zero-latency active session eviction
    setInMemoryUserBlocked(targetEmail, shouldBlock);

    // Non-blocking sync to backend service if running
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001").replace(/\/+$/, "");
      fetch(`${backendUrl}/api/internal/block-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, isBlocked: shouldBlock }),
      }).catch(() => {});
    } catch (e) {}

    return NextResponse.json({
      success: true,
      email: targetEmail,
      isBlocked: shouldBlock,
      message: shouldBlock
        ? `User ${targetEmail} has been successfully BLOCKED.`
        : `User ${targetEmail} has been successfully UNBLOCKED.`,
    });
  } catch (error) {
    console.error("SuperAdmin block user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
