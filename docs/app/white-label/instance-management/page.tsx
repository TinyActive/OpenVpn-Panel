import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Steps, Step } from "@/components/ui/steps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Play, Pause, RefreshCw, Trash2, BarChart3, Settings, CheckCircle } from "lucide-react";

export default function InstanceManagementPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Quản lý White-Label Instances</h1>
                <Badge variant="info">Management</Badge>
            </div>

            <p className="lead">
                Hướng dẫn chi tiết về cách khởi tạo hệ thống, tạo mới và quản lý White-Label instances
                thông qua Web UI và các thao tác quản lý hàng ngày.
            </p>

            <h2>Khởi tạo hệ thống White-Label</h2>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Bắt buộc:</strong> Trước khi tạo instances, bạn PHẢI khởi tạo hệ thống White-Label một lần duy nhất.
                </AlertDescription>
            </Alert>

            <h3>Phương pháp 1: Qua Web UI</h3>

            <Steps>
                <Step
                    number={1}
                    title="Truy cập White-Label Management"
                    description="Đăng nhập vào Super Admin Panel và vào menu White-Label"
                >
                    <div className="space-y-3">
                        <p>Đăng nhập vào Super Admin Panel tại: <code>http://your-server-ip:9000/dashboard</code></p>
                        <p>Tìm và click vào menu <strong>"White-Label Management"</strong> (biểu tượng layers/boxes)</p>
                    </div>
                </Step>

                <Step
                    number={2}
                    title="Click Initialize System"
                    description="Khởi chạy quá trình initialization"
                >
                    <p>Click nút <strong>"Initialize System"</strong> màu xanh và đợi quá trình hoàn tất (10-30 giây)</p>

                    <Alert variant="info" className="mt-4">
                        <AlertDescription>
                            Hệ thống sẽ tạo shared directory, symlinks và systemd service template.
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={3}
                    title="Xác nhận thành công"
                    description="Kiểm tra thông báo initialization complete"
                >
                    <p>Sau khi thành công, bạn sẽ thấy thông báo và có thể bắt đầu tạo instances.</p>
                </Step>
            </Steps>

            <h3>Phương pháp 2: Qua Command Line</h3>

            <CodeBlock
                code={`# Di chuyển vào thư mục cài đặt
cd /opt/ov-panel

# Chạy CLI init command
python3 whitelabel_cli.py init

# Output mong đợi:
Initializing White-Label system...
✓ Created shared directory
✓ Created symlinks
✓ Created systemd template
✓ System initialized successfully`}
                title="Terminal"
                language="bash"
            />

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border p-6 my-6">
                <h4 className="font-semibold mb-3">Quá trình Initialize thực hiện:</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Tạo thư mục <code>/opt/ov-panel-instances/shared</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Tạo symlinks tới backend, frontend, main.py</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Tạo systemd service template: <code>ov-panel-instance@.service</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Tạo sample database với schema đầy đủ</span>
                    </li>
                </ul>
            </div>

            <h2>Tạo Instance mới</h2>

            <h3>Qua Web UI</h3>

            <Steps>
                <Step
                    number={1}
                    title="Mở Create Instance Dialog"
                    description="Click nút Create Instance trong White-Label Management"
                >
                    <p>Tại trang White-Label Management, click nút <strong>"Create Instance"</strong> (nút màu xanh với icon "+")</p>
                </Step>

                <Step
                    number={2}
                    title="Điền thông tin Instance"
                    description="Nhập các thông tin cần thiết cho instance mới"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Field</th>
                                    <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Mô tả</th>
                                    <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Yêu cầu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3"><strong>Instance Name</strong></td>
                                    <td className="p-3">Tên hiển thị của instance</td>
                                    <td className="p-3"><Badge variant="destructive">Bắt buộc</Badge></td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3"><strong>Admin Username</strong></td>
                                    <td className="p-3">Username đăng nhập instance</td>
                                    <td className="p-3"><Badge variant="destructive">3-50 ký tự</Badge></td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3"><strong>Admin Password</strong></td>
                                    <td className="p-3">Password cho admin</td>
                                    <td className="p-3"><Badge variant="destructive">Min 6 ký tự</Badge></td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3"><strong>Port</strong></td>
                                    <td className="p-3">Port để instance chạy</td>
                                    <td className="p-3"><Badge variant="destructive">1024-65535</Badge></td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3"><strong>Has OpenVPN</strong></td>
                                    <td className="p-3">Instance có OpenVPN không</td>
                                    <td className="p-3"><Badge>Tùy chọn</Badge></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-4 mt-4">
                        <p className="font-semibold mb-2">Ví dụ:</p>
                        <ul className="space-y-1 text-sm">
                            <li><strong>Instance Name:</strong> Customer A Panel</li>
                            <li><strong>Admin Username:</strong> admin_customer_a</li>
                            <li><strong>Admin Password:</strong> SecurePass123!</li>
                            <li><strong>Port:</strong> 9001</li>
                            <li><strong>Has OpenVPN:</strong> ☐ (không check)</li>
                        </ul>
                    </div>
                </Step>

                <Step
                    number={3}
                    title="Submit và đợi tạo"
                    description="Hệ thống sẽ tự động tạo và khởi động instance"
                >
                    <p className="mb-3">Click nút <strong>"Create"</strong> và đợi 10-30 giây.</p>

                    <div className="space-y-2 text-sm">
                        <p className="font-semibold">Hệ thống sẽ tự động:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            <li>Validate thông tin input</li>
                            <li>Kiểm tra port conflict</li>
                            <li>Generate UUID cho instance</li>
                            <li>Tạo thư mục instance</li>
                            <li>Copy sample database</li>
                            <li>Generate file .env</li>
                            <li>Create và start systemd service</li>
                        </ul>
                    </div>
                </Step>

                <Step
                    number={4}
                    title="Xác nhận instance đã tạo"
                    description="Kiểm tra instance trong danh sách"
                >
                    <p>Instance mới sẽ xuất hiện trong danh sách với status <Badge variant="success">Active</Badge></p>

                    <div className="bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 p-4 mt-4">
                        <p className="font-semibold mb-2">Truy cập instance:</p>
                        <CodeBlock
                            code={`http://your-server-ip:9001/dashboard`}
                            language="text"
                        />
                        <p className="text-sm mt-2">Đăng nhập với username và password đã tạo</p>
                    </div>
                </Step>
            </Steps>

            <h2>Quản lý Instances</h2>

            <h3>Danh sách Instances</h3>

            <p>Table hiển thị các thông tin chính:</p>

            <div className="grid md:grid-cols-3 gap-4 my-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>• Instance ID (UUID)</p>
                        <p>• Name</p>
                        <p>• Port</p>
                        <p>• Status (Active/Inactive)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Thống kê</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>• Số lượng Users</p>
                        <p>• Số lượng Nodes</p>
                        <p>• Created Date</p>
                        <p>• Last Updated</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Hành động</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>• Start/Stop/Restart</p>
                        <p>• View Stats</p>
                        <p>• Delete Instance</p>
                    </CardContent>
                </Card>
            </div>

            <h3>Actions Dropdown</h3>

            <div className="space-y-3 my-6">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Play className="h-5 w-5 text-green-600" />
                            <CardTitle className="!mt-0">Start Instance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Khởi động instance đang dừng. Instance sẽ chuyển sang status Active.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Pause className="h-5 w-5 text-orange-600" />
                            <CardTitle className="!mt-0">Stop Instance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Dừng instance đang chạy. Người dùng sẽ không thể truy cập cho đến khi start lại.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 text-blue-600" />
                            <CardTitle className="!mt-0">Restart Instance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Restart instance để apply changes hoặc clear memory. Downtime ~5-10 giây.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <CardTitle className="!mt-0">View Stats</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Xem thống kê chi tiết về users, nodes, traffic và system resources.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            <CardTitle className="!mt-0">Delete Instance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Xóa instance vĩnh viễn. Có confirm dialog để tránh xóa nhầm.</p>
                        <Alert variant="warning" className="mt-3">
                            <AlertDescription>
                                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>

            <h2>Port Management</h2>

            <h3>Port Range khuyến nghị</h3>

            <div className="overflow-x-auto my-6">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Range</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Sử dụng</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3"><code>1-1023</code></td>
                            <td className="p-3">System ports</td>
                            <td className="p-3"><Badge variant="destructive">Không sử dụng</Badge></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>1024-8999</code></td>
                            <td className="p-3">Reserved</td>
                            <td className="p-3"><Badge variant="outline">Tránh conflict</Badge></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>9000</code></td>
                            <td className="p-3">Super Admin</td>
                            <td className="p-3"><Badge variant="secondary">Main panel</Badge></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>9001-9999</code></td>
                            <td className="p-3">Instances</td>
                            <td className="p-3"><Badge variant="success">Khuyến nghị</Badge></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>10000-65535</code></td>
                            <td className="p-3">Custom</td>
                            <td className="p-3"><Badge>Có thể dùng</Badge></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>Kiểm tra Port trước khi tạo</h3>

            <CodeBlock
                code={`# Kiểm tra port đã dùng chưa
netstat -tulpn | grep 9001

# Hoặc
lsof -i :9001

# Nếu không có output = port available`}
                title="Terminal"
                language="bash"
            />

            <h2>Best Practices</h2>

            <div className="space-y-4 my-6">
                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Naming Convention:</strong> Đặt tên instance rõ ràng theo khách hàng hoặc tổ chức
                        (VD: "ABC Company Panel", "Customer XYZ")
                    </AlertDescription>
                </Alert>

                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Port Planning:</strong> Lập kế hoạch port range trước khi tạo nhiều instances.
                        Giữ khoảng trống giữa các ports để dễ quản lý.
                    </AlertDescription>
                </Alert>

                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Security:</strong> Sử dụng mật khẩu mạnh (&gt;12 ký tự, kết hợp chữ, số, ký tự đặc biệt)
                        cho mỗi instance admin.
                    </AlertDescription>
                </Alert>

                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Monitoring:</strong> Thường xuyên kiểm tra status và stats của instances để phát hiện
                        vấn đề sớm.
                    </AlertDescription>
                </Alert>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Tiếp theo:</strong> Tìm hiểu cách <a href="/white-label/cli-management" className="text-primary underline">quản lý instances qua CLI</a> để thao tác nhanh hơn.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
