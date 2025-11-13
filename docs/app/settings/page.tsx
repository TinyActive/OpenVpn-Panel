import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
    return (
        <DocLayout>
            <h1>Cài đặt hệ thống</h1>
            <p className="lead">
                Tùy chỉnh và cấu hình các thông số quan trọng của OV-Panel để phù hợp với nhu cầu của bạn.
            </p>

            <h2>Truy cập Settings</h2>
            <p>
                Trang Settings cho phép administrators cấu hình các thông số toàn hệ thống ảnh hưởng đến tất cả người dùng và nodes.
            </p>

            <h3>Cách truy cập</h3>
            <ol>
                <li>Đăng nhập vào panel với tài khoản admin</li>
                <li>Nhấp vào <strong>"Settings"</strong> trong menu điều hướng bên trái</li>
                <li>Xem và chỉnh sửa các cài đặt có sẵn</li>
            </ol>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Chỉ dành cho Admin:</strong> Trang Settings chỉ có thể truy cập bởi tài khoản administrator. Người dùng thông thường không thể xem hoặc thay đổi cài đặt hệ thống.
                </AlertDescription>
            </Alert>

            <h2>Cài đặt chung (General Settings)</h2>
            <p>Các thông số cơ bản ảnh hưởng đến toàn bộ panel.</p>

            <h3>Tên hệ thống (System Name)</h3>
            <ul>
                <li><strong>Mô tả:</strong> Tên hiển thị của panel trong giao diện web</li>
                <li><strong>Giá trị mặc định:</strong> "OV-Panel"</li>
                <li><strong>Sử dụng:</strong> Xuất hiện trong header, title page và email notifications</li>
            </ul>

            <h3>Welcome Message</h3>
            <ul>
                <li><strong>Mô tả:</strong> Thông điệp chào mừng hiển thị trên dashboard</li>
                <li><strong>Hỗ trợ:</strong> Plain text hoặc Markdown</li>
                <li><strong>Ví dụ:</strong> "Chào mừng đến hệ thống VPN! Liên hệ support@example.com nếu cần hỗ trợ"</li>
            </ul>

            <h3>Timezone</h3>
            <ul>
                <li><strong>Mô tả:</strong> Múi giờ hiển thị cho timestamps trong panel</li>
                <li><strong>Giá trị mặc định:</strong> UTC</li>
                <li><strong>Khuyến nghị:</strong> Chọn timezone phù hợp với vị trí chính của users</li>
            </ul>

            <h2>Cài đặt User Management</h2>
            <p>Kiểm soát cách người dùng VPN được quản lý trong hệ thống.</p>

            <h3>Default Expiration Days</h3>
            <ul>
                <li><strong>Mô tả:</strong> Số ngày mặc định cho tài khoản mới trước khi hết hạn</li>
                <li><strong>Giá trị mặc định:</strong> 30 ngày</li>
                <li><strong>Phạm vi:</strong> 1-365 ngày</li>
            </ul>

            <div className="bg-slate-900 p-6 rounded-xl my-6 text-slate-50 shadow-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span className="ml-2 text-xs text-slate-400">Example</span>
                </div>
                <pre className="!bg-transparent !p-0 !my-0 text-sm font-mono">
                    {`# Người dùng tạo ngày 2025-01-01
# Default expiration: 30 ngày
# => Expiration date: 2025-01-31`}
                </pre>
            </div>

            <h3>Auto-deactivate Expired Users</h3>
            <ul>
                <li><strong>Mô tả:</strong> Tự động vô hiệu hóa users khi hết hạn</li>
                <li><strong>Giá trị:</strong> Enabled/Disabled</li>
                <li><strong>Lợi ích:</strong> Ngăn truy cập VPN khi subscription hết hạn mà không cần xóa tài khoản</li>
            </ul>

            <h3>Maximum Concurrent Connections</h3>
            <ul>
                <li><strong>Mô tả:</strong> Số kết nối đồng thời tối đa cho mỗi người dùng</li>
                <li><strong>Giá trị mặc định:</strong> 3 connections</li>
                <li><strong>Khuyến nghị:</strong> 1-5 connections tùy thuộc vào use case</li>
            </ul>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Multi-device support:</strong> Cho phép người dùng kết nối từ nhiều thiết bị (laptop, phone, tablet) cùng lúc. Giá trị cao hơn = linh hoạt hơn nhưng tiêu tốn nhiều băng thông hơn.
                </AlertDescription>
            </Alert>

            <h2>Cài đặt Node Management</h2>
            <p>Cấu hình cách các nodes được giám sát và quản lý.</p>

            <h3>Health Check Interval</h3>
            <ul>
                <li><strong>Mô tả:</strong> Khoảng thời gian giữa các lần kiểm tra sức khỏe node</li>
                <li><strong>Giá trị mặc định:</strong> 5 phút (300 giây)</li>
                <li><strong>Phạm vi:</strong> 1-60 phút</li>
                <li><strong>Lưu ý:</strong> Giá trị thấp hơn = phát hiện sự cố nhanh hơn nhưng tăng server load</li>
            </ul>

            <h3>Health Check Timeout</h3>
            <ul>
                <li><strong>Mô tả:</strong> Thời gian chờ tối đa cho mỗi request health check</li>
                <li><strong>Giá trị mặc định:</strong> 10 giây</li>
                <li><strong>Khuyến nghị:</strong> 5-30 giây tùy latency mạng</li>
            </ul>

            <h3>Auto-retry Failed Nodes</h3>
            <ul>
                <li><strong>Mô tả:</strong> Tự động thử lại khi node báo unhealthy</li>
                <li><strong>Retry attempts:</strong> 3 lần</li>
                <li><strong>Retry delay:</strong> 30 giây giữa các lần</li>
            </ul>

            <h2>Cài đặt Security</h2>
            <p>Tăng cường bảo mật cho panel và người dùng.</p>

            <h3>JWT Token Expiration</h3>
            <ul>
                <li><strong>Mô tả:</strong> Thời gian hết hạn session đăng nhập admin</li>
                <li><strong>Giá trị mặc định:</strong> 24 giờ (86400 giây)</li>
                <li><strong>Khuyến nghị bảo mật:</strong> 1-8 giờ cho môi trường production</li>
            </ul>

            <h3>Password Policy</h3>
            <ul>
                <li><strong>Minimum length:</strong> 8 ký tự (khuyến nghị: 12+)</li>
                <li><strong>Require uppercase:</strong> Enabled/Disabled</li>
                <li><strong>Require numbers:</strong> Enabled/Disabled</li>
                <li><strong>Require special characters:</strong> Enabled/Disabled</li>
            </ul>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Password strength:</strong> Bật tất cả các yêu cầu policy để tăng độ bảo mật tài khoản người dùng VPN. Mật khẩu yếu dễ bị brute-force attack.
                </AlertDescription>
            </Alert>

            <h3>API Key Rotation</h3>
            <ul>
                <li><strong>Mô tả:</strong> Tự động làm mới API keys định kỳ</li>
                <li><strong>Rotation interval:</strong> 90 ngày</li>
                <li><strong>Lợi ích:</strong> Giảm rủi ro khi API key bị lộ</li>
            </ul>

            <h2>Cài đặt Notification</h2>
            <p>Cấu hình cảnh báo và thông báo tự động.</p>

            <h3>Email Notifications</h3>
            <ul>
                <li><strong>SMTP Server:</strong> Địa chỉ mail server (ví dụ: smtp.gmail.com)</li>
                <li><strong>SMTP Port:</strong> 587 (TLS) hoặc 465 (SSL)</li>
                <li><strong>From Email:</strong> Địa chỉ gửi (ví dụ: noreply@yourpanel.com)</li>
                <li><strong>Authentication:</strong> Username và password SMTP</li>
            </ul>

            <h3>Alert Triggers</h3>
            <p>Các sự kiện kích hoạt thông báo email:</p>
            <ul>
                <li><strong>Node Unhealthy:</strong> Khi node offline hoặc không phản hồi</li>
                <li><strong>User Expiring Soon:</strong> 7 ngày trước khi tài khoản hết hạn</li>
                <li><strong>Sync Failed:</strong> Khi đồng bộ người dùng đến node thất bại</li>
                <li><strong>High Connection Load:</strong> Khi số kết nối vượt ngưỡng</li>
            </ul>

            <h2>Cài đặt Backup & Maintenance</h2>
            <p>Đảm bảo dữ liệu được sao lưu và hệ thống được bảo trì đúng cách.</p>

            <h3>Automatic Backups</h3>
            <ul>
                <li><strong>Backup Frequency:</strong> Daily, Weekly, Monthly</li>
                <li><strong>Backup Location:</strong> Local path hoặc remote storage (S3, FTP)</li>
                <li><strong>Retention Period:</strong> Số ngày giữ lại backup cũ (mặc định: 30 ngày)</li>
                <li><strong>Backup Content:</strong> Database, configurations, certificates</li>
            </ul>

            <div className="bg-slate-900 p-6 rounded-xl my-6 text-slate-50 shadow-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span className="ml-2 text-xs text-slate-400">Backup Command</span>
                </div>
                <pre className="!bg-transparent !p-0 !my-0 text-sm font-mono">
                    {`# Manual backup
sudo python backend/backup.py --output /backups/

# Restore from backup
sudo python backend/restore.py --input /backups/backup-2025-01-01.tar.gz`}
                </pre>
            </div>

            <h3>Database Maintenance</h3>
            <ul>
                <li><strong>Auto-vacuum:</strong> Tự động tối ưu hóa database</li>
                <li><strong>Log Cleanup:</strong> Xóa logs cũ hơn X ngày</li>
                <li><strong>Orphan Data Cleanup:</strong> Dọn dẹp dữ liệu không còn sử dụng</li>
            </ul>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Best Practice:</strong> Thiết lập backup tự động hàng ngày và lưu trữ ở vị trí khác với server chính. Test restore định kỳ để đảm bảo backup hoạt động.
                </AlertDescription>
            </Alert>

            <h2>Cài đặt Advanced</h2>
            <p>Các tùy chọn nâng cao cho người dùng có kinh nghiệm.</p>

            <h3>API Rate Limiting</h3>
            <ul>
                <li><strong>Requests per minute:</strong> 60 (mặc định)</li>
                <li><strong>Burst allowance:</strong> 100 requests</li>
                <li><strong>Ban duration:</strong> 15 phút khi vi phạm</li>
            </ul>

            <h3>Logging Level</h3>
            <ul>
                <li><strong>DEBUG:</strong> Tất cả logs chi tiết (chỉ dùng development)</li>
                <li><strong>INFO:</strong> Thông tin hoạt động thông thường (khuyến nghị production)</li>
                <li><strong>WARNING:</strong> Chỉ cảnh báo và lỗi</li>
                <li><strong>ERROR:</strong> Chỉ lỗi nghiêm trọng</li>
            </ul>

            <h3>Custom Scripts</h3>
            <ul>
                <li><strong>Pre-user-create:</strong> Chạy script trước khi tạo user mới</li>
                <li><strong>Post-user-delete:</strong> Chạy script sau khi xóa user</li>
                <li><strong>On-node-unhealthy:</strong> Chạy script khi phát hiện node lỗi</li>
            </ul>

            <h2>Lưu và áp dụng thay đổi</h2>
            <p>Các bước để cập nhật cài đặt hệ thống:</p>

            <ol>
                <li>Thay đổi các giá trị mong muốn trong form Settings</li>
                <li>Nhấn nút <strong>"Save Settings"</strong> ở cuối trang</li>
                <li>Xác nhận thay đổi trong dialog popup</li>
                <li>Đợi notification xác nhận thành công</li>
                <li>Một số thay đổi có thể yêu cầu restart services</li>
            </ol>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Service Restart:</strong> Thay đổi một số cài đặt (như JWT expiration, port numbers) yêu cầu restart backend service để có hiệu lực. Panel sẽ thông báo khi cần restart.
                </AlertDescription>
            </Alert>

            <h2>Reset về mặc định</h2>
            <p>Khôi phục tất cả cài đặt về giá trị ban đầu:</p>

            <ol>
                <li>Cuộn xuống cuối trang Settings</li>
                <li>Nhấn nút <strong>"Reset to Defaults"</strong></li>
                <li>Xác nhận hành động (không thể hoàn tác)</li>
                <li>Tất cả cài đặt sẽ trở về giá trị mặc định</li>
            </ol>

            <Alert variant="error">
                <AlertDescription>
                    <strong>Cảnh báo:</strong> Reset settings là hành động không thể hoàn tác. Cân nhắc backup database trước khi thực hiện reset toàn bộ.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
