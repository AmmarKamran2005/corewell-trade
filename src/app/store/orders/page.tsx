import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { onlineOrders, SHIPMENT_LABEL, deliveryMethods, storeCustomer } from "@/data/store";
import { formatMoney, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "My orders" };

const STATE_TONE: Record<string, string> = {
  DELIVERED: "text-success bg-success/10",
  DISPATCHED: "text-info bg-info/10",
  PACKED: "text-warning bg-warning/10",
  PICKING: "text-warning bg-warning/10",
  PAYMENT_CONFIRMED: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800",
  PLACED: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800",
  CANCELLED: "text-danger bg-danger/10",
};

export default function MyOrdersPage() {
  const mine = onlineOrders.filter((o) => o.email === storeCustomer.email);
  const others = onlineOrders.filter((o) => o.email !== storeCustomer.email);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My orders</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Signed in as {storeCustomer.name} · {storeCustomer.email}
      </p>

      <OrderList orders={mine} />

      {/* The demo ships with several orders so the fulfilment states are all
          visible; they are labelled honestly rather than pretended to be yours. */}
      <section className="mt-10">
        <h2 className="text-sm font-bold text-navy-900 dark:text-white">Other orders in this demonstration</h2>
        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
          Shown so every fulfilment stage can be explored. A real storefront would never expose these.
        </p>
        <OrderList orders={others} />
      </section>
    </div>
  );
}

function OrderList({ orders }: { orders: typeof onlineOrders }) {
  if (orders.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 dark:border-navy-700 py-12 text-center">
        <Package className="size-6 text-slate-300 dark:text-navy-600 mx-auto mb-2" aria-hidden />
        <p className="text-sm text-slate-500 dark:text-slate-400">No orders yet.</p>
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {orders.map((o) => {
        const method = deliveryMethods.find((d) => d.code === o.deliveryCode);
        return (
          <li key={o.id}>
            <Link
              href={`/store/orders/${o.orderNo}`}
              className="block rounded-xl border border-slate-200 dark:border-navy-700 p-4 hover:border-brand/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm tabular font-semibold text-navy-900 dark:text-white">{o.orderNo}</p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(o.placedAt)} · {o.lines.length} {o.lines.length === 1 ? "item" : "items"} · {method?.name}
                  </p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-2xs font-semibold whitespace-nowrap", STATE_TONE[o.state])}>
                  {SHIPMENT_LABEL[o.state]}
                </span>
                <span className="text-sm tabular font-bold text-navy-900 dark:text-white">{formatMoney(o.total)}</span>
                <ChevronRight className="size-4 text-slate-400" aria-hidden />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
