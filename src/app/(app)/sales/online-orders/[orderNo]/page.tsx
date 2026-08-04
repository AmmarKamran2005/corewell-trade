"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Truck, MapPin, Phone, Mail, ClipboardCheck, PackageCheck, Send, Clock, AlertTriangle, Barcode,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import { products } from "@/data/products";
import { warehouses } from "@/data/admin";
import {
  onlineOrders, deliveryMethods, paymentMethods, SHIPMENT_FLOW, SHIPMENT_LABEL,
  stockPromise, isSerialised, type ShipmentState,
} from "@/data/store";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The fulfilment side of an online order: pick → pack → dispatch.
 *
 * This is the piece the trade business never needed. A counter sale hands the
 * goods over immediately; an online order creates an obligation that has to be
 * picked from a specific warehouse, packed, and handed to a courier — with a
 * short pick that has to become a backorder rather than a silent cancellation.
 */
export default function FulfilOrderPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const order = onlineOrders.find((o) => o.orderNo === decodeURIComponent(orderNo));

  const [state, setState] = React.useState<ShipmentState>(order?.state ?? "PLACED");
  const [picked, setPicked] = React.useState<Record<number, number>>({});
  const [tracking, setTracking] = React.useState(order?.trackingNo ?? "");
  const [serials, setSerials] = React.useState<Record<number, string>>({});
  const [working, setWorking] = React.useState(false);

  if (!order) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: "Sales", href: "/sales/orders" }, { label: "Online orders", href: "/sales/online-orders" }, { label: "Not found" }]}
          title="Order not found"
        />
        <EmptyState
          title="No such order"
          description={`Nothing matches ${decodeURIComponent(orderNo)} in the seeded data.`}
        />
      </>
    );
  }

  const method = deliveryMethods.find((d) => d.code === order.deliveryCode);
  const payment = paymentMethods.find((p) => p.code === order.paymentCode);
  const step = SHIPMENT_FLOW.indexOf(state);

  const pickedQty = (productId: number, ordered: number) => picked[productId] ?? ordered;
  const shortLines = order.lines.filter((l) => pickedQty(l.productId, l.qty) < l.qty);
  const allPicked = order.lines.every((l) => pickedQty(l.productId, l.qty) > 0);

  /* Serialised lines must have a number captured before the goods leave. The
     storefront promises warranty without a receipt, and that is only keepable
     if the unit that shipped was recorded against the order. */
  const serialLines = order.lines.filter((l) => {
    const p = products.find((x) => x.id === l.productId);
    return p ? isSerialised(p) : false;
  });
  const serialsMissing = serialLines.filter(
    (l) => !(l.serials?.length) && !(serials[l.productId] ?? "").trim()
  );

  async function advance(to: ShipmentState, message: string, description: string) {
    setWorking(true);
    await new Promise((r) => setTimeout(r, 500));
    setState(to);
    setWorking(false);
    toast.success(message, { description });
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Sales", href: "/sales/orders" },
          { label: "Online orders", href: "/sales/online-orders" },
          { label: order.orderNo },
        ]}
        title={order.orderNo}
        subtitle={`Placed ${formatDate(order.placedAt)} · ${order.customerName} · ${payment?.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={state === "DELIVERED" ? "success" : state === "DISPATCHED" ? "info" : "warning"}>
              {SHIPMENT_LABEL[state]}
            </Badge>
            <Button variant="secondary" size="md" asChild>
              <Link href={`/store/orders/${order.orderNo}`} target="_blank">
                Customer view
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stage rail */}
      <Card className="mb-6">
        <CardBody>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {SHIPMENT_FLOW.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center text-2xs font-bold tabular",
                    i < step ? "bg-success text-white" : i === step ? "bg-brand text-white" : "bg-slate-100 dark:bg-navy-700 text-slate-400"
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn("text-xs font-medium", i <= step ? "text-navy-900 dark:text-white" : "text-slate-400 dark:text-slate-500")}>
                  {SHIPMENT_LABEL[s]}
                </span>
                {i < SHIPMENT_FLOW.length - 1 && (
                  <span className={cn("hidden sm:block w-6 h-px", i < step ? "bg-success" : "bg-slate-200 dark:bg-navy-700")} />
                )}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Pick list */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-navy-700 flex items-center gap-3">
            <h2 className="text-sm font-bold text-navy-900 dark:text-white">Pick list</h2>
            <span className="text-2xs text-slate-500 dark:text-slate-400">
              {warehouses.find((w) => w.code === "KHI-WH-01")?.name ?? "Main warehouse"}
            </span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-navy-800">
            {order.lines.map((l) => {
              const p = products.find((x) => x.id === l.productId);
              const promise = p ? stockPromise(p) : null;
              const qty = pickedQty(l.productId, l.qty);
              const short = qty < l.qty;
              return (
                <li key={l.productId} className="p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-white">{l.name}</p>
                      <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Barcode className="size-3 text-slate-400" aria-hidden />
                          {p?.barcodes[0] ?? l.sku}
                        </span>
                        · {l.sku}
                        {promise && <span>· {promise.available} available online</span>}
                      </p>
                      {(l.backordered ?? 0) > 0 && (
                        <p className="inline-flex items-center gap-1 text-2xs text-info font-medium mt-1">
                          <Clock className="size-3" aria-hidden />
                          {l.backordered} already on backorder from an earlier pick
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`pick-${l.productId}`} className="block text-2xs text-slate-500 dark:text-slate-400 mb-1">
                        Picked of {l.qty}
                      </label>
                      <input
                        id={`pick-${l.productId}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={l.qty}
                        value={qty}
                        disabled={step > 2}
                        onChange={(e) =>
                          setPicked((prev) => ({
                            ...prev,
                            [l.productId]: Math.min(l.qty, Math.max(0, Number(e.target.value) || 0)),
                          }))
                        }
                        className={cn(
                          "w-20 h-11 px-2 text-center text-sm tabular font-semibold rounded-lg border bg-transparent text-navy-900 dark:text-white focus:outline-none disabled:opacity-60",
                          short ? "border-warning" : "border-slate-200 dark:border-navy-700 focus:border-brand",
                          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        )}
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-sm tabular font-semibold text-navy-900 dark:text-white">
                        {formatMoney(l.unitPrice * l.qty)}
                      </p>
                      {short && (
                        <p className="text-2xs text-warning font-medium mt-0.5">
                          {l.qty - qty} short
                        </p>
                      )}
                    </div>
                  </div>

                  {l.serials?.length ? (
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-2 tabular">
                      Serial recorded at despatch: {l.serials.join(", ")}
                    </p>
                  ) : p && isSerialised(p) && step >= 3 ? (
                    <div className="mt-3">
                      <label htmlFor={`serial-${l.productId}`} className="block text-2xs text-slate-500 dark:text-slate-400 mb-1">
                        Serial number{qty > 1 ? "s" : ""} <span className="text-danger">*</span>
                        {qty > 1 && <span className="font-normal"> — comma separated, {qty} units</span>}
                      </label>
                      <Input
                        id={`serial-${l.productId}`}
                        value={serials[l.productId] ?? ""}
                        onChange={(e) => setSerials((prev) => ({ ...prev, [l.productId]: e.target.value }))}
                        placeholder="NX-SPK-2026-000000"
                        className="h-11 tabular max-w-sm"
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {shortLines.length > 0 && step <= 2 && (
            <p className="flex items-start gap-2 px-4 py-3 border-t border-slate-200 dark:border-navy-700 text-2xs text-warning">
              <AlertTriangle className="size-3.5 flex-shrink-0 mt-px" aria-hidden />
              {shortLines.length} {shortLines.length === 1 ? "line is" : "lines are"} short. Confirming the pick
              raises a backorder for the shortfall and tells the customer their order will arrive in two deliveries.
            </p>
          )}
        </Card>

        {/* Actions + address */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white">Next action</h2>

              {step <= 1 && (
                <Button
                  variant="accent" size="lg" className="w-full" disabled={working}
                  onClick={() => advance("PICKING", "Picking started", `${order.orderNo} assigned to the warehouse queue.`)}
                >
                  <ClipboardCheck className="size-4" />
                  Start picking
                </Button>
              )}

              {step === 2 && (
                <Button
                  variant="accent" size="lg" className="w-full" disabled={working || !allPicked}
                  onClick={() =>
                    advance(
                      "PACKED",
                      "Pick confirmed",
                      shortLines.length
                        ? `${shortLines.length} short ${shortLines.length === 1 ? "line" : "lines"} raised as a backorder.`
                        : "All lines picked in full."
                    )
                  }
                >
                  <PackageCheck className="size-4" />
                  Confirm pick &amp; pack
                </Button>
              )}

              {step === 3 && (
                <>
                  <div>
                    <label htmlFor="tracking" className="block text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Courier tracking number
                    </label>
                    <Input
                      id="tracking"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder="TCS-000000000"
                      className="h-11 tabular"
                    />
                  </div>
                  {serialsMissing.length > 0 && (
                    <p className="flex items-start gap-1.5 text-2xs text-warning">
                      <AlertTriangle className="size-3.5 flex-shrink-0 mt-px" aria-hidden />
                      {serialsMissing.length} serialised {serialsMissing.length === 1 ? "line needs" : "lines need"} a
                      serial number before despatch — it is the warranty record.
                    </p>
                  )}
                  <Button
                    variant="accent" size="lg" className="w-full"
                    disabled={working || !tracking.trim() || serialsMissing.length > 0}
                    onClick={() =>
                      advance(
                        "DISPATCHED",
                        "Dispatched",
                        `Tracking ${tracking} sent to ${order.customerName}${serialLines.length ? ` · ${serialLines.length} serial${serialLines.length === 1 ? "" : "s"} recorded` : ""}.`
                      )
                    }
                  >
                    <Send className="size-4" />
                    Mark dispatched
                  </Button>
                </>
              )}

              {step === 4 && (
                <Button
                  variant="accent" size="lg" className="w-full" disabled={working}
                  onClick={() => advance("DELIVERED", "Marked delivered", "The 14-day return window starts today.")}
                >
                  <Truck className="size-4" />
                  Mark delivered
                </Button>
              )}

              {step >= 5 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This order is complete. Nothing further is owed to the customer.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2 text-xs">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white mb-1">Ship to</h2>
              <p className="font-medium text-navy-900 dark:text-white">{order.customerName}</p>
              <p className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                <MapPin className="size-3.5 text-slate-400 flex-shrink-0 mt-px" aria-hidden />
                {order.deliveryCode === "PICKUP" ? "Collection at counter" : `${order.address}, ${order.city}`}
              </p>
              <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Phone className="size-3.5 text-slate-400" aria-hidden />
                {order.phone}
              </p>
              <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Mail className="size-3.5 text-slate-400" aria-hidden />
                {order.email}
              </p>
              <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-navy-800">
                <Truck className="size-3.5 text-slate-400" aria-hidden />
                {method?.name} — {method?.eta}
              </p>
              {order.paymentCode === "COD" && (
                <p className="text-warning font-medium">
                  Collect {formatMoney(order.total)} in cash on delivery.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
