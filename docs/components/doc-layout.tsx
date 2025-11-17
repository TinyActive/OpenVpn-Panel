"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { BookOpen, Users, Server, Settings, Download, Github, Menu, FileCode, AlertCircle, Cloud, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
    {
        title: "Panel (Master Node)",
        items: [
            { title: "Cài đặt Panel", href: "/installation", icon: Download },
            { title: "Quản lý người dùng", href: "/user-management", icon: Users },
            { title: "Quản lý Node", href: "/node-management", icon: Server },
            { title: "Cài đặt hệ thống", href: "/settings", icon: Settings },
        ],
    },
    {
        title: "OV-Node (Worker Node)",
        items: [
            { title: "Cài đặt Node", href: "/node-installation", icon: Download },
            { title: "API Reference", href: "/node-api", icon: FileCode },
            { title: "Xử lý sự cố", href: "/node-troubleshooting", icon: AlertCircle },
        ],
    },
    {
        title: "White-Label System",
        items: [
            { title: "Giới thiệu", href: "/white-label/introduction", icon: BookOpen },
            { title: "Cài đặt Super Admin", href: "/white-label/installation", icon: Download },
            { title: "Quản lý Instances", href: "/white-label/instance-management", icon: Server },
            { title: "Quản lý CLI", href: "/white-label/cli-management", icon: Terminal },
            { title: "Systemd Services", href: "/white-label/systemd-services", icon: Settings },
            { title: "Xử lý sự cố", href: "/white-label/troubleshooting", icon: AlertCircle },
        ],
    },
    {
        title: "Cấu hình nâng cao",
        items: [
            { title: "R2 Storage", href: "/r2-storage", icon: Cloud },
        ],
    },
];

export function DocLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 p-1.5 group-hover:scale-105 transition-transform">
                            <Image src="/logo.png" alt="OV-Panel" fill className="object-contain p-0.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                                OV-Panel
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">Documentation</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="https://github.com/TinyActive/OpenVpn-Panel"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-2">
                                <Github className="h-4 w-4" />
                                <span className="hidden sm:inline">GitHub</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container flex-1">
                <div className="flex gap-10 py-10">
                    {/* Sidebar */}
                    <aside className="w-64 shrink-0 hidden lg:block">
                        <div className="sticky top-24 bg-white/50 backdrop-blur-sm rounded-xl border shadow-sm p-4">
                            <ScrollArea className="h-[calc(100vh-8rem)] pr-2">
                                <div className="space-y-6">
                                    {navigation.map((section) => (
                                        <div key={section.title}>
                                            <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-slate-500 px-3">{section.title}</h4>
                                            <ul className="space-y-0.5">
                                                {section.items.map((item) => {
                                                    const Icon = item.icon;
                                                    const isActive = pathname === item.href;
                                                    return (
                                                        <li key={item.href}>
                                                            <Link
                                                                href={item.href}
                                                                className={cn(
                                                                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all font-medium",
                                                                    isActive
                                                                        ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/20"
                                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                                )}
                                                            >
                                                                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                                                                <span>{item.title}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <article className="prose prose-slate max-w-none
              prose-headings:scroll-mt-24 
              prose-headings:font-bold
              
              prose-h1:text-5xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:pb-6 prose-h1:border-b-4 prose-h1:border-gradient-to-r prose-h1:from-primary prose-h1:to-blue-600 prose-h1:bg-gradient-to-r prose-h1:from-slate-900 prose-h1:to-slate-700 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:leading-tight
              
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:text-slate-800 prose-h2:flex prose-h2:items-center prose-h2:gap-3
              prose-h2:before:content-[''] prose-h2:before:h-8 prose-h2:before:w-1.5 prose-h2:before:bg-gradient-to-b prose-h2:before:from-primary prose-h2:before:to-blue-600 prose-h2:before:rounded-full
              
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-slate-700 prose-h3:font-bold prose-h3:flex prose-h3:items-center prose-h3:gap-2
              prose-h3:before:content-['▸'] prose-h3:before:text-primary prose-h3:before:text-xl
              
              prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-slate-600 prose-h4:font-semibold prose-h4:italic
              
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-5 prose-p:text-[15px]
              
              prose-ul:my-6 prose-ul:space-y-3
              prose-ol:my-6 prose-ol:space-y-3
              
              prose-li:my-0 prose-li:pl-2 prose-li:relative prose-li:text-slate-700
              prose-li:marker:text-primary prose-li:marker:font-bold
              
              prose-code:text-sm prose-code:bg-gradient-to-r prose-code:from-primary/10 prose-code:to-blue-600/10 prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-[''] prose-code:border prose-code:border-primary/20 prose-code:font-semibold
              
              prose-pre:!bg-gradient-to-br prose-pre:!from-slate-900 prose-pre:!to-slate-800 prose-pre:!text-slate-50 prose-pre:!p-0 prose-pre:!rounded-xl prose-pre:!overflow-hidden prose-pre:!shadow-2xl prose-pre:!border prose-pre:!border-slate-700 prose-pre:my-8
              
              prose-strong:font-bold prose-strong:text-slate-900 prose-strong:bg-gradient-to-r prose-strong:from-slate-900 prose-strong:to-slate-700 prose-strong:bg-clip-text prose-strong:text-transparent
              
              prose-a:text-primary prose-a:no-underline prose-a:font-semibold prose-a:decoration-primary/30 prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:underline hover:prose-a:decoration-primary prose-a:transition-all
              
              [&_.lead]:text-xl [&_.lead]:text-slate-500 [&_.lead]:font-normal [&_.lead]:leading-relaxed [&_.lead]:mb-12 [&_.lead]:border-l-4 [&_.lead]:border-primary/30 [&_.lead]:pl-6 [&_.lead]:italic
            ">
                            {children}
                        </article>
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t bg-gradient-to-b from-white to-slate-50 py-12 mt-20">
                <div className="container">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-2">
                                <Image src="/logo.png" alt="OV-Panel" fill className="object-contain p-0.5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    OV-Panel Documentation
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    © 2025 Made with ❤️ by TinyActive
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                                Trang chủ
                            </Link>
                            <Link
                                href="https://github.com/TinyActive/OpenVpn-Panel"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                <Github className="h-4 w-4" />
                                GitHub
                            </Link>
                            <Link
                                href="https://github.com/TinyActive/OpenVpn-Panel/blob/main/LICENSE"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                License
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
