import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Steps, Step } from "@/components/ui/steps";
import { Terminal, Download, Settings, CheckCircle, Shield, Database } from "lucide-react";

export default function WhiteLabelInstallationPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Cài đặt Super Admin Panel</h1>
                <Badge variant="success">Setup Guide</Badge>
            </div>

            <p className="lead">
                Hướng dẫn chi tiết từng bước để cài đặt Super Admin Panel - trung tâm quản lý tất cả White-Label instances.
            </p>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Quan trọng:</strong> Đảm bảo server của bạn đáp ứng <a href="/white-label/introduction" className="text-primary underline">yêu cầu hệ thống</a> trước khi bắt đầu cài đặt.
                </AlertDescription>
            </Alert>

            <h2>Quy trình cài đặt</h2>

            <Steps>
                <Step
                    number={1}
                    title="Chuẩn bị hệ thống"
                    description="Cập nhật system packages và cài đặt dependencies cần thiết"
                >
                    <CodeBlock
                        code={`# Đăng nhập với quyền root
sudo su -

# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài đặt dependencies cơ bản
apt install -y python3 python3-pip python3-venv wget curl git net-tools`}
                        title="Terminal"
                        language="bash"
                    />

                    <Alert variant="tip" className="mt-4">
                        <AlertDescription>
                            Quá trình update và cài đặt dependencies có thể mất 5-10 phút tùy theo tốc độ kết nối.
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={2}
                    title="Clone Repository"
                    description="Tải source code OV-Panel từ GitHub về server"
                >
                    <CodeBlock
                        code={`# Clone repository về /opt
cd /opt
git clone -b Features/white_label https://github.com/TinyActive/OpenVpn-Panel.git ov-panel
cd ov-panel`}
                        title="Terminal"
                        language="bash"
                    />

                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                        <p className="text-sm font-semibold mb-2">Cấu trúc thư mục sau khi clone:</p>
                        <CodeBlock
                            code={`/opt/ov-panel/
├── backend/          # Backend source code
├── frontend/         # Frontend source code
├── data/            # Database directory
├── install.sh       # Installation script
├── installer.py     # Python installer
├── main.py          # Application entry point
└── pyproject.toml   # Python dependencies`}
                            language="text"
                        />
                    </div>
                </Step>

                <Step
                    number={3}
                    title="Chạy Installation Script"
                    description="Khởi chạy script cài đặt tự động"
                >
                    <CodeBlock
                        code={`# Chạy install.sh
bash install.sh`}
                        title="Terminal"
                        language="bash"
                    />

                    <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Script sẽ tự động thực hiện:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Cập nhật system packages</li>
                            <li>Tạo Python virtual environment</li>
                            <li>Cài đặt Python dependencies</li>
                            <li>Khởi chạy installer tương tác</li>
                        </ul>
                    </div>
                </Step>

                <Step
                    number={4}
                    title="Chọn chế độ Super Admin"
                    description="Trong menu installer, chọn option [2] để cài đặt Super Admin Panel"
                >
                    <CodeBlock
                        code={`  ██████╗ ██╗   ██╗██████╗  █████╗ ███╗   ██╗███████╗██╗     
 ██╔═══██╗██║   ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     
 ██║   ██║██║   ██║██████╔╝███████║██╔██╗ ██║█████╗  ██║     
 ██║   ██║╚██╗ ██╔╝██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     
 ╚██████╔╝ ╚████╔╝ ██║     ██║  ██║██║ ╚████║███████╗███████╗
  ╚═════╝   ╚═══╝  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝

Please choose an option:

  [1] Install as Standalone Panel (with OpenVPN)
  [2] Install as Super Admin Panel (White-Label Manager)  ← Chọn option này
  [3] Update
  [4] Restart
  [5] Uninstall
  [6] Exit

Your choice: 2`}
                        language="text"
                        title="Installer Menu"
                    />

                    <Alert variant="info" className="mt-4">
                        <AlertDescription>
                            <strong>Option [2]</strong> sẽ cài đặt panel ở chế độ Super Admin để quản lý White-Label instances,
                            không bao gồm OpenVPN server.
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={5}
                    title="Nhập thông tin cấu hình"
                    description="Cung cấp thông tin cần thiết cho Super Admin Panel"
                >
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Field</th>
                                        <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Mô tả</th>
                                        <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Ví dụ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-3"><code>Username</code></td>
                                        <td className="p-3">Tên đăng nhập Super Admin</td>
                                        <td className="p-3"><Badge variant="outline">superadmin</Badge></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3"><code>Password</code></td>
                                        <td className="p-3">Mật khẩu Super Admin (min 6 ký tự)</td>
                                        <td className="p-3"><Badge variant="outline">SecurePass123!</Badge></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3"><code>Port</code></td>
                                        <td className="p-3">Port cho panel chạy</td>
                                        <td className="p-3"><Badge variant="outline">9000</Badge></td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3"><code>URL Path</code></td>
                                        <td className="p-3">URL prefix cho panel</td>
                                        <td className="p-3"><Badge variant="outline">dashboard</Badge></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <CodeBlock
                            code={`# Super Admin Username
Enter Super Admin username: superadmin

# Super Admin Password
Enter Super Admin password: ********
Confirm password: ********

# Panel Port
Enter panel port [default: 9000]: 9000

# URL Path
Enter URL path [default: dashboard]: dashboard`}
                            language="text"
                            title="Configuration Input"
                        />
                    </div>
                </Step>

                <Step
                    number={6}
                    title="Hoàn tất cài đặt"
                    description="Installer sẽ tự động thực hiện các bước sau"
                >
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Tạo file .env</p>
                                <p className="text-sm text-muted-foreground">Với cấu hình <code>IS_SUPER_ADMIN=True</code></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Khởi tạo Database</p>
                                <p className="text-sm text-muted-foreground">Tạo database và chạy migrations</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Tạo Super Admin Account</p>
                                <p className="text-sm text-muted-foreground">Với username và password đã nhập</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                            <Download className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Build Frontend</p>
                                <p className="text-sm text-muted-foreground">Compile React application với Vite</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <Settings className="h-5 w-5 text-slate-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Tạo Systemd Service</p>
                                <p className="text-sm text-muted-foreground">Service <code>ov-panel.service</code> và auto-start</p>
                            </div>
                        </div>
                    </div>
                </Step>

                <Step
                    number={7}
                    title="Xác nhận cài đặt thành công"
                    description="Kiểm tra service status và truy cập panel"
                >
                    <CodeBlock
                        code={`# Kiểm tra service status
systemctl status ov-panel

# Output mong đợi:
● ov-panel.service - OV-Panel Super Admin Panel
     Loaded: loaded (/etc/systemd/system/ov-panel.service; enabled)
     Active: active (running) since Mon 2025-11-17 10:00:00 UTC
   Main PID: 12345 (python)

# Kiểm tra port đang listen
netstat -tulpn | grep 9000

# Kiểm tra logs
journalctl -u ov-panel -f`}
                        title="Verification Commands"
                        language="bash"
                    />
                </Step>
            </Steps>

            <h2>Truy cập Super Admin Panel</h2>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border border-blue-200 dark:border-blue-800 p-6 my-6">
                <p className="font-semibold mb-3">Mở trình duyệt và truy cập:</p>
                <CodeBlock
                    code={`http://your-server-ip:9000/dashboard`}
                    language="text"
                />
                <div className="mt-4 space-y-2">
                    <p className="text-sm"><strong>Username:</strong> superadmin (hoặc username bạn đã tạo)</p>
                    <p className="text-sm"><strong>Password:</strong> password bạn đã nhập khi cài đặt</p>
                </div>
            </div>

            <h2>Các file và thư mục quan trọng</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Path</th>
                            <th className="text-left p-3">Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3"><code>/opt/ov-panel/</code></td>
                            <td className="p-3">Thư mục cài đặt chính</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>/opt/ov-panel/.env</code></td>
                            <td className="p-3">File cấu hình Super Admin</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>/opt/ov-panel/data/ov-panel.db</code></td>
                            <td className="p-3">Database Super Admin</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>/opt/ov-panel/venv/</code></td>
                            <td className="p-3">Python virtual environment</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>/etc/systemd/system/ov-panel.service</code></td>
                            <td className="p-3">Systemd service file</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2>Bước tiếp theo</h2>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Cài đặt thành công!</strong> Bây giờ bạn cần <a href="/white-label/instance-management" className="text-primary underline">khởi tạo hệ thống White-Label</a> để có thể tạo và quản lý instances.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
