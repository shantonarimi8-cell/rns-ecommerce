import { db } from "../../src/prisma/db";

export function formatAddress(parts: {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
}) {
  return [
    parts.line1,
    parts.line2,
    parts.city,
    parts.region,
    parts.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function serializeOrder(orderId: number) {
  const [orders, items, variants, products] = await Promise.all([
    db.orm.public.Order.all(),
    db.orm.public.OrderItem.all(),
    db.orm.public.ProductVariant.all(),
    db.orm.public.Product.all(),
  ]);

  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const orderItems = items
    .filter((i) => i.orderId === orderId)
    .map((i) => {
      const variant = variants.find((v) => v.id === i.variantId);
      const product = variant
        ? products.find((p) => p.id === variant.productId)
        : null;
      return {
        id: i.id,
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        productId: product?.id ?? null,
      };
    });

  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    couponCode: order.couponCode,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    deliveryAddress: order.deliveryAddress,
    createdAt: order.createdAt,
    items: orderItems,
  };
}

export type SerializedOrder = NonNullable<Awaited<ReturnType<typeof serializeOrder>>>;
