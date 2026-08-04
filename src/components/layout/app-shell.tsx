"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { AIDrawer } from "./ai-drawer";
import { CommandPalette } from "./command-palette";
import { AppFooter } from "./app-footer";
import { Toaster } from "@/components/ui/toaster";

const SIDEBAR_COLLAPSED_KEY = "cwt-sidebar-collapsed";

/**
 * The collapsed state lives in localStorage, which is an external system —
 * so it is read through `useSyncExternalStore` rather than copied into React
 * state by an effect. The server snapshot is `false` so the markup matches
 * during hydration, exactly as the previous effect-based restore did.
 */
let collapsedSnapshot: boolean | null = null;
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(onChange: () => void) {
  collapsedListeners.add(onChange);
  return () => collapsedListeners.delete(onChange);
}

function getCollapsed() {
  if (collapsedSnapshot === null) {
    try {
      collapsedSnapshot = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      collapsedSnapshot = false;
    }
  }
  return collapsedSnapshot;
}

const getCollapsedOnServer = () => false;

function persistCollapsed(next: boolean) {
  collapsedSnapshot = next;
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    /* Private browsing can refuse the write; the in-memory value still holds. */
  }
  collapsedListeners.forEach((l) => l());
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = React.useSyncExternalStore(
    subscribeCollapsed,
    getCollapsed,
    getCollapsedOnServer
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [aiOpen, setAIOpen] = React.useState(false);

  /* Close mobile sidebar on route navigation */
  React.useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [mobileOpen]);

  function toggleCollapsed() {
    persistCollapsed(!collapsed);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 flex">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenSidebar={() => setMobileOpen(true)}
          onOpenAI={() => setAIOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
            {children}
            <AppFooter />
          </div>
        </main>
      </div>
      <AIDrawer open={aiOpen} onOpenChange={setAIOpen} />
      <CommandPalette />
      <Toaster />
    </div>
  );
}
