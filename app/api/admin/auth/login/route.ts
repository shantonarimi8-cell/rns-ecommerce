import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateAdmin } from "../../../../lib/admin";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
} from "../../../../lib/session";

/**
 * Admin-only login. Issues the admin session cookie; never touches the
 * storefront session. Non-admin accounts receive the same generic 401 as a
 * wrong password so the admin email cannot be discovered here.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!email.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(admin.id, "admin"), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ user: admin });
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
