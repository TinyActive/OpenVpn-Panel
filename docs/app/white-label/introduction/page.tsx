import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Database, Server, Shield, Zap, GitBranch, Box, Users, CheckCircle } from "lucide-react";

export default function WhiteLabelIntroductionPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Giới thiệu White-Label System</h1>
                <Badge variant="info">Overview</Badge>
            </div>

            <p className="lead">
                Hệ thống White-Label OV-Panel cho phép bạn triển khai và quản lý nhiều instances độc lập của OV-Panel,
                mỗi instance phục vụ cho một khách hàng hoặc tổ chức khác nhau từ một Super Admin Panel duy nhất.
            </p>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Lưu ý:</strong> White-Label System là tính năng nâng cao dành cho việc triển khai multi-tenant.
                    Nếu bạn chỉ cần một panel đơn giản, hãy sử dụng chế độ Standalone Panel thông thường.
                </AlertDescription>
            </Alert>

            <h2>Đặc điểm chính</h2>

            <div className="grid md:grid-cols-2 gap-6 my-8">
                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                                <Layers className="h-5 w-5" />
                            </div>
                            <CardTitle className="!mt-0">Process Isolation</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Mỗi instance chạy như một process riêng biệt, được quản lý bởi systemd service độc lập.
                            Đảm bảo sự cô lập và ổn định giữa các instances.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                                <Database className="h-5 w-5" />
                            </div>
                            <CardTitle className="!mt-0">Database Isolation</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Mỗi instance có database SQLite độc lập, đảm bảo dữ liệu của các khách hàng
                            được tách biệt hoàn toàn và bảo mật tuyệt đối.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                                <Server className="h-5 w-5" />
                            </div>
                            <CardTitle className="!mt-0">Port Management</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Mỗi instance chạy trên port riêng (9001-9999), cho phép truy cập độc lập
                            và dễ dàng cấu hình reverse proxy hoặc SSL.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                                <GitBranch className="h-5 w-5" />
                            </div>
                            <CardTitle className="!mt-0">Shared Codebase</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Tất cả instances dùng chung source code qua symlinks, giúp tiết kiệm disk space
                            và dễ dàng update toàn bộ hệ thống chỉ bằng một lần.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h2>Mô hình triển khai</h2>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-8 my-8">
                <CodeBlock
                    code={`┌─────────────────────────────────────────────────────────┐
│          Super Admin Panel (Main Panel)                 │
│          Port: 9000 (mặc định)                          │
│          Database: /opt/ov-panel/data/ov-panel.db      │
│          Quản lý: Tất cả White-Label Instances         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ quản lý
                          ▼
    ┌─────────────────────────────────────────────────────┐
    │         White-Label Instances Directory             │
    │         /opt/ov-panel-instances/                    │
    └─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Instance A        Instance B        Instance C
   Port: 9001       Port: 9002        Port: 9003
   Customer A       Customer B        Customer C`}
                    language="text"
                    title="Kiến trúc hệ thống"
                />
            </div>

            <h2>Yêu cầu hệ thống</h2>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Phần cứng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="font-semibold mb-2">Tối thiểu</div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• CPU: 2 cores</li>
                                <li>• RAM: 2GB</li>
                                <li>• Disk: 10GB SSD</li>
                                <li>• Network: 1 IP công cộng</li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Khuyến nghị</div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>• CPU: 4+ cores</li>
                                <li>• RAM: 4GB+</li>
                                <li>• Disk: 20GB+ SSD</li>
                                <li>• Network: Băng thông ổn định</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="h-5 w-5" />
                            Phần mềm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <Badge variant="outline" className="mb-2">OS</Badge>
                                <p className="text-muted-foreground">Ubuntu 20.04/22.04 LTS hoặc Debian 10/11</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-2">Python</Badge>
                                <p className="text-muted-foreground">Python 3.8 trở lên</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-2">Systemd</Badge>
                                <p className="text-muted-foreground">Hỗ trợ systemd service management</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-2">Quyền truy cập</Badge>
                                <p className="text-muted-foreground">Cần quyền root để cài đặt</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2>Ports yêu cầu</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Service</th>
                            <th className="text-left p-3">Port Range</th>
                            <th className="text-left p-3">Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3"><Badge>Super Admin Panel</Badge></td>
                            <td className="p-3"><code>9000</code></td>
                            <td className="p-3">Port mặc định cho Main Panel</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><Badge variant="secondary">Instances</Badge></td>
                            <td className="p-3"><code>9001-9999</code></td>
                            <td className="p-3">Port range cho White-Label instances</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><Badge variant="outline">OpenVPN (optional)</Badge></td>
                            <td className="p-3"><code>1194/UDP</code></td>
                            <td className="p-3">Nếu instance có OpenVPN</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>Các bước triển khai tổng quan</h2>

            <div className="space-y-4 my-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</div>
                            <CardTitle className="!mt-0">Cài đặt Super Admin Panel</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Cài đặt panel chính với chế độ Super Admin để quản lý tập trung tất cả instances.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">2</div>
                            <CardTitle className="!mt-0">Khởi tạo hệ thống White-Label</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Tạo shared directory, symlinks và systemd service template cho instances.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">3</div>
                            <CardTitle className="!mt-0">Tạo và quản lý Instances</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Tạo instances mới cho từng khách hàng qua Web UI hoặc CLI với cấu hình riêng biệt.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">4</div>
                            <CardTitle className="!mt-0">Monitoring và Maintenance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Theo dõi health check, logs và thực hiện backup định kỳ để đảm bảo hệ thống ổn định.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Alert variant="tip">
                <AlertDescription>
                    <strong>Tiếp theo:</strong> Bắt đầu với việc <a href="/white-label/installation" className="text-primary underline">cài đặt Super Admin Panel</a> để triển khai hệ thống White-Label.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
