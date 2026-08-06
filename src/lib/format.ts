/**
 * Corewell Trade — Number & Money Formatting Utilities
 * --------------------------------------------------------------------------
 * Money is held as integer minor units (cents) throughout and converted to
 * major units at the point of display, which is why every amount passes
 * through these helpers rather than being formatted inline. Working in
 * integers keeps line totals, tax and tenders exactly consistent — the
 * rounding happens once, here.
 */

const MINOR_UNITS_PER_MAJOR = 100;
const CURRENCY_SYMBOL = "$";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyFormatterWhole = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

/** Format money — `$1,228.81`. Pass `decimals: 0` for rounded display. */
export function formatMoney(
  amount: number,
  options: { withSymbol?: boolean; decimals?: 0 | 2 } = {}
) {
  const { withSymbol = true, decimals = 2 } = options;
  const major = amount / MINOR_UNITS_PER_MAJOR;
  const formatter = decimals === 0 ? moneyFormatterWhole : moneyFormatter;
  const sign = major < 0 ? "-" : "";
  const value = formatter.format(Math.abs(major));
  return withSymbol ? `${sign}${CURRENCY_SYMBOL}${value}` : `${sign}${value}`;
}

/** Format compact — `$1.84M`, `$218.0K`, `$842` */
export function formatCompact(amount: number, withSymbol = true): string {
  const major = Math.abs(amount) / MINOR_UNITS_PER_MAJOR;
  const sign = amount < 0 ? "-" : "";
  let formatted: string;

  if (major >= 1_000_000_000) {
    formatted = `${(major / 1_000_000_000).toFixed(2)}B`;
  } else if (major >= 1_000_000) {
    formatted = `${(major / 1_000_000).toFixed(2)}M`;
  } else if (major >= 1_000) {
    formatted = `${(major / 1_000).toFixed(1)}K`;
  } else {
    formatted = major.toFixed(0);
  }

  return withSymbol ? `${sign}${CURRENCY_SYMBOL}${formatted}` : `${sign}${formatted}`;
}

/** Plain number with thousands grouping — `1,247` */
export function formatNumber(n: number) {
  return numberFormatter.format(n);
}

/** Percent with 1 decimal — `12.4%` */
export function formatPercent(n: number, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}

/** Format date as `DD-MMM-YYYY` */
export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format relative time — `2 min ago`, `3 hours ago` */
export function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) === 1 ? "" : "s"} ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) === 1 ? "" : "s"} ago`;
  return formatDate(d);
}

/** Initials from a full name — `Alex Hartley` → `AH` */
export function initials(name: string, max = 2) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, max)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
