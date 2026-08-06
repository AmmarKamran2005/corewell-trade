import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Everything in here runs on fabricated records — invented customers, invented
 * order numbers, invented balances. The landing page is indexable; this is not.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
