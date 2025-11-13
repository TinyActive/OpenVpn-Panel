import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Steps, Step, FeatureList } from "@/components/ui/steps";
import { Server, HardDrive, Cpu, Wifi, Shield, Clock, Terminal, Package } from "lucide-react";

export default function InstallationPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Hướng dẫn cài đặt</h1>
                <Badge variant="info">Quick Start</Badge>
            </div>

            <p className="lead">
                Triển khai OV-Panel lên máy chủ của bạn chỉ trong vài phút với hướng dẫn từng bước chi tiết và dễ dàng.
            </p>

            <h2>Yêu cầu hệ thống</h2>
            <p>Đảm bảo môi trường máy chủ đáp ứng các yêu cầu sau trước khi bắt đầu quá trình cài đặt:</p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <Server className="h-5 w-5" />
                        </div>
                        <h3 className="!mt-0 !mb-0 !before:content-none text-xl">Hệ điều hành</h3>
                    </div>
                    <ul className="space-y-2 [&>li]:!pl-0 [&>li]:before:content-none">
                        <li className="flex items-start gap-2">
                            <Badge variant="success" className="mt-0.5">Ubuntu</Badge>
                            <span className="text-sm text-slate-600">20.04 LTS, 22.04 LTS, 24.04 LTS</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Badge variant="success" className="mt-0.5">Debian</Badge>
                            <span className="text-sm text-slate-600">11 (Bullseye), 12 (Bookworm)</span>
                        </li>
                    </ul>
                </div>

                <div className="rounded-xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <h3 className="!mt-0 !mb-0 !before:content-none text-xl">Phần cứng</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">CPU</span>
                            <Badge variant="outline">1+ vCPU</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">RAM</span>
                            <Badge variant="outline">1GB+ (2GB khuyến nghị)</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Storage</span>
                            <Badge variant="outline">10GB+ SSD</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Network</span>
                            <Badge variant="outline">Public IP</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Ports cần mở:</strong> Đảm bảo firewall cho phép traffic đến port <code>8443</code> (Panel HTTPS), <code>1194</code> (OpenVPN UDP/TCP), và <code>443</code> (OpenVPN TCP alternative).
                </AlertDescription>
            </Alert>

            <h2>Cài đặt tự động</h2>
            <p>Phương pháp được khuyến nghị - sử dụng script tự động để triển khai toàn bộ hệ thống:</p>

            <Steps>
                <Step
                    number={1}
                    title="Clone repository từ GitHub"
                    description="Tải source code của OV-Panel về máy chủ:"
                >
                    <CodeBlock
                        code={`wget https://ovpanel.nginxwaf.me/install.sh -O install.sh && chmod +x install.sh`}
                        title="Terminal"
                        language="bash"
                    />
                </Step>

                <Step
                    number={2}
                    title="Chạy installer script"
                    description="Thực thi script cài đặt tự động với quyền root:"
                >
                    <CodeBlock
                        code="sudo bash install.sh"
                        title="Terminal"
                        language="bash"
                    />
                    <Alert variant="tip" className="mt-4">
                        <AlertDescription>
                            <strong>Thời gian cài đặt:</strong> Quá trình thường mất 5-10 phút tùy theo tốc độ server và kết nối internet. Script sẽ tự động cài đặt tất cả dependencies.
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={3}
                    title="Hoàn tất và truy cập Panel"
                    description="Sau khi cài đặt xong, truy cập panel qua trình duyệt:"
                >
                    <CodeBlock
                        code="https://your-server-ip:9090"
                        title="URL"
                        language="text"
                    />
                    <Alert variant="warning" className="mt-4">
                        <AlertDescription>
                            <strong>SSL Certificate:</strong> Panel sử dụng self-signed certificate nên trình duyệt sẽ cảnh báo. Nhấp "Advanced" → "Proceed" để tiếp tục. Cấu hình Let's Encrypt cho production.
                        </AlertDescription>
                    </Alert>
                </Step>
            </Steps>

            <h3>Script tự động thực hiện</h3>
            <FeatureList items={[
                {
                    icon: <Package className="h-5 w-5" />,
                    title: "Cài đặt Dependencies",
                    description: "Python 3, pip, Node.js, npm, OpenVPN và các package cần thiết"
                },
                {
                    icon: <Server className="h-5 w-5" />,
                    title: "Cấu hình OpenVPN",
                    description: "Thiết lập OpenVPN server với cấu hình tối ưu và certificates"
                },
                {
                    icon: <HardDrive className="h-5 w-5" />,
                    title: "Setup Database",
                    description: "Tạo SQLite database và chạy migrations tự động"
                },
                {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Certificates",
                    description: "Generate self-signed certificates cho openvpn"
                }
            ]} />

            <h2>Cấu hình Backend</h2>
            <p>Tùy chỉnh thông số hoạt động của panel thông qua file cấu hình chính:</p>

            <CodeBlock
                code={`class Config:
    # Server settings
    HOST = "0.0.0.0"
    PORT = 8443
    
    # SSL certificates
    SSL_CERT = "certs/server.crt"
    SSL_KEY = "certs/server.key"
    
    # Database
    DATABASE_URL = "sqlite:///data/ovpanel.db"
    
    # JWT authentication
    SECRET_KEY = "your-secure-secret-key-here-change-this"
    JWT_EXPIRATION = 86400  # 24 hours in seconds
    
    # Node health monitoring
    HEALTH_CHECK_INTERVAL = 300  # 5 minutes`}
                title="backend/config.py"
                language="python"
                showLineNumbers
            />

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Bảo mật quan trọng:</strong> Thay đổi <code>SECRET_KEY</code> thành một chuỗi ngẫu nhiên mạnh để bảo vệ JWT tokens. Không sử dụng giá trị mặc định trong production!
                </AlertDescription>
            </Alert>

            <h2>Cài đặt thủ công</h2>
            <p>Nếu muốn kiểm soát chi tiết từng bước, bạn có thể cài đặt thủ công thay vì dùng script:</p>

            <h3>Bước 1: Cài đặt System Dependencies</h3>
            <CodeBlock
                code={`# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv \\
  openvpn easy-rsa nodejs npm git sqlite3

# CentOS/Rocky Linux
sudo dnf update -y
sudo dnf install -y python3 python3-pip \\
  openvpn easy-rsa nodejs npm git sqlite`}
                title="Terminal"
                language="bash"
            />

            <h3>Bước 2: Setup Python Environment</h3>
            <CodeBlock
                code={`cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt`}
                title="Terminal"
                language="bash"
            />

            <h3>Bước 3: Initialize Database</h3>
            <CodeBlock
                code={`# Run database migrations
alembic upgrade head

# Create admin user (interactive)
python -c "from db.crud import create_admin; \\
  create_admin('admin', 'YourSecurePassword123!')"

# Verify database
sqlite3 data/ovpanel.db ".tables"`}
                title="Terminal"
                language="bash"
            />

            <h3>Bước 4: Build Frontend</h3>
            <CodeBlock
                code={`cd ../frontend
npm install
npm run build
npm run preview  # Test the build`}
                title="Terminal"
                language="bash"
            />

            <h3>Bước 5: Configure Systemd Service</h3>
            <CodeBlock
                code={`[Unit]
Description=OV-Panel Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/OpenVpn-Panel/backend
Environment="PATH=/opt/OpenVpn-Panel/backend/venv/bin"
ExecStart=/opt/OpenVpn-Panel/backend/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`}
                title="/etc/systemd/system/ov-panel.service"
                language="ini"
                showLineNumbers
            />

            <CodeBlock
                code={`# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ov-panel
sudo systemctl start ov-panel
sudo systemctl status ov-panel`}
                title="Terminal"
                language="bash"
            />

            <h2>Xác minh cài đặt</h2>
            <p>Kiểm tra xem tất cả components đã hoạt động chính xác:</p>

            <FeatureList items={[
                {
                    title: "Panel Web Access",
                    description: "Có thể truy cập panel qua HTTPS và đăng nhập thành công với tài khoản admin"
                },
                {
                    title: "Dashboard Display",
                    description: "Dashboard hiển thị đầy đủ thông tin thống kê và không có lỗi"
                },
                {
                    title: "User Management",
                    description: "Có thể tạo, chỉnh sửa và xóa người dùng VPN một cách bình thường"
                },
                {
                    title: "Node Management",
                    description: "Có thể thêm node và kiểm tra health status thành công"
                },
                {
                    title: "OpenVPN Service",
                    description: "Service OpenVPN đang chạy: systemctl status openvpn@server"
                },
                {
                    title: "Backend API",
                    description: "Backend API responding correctly: curl -k https://localhost:8443/api/health"
                }
            ]} />

            <Alert variant="success">
                <AlertDescription>
                    <strong>🎉 Hoàn tất cài đặt!</strong> OV-Panel đã sẵn sàng. Bước tiếp theo: Thêm node đầu tiên và bắt đầu tạo người dùng VPN.
                </AlertDescription>
            </Alert>

            <h2>Khắc phục sự cố</h2>
            <p>Các vấn đề thường gặp và cách giải quyết nhanh chóng:</p>

            <div className="space-y-6 my-8">
                <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6">
                    <h4 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Panel không thể truy cập
                    </h4>
                    <ul className="space-y-2 [&>li]:!pl-0 [&>li]:before:content-none text-sm text-red-800">
                        <li>✓ Kiểm tra firewall: <code>sudo ufw status</code></li>
                        <li>✓ Xem logs backend: <code>sudo journalctl -u ov-panel -f</code></li>
                        <li>✓ Verify port listening: <code>sudo netstat -tlnp | grep 8443</code></li>
                        <li>✓ Check service status: <code>sudo systemctl status ov-panel</code></li>
                    </ul>
                </div>

                <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
                    <h4 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Database errors
                    </h4>
                    <ul className="space-y-2 [&>li]:!pl-0 [&>li]:before:content-none text-sm text-yellow-800">
                        <li>✓ Chạy lại migrations: <code>cd backend && alembic upgrade head</code></li>
                        <li>✓ Kiểm tra quyền file: <code>sudo chown -R $USER:$USER data/</code></li>
                        <li>✓ Verify database: <code>sqlite3 data/ovpanel.db "SELECT * FROM admins;"</code></li>
                    </ul>
                </div>

                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                    <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        OpenVPN không hoạt động
                    </h4>
                    <ul className="space-y-2 [&>li]:!pl-0 [&>li]:before:content-none text-sm text-blue-800">
                        <li>✓ Check service: <code>sudo systemctl status openvpn@server</code></li>
                        <li>✓ View logs: <code>sudo journalctl -u openvpn@server -f</code></li>
                        <li>✓ Test config: <code>sudo openvpn --config /etc/openvpn/server.conf --test-crypto</code></li>
                        <li>✓ Verify certificates: <code>ls -la /etc/openvpn/easy-rsa/pki/</code></li>
                    </ul>
                </div>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Cần hỗ trợ thêm?</strong> Tham gia <a href="https://github.com/TinyActive/OpenVpn-Panel/issues" className="font-bold underline">GitHub Issues</a> hoặc xem <a href="https://github.com/TinyActive/OpenVpn-Panel/discussions" className="font-bold underline">Discussions</a> để được cộng đồng hỗ trợ.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
