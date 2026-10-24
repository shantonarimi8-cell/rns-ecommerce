import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { serializeOrder } from "../../../lib/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = Number(body.orderId);
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!Number.isInteger(orderId) || !email) {
      return NextResponse.json({ error: "Order ID and email required" }, { status: 400 });
    }

    const orders = await db.orm.public.Order.all();
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const matchesEmail =
      order.customerEmail.toLowerCase() === email ||
      order.guestEmail?.toLowerCase() === email;

    if (!matchesEmail) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const full = await serializeOrder(order.id);
    return NextResponse.json(full);
  } catch (error) {
    console.error("Order lookup failed:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
