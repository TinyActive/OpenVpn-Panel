import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                success:
                    "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30",
                warning:
                    "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md shadow-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/30",
                destructive:
                    "border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-destructive-foreground shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30",
                outline: "text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                info:
                    "border-transparent bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
