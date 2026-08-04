import { cn } from "@/lib/utils";

/**
 * The Corewell Systems mark.
 *
 * Six rings around a solid core, joined by five segments. The sixth edge —
 * between the two right-hand rings — is deliberately missing: the open side is
 * what makes the outline read as a "C".
 *
 * Drawn rather than loaded as an image so it inherits `currentColor`, which
 * lets it step up to a lighter tint on the dark navy shells where the brand
 * teal would fall below contrast.
 */
export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("text-brand", className)}
      role="img"
      aria-label="Corewell Systems"
    >
      {/* Connectors, trimmed so they meet the rings instead of crossing them. */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
      >
        <path d="M59.2 25.3 L66.8 29.7" />
        <path d="M40.8 25.3 L33.2 29.7" />
        <path d="M24 45.6 L24 54.4" />
        <path d="M33.2 70.3 L40.8 74.7" />
        <path d="M59.2 74.7 L66.8 70.3" />
      </g>

      {/* The six vertices are rings, not dots. */}
      <g fill="none" stroke="currentColor" strokeWidth={4}>
        <circle cx="50" cy="20" r="8.4" />
        <circle cx="76" cy="35" r="8.4" />
        <circle cx="76" cy="65" r="8.4" />
        <circle cx="50" cy="80" r="8.4" />
        <circle cx="24" cy="65" r="8.4" />
        <circle cx="24" cy="35" r="8.4" />
      </g>

      {/* Only the core is filled. */}
      <circle cx="50" cy="50" r="9.4" fill="currentColor" />
    </svg>
  );
}
