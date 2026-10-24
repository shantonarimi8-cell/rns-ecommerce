import { db } from "../../src/prisma/db";

export type CouponValidation =
  | { ok: true; couponId: number; code: string; discount: number }
  | { ok: false; error: string };

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidation> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, error: "Enter a coupon code" };
  }

  const coupons = await db.orm.public.Coupon.all();
  const coupon = coupons.find((c) => c.code.toUpperCase() === normalized);

  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Invalid coupon code" };
  }

  if (coupon.expiresAt) {
    const expires = new Date(coupon.expiresAt).getTime();
    if (Number.isFinite(expires) && expires < Date.now()) {
      return { ok: false, error: "This coupon has expired" };
    }
  }

  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "This coupon has reached its usage limit" };
  }

  const minSubtotal = coupon.minSubtotal ? Number(coupon.minSubtotal) : 0;
  if (subtotal < minSubtotal) {
    return {
      ok: false,
      error: `Minimum order ৳${minSubtotal} required for this coupon`,
    };
  }

  const value = Number(coupon.value);
  let discount = 0;

  if (coupon.type === "PERCENT") {
    discount = Math.round((subtotal * value) / 100);
  } else if (coupon.type === "FIXED") {
    discount = Math.min(subtotal, value);
  } else {
    return { ok: false, error: "Invalid coupon configuration" };
  }

  if (discount <= 0) {
    return { ok: false, error: "Coupon does not apply to this order" };
  }

  return {
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
  };
}
