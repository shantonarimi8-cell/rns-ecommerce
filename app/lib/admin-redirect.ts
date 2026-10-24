export const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Sanitises the `next` query parameter used after admin login.
 * Only in-app paths under /admin are allowed; absolute URLs,
 * protocol-relative URLs, backslash tricks and the login page itself
 * fall back to the dashboard.
 */
export function safeAdminRedirect(next: string | null | undefined): string {
  if (!next) return "/admin";
  if (next.startsWith("//") || next.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(next)) return "/admin";
  if (next !== "/admin" && !next.startsWith("/admin/") && !next.startsWith("/admin?")) return "/admin";
  if (next === ADMIN_LOGIN_PATH || next.startsWith(`${ADMIN_LOGIN_PATH}?`) || next.startsWith(`${ADMIN_LOGIN_PATH}/`)) {
    return "/admin";
  }
  return next;
}
