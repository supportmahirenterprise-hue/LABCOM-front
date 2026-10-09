import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export async function POST(req) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
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
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contact inquiries: " + (error.message || error) },
      { status: 500 }
    );
  }
}
