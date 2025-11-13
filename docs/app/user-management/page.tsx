import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserManagementPage() {
    return (
        <DocLayout>
            <h1>Quản lý người dùng</h1>
            <p className="lead">
                Quản lý người dùng OpenVPN trong hệ thống OV-Panel - tạo, chỉnh sửa, xóa và tải cấu hình VPN một cách dễ dàng.
            </p>

            <h2>Xem danh sách người dùng</h2>
            <p>
                Trang User Management hiển thị tất cả người dùng trong hệ thống với thông tin chi tiết và trạng thái hiện tại của họ.
            </p>

            <h3>Các tính năng của danh sách</h3>
            <ul>
                <li><strong>Tìm kiếm nhanh:</strong> Sử dụng thanh tìm kiếm để nhanh chóng tìm người dùng theo username hoặc email</li>
                <li><strong>Hiển thị trạng thái:</strong> Badge màu xanh cho người dùng đang hoạt động, màu đỏ cho người dùng không hoạt động</li>
                <li><strong>Thông tin chi tiết:</strong> Xem username, email, ngày tạo và ngày hết hạn của mỗi người dùng</li>
                <li><strong>Phân trang thông minh:</strong> Điều hướng dễ dàng qua nhiều trang người dùng (10 người dùng mỗi trang)</li>
            </ul>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Lưu ý:</strong> Trạng thái người dùng được tự động cập nhật dựa trên ngày hết hạn. Người dùng quá ngày hết hạn sẽ được đánh dấu là không hoạt động.
                </AlertDescription>
            </Alert>

            <h2>Thêm người dùng mới</h2>
            <p>Tạo người dùng VPN mới với cài đặt tùy chỉnh và thông tin đăng nhập an toàn.</p>

            <h3>Các bước thêm người dùng</h3>
            <ol>
                <li>Nhấn nút <strong>"Add User"</strong> ở góc trên bên phải của trang User Management</li>
                <li>
                    Điền đầy đủ thông tin vào form modal:
                    <ul>
                        <li><strong>Username:</strong> Tên định danh duy nhất (chỉ chữ cái, số và dấu gạch dưới)</li>
                        <li><strong>Email:</strong> Địa chỉ email người dùng (tùy chọn nhưng được khuyến nghị để liên hệ)</li>
                        <li><strong>Password:</strong> Mật khẩu VPN mạnh và an toàn</li>
                        <li><strong>Expiration Date:</strong> Ngày hết hạn truy cập (có thể gia hạn sau)</li>
                        <li><strong>Status:</strong> Chuyển đổi để kích hoạt hoặc vô hiệu hóa tài khoản ngay lập tức</li>
                    </ul>
                </li>
                <li>Nhấn <strong>"Create User"</strong> để hoàn tất</li>
            </ol>

            <div className="bg-slate-900 p-6 rounded-xl my-6 text-slate-50 shadow-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span className="ml-2 text-xs text-slate-400">Request Body</span>
                </div>
                <pre className="!bg-transparent !p-0 !my-0 text-sm font-mono">
                    {`{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "expiration_date": "2025-12-31",
  "is_active": true
}`}
                </pre>
            </div>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Thành công:</strong> Sau khi tạo người dùng, hệ thống sẽ tự động đồng bộ thông tin đến tất cả các node đang hoạt động. Bạn có thể tải xuống cấu hình VPN ngay lập tức.
                </AlertDescription>
            </Alert>

            <h2>Chỉnh sửa thông tin người dùng</h2>
            <p>Cập nhật chi tiết người dùng, thay đổi mật khẩu hoặc gia hạn thời gian truy cập một cách linh hoạt.</p>

            <h3>Các bước chỉnh sửa người dùng</h3>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) ở cuối hàng của người dùng trong danh sách</li>
                <li>Chọn <strong>"Edit"</strong> từ menu thả xuống</li>
                <li>
                    Sửa đổi các trường cần thiết:
                    <ul>
                        <li><strong>Email:</strong> Cập nhật địa chỉ email liên hệ</li>
                        <li><strong>Password:</strong> Đổi mật khẩu VPN (để trống nếu muốn giữ nguyên)</li>
                        <li><strong>Expiration Date:</strong> Gia hạn hoặc rút ngắn thời gian truy cập</li>
                        <li><strong>Status:</strong> Kích hoạt hoặc tạm ngưng tài khoản người dùng</li>
                    </ul>
                </li>
                <li>Nhấn <strong>"Update User"</strong> để lưu các thay đổi</li>
            </ol>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Quan trọng:</strong> Thay đổi mật khẩu sẽ được cập nhật trên tất cả các node. Người dùng cần kết nối lại VPN với thông tin mới.
                </AlertDescription>
            </Alert>

            <h2>Xóa người dùng</h2>
            <p>Xóa vĩnh viễn người dùng khỏi hệ thống và tất cả các node được kết nối.</p>

            <h3>Các bước xóa người dùng</h3>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) bên cạnh người dùng cần xóa</li>
                <li>Chọn <strong>"Delete"</strong> từ menu thả xuống</li>
                <li>Xác nhận hành động xóa trong hộp thoại cảnh báo</li>
            </ol>

            <Alert variant="error">
                <AlertDescription>
                    <strong>Cảnh báo:</strong> Xóa người dùng là hành động vĩnh viễn và không thể hoàn tác. Người dùng sẽ bị xóa khỏi tất cả các node ngay lập tức và quyền truy cập VPN sẽ bị chấm dứt hoàn toàn.
                </AlertDescription>
            </Alert>

            <h2>Tải xuống cấu hình VPN</h2>
            <p>Tải xuống file cấu hình .ovpn để người dùng có thể kết nối đến VPN server.</p>

            <h3>Các tùy chọn tải xuống</h3>

            <h4>Tùy chọn 1: Tải từ Node cụ thể</h4>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) bên cạnh người dùng</li>
                <li>Chọn <strong>"Download OVPN"</strong> từ menu</li>
                <li>Chọn một node cụ thể từ danh sách có sẵn</li>
                <li>Nhấn <strong>"Download"</strong> để tải file cấu hình</li>
            </ol>

            <h4>Tùy chọn 2: Tải từ Node tốt nhất (Khuyến nghị)</h4>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) bên cạnh người dùng</li>
                <li>Chọn <strong>"Download from Best Node"</strong></li>
                <li>Hệ thống sẽ tự động chọn node tốt nhất dựa trên sức khỏe và hiệu suất</li>
            </ol>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Mẹo chọn node:</strong> Tùy chọn "Best Node" tự động chọn server có tình trạng tốt nhất về độ ổn định và tốc độ. Đây là lựa chọn được khuyến nghị cho hầu hết người dùng.
                </AlertDescription>
            </Alert>

            <h3>Sử dụng file cấu hình</h3>
            <ol>
                <li>Tải file <code>.ovpn</code> về thiết bị của bạn</li>
                <li>
                    Import file vào OpenVPN client phù hợp:
                    <ul>
                        <li><strong>Windows:</strong> OpenVPN GUI hoặc OpenVPN Connect</li>
                        <li><strong>macOS:</strong> Tunnelblick hoặc OpenVPN Connect</li>
                        <li><strong>Linux:</strong> Network Manager OpenVPN Plugin hoặc OpenVPN CLI</li>
                        <li><strong>Android:</strong> OpenVPN for Android (Google Play)</li>
                        <li><strong>iOS:</strong> OpenVPN Connect (App Store)</li>
                    </ul>
                </li>
                <li>Kết nối VPN bằng profile vừa import</li>
            </ol>

            <h2>Thống kê người dùng</h2>
            <p>Theo dõi các chỉ số quan trọng về người dùng và mức sử dụng hệ thống.</p>

            <h3>Các thống kê có sẵn</h3>
            <ul>
                <li><strong>Total Users:</strong> Tổng số người dùng đã đăng ký trong hệ thống</li>
                <li><strong>Active Users:</strong> Số lượng người dùng đang hoạt động với ngày hết hạn còn hiệu lực</li>
                <li><strong>Inactive Users:</strong> Số lượng người dùng bị vô hiệu hóa hoặc đã hết hạn</li>
            </ul>

            <p>
                Các thống kê này được hiển thị dưới dạng thẻ thông tin ở đầu trang User Management
                và tự động cập nhật theo thời gian thực khi có thay đổi (thêm, sửa hoặc xóa người dùng).
            </p>
        </DocLayout>
    );
}
