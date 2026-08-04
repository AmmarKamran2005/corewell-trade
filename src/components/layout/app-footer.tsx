import { brand, copyright, developedBy, demoTenant } from "@/lib/brand";

/**
 * Persistent footer under every page in the app shell.
 *
 * Carries three things that must never be lost in a screenshot: who built the
 * system, how to reach them, and that this is sample data — not a live clinic
 * of records.
 */
export function AppFooter() {
  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 pb-2 dark:border-navy-800">
      <div className="flex flex-col gap-2 text-2xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p>
          <span className="font-semibold text-navy-900 dark:text-white">
            {brand.product}
          </span>{" "}
          — {developedBy},{" "}
          <a
            href={brand.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:underline"
          >
            corewellsystems.com
          </a>{" "}
          ·{" "}
          <a
            href={`mailto:${brand.contactEmail}`}
            className="hover:text-navy-900 dark:hover:text-white"
          >
            {brand.contactEmail}
          </a>
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand/10 dark:text-brand-300">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Demonstration system — sample data ({demoTenant.name})
          </span>
          <span>{copyright}</span>
        </p>
      </div>
    </footer>
  );
}
