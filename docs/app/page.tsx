import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, Download, Shield, Activity, Settings, Github, BookOpen, Zap, Cloud } from "lucide-react";
import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="relative h-10 w-10">
                                <Image src="/logo.png" alt="OV-Panel" fill className="object-contain" />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                OV-Panel
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="#documentation" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Documentation
                        </Link>
                        <Link
                            href="https://github.com/TinyActive/OpenVpn-Panel"
                            target="_blank"
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            GitHub
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Open Source & Free</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            Modern{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                OpenVPN
                            </span>
                            <br />
                            Management Panel
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Giao diện web mạnh mẽ và trực quan để quản lý máy chủ và người dùng OpenVPN.
                            Được xây dựng với FastAPI và React để đảm bảo độ tin cậy và hiệu suất.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/installation">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Bắt đầu ngay
                                </Button>
                            </Link>
                            <Link href="/user-management">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                                    Xem tài liệu
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-8">
                            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-cyan-500/10" />
                                <Image
                                    src="/panel.png"
                                    alt="OV-Panel Dashboard"
                                    width={1200}
                                    height={600}
                                    className="relative w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50/50">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tính năng nổi bật
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Mọi thứ bạn cần để quản lý hạ tầng OpenVPN của mình
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Quản lý người dùng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Tạo, chỉnh sửa và quản lý người dùng OpenVPN dễ dàng. Kiểm soát quyền truy cập, đặt ngày hết hạn và quản lý thông tin đăng nhập.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                                    <Server className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Hỗ trợ đa node</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Quản lý nhiều máy chủ OpenVPN từ một giao diện. Tự động đồng bộ người dùng trên tất cả các node.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                                    <Activity className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Giám sát sức khỏe</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Giám sát theo thời gian thực sức khỏe và hiệu suất máy chủ. Nhận cảnh báo ngay khi node offline.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                                    <Download className="h-6 w-6 text-cyan-600" />
                                </div>
                                <CardTitle>Quản lý cấu hình</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Tải xuống cấu hình client chỉ với một cú click. Hỗ trợ nhiều định dạng cấu hình khác nhau.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle>Xác thực an toàn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Xác thực dựa trên JWT với hỗ trợ API key. Kiểm soát truy cập dựa trên vai trò cho quản trị viên.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                                    <Settings className="h-6 w-6 text-pink-600" />
                                </div>
                                <CardTitle>Cấu hình dễ dàng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="leading-relaxed">
                                    Quy trình thiết lập đơn giản với trình cài đặt tự động. Quản lý cài đặt toàn diện.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Documentation Section */}
            <section id="documentation" className="py-24">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Tài liệu hướng dẫn
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Học cách sử dụng OV-Panel hiệu quả
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Panel Documentation */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Server className="h-5 w-5 text-primary" />
                                Master Panel (Panel quản lý)
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Link href="/installation" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                                                <Download className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Cài đặt Panel
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Hướng dẫn cài đặt và cấu hình Master Panel
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/user-management" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Quản lý người dùng
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Hướng dẫn quản lý người dùng và tải cấu hình
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/node-management" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                                <Server className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Quản lý Node
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Hướng dẫn thêm và quản lý các node
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/settings" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                                                <Settings className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Cài đặt hệ thống
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Cấu hình cài đặt hệ thống và tùy chỉnh
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </div>

                        {/* Node Documentation */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                OV-Node (Worker Node)
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Link href="/node-installation" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-4">
                                                <Download className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Cài đặt Node
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Hướng dẫn cài đặt và kết nối Node vào Panel
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/node-api" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                                                <BookOpen className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                API Reference
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Tài liệu API endpoints của Node
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/node-troubleshooting" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                                                <Shield className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                Xử lý sự cố
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Giải quyết các vấn đề thường gặp với Node
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </div>

                        {/* Advanced Configuration */}
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Cloud className="h-5 w-5 text-primary" />
                                Cấu hình nâng cao
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Link href="/r2-storage" className="group">
                                    <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-lg">
                                        <CardHeader>
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4">
                                                <Cloud className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                R2 Storage
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                Tích hợp Cloudflare R2 để lưu trữ file cấu hình
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */
            <footer className="relative border-t py-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/50 -z-10" />
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative h-8 w-8">
                                    <Image
                                        src="/logo.png"
                                        alt="OV-Panel Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    OV-Panel
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Giải pháp quản lý OpenVPN mạnh mẽ và dễ sử dụng
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/installation" className="text-muted-foreground hover:text-primary transition-colors">
                                        Cài đặt
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/user-management" className="text-muted-foreground hover:text-primary transition-colors">
                                        Quản lý người dùng
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/node-management" className="text-muted-foreground hover:text-primary transition-colors">
                                        Quản lý Node
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                                        Cài đặt hệ thống
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/r2-storage" className="text-muted-foreground hover:text-primary transition-colors">
                                        R2 Storage
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Tài nguyên</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link
                                        href="https://github.com/TinyActive/OpenVpn-Panel"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#documentation" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Tài liệu
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                        <p>© 2025 OV-Panel. Fork bởi TinyActive. Tác phẩm gốc của primeZdev.</p>
                        <p className="mt-1">Mã nguồn mở theo giấy phép MIT.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
