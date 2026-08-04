"use client";

import * as React from "react";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportToolbar } from "@/components/widgets/report-toolbar";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { purchaseOrders, purchaseInvoices } from "@/data/purchases";
import { formatMoney, formatCompact, formatPercent } from "@/lib/format";

/** One row per supplier, aggregated from purchase orders and purchase invoices. */
type SupplierRow = {
  id: string;
  supplier: string;
  initials: string;
  poCount: number;
  ordered: number;
  invoiced: number;
  paid: number;
  outstanding: number;
  wht: number;
  share: number;
};

function buildRows(): SupplierRow[] {
  const by = new Map<string, SupplierRow>();

  const row = (name: string, initials: string) => {
    let r = by.get(name);
    if (!r) {
      r = { id: name, supplier: name, initials, poCount: 0, ordered: 0, invoiced: 0, paid: 0, outstanding: 0, wht: 0, share: 0 };
      by.set(name, r);
    }
    return r;
  };

  for (const po of purchaseOrders) {
    if (po.status === "CANCELLED") continue;
    const r = row(po.supplierName, po.supplierInitials);
    r.poCount += 1;
    r.ordered += po.total;
  }
  for (const pi of purchaseInvoices) {
    const r = row(pi.supplierName, pi.supplierInitials);
    r.invoiced += pi.total;
    r.paid += pi.paid;
    r.outstanding += pi.balance;
    r.wht += pi.whtAmount;
  }

  const rows = [...by.values()].sort((a, b) => b.ordered + b.invoiced - (a.ordered + a.invoiced));
  const total = rows.reduce((s, r) => s + r.ordered, 0) || 1;
  for (const r of rows) r.share = (r.ordered / total) * 100;
  return rows;
}

const ROWS = buildRows();

export default function PurchaseSummaryPage() {
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const totalOrdered = ROWS.reduce((s, r) => s + r.ordered, 0);
  const totalInvoiced = ROWS.reduce((s, r) => s + r.invoiced, 0);
  const totalOutstanding = ROWS.reduce((s, r) => s + r.outstanding, 0);
  const totalWht = ROWS.reduce((s, r) => s + r.wht, 0);

  const columns: Column<SupplierRow>[] = [
    {
      key: "supplier",
      header: "Supplier",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-full bg-navy-900 text-brand-300 flex items-center justify-center text-2xs font-semibold">
            {r.initials}
          </span>
          <div>
            <div className="text-sm font-medium text-navy-900 dark:text-white">{r.supplier}</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">
              {r.poCount} purchase {r.poCount === 1 ? "order" : "orders"}
            </div>
          </div>
        </div>
      ),
    },
    { key: "ordered",     header: "Ordered",     align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-navy-900 dark:text-white">{formatMoney(r.ordered)}</span> },
    { key: "invoiced",    header: "Invoiced",    align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-slate-600 dark:text-slate-300">{formatMoney(r.invoiced)}</span> },
    { key: "paid",        header: "Paid",        align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-success font-medium">{formatMoney(r.paid)}</span> },
    { key: "outstanding", header: "Outstanding", align: "right", sortable: true, cell: (r) => (
        r.outstanding > 0
          ? <span className="tabular text-sm font-bold text-warning">{formatMoney(r.outstanding)}</span>
          : <span className="tabular text-sm text-slate-400">—</span>
      ) },
    { key: "wht",         header: "WHT",         align: "right", cell: (r) => <span className="tabular text-xs text-slate-500 dark:text-slate-400">{formatMoney(r.wht)}</span> },
    { key: "share",       header: "Share",       align: "right", cell: (r) => (
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
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Purchase Summary" }]}
        title="Purchase Summary"
        subtitle="Purchases by supplier and period"
        actions={
          <ReportToolbar
            mode="range"
            reportName="Purchase Summary"
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
              <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Total Ordered</div>
              <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalOrdered)}</div>
            </div>
            <Truck className="size-5 text-slate-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Invoiced</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalInvoiced)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Outstanding</div>
          <div className="text-2xl tabular font-bold text-warning mt-1">{formatCompact(totalOutstanding)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">WHT Withheld</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalWht)}</div>
          <Badge variant="muted" className="mt-2">Payable to FBR</Badge>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={ROWS} pageSize={15} />
      </Card>

      <Card className="mt-4">
        <CardBody>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ordered is the value of purchase orders raised in the period. Invoiced is what
            suppliers have billed against them — the two differ while goods are in transit
            or a receipt is partial.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
