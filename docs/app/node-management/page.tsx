import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NodeManagementPage() {
    return (
        <DocLayout>
            <h1>Quản lý Node</h1>
            <p className="lead">
                Quản lý nhiều máy chủ OpenVPN (nodes) từ một giao diện duy nhất - mở rộng quy mô hạ tầng VPN của bạn dễ dàng.
            </p>

            <h2>Xem danh sách Nodes</h2>
            <p>
                Trang Node Management hiển thị tất cả các máy chủ VPN đã cấu hình kèm theo trạng thái và thông tin chi tiết.
            </p>

            <h3>Các tính năng của danh sách Node</h3>
            <ul>
                <li><strong>Node Name:</strong> Tên định danh dễ nhớ cho máy chủ</li>
                <li><strong>API URL:</strong> Endpoint để giao tiếp giữa panel và node</li>
                <li><strong>Health Status:</strong> Chỉ báo sức khỏe theo thời gian thực (Healthy/Unhealthy)</li>
                <li><strong>Sync Status:</strong> Trạng thái đồng bộ dữ liệu người dùng</li>
                <li><strong>Last Check:</strong> Thời gian kiểm tra sức khỏe gần nhất</li>
            </ul>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Giám sát tự động:</strong> Các node được kiểm tra sức khỏe định kỳ mỗi vài phút. Hệ thống tự động phát hiện và cảnh báo khi có vấn đề.
                </AlertDescription>
            </Alert>

            <h2>Thêm Node mới</h2>
            <p>Kết nối thêm các máy chủ OpenVPN vào panel để tăng khả năng mở rộng, cân bằng tải và dự phòng.</p>

            <h3>Yêu cầu trước khi thêm</h3>
            <p>Đảm bảo các điều kiện sau đã được đáp ứng:</p>
            <ul>
                <li>Máy chủ đích đã cài đặt và cấu hình OpenVPN hoàn chỉnh</li>
                <li>Node API có thể truy cập được từ máy chủ panel (kiểm tra firewall, port)</li>
                <li>Đã có API URL và API Key để xác thực</li>
            </ul>

            <h3>Các bước thêm Node</h3>
            <ol>
                <li>Nhấn nút <strong>"Add Node"</strong> ở góc trên bên phải</li>
                <li>
                    Điền đầy đủ thông tin node:
                    <ul>
                        <li><strong>Node Name:</strong> Tên thân thiện để nhận diện (ví dụ: "US-East-1", "EU-Frankfurt")</li>
                        <li><strong>API URL:</strong> URL đầy đủ đến API endpoint (ví dụ: "https://node1.example.com:8443")</li>
                        <li><strong>API Key:</strong> Khóa xác thực bảo mật cho giao tiếp giữa panel và node</li>
                    </ul>
                </li>
                <li>Nhấn <strong>"Add Node"</strong> để hoàn tất</li>
            </ol>

            <div className="bg-slate-900 p-6 rounded-xl my-6 text-slate-50 shadow-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <span className="ml-2 text-xs text-slate-400">Node Configuration</span>
                </div>
                <pre className="!bg-transparent !p-0 !my-0 text-sm font-mono">
                    {`{
  "name": "US-East-1",
  "api_url": "https://vpn1.example.com:8443",
  "api_key": "sk-node-1a2b3c4d5e6f7g8h9i0j"
}`}
                </pre>
            </div>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Đồng bộ tự động:</strong> Khi thêm node mới, hệ thống tự động đồng bộ toàn bộ người dùng hiện có lên node đó. Tất cả tài khoản sẽ ngay lập tức có sẵn trên máy chủ mới.
                </AlertDescription>
            </Alert>

            <h2>Chỉnh sửa thông tin Node</h2>
            <p>Cập nhật cấu hình node, thay đổi API endpoints hoặc làm mới thông tin xác thực.</p>

            <h3>Các bước chỉnh sửa Node</h3>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) ở cuối hàng của node</li>
                <li>Chọn <strong>"Edit"</strong> từ menu thả xuống</li>
                <li>
                    Sửa đổi các trường cần thiết:
                    <ul>
                        <li><strong>Node Name:</strong> Cập nhật tên hiển thị cho rõ ràng hơn</li>
                        <li><strong>API URL:</strong> Thay đổi địa chỉ endpoint nếu node di chuyển</li>
                        <li><strong>API Key:</strong> Làm mới khóa xác thực khi cần</li>
                    </ul>
                </li>
                <li>Nhấn <strong>"Update Node"</strong> để lưu</li>
            </ol>

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Quan trọng:</strong> Thay đổi API URL hoặc Key sẽ ảnh hưởng ngay lập tức đến khả năng giao tiếp với node. Đảm bảo thông tin mới hoàn toàn chính xác.
                </AlertDescription>
            </Alert>

            <h2>Xóa Node</h2>
            <p>Gỡ bỏ node khỏi hệ thống quản lý panel.</p>

            <h3>Các bước xóa Node</h3>
            <ol>
                <li>Nhấn vào <strong>menu ba chấm</strong> (⋮) bên cạnh node cần xóa</li>
                <li>Chọn <strong>"Delete"</strong> từ menu thả xuống</li>
                <li>Xác nhận hành động xóa trong hộp thoại cảnh báo</li>
            </ol>

            <Alert variant="error">
                <AlertDescription>
                    <strong>Cảnh báo:</strong> Xóa node chỉ loại bỏ nó khỏi panel quản lý, không tự động xóa dữ liệu người dùng trên máy chủ thực tế. Người dùng vẫn có thể kết nối đến node đó trừ khi được xóa thủ công.
                </AlertDescription>
            </Alert>

            <h2>Giám sát trạng thái sức khỏe</h2>
            <p>Theo dõi tính khả dụng và hiệu suất của các node theo thời gian thực.</p>

            <h3>Các tính năng kiểm tra sức khỏe</h3>
            <ul>
                <li><strong>Kiểm tra tự động:</strong> Node được ping định kỳ mà không cần can thiệp thủ công</li>
                <li>
                    <strong>Chỉ báo trực quan:</strong>
                    <ul>
                        <li>🟢 <strong>Healthy:</strong> Node đang online và phản hồi bình thường</li>
                        <li>🔴 <strong>Unhealthy:</strong> Node offline hoặc không phản hồi đúng cách</li>
                    </ul>
                </li>
                <li><strong>Timestamp kiểm tra:</strong> Hiển thị thời điểm xác minh trạng thái lần cuối</li>
            </ul>

            <h3>Những gì được kiểm tra</h3>
            <p>Mỗi lần health check sẽ xác minh:</p>
            <ul>
                <li>Node API có thể truy cập được từ panel</li>
                <li>Xác thực API Key hợp lệ</li>
                <li>Node phản hồi đúng định dạng mong đợi</li>
                <li>Các chỉ số hệ thống cơ bản (CPU, RAM, disk)</li>
            </ul>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Khắc phục sự cố:</strong> Nếu node hiển thị unhealthy, hãy kiểm tra: (1) Trạng thái server, (2) Quy tắc firewall/security group, (3) Dịch vụ API có đang chạy không, (4) API Key còn hợp lệ không.
                </AlertDescription>
            </Alert>

            <h2>Đồng bộ người dùng</h2>
            <p>Hệ thống tự động giữ tài khoản người dùng được đồng bộ trên tất cả các node.</p>

            <h3>Các sự kiện đồng bộ tự động</h3>
            <p>Đồng bộ người dùng được kích hoạt tự động khi:</p>
            <ul>
                <li>Node mới được thêm vào hệ thống → Tất cả người dùng hiện có đồng bộ lên node mới</li>
                <li>Người dùng mới được tạo → Tài khoản được tạo trên tất cả các node đang hoạt động</li>
                <li>Thông tin người dùng được cập nhật → Thay đổi lan truyền đến mọi node</li>
                <li>Người dùng bị xóa → Tài khoản bị xóa khỏi tất cả các node</li>
            </ul>

            <h3>Trạng thái đồng bộ</h3>
            <ul>
                <li><strong>Synced:</strong> Tất cả dữ liệu người dùng đã được cập nhật thành công trên node</li>
                <li><strong>Syncing:</strong> Quá trình đồng bộ đang diễn ra</li>
                <li><strong>Failed:</strong> Một số người dùng không đồng bộ được (kiểm tra health status)</li>
            </ul>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Best practice:</strong> Đảm bảo tất cả node ở trạng thái healthy trước khi thêm hàng loạt người dùng. Điều này giúp đảm bảo đồng bộ thành công trên toàn bộ hạ tầng.
                </AlertDescription>
            </Alert>

            <h2>Chiến lược Multi-Node</h2>
            <p>Hướng dẫn tối ưu để quản lý nhiều node hiệu quả:</p>

            <h3>Quy ước đặt tên rõ ràng</h3>
            <ul>
                <li>Sử dụng định danh địa lý: "US-West", "EU-Frankfurt", "Asia-Singapore"</li>
                <li>Bao gồm mục đích hoặc tier: "Premium-US", "Free-EU", "Enterprise-Asia"</li>
                <li>Đánh số cho nhiều node cùng vị trí: "US-East-1", "US-East-2", "US-East-3"</li>
            </ul>

            <h3>Phân phối tải thông minh</h3>
            <ul>
                <li>Sử dụng tính năng "Best Node" khi tải cấu hình để tự động chọn node tối ưu</li>
                <li>Giám sát health status để phát hiện node quá tải hoặc có vấn đề</li>
                <li>Phân phối người dùng theo khu vực địa lý để giảm độ trễ</li>
            </ul>

            <h3>Dự phòng và tính sẵn sàng cao</h3>
            <ul>
                <li>Duy trì tối thiểu 2-3 node để đảm bảo high availability</li>
                <li>Đặt node ở các datacenter hoặc cloud provider khác nhau</li>
                <li>Thiết lập cảnh báo cho trạng thái unhealthy để phản ứng nhanh</li>
            </ul>
        </DocLayout>
    );
}
