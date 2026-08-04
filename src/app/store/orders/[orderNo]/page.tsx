"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  CheckCircle2, Circle, Truck, MapPin, Phone, Mail, Package, ShieldCheck, Clock, ChevronLeft, RotateCcw,
} from "lucide-react";
import { products } from "@/data/products";
import {
  onlineOrders, deliveryMethods, paymentMethods, SHIPMENT_FLOW, SHIPMENT_LABEL, storeCustomer,
  RETURN_WINDOW_DAYS, type OnlineOrder,
} from "@/data/store";
import { ProductThumb } from "@/components/store/product-card";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A newly placed order has no seeded record — checkout builds its number and
 * routes here. Rather than 404 on the shopper's own confirmation, synthesise a
 * freshly-placed order so the confirmation and tracking are one page.
 */
function newlyPlaced(orderNo: string): OnlineOrder {
  return {
    id: 0, orderNo, placedAt: new Date().toISOString(),
    customerName: storeCustomer.name, email: storeCustomer.email, phone: storeCustomer.phone,
    address: storeCustomer.address, city: storeCustomer.city,
    deliveryCode: "STANDARD", paymentCode: "CARD", state: "PAYMENT_CONFIRMED",
    trackingNo: null, subtotal: 0, deliveryFee: 0, discount: 0, total: 0, lines: [],
  };
}

export default function OrderTrackingPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const params = useSearchParams();
  const justPlaced = params.get("placed") === "1";

  const decoded = decodeURIComponent(orderNo);
  const order = onlineOrders.find((o) => o.orderNo === decoded) ?? (justPlaced ? newlyPlaced(decoded) : null);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-navy-900 dark:text-white">Order not found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          We couldn’t find an order numbered {decoded}.
        </p>
        <Link href="/store/orders" className="mt-6 inline-flex h-12 px-6 rounded-lg bg-brand text-white text-sm font-semibold items-center">
          Back to my orders
        </Link>
      </div>
    );
  }

  const method = deliveryMethods.find((d) => d.code === order.deliveryCode);
  const payment = paymentMethods.find((p) => p.code === order.paymentCode);
  const currentStep = SHIPMENT_FLOW.indexOf(order.state);
  const hasBackorder = order.lines.some((l) => (l.backordered ?? 0) > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/store/orders" className="inline-flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 hover:text-brand mb-5">
        <ChevronLeft className="size-3.5" aria-hidden />
        My orders
      </Link>

      {justPlaced && (
        <div role="status" className="rounded-xl border border-success/30 bg-success/5 p-5 mb-6 flex items-start gap-3">
          <CheckCircle2 className="size-6 text-success flex-shrink-0" aria-hidden />
          <div>
            <h1 className="text-lg font-bold text-navy-900 dark:text-white">Thank you — your order is placed</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              We’ve emailed a confirmation to {order.email}. Your order number is{" "}
              <span className="tabular font-semibold text-navy-900 dark:text-white">{order.orderNo}</span>.
            </p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-2">
              This is a demonstration — no payment was taken, no email was sent, and nothing will be dispatched.
            </p>
          </div>
        </div>
      )}

      {!justPlaced && (
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white tabular">{order.orderNo}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Placed {formatDate(order.placedAt)} · {payment?.name}
          </p>
        </header>
      )}

      {/* Progress */}
      <section aria-labelledby="progress-h" className="rounded-xl border border-slate-200 dark:border-navy-700 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h2 id="progress-h" className="text-sm font-bold text-navy-900 dark:text-white">Progress</h2>
          {order.trackingNo && (
            <span className="inline-flex items-center gap-1.5 text-2xs tabular text-slate-600 dark:text-slate-300">
              <Truck className="size-3.5 text-slate-400" aria-hidden />
              Tracking {order.trackingNo}
            </span>
          )}
        </div>

        <ol className="space-y-0">
          {SHIPMENT_FLOW.map((step, i) => {
            const done = i <= currentStep;
            const current = i === currentStep;
            const last = i === SHIPMENT_FLOW.length - 1;
            return (
              <li key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 className={cn("size-5 flex-shrink-0", current ? "text-brand" : "text-success")} aria-hidden />
                  ) : (
                    <Circle className="size-5 flex-shrink-0 text-slate-300 dark:text-navy-600" aria-hidden />
                  )}
                  {!last && (
                    <span className={cn("w-px flex-1 min-h-[26px] my-1", i < currentStep ? "bg-success" : "bg-slate-200 dark:bg-navy-700")} />
                  )}
                </div>
                <div className={cn("pb-4", last && "pb-0")}>
                  <p className={cn(
                    "text-sm font-medium",
                    current ? "text-brand" : done ? "text-navy-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {SHIPMENT_LABEL[step]}
                    {current && <span className="ml-2 text-2xs font-semibold uppercase tracking-wider">Current</span>}
                  </p>
                  {current && (
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {step === "PICKING" && "Our warehouse team is collecting your items."}
                      {step === "PACKED" && "Packed and waiting for the courier collection."}
                      {step === "DISPATCHED" && `On its way — ${method?.eta}.`}
                      {step === "DELIVERED" && "Delivered. Your 14-day return window starts today."}
                      {step === "PAYMENT_CONFIRMED" && "Payment confirmed. Picking starts shortly."}
                      {step === "PLACED" && "We have your order."}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {hasBackorder && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-info/5 border border-info/20 px-3 py-2.5 text-2xs text-slate-700 dark:text-slate-200">
            <Clock className="size-3.5 text-info flex-shrink-0 mt-px" aria-hidden />
            Part of this order is on backorder and will arrive in a second delivery. No extra delivery charge applies.
          </p>
        )}
      </section>

      {/* Items */}
      {order.lines.length > 0 && (
        <section aria-labelledby="items-h" className="mt-6 rounded-xl border border-slate-200 dark:border-navy-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-navy-700">
            <h2 id="items-h" className="text-sm font-bold text-navy-900 dark:text-white">Items</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-navy-800">
            {order.lines.map((l) => {
              const p = products.find((x) => x.id === l.productId);
              return (
                <li key={l.productId} className="p-4 flex gap-4">
                  {p ? (
                    <Link href={`/store/products/${p.sku}`} className="flex-shrink-0">
                      <ProductThumb product={p} className="size-16 rounded-lg" />
                    </Link>
                  ) : (
                    <span className="size-16 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                      <Package className="size-5 text-slate-400" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900 dark:text-white">{l.name}</p>
                    <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5">
                      {l.sku} · {l.qty} × {formatMoney(l.unitPrice)}
                    </p>
                    {(l.backordered ?? 0) > 0 && (
                      <p className="inline-flex items-center gap-1 text-2xs text-info font-medium mt-1">
                        <Clock className="size-3" aria-hidden />
                        {l.backordered} on backorder, shipping separately
                      </p>
                    )}
                    {l.serials?.length ? (
                      <p className="inline-flex items-center gap-1.5 text-2xs text-slate-600 dark:text-slate-300 mt-1">
                        <ShieldCheck className="size-3 text-success" aria-hidden />
                        Serial <span className="tabular">{l.serials.join(", ")}</span> — registered for warranty
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm tabular font-semibold text-navy-900 dark:text-white">
                    {formatMoney(l.unitPrice * l.qty)}
                  </p>
                </li>
              );
            })}
          </ul>

          <dl className="px-5 py-4 border-t border-slate-200 dark:border-navy-700 space-y-1.5 text-sm bg-slate-50 dark:bg-navy-950">
            <Row label="Subtotal" value={formatMoney(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" value={`− ${formatMoney(order.discount)}`} tone="success" />}
            <Row label="Delivery" value={order.deliveryFee === 0 ? "Free" : formatMoney(order.deliveryFee)} />
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-navy-700">
              <dt className="font-semibold text-navy-900 dark:text-white">Total</dt>
              <dd className="text-lg tabular font-bold text-navy-900 dark:text-white">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* Returns — only offered once the goods have actually arrived */}
      {order.state === "DELIVERED" && (
        <section aria-labelledby="return-h" className="mt-6 rounded-xl border border-slate-200 dark:border-navy-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 id="return-h" className="text-sm font-bold text-navy-900 dark:text-white">
              Something not right?
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              You have {RETURN_WINDOW_DAYS} days from delivery to send an item back.{" "}
              <Link href="/store/help" className="text-brand font-medium hover:underline">
                Read the returns policy
              </Link>
              .
            </p>
          </div>
          <Link
            href={`/store/orders/${order.orderNo}/return`}
            className="h-11 px-5 rounded-lg border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-navy-800 whitespace-nowrap"
          >
            <RotateCcw className="size-4" aria-hidden />
            Return an item
          </Link>
        </section>
      )}

      {/* Delivery details */}
      <section aria-labelledby="addr-h" className="mt-6 rounded-xl border border-slate-200 dark:border-navy-700 p-5">
        <h2 id="addr-h" className="text-sm font-bold text-navy-900 dark:text-white">Delivery details</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-3 text-xs">
          <div className="space-y-1.5">
            <p className="font-medium text-navy-900 dark:text-white">{order.customerName}</p>
            <p className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
              <MapPin className="size-3.5 text-slate-400 flex-shrink-0 mt-px" aria-hidden />
              {order.deliveryCode === "PICKUP" ? "Collection from store counter" : `${order.address}, ${order.city}`}
            </p>
            <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Phone className="size-3.5 text-slate-400" aria-hidden />
              {order.phone}
            </p>
            <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Mail className="size-3.5 text-slate-400" aria-hidden />
              {order.email}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Truck className="size-3.5 text-slate-400" aria-hidden />
              {method?.name} — {method?.eta}
            </p>
            <p className="text-slate-600 dark:text-slate-300">Paid by {payment?.name}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className={tone === "success" ? "tabular font-medium text-success" : "tabular font-medium text-navy-900 dark:text-white"}>
        {value}
      </dd>
    </div>
  );
}
