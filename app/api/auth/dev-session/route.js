import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function GET(req) {
  const host = req.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  if (!isLocalhost && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Dev session endpoint disabled in production" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "vishal.nexios@gmail.com";
  let callbackUrl = searchParams.get("callbackUrl") || "/admin";
  if (callbackUrl === "/admin" && !callbackUrl.includes("email=")) {
    callbackUrl = `/admin?email=${encodeURIComponent(email)}`;
  }

  const secret = process.env.NEXTAUTH_SECRET || "veloura-dev-secret-key-987654321";
  const token = await encode({
    token: {
      email,
      name: email === "vishal.nexios@gmail.com" ? "Vishal SuperAdmin" : "Seller Demo",
      sub: "dev-session-user-1",
    },
    secret,
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating SuperAdmin...</title>
  <meta http-equiv="refresh" content="0; url=${callbackUrl}">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0F172A; color: #FFFFFF;">
  <div style="text-align: center;">
    <div style="width: 44px; height: 44px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #6366F1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
    <p style="font-weight: 600; font-size: 1.1rem;">Authenticating Session for ${email}...</p>
    <a href="${callbackUrl}" style="color: #818CF8; text-decoration: none; font-size: 0.9rem;">Click here if not redirected automatically</a>
  </div>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script>
    window.location.replace("${callbackUrl}");
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  response.cookies.set("next-auth.session-token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}
