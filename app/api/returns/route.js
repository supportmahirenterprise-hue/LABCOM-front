import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { isUserBlockedSync } from "../../../lib/blockGuard";

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

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized / Missing user email" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/returns`);
    searchParams.forEach((val, key) => {
      backendUrl.searchParams.set(key, val);
    });
    backendUrl.searchParams.set("email", userEmail);

    const res = await fetch(backendUrl.toString(), {
      headers: {
        "x-user-email": userEmail,
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      cache: "no-store",
    });

    const data = await safeParseJson(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email");
    const headerEmail = req.headers.get("x-user-email");
    const userEmail = session?.user?.email || queryEmail || headerEmail || "";

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isUserBlockedSync(userEmail)) {
      return NextResponse.json(
        { error: "ACCOUNT_SUSPENDED", message: "Account has been restricted by an administrator." },
        { status: 403 }
      );
    }

    const id = searchParams.get("id");
    const res = await fetch(
      `${BACKEND_URL}/api/returns?id=${encodeURIComponent(id || "")}&email=${encodeURIComponent(userEmail)}`,
      {
        method: "DELETE",
        headers: {
          "x-user-email": userEmail,
          "x-internal-secret": INTERNAL_API_SECRET,
        },
      }
    );
    const data = await safeParseJson(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
