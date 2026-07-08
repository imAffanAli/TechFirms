import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        brand: "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
        verified: "bg-brand-600 text-white",
        ai: "bg-violet-600 text-white",
        sponsored: "border border-warning text-warning",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
