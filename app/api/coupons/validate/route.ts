import { NextResponse } from "next/server";
import { validateCoupon } from "../../../lib/coupons";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body.code ?? "");
    const subtotal = Number(body.subtotal);

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });
    }

    const result = await validateCoupon(code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      code: result.code,
      discount: result.discount,
    });
  } catch (error) {
    console.error("Coupon validation failed:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
