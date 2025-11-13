import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Steps, Step } from "@/components/ui/steps";
import { Cloud, Database, Key, Shield, Globe, Lock, Download, Upload } from "lucide-react";
import Image from "next/image";

export default function R2StoragePage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Cấu hình R2 Storage</h1>
                <Badge variant="warning">Advanced</Badge>
            </div>

            <p className="lead">
                Tích hợp Cloudflare R2 Object Storage để lưu trữ file cấu hình OpenVPN một cách hiệu quả, tiết kiệm chi phí và dễ dàng quản lý.
            </p>

            <h2>Tại sao sử dụng R2 Storage?</h2>
            <p>
                Khi hệ thống có quá nhiều người dùng, việc lưu trữ file cấu hình trực tiếp trên các node OpenVPN gặp nhiều thách thức:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                            <Database className="h-5 w-5" />
                        </div>
                        <h3 className="!mt-0 !mb-0 !before:content-none text-xl">Vấn đề</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li>❌ Tốn nhiều dung lượng trên từng node</li>
                        <li>❌ Khó khăn trong việc quản lý và đồng bộ</li>
                        <li>❌ Node tập trung vào network, không có storage tốt</li>
                        <li>❌ Phức tạp khi scale nhiều node</li>
                    </ul>
                </div>

                <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <h3 className="!mt-0 !mb-0 !before:content-none text-xl">Giải pháp R2</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li>✅ Chi phí thấp (10GB miễn phí/tháng)</li>
                        <li>✅ Truy cập nhanh qua CDN toàn cầu</li>
                        <li>✅ Quản lý tập trung, dễ dàng backup</li>
                        <li>✅ Không giới hạn băng thông</li>
                    </ul>
                </div>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Lưu ý:</strong> Cloudflare R2 tương thích với Amazon S3 API, cung cấp 10GB lưu trữ miễn phí mỗi tháng và không tính phí băng thông egress.
                </AlertDescription>
            </Alert>

            <h2>Các biến môi trường cần cấu hình</h2>
            <p>Sau khi cài đặt OV-Panel, bạn cần thêm các biến môi trường sau vào file <code>.env</code>:</p>

            <CodeBlock
                code={`# Cloudflare R2 Storage Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name

# R2 Endpoint - Chỉ cần Account ID
# Định dạng đầy đủ: https://your_account_id.r2.cloudflarestorage.com
# Chỉ lấy phần your_account_id trước .r2.cloudflarestorage.com
R2_ACCOUNT_ID=your_cloudflare_account_id

# R2 Public URL base (domain tùy chỉnh để download file .ovpn)
R2_PUBLIC_BASE_URL=api.openvpn.panel

# R2 Download token (token bảo mật cho việc download)
# ⚠️ Thay đổi token mặc định này ngay lập tức!
R2_DOWNLOAD_TOKEN=8638b5a1-77df-4d24-8253-58977fa508a4`}
                title=".env"
                language="bash"
            />

            <Alert variant="warning">
                <AlertDescription>
                    <strong>Bảo mật:</strong> Hãy thay đổi <code>R2_DOWNLOAD_TOKEN</code> mặc định bằng một UUID ngẫu nhiên. Token này được dùng để bảo vệ các file cấu hình khỏi truy cập trái phép.
                </AlertDescription>
            </Alert>

            <h2>Hướng dẫn cấu hình từng bước</h2>

            <Steps>
                <Step
                    number={1}
                    title="Tạo R2 Bucket trên Cloudflare"
                    description="Đăng nhập Cloudflare Dashboard và tạo bucket lưu trữ mới:"
                >
                    <ol className="space-y-2 text-sm text-slate-700">
                        <li>1. Truy cập <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener" className="text-primary hover:underline">Cloudflare Dashboard</a></li>
                        <li>2. Chọn <strong>R2</strong> từ menu bên trái</li>
                        <li>3. Click <strong>Create bucket</strong></li>
                        <li>4. Đặt tên bucket (ví dụ: <code>openvpn-configs</code>)</li>
                        <li>5. Chọn location gần với người dùng của bạn</li>
                        <li>6. Click <strong>Create bucket</strong></li>
                    </ol>
                    <Alert variant="success" className="mt-4">
                        <AlertDescription>
                            Sau khi tạo xong, lưu lại <strong>Bucket Name</strong> để điền vào <code>R2_BUCKET_NAME</code>
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={2}
                    title="Tạo API Token cho R2"
                    description="Tạo credentials để ứng dụng có thể truy cập R2:"
                >
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold mb-2">Bước 1: Truy cập Account Details</p>
                            <p className="text-sm text-slate-600 mb-3">
                                Trong R2 Dashboard, click vào <strong>Manage R2 API Tokens</strong> hoặc vào <strong>Account Details → R2 API Tokens</strong>
                            </p>
                            <div className="rounded-lg border bg-slate-50 p-4">
                                <img 
                                    src="https://gist.github.com/user-attachments/assets/1ecff5e7-e35a-4c83-8003-c09c64480bf5"
                                    alt="R2 Account Details"
                                    className="w-full rounded-md border"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Bước 2: Create API Token</p>
                            <p className="text-sm text-slate-600 mb-3">
                                Click <strong>Create API Token</strong> để tạo credentials mới
                            </p>
                            <div className="rounded-lg border bg-slate-50 p-4">
                                <img 
                                    src="https://gist.github.com/user-attachments/assets/33861852-48f1-45f0-9153-5f2acfc1d524"
                                    alt="Create API Token"
                                    className="w-full rounded-md border"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Bước 3: Cấu hình permissions</p>
                            <Alert variant="info" className="mb-3">
                                <AlertDescription>
                                    Chọn các quyền phù hợp để đảm bảo bảo mật:
                                </AlertDescription>
                            </Alert>
                            <ul className="space-y-2 text-sm text-slate-700 mb-3">
                                <li>
                                    <Badge variant="outline" className="mr-2">Permission</Badge>
                                    <strong>Object Read & Write</strong> - Cho phép đọc, ghi và list objects
                                </li>
                                <li>
                                    <Badge variant="outline" className="mr-2">Scope</Badge>
                                    <strong>Apply to specific buckets only</strong> - Chọn bucket đã tạo ở bước 1
                                </li>
                            </ul>
                            <div className="rounded-lg border bg-slate-50 p-4">
                                <img 
                                    src="https://gist.github.com/user-attachments/assets/44008443-9b37-48ee-959e-7c0e5f5fa37f"
                                    alt="Configure Permissions"
                                    className="w-full rounded-md border"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Bước 4: Lưu credentials</p>
                            <Alert variant="warning" className="mb-3">
                                <AlertDescription>
                                    <strong>⚠️ Quan trọng:</strong> Thông tin này chỉ hiển thị một lần duy nhất. Hãy lưu lại ngay!
                                </AlertDescription>
                            </Alert>
                            <div className="rounded-lg border bg-slate-50 p-4 mb-3">
                                <img 
                                    src="https://gist.github.com/user-attachments/assets/feb91625-6b67-4c48-b2dc-6f9004239a4d"
                                    alt="Save Credentials"
                                    className="w-full rounded-md border"
                                />
                            </div>
                            <p className="text-sm text-slate-600">
                                Sao chép <strong>Access Key ID</strong> và <strong>Secret Access Key</strong> để điền vào:
                            </p>
                            <ul className="text-sm text-slate-700 mt-2 space-y-1">
                                <li>→ <code>R2_ACCESS_KEY_ID</code></li>
                                <li>→ <code>R2_SECRET_ACCESS_KEY</code></li>
                            </ul>
                        </div>
                    </div>
                </Step>

                <Step
                    number={3}
                    title="Lấy thông tin Bucket và Account ID"
                    description="Trở lại trang Settings của bucket để lấy thông tin còn lại:"
                >
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-slate-50 p-4 mb-4">
                            <img 
                                src="https://gist.github.com/user-attachments/assets/ae9bc216-6cf2-4b4c-b4f1-f0c16e9b97c1"
                                alt="Bucket Settings"
                                className="w-full rounded-md border"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="h-4 w-4 text-blue-600" />
                                    <p className="font-semibold text-blue-900">Account ID</p>
                                </div>
                                <p className="text-sm text-slate-700 mb-2">
                                    Từ <strong>S3 API</strong> endpoint:
                                </p>
                                <CodeBlock
                                    code="https://eba7a4693383ce39f359229132d1111f.r2.cloudflarestorage.com/openvpn"
                                    language="text"
                                />
                                <p className="text-sm text-slate-600 mt-2">
                                    Lấy phần trước <code>.r2.cloudflarestorage.com</code>:
                                </p>
                                <CodeBlock
                                    code="R2_ACCOUNT_ID=eba7a4693383ce39f359229132d1111f"
                                    language="bash"
                                />
                            </div>

                            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="h-4 w-4 text-green-600" />
                                    <p className="font-semibold text-green-900">Public Domain</p>
                                </div>
                                <p className="text-sm text-slate-700 mb-2">
                                    Từ phần <strong>Public R2.dev Bucket URL</strong> hoặc <strong>Custom Domain</strong>:
                                </p>
                                <CodeBlock
                                    code="https://pub-xxx.r2.dev"
                                    language="text"
                                />
                                <p className="text-sm text-slate-600 mt-2">
                                    Hoặc cấu hình custom domain (khuyến nghị):
                                </p>
                                <CodeBlock
                                    code="R2_PUBLIC_BASE_URL=api.openvpn.panel"
                                    language="bash"
                                />
                            </div>
                        </div>
                    </div>
                </Step>

                <Step
                    number={4}
                    title="Cấu hình Custom Domain (Tùy chọn nhưng khuyến nghị)"
                    description="Sử dụng domain riêng của bạn thay vì r2.dev mặc định:"
                >
                    <ol className="space-y-2 text-sm text-slate-700 mb-4">
                        <li>1. Trong Bucket Settings, tìm mục <strong>Custom Domains</strong></li>
                        <li>2. Click <strong>Connect Domain</strong></li>
                        <li>3. Nhập subdomain (ví dụ: <code>api.openvpn.panel</code>)</li>
                        <li>4. Cloudflare sẽ tự động tạo DNS record</li>
                        <li>5. Đợi vài phút để DNS propagate</li>
                    </ol>
                    <Alert variant="success">
                        <AlertDescription>
                            <strong>Lợi ích:</strong> Domain riêng giúp dễ quản lý, professional hơn và có thể thêm các rule bảo mật tùy chỉnh.
                        </AlertDescription>
                    </Alert>
                </Step>

                <Step
                    number={5}
                    title="Cấu hình bảo mật với Firewall Rules"
                    description="Bảo vệ file cấu hình bằng token authentication:"
                >
                    <p className="text-sm text-slate-700 mb-4">
                        Vì R2 bucket với custom domain sẽ public, chúng ta cần thêm WAF rule để chỉ cho phép request có token hợp lệ:
                    </p>

                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold mb-2">Bước 1: Tạo WAF Custom Rule</p>
                            <ol className="space-y-2 text-sm text-slate-700">
                                <li>1. Vào domain quản lý trên Cloudflare Dashboard</li>
                                <li>2. Chọn <strong>Security → WAF → Custom rules</strong></li>
                                <li>3. Click <strong>Create rule</strong></li>
                            </ol>
                        </div>

                        <div className="rounded-lg border bg-slate-50 p-4 mb-4">
                            <img 
                                src="https://gist.github.com/user-attachments/assets/ac2b490d-3723-4601-b01a-0fdf8778c175"
                                alt="Firewall Rule"
                                className="w-full rounded-md border"
                            />
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Bước 2: Cấu hình Rule Expression</p>
                            <CodeBlock
                                code={`(http.host eq "api.openvpn.panel" and not http.request.uri.query contains "token=8638b5a1-77df-4d24-8253-58977fa508a4")`}
                                title="Expression"
                                language="text"
                            />
                            <p className="text-sm text-slate-600 mt-2 mb-2">Giải thích:</p>
                            <ul className="text-sm text-slate-700 space-y-1">
                                <li>→ Áp dụng cho domain <code>api.openvpn.panel</code></li>
                                <li>→ Chặn tất cả request không có <code>?token=YOUR_TOKEN</code></li>
                                <li>→ Action: <strong>Block</strong></li>
                            </ul>
                        </div>

                        <Alert variant="warning">
                            <AlertDescription>
                                <strong>Quan trọng:</strong> Thay <code>8638b5a1-77df-4d24-8253-58977fa508a4</code> bằng token tùy chỉnh của bạn (giá trị của <code>R2_DOWNLOAD_TOKEN</code>)
                            </AlertDescription>
                        </Alert>

                        <div>
                            <p className="font-semibold mb-2">Cách hoạt động</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                                    <p className="font-semibold text-red-900 mb-2">❌ Bị chặn</p>
                                    <CodeBlock
                                        code="https://api.openvpn.panel/user123.ovpn"
                                        language="text"
                                    />
                                </div>
                                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                                    <p className="font-semibold text-green-900 mb-2">✅ Cho phép</p>
                                    <CodeBlock
                                        code="https://api.openvpn.panel/user123.ovpn?token=YOUR_TOKEN"
                                        language="text"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Step>

                <Step
                    number={6}
                    title="Cập nhật biến môi trường và khởi động lại"
                    description="Hoàn tất cấu hình và áp dụng thay đổi:"
                >
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold mb-2">Mở file .env</p>
                            <CodeBlock
                                code="nano /opt/ovpanel/.env"
                                title="Terminal"
                                language="bash"
                            />
                        </div>

                        <div>
                            <p className="font-semibold mb-2">Thêm/cập nhật các biến sau</p>
                            <CodeBlock
                                code={`# Cloudflare R2 Storage Configuration
R2_ACCESS_KEY_ID=abc123xyz456def789ghi012
R2_SECRET_ACCESS_KEY=jkl345mno678pqr901stu234vwx567yz
R2_BUCKET_NAME=openvpn-configs
R2_ACCOUNT_ID=eba7a4693383ce39f359229132d1111f
R2_PUBLIC_BASE_URL=api.openvpn.panel
R2_DOWNLOAD_TOKEN=f7b3c2e1-9a8d-4f3e-b2c1-a0d9e8f7c6b5`}
                                title=".env"
                                language="bash"
                            />
                        </div>

                        <Alert variant="info">
                            <AlertDescription>
                                <strong>Lưu ý:</strong> Thay tất cả các giá trị ví dụ bằng thông tin thực tế từ các bước trước.
                            </AlertDescription>
                        </Alert>

                        <div>
                            <p className="font-semibold mb-2">Khởi động lại dịch vụ</p>
                            <CodeBlock
                                code={`# Khởi động lại backend để load biến môi trường mới
systemctl restart ovpanel

# Kiểm tra trạng thái
systemctl status ovpanel`}
                                title="Terminal"
                                language="bash"
                            />
                        </div>
                    </div>
                </Step>
            </Steps>

            <h2>Kiểm tra cấu hình</h2>
            <p>Sau khi hoàn tất các bước trên, hãy kiểm tra xem R2 Storage đã hoạt động chưa:</p>

            <div className="space-y-4 my-6">
                <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Upload className="h-6 w-6 text-primary" />
                        <h3 className="!mt-0 !mb-0 !before:content-none text-lg">1. Test Upload</h3>
                    </div>
                    <ol className="space-y-2 text-sm text-slate-700">
                        <li>1. Đăng nhập vào OV-Panel</li>
                        <li>2. Tạo một user mới hoặc cập nhật user hiện có</li>
                        <li>3. Kiểm tra Cloudflare R2 Dashboard → Bucket của bạn</li>
                        <li>4. Xác nhận file <code>.ovpn</code> đã được upload lên R2</li>
                    </ol>
                </div>

                <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Download className="h-6 w-6 text-primary" />
                        <h3 className="!mt-0 !mb-0 !before:content-none text-lg">2. Test Download</h3>
                    </div>
                    <ol className="space-y-2 text-sm text-slate-700">
                        <li>1. Trong OV-Panel, click nút download config của user</li>
                        <li>2. URL sẽ có dạng: <code>https://api.openvpn.panel/user123.ovpn?token=YOUR_TOKEN</code></li>
                        <li>3. File nên download thành công</li>
                        <li>4. Nếu bỏ <code>?token=...</code>, request sẽ bị chặn bởi WAF</li>
                    </ol>
                </div>
            </div>

            <h2>Troubleshooting</h2>
            
            <div className="space-y-4 my-6">
                <details className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <summary className="font-semibold cursor-pointer text-slate-800">
                        ❌ Lỗi: "Access Denied" khi upload file
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <p><strong>Nguyên nhân:</strong> API Token không có đủ quyền hoặc sai bucket.</p>
                        <p><strong>Giải pháp:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Kiểm tra API Token có quyền <strong>Object Read & Write</strong></li>
                            <li>Xác nhận token được apply cho đúng bucket (<code>R2_BUCKET_NAME</code>)</li>
                            <li>Thử tạo token mới với full permissions</li>
                        </ul>
                    </div>
                </details>

                <details className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <summary className="font-semibold cursor-pointer text-slate-800">
                        ❌ Lỗi: "InvalidAccessKeyId"
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <p><strong>Nguyên nhân:</strong> Sai <code>R2_ACCESS_KEY_ID</code> hoặc <code>R2_SECRET_ACCESS_KEY</code>.</p>
                        <p><strong>Giải pháp:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Kiểm tra lại credentials trong file <code>.env</code></li>
                            <li>Đảm bảo không có khoảng trắng thừa</li>
                            <li>Tạo API Token mới nếu cần</li>
                        </ul>
                    </div>
                </details>

                <details className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <summary className="font-semibold cursor-pointer text-slate-800">
                        ❌ Lỗi: "NoSuchBucket"
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <p><strong>Nguyên nhân:</strong> Sai tên bucket hoặc bucket không tồn tại.</p>
                        <p><strong>Giải pháp:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Kiểm tra <code>R2_BUCKET_NAME</code> khớp với tên bucket trên Cloudflare</li>
                            <li>Bucket name phân biệt chữ hoa/thường</li>
                            <li>Xác nhận bucket đã được tạo thành công</li>
                        </ul>
                    </div>
                </details>

                <details className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <summary className="font-semibold cursor-pointer text-slate-800">
                        ❌ Download bị chặn dù có token
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <p><strong>Nguyên nhân:</strong> WAF rule không khớp với token trong <code>.env</code>.</p>
                        <p><strong>Giải pháp:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Đảm bảo <code>R2_DOWNLOAD_TOKEN</code> trong <code>.env</code> khớp với token trong WAF rule</li>
                            <li>Kiểm tra WAF rule đang enabled</li>
                            <li>Xem Cloudflare Firewall Events để debug</li>
                        </ul>
                    </div>
                </details>

                <details className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <summary className="font-semibold cursor-pointer text-slate-800">
                        ❌ Download thành công nhưng không có token
                    </summary>
                    <div className="mt-3 text-sm text-slate-700 space-y-2">
                        <p><strong>Nguyên nhân:</strong> WAF rule chưa được áp dụng hoặc expression sai.</p>
                        <p><strong>Giải pháp:</strong></p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Kiểm tra Custom Domain đã connect đúng chưa</li>
                            <li>Xác nhận WAF rule đang ở trạng thái <strong>Deployed</strong></li>
                            <li>Đợi vài phút để rule propagate</li>
                            <li>Test với curl: <code>curl https://api.openvpn.panel/test.txt</code> (phải bị chặn)</li>
                        </ul>
                    </div>
                </details>
            </div>

            <h2>Chi phí dự kiến</h2>
            <p>Cloudflare R2 có mức giá rất cạnh tranh, phù hợp cho mọi quy mô:</p>

            <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-6 my-6">
                <h3 className="!mt-0 !before:content-none text-xl mb-4">Bảng giá R2 Storage</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="font-semibold">Storage</span>
                        <span className="text-sm">$0.015/GB/tháng (10GB đầu tiên FREE)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="font-semibold">Class A Operations (Write)</span>
                        <span className="text-sm">$4.50/triệu request (1 triệu đầu FREE)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <span className="font-semibold">Class B Operations (Read)</span>
                        <span className="text-sm">$0.36/triệu request (10 triệu đầu FREE)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="font-semibold">Egress Bandwidth</span>
                        <Badge variant="success">MIỄN PHÍ 100%</Badge>
                    </div>
                </div>

                <Alert variant="success" className="mt-4">
                    <AlertDescription>
                        <strong>Ví dụ:</strong> Với 1000 users, mỗi file cấu hình ~10KB = 10MB total. Chi phí chỉ <strong>$0</strong> (nằm trong free tier)!
                    </AlertDescription>
                </Alert>
            </div>

            <h2>Tích hợp nâng cao</h2>
            <p>R2 Storage không chỉ dùng cho file cấu hình, bạn có thể mở rộng để:</p>

            <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-primary mb-2">📊 Backup Database</h4>
                    <p className="text-sm text-slate-600">
                        Tự động backup PostgreSQL database lên R2 hàng ngày để đảm bảo an toàn dữ liệu.
                    </p>
                </div>
                <div className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-primary mb-2">📝 Log Storage</h4>
                    <p className="text-sm text-slate-600">
                        Lưu trữ application logs và audit logs dài hạn với chi phí thấp.
                    </p>
                </div>
                <div className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-primary mb-2">🎨 Static Assets</h4>
                    <p className="text-sm text-slate-600">
                        Serve images, stylesheets, scripts qua CDN toàn cầu của Cloudflare.
                    </p>
                </div>
                <div className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-primary mb-2">📦 Package Repository</h4>
                    <p className="text-sm text-slate-600">
                        Host các OpenVPN client packages (.exe, .deb, .apk) cho user download.
                    </p>
                </div>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Mẹo:</strong> Kết hợp R2 với Cloudflare Workers để xử lý file trước khi serve (resize image, compress, validate, etc.)
                </AlertDescription>
            </Alert>

            <h2>Tài liệu tham khảo</h2>
            <ul className="space-y-2">
                <li>
                    <a href="https://developers.cloudflare.com/r2/" target="_blank" rel="noopener" className="text-primary hover:underline">
                        📖 Cloudflare R2 Documentation
                    </a>
                </li>
                <li>
                    <a href="https://developers.cloudflare.com/r2/api/s3/tokens/" target="_blank" rel="noopener" className="text-primary hover:underline">
                        🔑 R2 API Tokens Guide
                    </a>
                </li>
                <li>
                    <a href="https://developers.cloudflare.com/r2/buckets/public-buckets/" target="_blank" rel="noopener" className="text-primary hover:underline">
                        🌐 Public Buckets and Custom Domains
                    </a>
                </li>
                <li>
                    <a href="https://developers.cloudflare.com/waf/custom-rules/" target="_blank" rel="noopener" className="text-primary hover:underline">
                        🛡️ WAF Custom Rules
                    </a>
                </li>
            </ul>
        </DocLayout>
    );
}
