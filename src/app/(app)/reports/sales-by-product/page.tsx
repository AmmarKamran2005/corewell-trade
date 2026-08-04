"use client";

import * as React from "react";
import { Package, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportToolbar } from "@/components/widgets/report-toolbar";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { products, brands, categories } from "@/data/products";
import { formatMoney, formatCompact, formatNumber, formatPercent } from "@/lib/format";

/**
 * Units sold is derived deterministically from the seeded catalogue so the
 * report is stable between renders — there is no sales-line data in the mock
 * layer yet, and inventing a random figure per render would make the totals
 * disagree with themselves.
 */
type ProductRow = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  deltaPercent: number;
};

const ROWS: ProductRow[] = products
  .filter((p) => p.isActive)
  .map((p, i) => {
    const unitsSold = 40 + ((p.id * 37) % 380);
    const revenue = unitsSold * p.salePrice;
    const cost = unitsSold * p.costPrice;
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: brands.find((b) => b.id === p.brandId)?.name ?? "—",
      category: categories.find((c) => c.id === p.categoryId)?.name ?? "—",
      unitsSold,
      revenue,
      cost,
      margin: revenue - cost,
      marginPercent: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
      deltaPercent: ((p.id * 13) % 47) - 18 + (i % 3),
    };
  })
  .sort((a, b) => b.revenue - a.revenue);

export default function SalesByProductPage() {
  const [from, setFrom] = React.useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const totalRevenue = ROWS.reduce((s, r) => s + r.revenue, 0);
  const totalMargin = ROWS.reduce((s, r) => s + r.margin, 0);
  const totalUnits = ROWS.reduce((s, r) => s + r.unitsSold, 0);
  const blendedMargin = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-slate-100 dark:bg-navy-700 flex items-center justify-center">
            <Package className="size-4 text-slate-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-navy-900 dark:text-white">{r.name}</div>
            <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{r.sku} · {r.brand}</div>
          </div>
        </div>
      ),
    },
    { key: "category",  header: "Category", cell: (r) => <span className="text-xs text-slate-500 dark:text-slate-400">{r.category}</span> },
    { key: "unitsSold", header: "Units",    align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-navy-900 dark:text-white">{formatNumber(r.unitsSold)}</span> },
    { key: "revenue",   header: "Revenue",  align: "right", sortable: true, cell: (r) => <span className="tabular text-sm font-semibold text-navy-900 dark:text-white">{formatMoney(r.revenue)}</span> },
    { key: "margin",    header: "Margin",   align: "right", sortable: true, cell: (r) => (
        <div className="text-right">
          <div className="tabular text-sm text-success font-medium">{formatMoney(r.margin)}</div>
          <div className="tabular text-2xs text-slate-500 dark:text-slate-400">{formatPercent(r.marginPercent)}</div>
        </div>
      ) },
    { key: "deltaPercent", header: "vs prev.", align: "right", cell: (r) => (
        <span className={`tabular text-xs font-semibold inline-flex items-center gap-1 ${r.deltaPercent >= 0 ? "text-success" : "text-danger"}`}>
          {r.deltaPercent >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {formatPercent(Math.abs(r.deltaPercent), 0)}
        </span>
      ) },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Sales by Product" }]}
        title="Sales by Product"
        subtitle="Units, revenue and margin per SKU"
        actions={
          <ReportToolbar
            mode="range"
            reportName="Sales by Product"
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
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Revenue</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalRevenue)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Gross Margin</div>
          <div className="text-2xl tabular font-bold text-success mt-1">{formatCompact(totalMargin)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Blended Margin</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatPercent(blendedMargin)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Units Sold</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatNumber(totalUnits)}</div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={ROWS} pageSize={15} />
      </Card>
    </>
  );
}
