"use client";

import * as React from "react";
import { Users, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportToolbar } from "@/components/widgets/report-toolbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { orders } from "@/data/sales";
import { formatMoney, formatCompact, formatPercent } from "@/lib/format";
import { initials } from "@/lib/format";

type RepRow = {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  avgOrder: number;
  onHold: number;
  unpaid: number;
  share: number;
};

function buildRows(): RepRow[] {
  const by = new Map<string, RepRow>();
  for (const o of orders) {
    if (o.status === "CANCELLED") continue;
    let r = by.get(o.salesPerson);
    if (!r) {
      r = { id: o.salesPerson, name: o.salesPerson, orders: 0, revenue: 0, avgOrder: 0, onHold: 0, unpaid: 0, share: 0 };
      by.set(o.salesPerson, r);
    }
    r.orders += 1;
    r.revenue += o.total;
    if (o.status === "CREDIT_HOLD") r.onHold += 1;
    if (o.paymentStatus !== "PAID") r.unpaid += o.total;
  }
  const rows = [...by.values()].sort((a, b) => b.revenue - a.revenue);
  const total = rows.reduce((s, r) => s + r.revenue, 0) || 1;
  for (const r of rows) {
    r.avgOrder = r.orders ? r.revenue / r.orders : 0;
    r.share = (r.revenue / total) * 100;
  }
  return rows;
}

const ROWS = buildRows();

export default function SalesBySalespersonPage() {
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const totalRevenue = ROWS.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = ROWS.reduce((s, r) => s + r.orders, 0);
  const leader = ROWS[0];

  const columns: Column<RepRow>[] = [
    {
      key: "name",
      header: "Salesperson",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-full bg-navy-900 text-brand-300 flex items-center justify-center text-2xs font-semibold">
            {initials(r.name)}
          </span>
          <div>
            <div className="text-sm font-medium text-navy-900 dark:text-white">{r.name}</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">
              {r.orders} {r.orders === 1 ? "order" : "orders"}
            </div>
          </div>
        </div>
      ),
    },
    { key: "revenue",  header: "Revenue",   align: "right", sortable: true, cell: (r) => <span className="tabular text-sm font-semibold text-navy-900 dark:text-white">{formatMoney(r.revenue)}</span> },
    { key: "avgOrder", header: "Avg Order", align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-slate-600 dark:text-slate-300">{formatMoney(r.avgOrder)}</span> },
    { key: "unpaid",   header: "Unpaid",    align: "right", sortable: true, cell: (r) => (
        r.unpaid > 0
          ? <span className="tabular text-sm font-medium text-warning">{formatMoney(r.unpaid)}</span>
          : <span className="tabular text-sm text-slate-400">—</span>
      ) },
    { key: "onHold",   header: "Credit Holds", align: "right", cell: (r) => (
        r.onHold > 0 ? <Badge variant="danger">{r.onHold}</Badge> : <span className="text-sm text-slate-400">—</span>
      ) },
    { key: "share",    header: "Share", align: "right", cell: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-navy-700 overflow-hidden">
            <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, r.share)}%` }} />
          </div>
          <span className="tabular text-2xs text-slate-500 dark:text-slate-400 w-10 text-right">{formatPercent(r.share)}</span>
        </div>
      ) },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Sales by Salesperson" }]}
        title="Sales by Salesperson"
        subtitle="Performance per sales representative"
        actions={
          <ReportToolbar
            mode="range"
            reportName="Sales by Salesperson"
            fromDate={from}
            toDate={to}
            onRangeChange={(f, t) => { setFrom(f); setTo(t); }}
            branchId={branchId}
            onBranchChange={setBranchId}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Team Revenue</div>
              <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalRevenue)}</div>
            </div>
            <Users className="size-5 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Orders</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{totalOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Reps Active</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{ROWS.length}</div>
        </Card>
        <Card className="p-4 bg-brand/5 border-brand/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase font-semibold tracking-wider text-brand-700 dark:text-brand-300">Top Performer</div>
              <div className="text-base font-bold text-navy-900 dark:text-white mt-1">{leader?.name ?? "—"}</div>
              <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{leader ? formatCompact(leader.revenue) : ""}</div>
            </div>
            <Trophy className="size-5 text-brand" />
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={ROWS} pageSize={15} />
      </Card>
    </>
  );
}
