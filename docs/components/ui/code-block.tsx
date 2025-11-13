"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
    showLineNumbers?: boolean;
    className?: string;
}

export function CodeBlock({
    code,
    language = "bash",
    title,
    showLineNumbers = false,
    className
}: CodeBlockProps) {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split('\n');

    return (
        <div className={cn("my-8 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl", className)}>
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    {title && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <Terminal className="h-4 w-4" />
                            <span>{title}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
                <pre className="!bg-transparent !m-0 p-6 overflow-x-auto">
                    <code className="text-sm font-mono text-slate-100 leading-relaxed">
                        {showLineNumbers ? (
                            <table className="w-full border-collapse">
                                <tbody>
                                    {lines.map((line, i) => (
                                        <tr key={i}>
                                            <td className="pr-4 text-right text-slate-600 select-none w-8">
                                                {i + 1}
                                            </td>
                                            <td className="text-slate-100">{line || '\n'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            code
                        )}
                    </code>
                </pre>
            </div>
        </div>
    );
}

interface InlineCodeProps {
    children: string;
    className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
    return (
        <code className={cn(
            "relative rounded-md bg-gradient-to-r from-primary/10 to-blue-600/10 px-2 py-1 font-mono text-sm font-semibold text-primary border border-primary/20",
            className
        )}>
            {children}
        </code>
    );
}
