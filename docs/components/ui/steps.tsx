import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepProps {
    number: number;
    title: string;
    description?: string;
    children?: React.ReactNode;
    isLast?: boolean;
}

export function Step({ number, title, description, children, isLast }: StepProps) {
    return (
        <div className="relative pb-8">
            {!isLast && (
                <div className="absolute left-5 top-11 h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
            )}
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 font-bold">
                        {number}
                    </div>
                </div>
                <div className="flex-1 pt-1">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
                    {description && <p className="text-slate-600 mb-3 leading-relaxed">{description}</p>}
                    {children && <div className="space-y-2">{children}</div>}
                </div>
            </div>
        </div>
    );
}

interface StepItemProps {
    title: string;
    description?: string;
    content?: React.ReactNode;
}

interface StepsProps {
    steps?: StepItemProps[];
    children?: React.ReactNode;
    className?: string;
}

export function Steps({ steps, children, className }: StepsProps) {
    // If steps array is provided, use it
    if (steps && steps.length > 0) {
        return (
            <div className={cn("my-8 rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6", className)}>
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        number={index + 1}
                        title={step.title}
                        description={step.description}
                        isLast={index === steps.length - 1}
                    >
                        {step.content}
                    </Step>
                ))}
            </div>
        );
    }

    // Otherwise, use children (old behavior)
    const childrenArray = React.Children.toArray(children);
    const stepsWithLastProp = React.Children.map(childrenArray, (child, index) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                isLast: index === childrenArray.length - 1,
                number: index + 1
            } as any);
        }
        return child;
    });

    return (
        <div className={cn("my-8 rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6", className)}>
            {stepsWithLastProp}
        </div>
    );
}

interface FeatureListProps {
    items: Array<{
        icon?: React.ReactNode;
        title: string;
        description: string;
    }>;
}

export function FeatureList({ items }: FeatureListProps) {
    return (
        <div className="my-8 grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="flex gap-3 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                    {item.icon ? (
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary">
                                {item.icon}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/20">
                                <Check className="h-5 w-5" />
                            </div>
                        </div>
                    )}
                    <div>
                        <h5 className="font-semibold text-slate-800 mb-1">{item.title}</h5>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
