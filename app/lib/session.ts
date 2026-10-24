import { createHmac, timingSafeEqual } from "crypto";

/** Storefront customer session. */
export const SESSION_COOKIE = "rns_session";
/** Admin panel session. Kept separate so logging into the store never grants admin access. */
export const ADMIN_SESSION_COOKIE = "rns_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

/**
 * Tokens are bound to a scope. The scope is mixed into the signature, so a
 * token minted for the store cannot be presented as an admin token even
 * though both are signed with the same secret.
 */
export type SessionScope = "store" | "admin";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is missing in .env");
  }
  return secret;
}

function sign(value: string, scope: SessionScope) {
  // The store scope keeps the legacy (unprefixed) signature so existing
  // customer sessions stay valid.
  const input = scope === "store" ? value : `${scope}:${value}`;
  return createHmac("sha256", getSecret()).update(input).digest("hex");
}

export function createSessionToken(userId: number, scope: SessionScope = "store") {
  const maxAge = scope === "admin" ? ADMIN_SESSION_MAX_AGE : SESSION_MAX_AGE;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload, scope)}`;
}

export function verifySessionToken(token: string | undefined, scope: SessionScope = "store") {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userIdText, expiresText, signature] = parts;
  const payload = `${userIdText}.${expiresText}`;

  const expected = Buffer.from(sign(payload, scope));
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const userId = Number(userIdText);
  return Number.isInteger(userId) ? userId : null;
}
