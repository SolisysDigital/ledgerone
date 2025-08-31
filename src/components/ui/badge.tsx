import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = (props: { variant?: string } = {}) => {
  const baseClasses = "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    success: "border-transparent bg-success/10 text-success border-success/20 hover:bg-success/20",
    warning: "border-transparent bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
  };
  
  const variant = props.variant || "default";
  return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default}`.trim();
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 