import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;
    const res = await fetch(
      `${BACKEND_URL}/api/templates?email=${encodeURIComponent(userEmail)}`,
      {
        headers: { "x-user-email": userEmail },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": userEmail,
      },
      body: JSON.stringify({ email: userEmail, ...body }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = session.user.email;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const res = await fetch(
      `${BACKEND_URL}/api/templates?id=${id}&email=${encodeURIComponent(userEmail)}`,
      {
        method: "DELETE",
        headers: { "x-user-email": userEmail },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
