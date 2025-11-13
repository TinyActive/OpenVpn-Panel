"use client"

import { DocLayout } from "@/components/doc-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Steps } from "@/components/ui/steps";
import { Server, Download, Shield, CheckCircle2, AlertCircle, Terminal, Lock, Activity, FileCode } from "lucide-react";
import Link from "next/link";

export default function NodeInstallation() {
    return (
        <DocLayout>
            <div className="max-w-4xl">
                <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2">
                        <Server className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight">Cài Đặt OV-Node</h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Hướng dẫn chi tiết cách cài đặt và kết nối Node vào OpenVPN Panel
                    </p>
                </div>

                <Alert className="mb-8 border-primary/50 bg-primary/5">
                    <Server className="h-4 w-4" />
                    <div className="ml-2">
                        <h4 className="font-semibold">Giới thiệu về OV-Node</h4>
                        <p className="text-sm mt-1">
                            OV-Node là dịch vụ backend chạy trên các máy chủ OpenVPN, cho phép Panel quản lý từ xa thông qua REST API.
                            Mỗi Node là một máy chủ OpenVPN độc lập được điều khiển bởi Master Panel.
                        </p>
                    </div>
                </Alert>

                {/* Architecture */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Kiến Trúc Hệ Thống
                        </CardTitle>
                        <CardDescription>
                            Mô hình Master-Node trong hệ thống OpenVPN Panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-50 p-6 rounded-lg border font-mono text-sm">
                            <pre className="text-slate-700">
                                {`┌─────────────────────┐
│   OpenVPN Panel     │ (Master - Quản lý tập trung)
│   (Master Node)     │
└──────────┬──────────┘
           │
           │ REST API (Port 9090)
           │
     ┌─────┴─────┬──────────┬──────────┐
     │           │          │          │
┌────▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
│ OV-Node │ │OV-Node │ │OV-Node │ │OV-Node │
│ Server1 │ │Server2 │ │Server3 │ │Server4 │
└─────────┘ └────────┘ └────────┘ └────────┘`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Yêu Cầu Hệ Thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Server className="h-4 w-4 text-primary" />
                                    Hệ Điều Hành
                                </h4>
                                <ul className="space-y-1 text-sm">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        Ubuntu 20.04/22.04 LTS
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        Debian 10/11
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        CentOS 7/8
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Phần Cứng Tối Thiểu
                                </h4>
                                <ul className="space-y-1 text-sm">
                                    <li><strong>CPU:</strong> 1 vCPU (2 vCPU khuyến nghị)</li>
                                    <li><strong>RAM:</strong> 1GB (2GB khuyến nghị)</li>
                                    <li><strong>Disk:</strong> 10GB dung lượng trống</li>
                                    <li><strong>Network:</strong> Public IP address</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Yêu Cầu Mạng
                            </h4>
                            <ul className="space-y-1 text-sm">
                                <li><strong>Port 1194/UDP:</strong> OpenVPN service</li>
                                <li><strong>Port 9090/TCP:</strong> OV-Node API (có thể tùy chỉnh)</li>
                                <li>Firewall phải cho phép kết nối từ Master Panel</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Installation Steps */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Cài Đặt Tự Động (Khuyến Nghị)
                        </CardTitle>
                        <CardDescription>
                            Script tự động sẽ cài đặt OpenVPN và OV-Node trong vài phút
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Steps
                            steps={[
                                {
                                    title: "Chuẩn bị hệ thống",
                                    description: "Cập nhật và cài đặt các gói cần thiết",
                                    content: (
                                        <div className="space-y-3">
                                            <CodeBlock
                                                language="bash"
                                                code={`sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv wget curl git`}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Tạo API Key ngẫu nhiên (lưu lại để sử dụng sau):
                                            </p>
                                            <CodeBlock
                                                language="bash"
                                                code={`python3 -c "import uuid; print(uuid.uuid4())"
# Output ví dụ: 7f8c9d4e-1a2b-3c4d-5e6f-7a8b9c0d1e2f`}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    title: "Download và chạy script",
                                    description: "Script sẽ tự động cài đặt tất cả",
                                    content: (
                                        <div className="space-y-3">
                                            <CodeBlock
                                                language="bash"
                                                code={`cd /tmp
wget https://node-vpn.nginxwaf.me/install.sh
chmod +x install.sh
sudo bash install.sh`}
                                            />
                                            <Alert className="border-yellow-200 bg-yellow-50">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <div className="ml-2">
                                                    <p className="text-sm font-medium text-yellow-900">Lưu ý</p>
                                                    <p className="text-sm text-yellow-800 mt-1">
                                                        Script sẽ hiển thị menu, chọn option <strong>1. Install OV-Node</strong>
                                                    </p>
                                                </div>
                                            </Alert>
                                        </div>
                                    )
                                },
                                {
                                    title: "Cấu hình OpenVPN",
                                    description: "Trả lời các câu hỏi về cấu hình OpenVPN",
                                    content: (
                                        <div className="space-y-3">
                                            <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
                                                <div>
                                                    <strong>1. Public IP:</strong> Nhấn Enter (auto-detect) hoặc nhập IP của bạn
                                                </div>
                                                <div>
                                                    <strong>2. Protocol:</strong> Chọn <Badge variant="outline">1 (UDP)</Badge> - khuyến nghị
                                                </div>
                                                <div>
                                                    <strong>3. Port:</strong> Nhấn Enter cho port mặc định <Badge variant="outline">1194</Badge>
                                                </div>
                                                <div>
                                                    <strong>4. DNS Server:</strong> Chọn <Badge variant="outline">1 (Current system resolvers)</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    title: "Cấu hình OV-Node",
                                    description: "Nhập thông tin cho OV-Node service",
                                    content: (
                                        <div className="space-y-3">
                                            <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
                                                <div>
                                                    <strong>Service Port:</strong> Nhấn Enter cho port <Badge variant="outline">9090</Badge> hoặc nhập port khác
                                                </div>
                                                <div>
                                                    <strong>API Key:</strong> Nhập UUID đã tạo ở bước 1 hoặc nhấn Enter để tự tạo
                                                </div>
                                            </div>
                                            <Alert className="border-red-200 bg-red-50">
                                                <Lock className="h-4 w-4 text-red-600" />
                                                <div className="ml-2">
                                                    <p className="text-sm font-medium text-red-900">⚠️ Quan trọng</p>
                                                    <p className="text-sm text-red-800 mt-1">
                                                        Lưu lại API Key! Bạn sẽ cần nó khi kết nối Node vào Panel
                                                    </p>
                                                </div>
                                            </Alert>
                                        </div>
                                    )
                                },
                                {
                                    title: "Xác minh cài đặt",
                                    description: "Kiểm tra service đã chạy thành công",
                                    content: (
                                        <div className="space-y-3">
                                            <CodeBlock
                                                language="bash"
                                                code={`# Kiểm tra service status
sudo systemctl status ov-node

# Kiểm tra OpenVPN
sudo systemctl status openvpn-server@server

# Test API
curl -X POST http://localhost:9090/sync/get-status \\
  -H "key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"set_new_setting": false}'`}
                                            />
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                <p className="text-sm font-medium text-green-900">✅ Kết quả mong đợi:</p>
                                                <CodeBlock
                                                    language="json"
                                                    code={`{
  "success": true,
  "msg": "Node status retrieved successfully",
  "data": {
    "status": "running",
    "cpu_usage": 15.2,
    "memory_usage": 45.8
  }
}`}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </CardContent>
                </Card>

                {/* Firewall Configuration */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Cấu Hình Firewall
                        </CardTitle>
                        <CardDescription>
                            Mở các port cần thiết để Panel có thể kết nối
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-primary" />
                                    Ubuntu/Debian (UFW)
                                </h4>
                                <CodeBlock
                                    language="bash"
                                    code={`# Mở port OV-Node API
sudo ufw allow 9090/tcp

# Mở port OpenVPN
sudo ufw allow 1194/udp

# Bật firewall
sudo ufw enable

# Kiểm tra
sudo ufw status`}
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-primary" />
                                    CentOS/RHEL (firewalld)
                                </h4>
                                <CodeBlock
                                    language="bash"
                                    code={`# Mở port OV-Node API
sudo firewall-cmd --permanent --add-port=9090/tcp

# Mở port OpenVPN
sudo firewall-cmd --permanent --add-port=1194/udp

# Reload firewall
sudo firewall-cmd --reload

# Kiểm tra
sudo firewall-cmd --list-all`}
                                />
                            </div>
                            <Alert className="border-blue-200 bg-blue-50">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-blue-900">Cloud Provider</p>
                                    <p className="text-sm text-blue-800 mt-1">
                                        Nếu Node chạy trên cloud (AWS, GCP, Azure), bạn cũng cần mở port trên Security Group:
                                    </p>
                                    <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                                        <li>• TCP Port 9090 từ IP của Panel</li>
                                        <li>• UDP Port 1194 từ 0.0.0.0/0 (cho VPN clients)</li>
                                    </ul>
                                </div>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>

                {/* Connect to Panel */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            Kết Nối Node Vào Panel
                        </CardTitle>
                        <CardDescription>
                            Sau khi cài đặt thành công, thêm Node vào Panel để quản lý
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Steps
                            steps={[
                                {
                                    title: "Lấy thông tin Node",
                                    description: "Thu thập thông tin cần thiết từ Node",
                                    content: (
                                        <div className="space-y-3">
                                            <CodeBlock
                                                language="bash"
                                                code={`# Public IP
curl ifconfig.me

# API Key
sudo cat /opt/ov-node/.env | grep API_KEY

# Service Port
sudo cat /opt/ov-node/.env | grep SERVICE_PORT`}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    title: "Truy cập Panel",
                                    description: "Đăng nhập vào OpenVPN Panel",
                                    content: (
                                        <div className="space-y-2">
                                            <p className="text-sm">Truy cập Panel tại: <code className="bg-slate-100 px-2 py-1 rounded">http://your-panel-domain/</code></p>
                                            <p className="text-sm">Vào menu <strong>Node Management</strong></p>
                                        </div>
                                    )
                                },
                                {
                                    title: "Thêm Node mới",
                                    description: "Điền thông tin Node và test kết nối",
                                    content: (
                                        <div className="space-y-3">
                                            <p className="text-sm">Click nút <strong>Add Node</strong> và điền thông tin:</p>
                                            <div className="bg-slate-50 p-4 rounded-lg border space-y-2 text-sm">
                                                <div><strong>Node Name:</strong> Tên hiển thị (VD: VN-HCM-01)</div>
                                                <div><strong>Node IP/Domain:</strong> IP hoặc domain công khai</div>
                                                <div><strong>Port:</strong> 9090 (hoặc port bạn đã cấu hình)</div>
                                                <div><strong>API Key:</strong> Key từ file .env của Node</div>
                                                <div><strong>Location:</strong> Vị trí địa lý (tùy chọn)</div>
                                                <div><strong>Max Users:</strong> Số user tối đa (tùy chọn)</div>
                                            </div>
                                            <Alert className="border-green-200 bg-green-50">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <div className="ml-2">
                                                    <p className="text-sm text-green-800">
                                                        Click <strong>Test Connection</strong> trước khi lưu để đảm bảo kết nối thành công
                                                    </p>
                                                </div>
                                            </Alert>
                                        </div>
                                    )
                                },
                                {
                                    title: "Xác minh hoạt động",
                                    description: "Kiểm tra Node đã kết nối thành công",
                                    content: (
                                        <div className="space-y-2">
                                            <p className="text-sm">Sau khi lưu, kiểm tra:</p>
                                            <ul className="space-y-1 text-sm ml-4">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    Node hiển thị status "Online"
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    CPU và RAM được cập nhật
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                    Thử tạo một user test
                                                </li>
                                            </ul>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tiếp Theo</CardTitle>
                        <CardDescription>
                            Tìm hiểu thêm về quản lý và vận hành Node
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <Link href="/node-api" className="block">
                                <div className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileCode className="h-5 w-5 text-primary" />
                                        <div>
                                            <h4 className="font-semibold">API Reference</h4>
                                            <p className="text-sm text-muted-foreground">Chi tiết về các API endpoints của Node</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/node-management" className="block">
                                <div className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Server className="h-5 w-5 text-primary" />
                                        <div>
                                            <h4 className="font-semibold">Quản Lý Node</h4>
                                            <p className="text-sm text-muted-foreground">Hướng dẫn quản lý và giám sát Node</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/node-troubleshooting" className="block">
                                <div className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-primary" />
                                        <div>
                                            <h4 className="font-semibold">Xử Lý Sự Cố</h4>
                                            <p className="text-sm text-muted-foreground">Giải quyết các vấn đề thường gặp</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DocLayout>
    );
}
