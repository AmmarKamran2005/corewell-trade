"use client";

import * as React from "react";
import { ShoppingBag, Truck, Clock, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  onlineOrders, deliveryMethods, paymentMethods, SHIPMENT_LABEL,
  type OnlineOrder, type ShipmentState,
} from "@/data/store";
import { formatMoney, formatCompact, formatDate, initials } from "@/lib/format";

const STATE_VARIANT: Record<ShipmentState, "success" | "warning" | "danger" | "info" | "muted"> = {
  PLACED: "muted",
  PAYMENT_CONFIRMED: "muted",
  PICKING: "warning",
  PACKED: "warning",
  DISPATCHED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

/** Anything before dispatch is work the warehouse still owes the customer. */
const OPEN_STATES: ShipmentState[] = ["PLACED", "PAYMENT_CONFIRMED", "PICKING", "PACKED"];

export default function OnlineOrdersPage() {
  const open = onlineOrders.filter((o) => OPEN_STATES.includes(o.state));
  const inTransit = onlineOrders.filter((o) => o.state === "DISPATCHED");
  const backordered = onlineOrders.filter((o) => o.lines.some((l) => (l.backordered ?? 0) > 0));
  const value = onlineOrders.reduce((s, o) => s + o.total, 0);

  const columns: Column<OnlineOrder>[] = [
    {
      key: "orderNo",
      header: "Order",
      cell: (o) => (
        <div>
          <div className="text-sm tabular font-medium text-navy-900 dark:text-white">{o.orderNo}</div>
          <div className="text-2xs text-slate-500 dark:text-slate-400">{formatDate(o.placedAt)}</div>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Customer",
      cell: (o) => (
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-navy-900 text-brand-300 flex items-center justify-center text-2xs font-semibold flex-shrink-0">
            {initials(o.customerName)}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-navy-900 dark:text-white truncate">{o.customerName}</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400 truncate">{o.city}</div>
          </div>
        </div>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      cell: (o) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {deliveryMethods.find((d) => d.code === o.deliveryCode)?.name}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      cell: (o) => (
        <Badge variant={o.paymentCode === "COD" ? "warning" : "muted"}>
          {paymentMethods.find((p) => p.code === o.paymentCode)?.name}
        </Badge>
      ),
    },
    {
      key: "lines",
      header: "Items",
      align: "right",
      cell: (o) => {
        const back = o.lines.reduce((s, l) => s + (l.backordered ?? 0), 0);
        return (
          <div className="text-right">
            <div className="text-sm tabular text-navy-900 dark:text-white">{o.lines.reduce((s, l) => s + l.qty, 0)}</div>
            {back > 0 && <div className="text-2xs text-info font-medium">{back} backordered</div>}
          </div>
        );
      },
    },
    { key: "total", header: "Total", align: "right", sortable: true, cell: (o) => (
        <span className="text-sm tabular font-semibold text-navy-900 dark:text-white">{formatMoney(o.total)}</span>
      ) },
    { key: "state", header: "Status", cell: (o) => (
        <Badge variant={STATE_VARIANT[o.state]}>{SHIPMENT_LABEL[o.state]}</Badge>
      ) },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Sales", href: "/sales/orders" }, { label: "Online orders" }]}
        title="Online orders"
        subtitle="Orders captured by the storefront, queued for warehouse fulfilment"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">To fulfil</div>
              <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{open.length}</div>
            </div>
            <PackageCheck className="size-5 text-slate-400" aria-hidden />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">In transit</div>
              <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{inTransit.length}</div>
            </div>
            <Truck className="size-5 text-slate-400" aria-hidden />
          </div>
        </Card>
        <Card className={backordered.length ? "p-4 border-info/30 bg-info/5" : "p-4"}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">With backorders</div>
              <div className="text-2xl tabular font-bold text-info mt-1">{backordered.length}</div>
            </div>
            <Clock className="size-5 text-info" aria-hidden />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Order value</div>
              <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(value)}</div>
            </div>
            <ShoppingBag className="size-5 text-slate-400" aria-hidden />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={onlineOrders}
          rowHref={(o) => `/sales/online-orders/${o.orderNo}`}
          pageSize={15}
        />
      </Card>
    </>
  );
}
