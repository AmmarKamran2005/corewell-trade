import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The Corewell Systems mark — the brand asset itself, not a redrawing of it.
 *
 * The artwork is a fixed teal on transparency, so on the dark navy shells it
 * sits at roughly 2.9:1 against the background. A filter lifts it there rather
 * than recolouring it, which keeps every surface showing the same logo.
 */
export function BrandMark({
  className,
  size = 32,
  onDark = false,
}: {
  className?: string;
  /** Rendered square, in CSS pixels. */
  size?: number;
  /** Set on permanently dark surfaces — the till chrome, the login panel. */
  onDark?: boolean;
}) {
  return (
    <Image
      src="/corewell-mark.png"
      alt="Corewell Systems"
      width={size}
      height={size}
      priority
      className={cn(
        "shrink-0 object-contain",
        onDark
          ? "brightness-[1.45] saturate-[1.25]"
          : "dark:brightness-[1.45] dark:saturate-[1.25]",
        className
      )}
    />
  );
}
