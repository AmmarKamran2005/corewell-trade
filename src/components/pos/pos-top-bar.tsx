"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Monitor, User, Clock, Wifi, WifiOff } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { brand } from "@/lib/brand";
import { currentSession, terminals } from "@/data/pos";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/pos",         label: "Sell" },
  { href: "/pos/returns", label: "Returns" },
  { href: "/pos/close",   label: "Close register" },
];

/**
 * The till's own chrome. Deliberately not the ERP sidebar: a cashier needs the
 * whole screen for the catalogue and the cart, and exactly three destinations.
 */
export function PosTopBar() {
  const pathname = usePathname();
  const terminal = terminals.find((t) => t.code === currentSession.terminalCode);
  const [now, setNow] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState(true);

  /* Rendered client-side only — a server-rendered clock would hydrate stale. */
  React.useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <header className="h-14 flex-shrink-0 bg-navy-900 text-white flex items-center gap-4 px-3 sm:px-4 border-b border-navy-700">
      <Link
        href="/dashboard"
        title="Back to Corewell Trade"
        className="flex items-center gap-2.5 flex-shrink-0 h-11 px-1.5 -mx-1.5 rounded-lg hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        <BrandMark size={26} className="text-brand-300" />
        <span className="hidden sm:block text-sm font-bold leading-none">
          {brand.productParts.lead} <span className="text-brand-300">POS</span>
        </span>
      </Link>

      <nav aria-label="Till" className="flex items-center gap-1 ml-1">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "h-9 px-3 inline-flex items-center rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-slate-300 hover:bg-navy-700 hover:text-white"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <span
          className={cn(
            "hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md",
            online ? "text-brand-300 bg-brand/15" : "text-warning-light bg-warning/20"
          )}
          title={online ? "Connected — sales post immediately" : "Offline — sales queue on this terminal"}
        >
          {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          {online ? "Online" : "Offline — queued"}
        </span>

        <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300">
          <Monitor className="size-3.5 text-slate-400" />
          {terminal ? `${terminal.branch} · ${terminal.name}` : currentSession.terminalCode}
        </span>

        <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
          <User className="size-3.5 text-slate-400" />
          {currentSession.cashier}
        </span>

        <span className="flex items-center gap-1.5 text-xs tabular text-slate-300 min-w-[52px]">
          <Clock className="size-3.5 text-slate-400" />
          {now ?? "--:--"}
        </span>

        <Link
          href="/dashboard"
          className="h-9 px-3 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-700 hover:text-white transition-colors"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Exit till</span>
        </Link>
      </div>
    </header>
  );
}
