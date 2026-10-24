import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "../../../src/prisma/db";
import { validateCoupon } from "../../lib/coupons";
import { formatAddress, serializeOrder } from "../../lib/orders";
import { SESSION_COOKIE, verifySessionToken } from "../../lib/session";
import { dec } from "../../lib/decimal";

type LineInput = { variantId: number; quantity: number };

function variantLabel(size: string | null, color: string | null) {
  const parts = [size, color].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Default";
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return NextResponse.json({ error: "Please login to see your orders" }, { status: 401 });
  }

  const orders = await db.orm.public.Order.all();
  const mine = orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.id - a.id);

  const serialized = [];
  for (const o of mine) {
    const full = await serializeOrder(o.id);
    if (full) serialized.push(full);
  }

  return NextResponse.json(serialized);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

    const body = await request.json();
    const items: LineInput[] = Array.isArray(body.items) ? body.items : [];
    const couponCode = String(body.couponCode ?? "").trim();
    const paymentMethod = String(body.paymentMethod ?? "Cash on Delivery");
    const saveAddress = Boolean(body.saveAddress);

    const customerName = String(body.customerName ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
    const addressId = body.addressId ? Number(body.addressId) : null;

    let deliveryAddress = String(body.deliveryAddress ?? "").trim();
    const addressLine1 = String(body.line1 ?? "").trim();
    const addressLine2 = String(body.line2 ?? "").trim();
    const city = String(body.city ?? "").trim();
    const region = String(body.region ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customerName || !customerPhone || !customerEmail) {
      return NextResponse.json(
        { error: "Name, phone and email are required" },
        { status: 400 }
      );
    }

    if (userId && addressId) {
      const addresses = await db.orm.public.Address.all();
      const saved = addresses.find((a) => a.id === addressId && a.userId === userId);
      if (!saved) {
        return NextResponse.json({ error: "Address not found" }, { status: 400 });
      }
      deliveryAddress = formatAddress(saved);
    } else if (!deliveryAddress) {
      if (!addressLine1 || !city) {
        return NextResponse.json(
          { error: "Delivery address is required" },
          { status: 400 }
        );
      }
      deliveryAddress = formatAddress({
        line1: addressLine1,
        line2: addressLine2 || null,
        city,
        region: region || null,
        postalCode: postalCode || null,
      });
    }

    const variants = await db.orm.public.ProductVariant.all();
    const products = await db.orm.public.Product.all();

    let subtotal = 0;
    const lines: {
      variantId: number;
      quantity: number;
      unitPrice: number;
      productName: string;
      variantLabel: string;
    }[] = [];

    for (const item of items) {
      const variantId = Number(item.variantId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(variantId) || !Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }

      const variant = variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: "A variant is no longer available" }, { status: 400 });
      }

      const product = products.find((p) => p.id === variant.productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `${product?.name ?? "Product"} is unavailable` },
          { status: 400 }
        );
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${product.name}` },
          { status: 400 }
        );
      }

      const unitPrice = Number(variant.price);
      subtotal += unitPrice * quantity;
      lines.push({
        variantId,
        quantity,
        unitPrice,
        productName: product.name,
        variantLabel: variantLabel(variant.size, variant.color),
      });
    }

    let discountAmount = 0;
    let appliedCouponId: number | null = null;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const validation = await validateCoupon(couponCode, subtotal);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      discountAmount = validation.discount;
      appliedCouponId = validation.couponId;
      appliedCouponCode = validation.code;
    }

    const total = Math.max(0, subtotal - discountAmount);

    const order = await db.orm.public.Order.create({
      status: "Processing",
      paymentMethod,
      subtotal: dec(subtotal),
      discountAmount: dec(discountAmount),
      total: dec(total),
      deliveryAddress,
      customerName,
      customerPhone,
      customerEmail,
      guestEmail: userId ? null : customerEmail,
      guestName: userId ? null : customerName,
      guestPhone: userId ? null : customerPhone,
      userId: userId ?? null,
      couponId: appliedCouponId,
      couponCode: appliedCouponCode,
    });

    for (const line of lines) {
      await db.orm.public.OrderItem.create({
        orderId: order.id,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: dec(line.unitPrice),
        productName: line.productName,
        variantLabel: line.variantLabel,
      });

      const variant = variants.find((v) => v.id === line.variantId)!;
      await db.orm.public.ProductVariant.where({ id: line.variantId }).update({
        stock: variant.stock - line.quantity,
      });
    }

    if (appliedCouponId) {
      const coupons = await db.orm.public.Coupon.all();
      const coupon = coupons.find((c) => c.id === appliedCouponId);
      if (coupon) {
        await db.orm.public.Coupon.where({ id: appliedCouponId }).update({
          usedCount: coupon.usedCount + 1,
        });
      }
    }

    if (userId && saveAddress && addressLine1 && city) {
      const addresses = await db.orm.public.Address.all();
      const hasDefault = addresses.some((a) => a.userId === userId && a.isDefault);
      await db.orm.public.Address.create({
        userId,
        label: "Checkout",
        line1: addressLine1,
        line2: addressLine2 || null,
        city,
        region: region || null,
        postalCode: postalCode || null,
        isDefault: !hasDefault,
      });
    }

    return NextResponse.json(
      { id: order.id, total, subtotal, discountAmount },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
