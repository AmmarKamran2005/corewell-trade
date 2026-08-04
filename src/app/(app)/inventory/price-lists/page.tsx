"use client";

import * as React from "react";
import { Tags, Store, Globe, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { products, brands } from "@/data/products";
import { priceLists, retailPrice, type PriceListCode } from "@/data/store";
import { formatMoney, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type PriceRow = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  cost: number;
  wholesale: number;
  distributor: number;
  retail: number;
  retailMargin: number;
};

const ROWS: PriceRow[] = products
  .filter((p) => p.isActive)
  .map((p) => {
    const retail = retailPrice(p);
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: brands.find((b) => b.id === p.brandId)?.name ?? "—",
      cost: p.costPrice,
      wholesale: Math.round(p.salePrice * priceLists[1].factor),
      distributor: Math.round(p.salePrice * priceLists[2].factor),
      retail,
      retailMargin: retail > 0 ? ((retail - p.costPrice) / retail) * 100 : 0,
    };
  })
  .sort((a, b) => b.retail - a.retail);

const LIST_ICON: Record<PriceListCode, typeof Tags> = {
  RETAIL: Globe,
  WHOLESALE: Store,
  DISTRIBUTOR: Tags,
};

/**
 * One catalogue, three prices.
 *
 * The storefront could not exist without this table: selling online at the
 * trade price undercuts the dealers who buy from the same warehouse. Each
 * channel reads its own list, and the product record stays single.
 */
export default function PriceListsPage() {
  const [highlight, setHighlight] = React.useState<PriceListCode>("RETAIL");

  const columns: Column<PriceRow>[] = [
    {
      key: "name",
      header: "Product",
      cell: (r) => (
        <div>
          <div className="text-sm font-medium text-navy-900 dark:text-white">{r.name}</div>
          <div className="text-2xs tabular text-slate-500 dark:text-slate-400">{r.sku} · {r.brand}</div>
        </div>
      ),
    },
    { key: "cost", header: "Cost", align: "right", sortable: true, cell: (r) => (
        <span className="tabular text-xs text-slate-500 dark:text-slate-400">{formatMoney(r.cost)}</span>
      ) },
    { key: "distributor", header: "Distributor", align: "right", sortable: true, cell: (r) => (
        <span className={cn("tabular text-sm", highlight === "DISTRIBUTOR" ? "font-bold text-navy-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
          {formatMoney(r.distributor)}
        </span>
      ) },
    { key: "wholesale", header: "Wholesale", align: "right", sortable: true, cell: (r) => (
        <span className={cn("tabular text-sm", highlight === "WHOLESALE" ? "font-bold text-navy-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
          {formatMoney(r.wholesale)}
        </span>
      ) },
    { key: "retail", header: "Retail (online)", align: "right", sortable: true, cell: (r) => (
        <span className={cn("tabular text-sm", highlight === "RETAIL" ? "font-bold text-navy-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
          {formatMoney(r.retail)}
        </span>
      ) },
    { key: "retailMargin", header: "Retail margin", align: "right", cell: (r) => (
        <span className="tabular text-sm text-success font-medium">{formatPercent(r.retailMargin)}</span>
      ) },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Inventory", href: "/inventory/products" }, { label: "Price lists" }]}
        title="Price lists"
        subtitle="One catalogue, one stock pool — a different price per channel"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {priceLists.map((list) => {
          const Icon = LIST_ICON[list.code];
          const active = highlight === list.code;
          return (
            <button
              key={list.code}
              type="button"
              onClick={() => setHighlight(list.code)}
              aria-pressed={active}
              className={cn(
                "text-left rounded-xl border p-4 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                active
                  ? "border-brand bg-brand-50/60 dark:bg-brand/10"
                  : "border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 hover:border-slate-300 dark:hover:border-navy-500"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("size-9 rounded-lg flex items-center justify-center", active ? "bg-brand text-white" : "bg-slate-100 dark:bg-navy-800 text-slate-500")}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <Badge variant={list.taxInclusive ? "info" : "muted"}>
                  {list.taxInclusive ? "Tax inclusive" : "Tax added at invoice"}
                </Badge>
              </div>
              <h2 className="text-sm font-bold text-navy-900 dark:text-white mt-3">{list.name}</h2>
              <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{list.channel}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{list.description}</p>
              <p className="text-2xs tabular text-slate-500 dark:text-slate-400 mt-2">
                Base × {list.factor.toFixed(2)}
              </p>
            </button>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardBody className="flex items-start gap-2.5">
          <Info className="size-4 text-info flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Retail sits <span className="font-semibold text-navy-900 dark:text-white">above</span> wholesale on purpose.
            A distributor that sells online at its own trade price competes with the shops it supplies — which is the
            fastest way to lose a dealer network. Retail is also quoted tax-inclusive, because that is the number a
            consumer expects to pay.
          </p>
        </CardBody>
      </Card>

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={ROWS} pageSize={15} />
      </Card>
    </>
  );
}
