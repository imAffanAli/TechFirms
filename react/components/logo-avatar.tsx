import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Company logo, or a brand-tinted initials tile when no logo is available. */
export function LogoAvatar({ name, logoUrl, size = 48, className }: { name: string; logoUrl?: string | null; size?: number; className?: string }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={`${name} logo`} width={size} height={size} className={cn("rounded-lg object-contain", className)} style={{ width: size, height: size }} />;
  }
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-lg bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
