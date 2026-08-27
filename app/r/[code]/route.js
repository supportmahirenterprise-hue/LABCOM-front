import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://lp.lextrack.in"
).replace(/\/+$/, "");

export async function GET(req, { params }) {
  try {
    const { code } = params;
    if (!code) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.redirect(`${BACKEND_URL}/r/${code}`, 302);
  } catch (error) {
    console.error("QR Redirect Error:", error);
    return NextResponse.redirect("https://www.meesho.com", 302);
  }
}
