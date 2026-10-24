import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "../../src/prisma/db";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./session";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

// Hash of a throwaway value; only used to equalise response timing when the
// submitted email does not exist, so that email enumeration is not possible.
const DUMMY_HASH = bcrypt.hashSync("rns-admin-timing-pad", 10);

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

/**
 * Resolves the admin for the current request from the dedicated admin
 * session cookie. A storefront session never satisfies this check.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return null;

  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, "admin");
  if (!userId) return null;

  const users = await db.orm.public.User.all();
  const user = users.find((u) => u.id === userId);
  if (!user || user.email.toLowerCase() !== adminEmail) return null;

  return { id: user.id, name: user.name, email: user.email };
}

/**
 * Verifies admin credentials. Returns the admin user only when the email is
 * the configured ADMIN_EMAIL and the password matches; any other account —
 * including a valid customer account — is rejected.
 */
export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  const adminEmail = getAdminEmail();
  const normalized = email.trim().toLowerCase();
  if (!adminEmail || !normalized || !password) return null;

  const users = await db.orm.public.User.all();
  const user = users.find((u) => u.email.toLowerCase() === normalized);

  // Always run a bcrypt compare so response timing does not reveal whether
  // the email exists or is the admin account.
  const hash = user?.password ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid || normalized !== adminEmail) return null;
  return { id: user.id, name: user.name, email: user.email };
}
