import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "seller@lextrack.in";

    const res = await fetch(`${BACKEND_URL}/api/insights/dashboard`, {
      headers: { "x-user-email": userEmail },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback response if backend server is starting
      return NextResponse.json({
        error: "Backend server temporarily unreachable",
      }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
