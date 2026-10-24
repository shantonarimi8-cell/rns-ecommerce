import { test } from "node:test";
import assert from "node:assert/strict";

process.env.SESSION_SECRET ??= "test-secret-not-for-production";

const { createSessionToken, verifySessionToken } = await import("../session");
const { safeAdminRedirect } = await import("../admin-redirect");

test("store token is not accepted as an admin token", () => {
  const token = createSessionToken(42, "store");
  assert.equal(verifySessionToken(token, "store"), 42);
  assert.equal(verifySessionToken(token, "admin"), null);
});

test("admin token is not accepted as a store token", () => {
  const token = createSessionToken(7, "admin");
  assert.equal(verifySessionToken(token, "admin"), 7);
  assert.equal(verifySessionToken(token, "store"), null);
});

test("default scope is store (backward compatible)", () => {
  const token = createSessionToken(3);
  assert.equal(verifySessionToken(token), 3);
  assert.equal(verifySessionToken(token, "store"), 3);
});

test("tampered admin token is rejected", () => {
  const token = createSessionToken(7, "admin");
  const [userId, expires, sig] = token.split(".");
  assert.equal(verifySessionToken(`${Number(userId) + 1}.${expires}.${sig}`, "admin"), null);
  assert.equal(verifySessionToken(`${userId}.${Number(expires) + 1}.${sig}`, "admin"), null);
  assert.equal(verifySessionToken(undefined, "admin"), null);
  assert.equal(verifySessionToken("garbage", "admin"), null);
});

test("safeAdminRedirect only allows in-panel paths", () => {
  assert.equal(safeAdminRedirect(null), "/admin");
  assert.equal(safeAdminRedirect(""), "/admin");
  assert.equal(safeAdminRedirect("/admin"), "/admin");
  assert.equal(safeAdminRedirect("/admin/orders"), "/admin/orders");
  assert.equal(safeAdminRedirect("/admin/products/12?tab=images"), "/admin/products/12?tab=images");
  // Not inside the panel
  assert.equal(safeAdminRedirect("/"), "/admin");
  assert.equal(safeAdminRedirect("/account"), "/admin");
  assert.equal(safeAdminRedirect("/administrator"), "/admin");
  // Open-redirect attempts
  assert.equal(safeAdminRedirect("//evil.example/admin"), "/admin");
  assert.equal(safeAdminRedirect("https://evil.example/admin"), "/admin");
  assert.equal(safeAdminRedirect("javascript:alert(1)"), "/admin");
  assert.equal(safeAdminRedirect("/admin\\@evil.example"), "/admin");
  // Avoid bouncing back to the login page
  assert.equal(safeAdminRedirect("/admin/login"), "/admin");
  assert.equal(safeAdminRedirect("/admin/login?next=/admin"), "/admin");
});
