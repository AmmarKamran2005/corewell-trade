"use client";

import * as React from "react";
import { Package, Warehouse as WarehouseIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportToolbar } from "@/components/widgets/report-toolbar";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { products, brands, categories } from "@/data/products";
import { warehouses } from "@/data/admin";
import { formatMoney, formatCompact, formatNumber, formatPercent } from "@/lib/format";

type ValuationRow = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  units: number;
  costPrice: number;
  costValue: number;
  retailValue: number;
  marginPercent: number;
  status: string;
};

const ROWS: ValuationRow[] = products
  .filter((p) => p.isActive)
  .map((p) => {
    const costValue = p.totalStock * p.costPrice;
    const retailValue = p.totalStock * p.salePrice;
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: brands.find((b) => b.id === p.brandId)?.name ?? "—",
      category: categories.find((c) => c.id === p.categoryId)?.name ?? "—",
      units: p.totalStock,
      costPrice: p.costPrice,
      costValue,
      retailValue,
      marginPercent: retailValue > 0 ? ((retailValue - costValue) / retailValue) * 100 : 0,
      status: p.status,
    };
  })
  .sort((a, b) => b.costValue - a.costValue);

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "muted"> = {
  active: "success",
  low: "warning",
  out: "danger",
  inactive: "muted",
};

export default function InventoryValuationPage() {
  const [asOf, setAsOf] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = React.useState<number | null>(null);

  const totalCost = ROWS.reduce((s, r) => s + r.costValue, 0);
  const totalRetail = ROWS.reduce((s, r) => s + r.retailValue, 0);
  const totalUnits = ROWS.reduce((s, r) => s + r.units, 0);
  const outOfStock = ROWS.filter((r) => r.units === 0).length;

  const columns: Column<ValuationRow>[] = [
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
    { key: "category",    header: "Category",    cell: (r) => <span className="text-xs text-slate-500 dark:text-slate-400">{r.category}</span> },
    { key: "units",       header: "Units",       align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-navy-900 dark:text-white">{formatNumber(r.units)}</span> },
    { key: "costPrice",   header: "Unit Cost",   align: "right", cell: (r) => <span className="tabular text-xs text-slate-500 dark:text-slate-400">{formatMoney(r.costPrice)}</span> },
    { key: "costValue",   header: "Cost Value",  align: "right", sortable: true, cell: (r) => <span className="tabular text-sm font-semibold text-navy-900 dark:text-white">{formatMoney(r.costValue)}</span> },
    { key: "retailValue", header: "Retail Value",align: "right", sortable: true, cell: (r) => <span className="tabular text-sm text-slate-600 dark:text-slate-300">{formatMoney(r.retailValue)}</span> },
    { key: "marginPercent", header: "Margin",    align: "right", cell: (r) => <span className="tabular text-sm text-success font-medium">{formatPercent(r.marginPercent)}</span> },
    { key: "status",      header: "Status",      cell: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? "muted"}>{r.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: "Inventory Valuation" }]}
        title="Inventory Valuation"
        subtitle="Current stock value at weighted-average cost"
        actions={
          <ReportToolbar
            mode="asOf"
            reportName="Inventory Valuation"
            asOfDate={asOf}
            onAsOfChange={setAsOf}
            branchId={branchId}
            onBranchChange={setBranchId}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Stock at Cost</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalCost)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Stock at Retail</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatCompact(totalRetail)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Units on Hand</div>
          <div className="text-2xl tabular font-bold text-navy-900 dark:text-white mt-1">{formatNumber(totalUnits)}</div>
        </Card>
        <Card className={outOfStock > 0 ? "p-4 bg-danger/5 border-danger/20" : "p-4"}>
          <div className="text-2xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Out of Stock SKUs</div>
          <div className="text-2xl tabular font-bold text-danger mt-1">{outOfStock}</div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardBody>
          <h3 className="text-base font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <WarehouseIcon className="size-4 text-slate-400" />
            Value by warehouse
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {warehouses.map((w) => {
              const share = totalCost > 0 ? (w.totalValue / warehouses.reduce((s, x) => s + x.totalValue, 0)) * 100 : 0;
              return (
                <div key={w.id} className="rounded-lg border border-slate-200 dark:border-navy-700 p-3">
                  <div className="text-sm font-medium text-navy-900 dark:text-white">{w.name}</div>
                  <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{w.code} · {w.productCount} SKUs</div>
                  <div className="text-lg tabular font-bold text-navy-900 dark:text-white mt-2">{formatCompact(w.totalValue)}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-navy-700 overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={ROWS} pageSize={15} />
      </Card>
    </>
  );
}
