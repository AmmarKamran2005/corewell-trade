import { cn } from "@/lib/utils";

/**
 * The Corewell Systems mark — six nodes around a core.
 *
 * Inline SVG rather than a raster asset so it inherits currentColor,
 * stays crisp at every size, and needs no light/dark variant swap.
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
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 35 L50 20 M50 20 L76 35 M24 35 L24 65 M24 65 L50 80 M50 80 L76 65" />
      </g>
      <g fill="currentColor">
        <circle cx="50" cy="20" r="7" />
        <circle cx="76" cy="35" r="7" />
        <circle cx="76" cy="65" r="7" />
        <circle cx="50" cy="80" r="7" />
        <circle cx="24" cy="65" r="7" />
        <circle cx="24" cy="35" r="7" />
        <circle cx="50" cy="50" r="11" />
      </g>
    </svg>
  );
}
