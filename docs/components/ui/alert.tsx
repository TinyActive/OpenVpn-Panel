import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Lightbulb } from "lucide-react"

const alertVariants = cva(
    "relative w-full rounded-xl border-2 p-5 [&>svg]:absolute [&>svg]:left-5 [&>svg]:top-5 [&>svg~*]:pl-10 my-6 shadow-lg",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground border-border",
                info: "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-900 [&>svg]:text-blue-600 shadow-blue-100",
                success: "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 [&>svg]:text-green-600 shadow-green-100",
                warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 text-yellow-900 [&>svg]:text-yellow-600 shadow-yellow-100",
                error: "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 text-red-900 [&>svg]:text-red-600 shadow-red-100",
                tip: "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-900 [&>svg]:text-purple-600 shadow-purple-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => {
    const Icon = variant === "success" ? CheckCircle2
        : variant === "warning" ? AlertTriangle
            : variant === "error" ? AlertCircle
                : variant === "tip" ? Lightbulb
                    : Info;

    return (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        >
            <Icon className="h-5 w-5" />
            <div className="text-sm leading-relaxed [&>p]:!my-0 [&>p]:leading-relaxed">{children}</div>
        </div>
    )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-2 font-bold text-base leading-none tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
