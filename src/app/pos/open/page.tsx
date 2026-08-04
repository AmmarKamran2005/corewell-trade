"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Banknote, Monitor, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { toast } from "@/components/ui/toaster";
import { BrandMark } from "@/components/ui/brand-mark";
import { brand } from "@/lib/brand";
import { terminals, currentSession, cashDenominations } from "@/data/pos";
import { formatMoney } from "@/lib/format";

/**
 * Opening the register. The float is counted into the drawer before the first
 * sale — without it, the close-of-day variance is meaningless.
 */
export default function OpenRegisterPage() {
  const router = useRouter();
  const active = terminals.filter((t) => t.isActive);
  const [terminalCode, setTerminalCode] = React.useState(active[0]?.code ?? "");
  const [float, setFloat] = React.useState(String(currentSession.openingFloat));
  const [counting, setCounting] = React.useState(false);

  const floatValue = Number(float) || 0;
  const terminal = terminals.find((t) => t.code === terminalCode);

  async function open(e: React.FormEvent) {
    e.preventDefault();
    setCounting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Register open", {
      description: `${terminal?.branch} ${terminal?.name} started with ${formatMoney(floatValue)} in the drawer.`,
    });
    router.push("/pos");
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2.5 mb-6">
          <BrandMark size={30} />
          <div>
            <h1 className="text-lg font-bold text-navy-900 dark:text-white">Open the register</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {brand.product} — start of shift
            </p>
          </div>
        </div>

        <form
          onSubmit={open}
          className="rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-5 space-y-5"
        >
          <div>
            <label htmlFor="terminal" className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">
              Terminal
            </label>
            <SelectNative
              id="terminal"
              value={terminalCode}
              onChange={(e) => setTerminalCode(e.target.value)}
              className="h-11"
            >
              {active.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.branch} · {t.name} ({t.code})
                </option>
              ))}
            </SelectNative>
            <p className="flex items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 mt-1.5">
              <Monitor className="size-3 flex-shrink-0" aria-hidden />
              Sales are stamped with this terminal for the end-of-day reconciliation.
            </p>
          </div>

          <div>
            <label htmlFor="float" className="block text-sm font-medium text-navy-900 dark:text-white mb-1.5">
              Opening float
            </label>
            <Input
              id="float"
              type="number"
              inputMode="decimal"
              min={0}
              value={float}
              onChange={(e) => setFloat(e.target.value)}
              className="h-12 text-lg tabular font-semibold"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {[5000, 10000, 15000, 20000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFloat(String(v))}
                  className="h-10 px-3 rounded-lg border border-slate-200 dark:border-navy-700 text-sm tabular font-medium text-navy-900 dark:text-white hover:border-brand hover:bg-brand-50 dark:hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {v.toLocaleString("en-PK")}
                </button>
              ))}
            </div>
            <p className="flex items-start gap-1.5 text-2xs text-slate-500 dark:text-slate-400 mt-2">
              <Banknote className="size-3 flex-shrink-0 mt-0.5" aria-hidden />
              Count the drawer before you enter this. Notes usually held:{" "}
              {cashDenominations.map((d) => d.toLocaleString("en-PK")).join(" · ")}.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-info/5 border border-info/20 px-3 py-2.5">
            <Info className="size-4 text-info flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Closing the register later compares the counted drawer against{" "}
              <span className="tabular font-medium text-navy-900 dark:text-white">{formatMoney(floatValue)}</span>{" "}
              plus cash takings. Any difference is recorded as a variance against your name.
            </p>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full h-12" disabled={counting}>
            {counting ? "Opening…" : <>Open register <ArrowRight className="size-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
