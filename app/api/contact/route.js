import { NextResponse } from "next/server";

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
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      body: JSON.stringify(body),
    });

    const data = await safeParseJson(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit contact inquiry: " + (error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const limit = searchParams.get("limit") || "50";

    const url = new URL(`${BACKEND_URL}/api/contact`);
    if (email) url.searchParams.set("email", email);
    if (limit) url.searchParams.set("limit", limit);

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_API_SECRET,
      },
      cache: "no-store",
    });

    const data = await safeParseJson(res);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contact inquiries: " + (error.message || error) },
      { status: 500 }
    );
  }
}
