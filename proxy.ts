import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH } from "./app/lib/admin-redirect";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./app/lib/session";

/**
 * Optimistic admin gate. Verifies the signed admin cookie on every /admin
 * request (no database access) and redirects unauthenticated visitors to the
 * admin login page. The authoritative check — that the user still exists and
 * still matches ADMIN_EMAIL — happens in `getAdminUser()` inside the
 * /api/admin/* route handlers and the panel layout.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  let hasAdminSession = false;
  try {
    hasAdminSession = verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "admin") !== null;
  } catch {
    // SESSION_SECRET missing: treat as signed out rather than crashing the edge.
    hasAdminSession = false;
  }

  if (isLoginPage) {
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!hasAdminSession) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
