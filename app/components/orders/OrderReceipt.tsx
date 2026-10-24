"use client";

import type { SerializedOrder } from "../../lib/orders";

function formatOrderDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

type OrderReceiptProps = {
  order: SerializedOrder;
  /** Shown on screen only, e.g. back link and status controls */
  toolbar?: React.ReactNode;
  title?: string;
};

export function OrderReceipt({ order, toolbar, title = "Order receipt" }: OrderReceiptProps) {
  return (
    <div className="order-receipt-root">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        {toolbar}
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
        >
          Print order
        </button>
      </div>

      <article
        id="order-receipt"
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none"
        aria-label={title}
      >
        <header className="border-b border-gray-200 pb-4 print:pb-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-[var(--brand)]">RNS Store</p>
              <p className="mt-1 text-sm text-gray-600">Fashion &amp; lifestyle</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-xl font-bold text-gray-900">Order #RNS-{order.id}</p>
              <p className="mt-1 text-gray-600">{formatOrderDate(order.createdAt)}</p>
              <p className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-0.5 font-medium text-gray-800">
                {order.status}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2 print:mt-4 print:grid-cols-2">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</h2>
            <p className="mt-2 font-medium text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-700">{order.customerPhone}</p>
            <p className="text-sm text-gray-700">{order.customerEmail}</p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-800">{order.deliveryAddress}</p>
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Payment:</span> {order.paymentMethod}
            </p>
          </section>
        </div>

        <div className="mt-8 overflow-x-auto print:mt-6">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-2 font-semibold">Item</th>
                <th className="py-2 px-2 font-semibold">Variant</th>
                <th className="py-2 px-2 text-right font-semibold">Qty</th>
                <th className="py-2 px-2 text-right font-semibold">Unit</th>
                <th className="py-2 pl-2 text-right font-semibold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 pr-2 font-medium text-gray-900">{item.productName}</td>
                    <td className="py-3 px-2 text-gray-700">{item.variantLabel}</td>
                    <td className="py-3 px-2 text-right text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-2 text-right text-gray-800">{formatMoney(item.unitPrice)}</td>
                    <td className="py-3 pl-2 text-right font-medium text-gray-900">{formatMoney(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <footer className="mt-6 border-t border-gray-200 pt-4 print:mt-4">
          <dl className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium text-gray-900">{formatMoney(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 ? (
              <div className="flex justify-between gap-4 text-green-700">
                <dt>
                  Discount
                  {order.couponCode ? ` (${order.couponCode})` : ""}
                </dt>
                <dd className="font-medium">−{formatMoney(order.discountAmount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 text-base">
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="font-bold text-gray-900">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </footer>

        <p className="mt-8 hidden text-center text-xs text-gray-500 print:block">
          Thank you for shopping with RNS Store.
        </p>
      </article>
    </div>
  );
}
