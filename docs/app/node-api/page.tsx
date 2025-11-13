"use client"

import { DocLayout } from "@/components/doc-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { FileCode, Server, Activity, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function NodeAPI() {
    return (
        <DocLayout>
            <div className="max-w-4xl">
                <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2">
                        <FileCode className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight">Node API Reference</h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Tài liệu chi tiết về các REST API endpoints của OV-Node
                    </p>
                </div>

                <Alert className="mb-8 border-primary/50 bg-primary/5">
                    <Lock className="h-4 w-4" />
                    <div className="ml-2">
                        <h4 className="font-semibold">Authentication</h4>
                        <p className="text-sm mt-1">
                            Tất cả các API endpoints đều yêu cầu xác thực bằng API Key trong header <code className="bg-slate-100 px-1.5 py-0.5 rounded">key</code>
                        </p>
                    </div>
                </Alert>

                {/* Base URL */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Base URL</CardTitle>
                        <CardDescription>URL cơ sở cho tất cả API requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            language="bash"
                            code={`http://YOUR_NODE_IP:9090`}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                            Thay thế <code className="bg-slate-100 px-1.5 py-0.5 rounded">YOUR_NODE_IP</code> bằng IP hoặc domain của Node.
                        </p>
                    </CardContent>
                </Card>

                {/* Get Status */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Get Status
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Lấy trạng thái hiện tại của Node và cập nhật cấu hình OpenVPN
                                </CardDescription>
                            </div>
                            <Badge variant="default">POST</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`POST /sync/get-status`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Request Body</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "set_new_setting": false,
  "protocol": "udp",        // optional: "udp" or "tcp"
  "port": 1194,             // optional: OpenVPN port
  "dns": "1.1.1.1"          // optional: DNS server
}`}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                • <code>set_new_setting</code>: <code>true</code> để cập nhật cấu hình OpenVPN, <code>false</code> để chỉ lấy status
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response</h4>
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

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X POST http://YOUR_NODE_IP:9090/sync/get-status \\
  -H "key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "set_new_setting": false
  }'`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Create User */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Create User
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Tạo người dùng OpenVPN mới trên Node
                                </CardDescription>
                            </div>
                            <Badge variant="default">POST</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`POST /sync/create-user`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Request Body</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "name": "username"
}`}
                            />
                            <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <div className="ml-2">
                                    <p className="text-sm text-yellow-800">
                                        Username chỉ được chứa chữ cái, số và dấu gạch dưới
                                    </p>
                                </div>
                            </Alert>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response (Success)</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": true,
  "msg": "User created successfully",
  "data": {
    "client_name": "username"
  }
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response (Error)</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": false,
  "msg": "Failed to create user",
  "data": null
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X POST http://YOUR_NODE_IP:9090/sync/create-user \\
  -H "key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "testuser"
  }'`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Delete User */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Delete User
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Xóa người dùng OpenVPN khỏi Node
                                </CardDescription>
                            </div>
                            <Badge variant="destructive">POST</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`POST /sync/delete-user`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY",
  "Content-Type": "application/json"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Request Body</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "name": "username"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": true,
  "msg": "User deleted successfully",
  "data": {
    "client_name": "username"
  }
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X POST http://YOUR_NODE_IP:9090/sync/delete-user \\
  -H "key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "testuser"
  }'`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Download OVPN */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileCode className="h-5 w-5" />
                                    Download OVPN File
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Tải file cấu hình .ovpn của người dùng
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">GET</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`GET /sync/download/ovpn/{client_name}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Path Parameters</h4>
                            <div className="bg-slate-50 p-3 rounded-lg border text-sm">
                                • <code className="bg-slate-100 px-1.5 py-0.5 rounded">client_name</code>: Tên người dùng cần tải file cấu hình
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                                Trả về file .ovpn với header:
                            </p>
                            <CodeBlock
                                language="bash"
                                code={`Content-Type: application/x-openvpn-profile
Content-Disposition: attachment; filename="username.ovpn"`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X GET http://YOUR_NODE_IP:9090/sync/download/ovpn/testuser \\
  -H "key: YOUR_API_KEY" \\
  --output testuser.ovpn`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Health Check */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    OpenVPN Health Check
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Kiểm tra tình trạng hoạt động của OpenVPN service
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">GET</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`GET /sync/openvpn/health`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response (Healthy)</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": true,
  "msg": "OpenVPN health check completed",
  "data": {
    "healthy": true,
    "service_running": true,
    "port_listening": true,
    "config_valid": true,
    "issues": []
  }
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response (Unhealthy)</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": false,
  "msg": "OpenVPN health check completed",
  "data": {
    "healthy": false,
    "service_running": false,
    "port_listening": false,
    "config_valid": true,
    "issues": [
      "OpenVPN service is not running",
      "Port 1194 is not listening"
    ]
  }
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X GET http://YOUR_NODE_IP:9090/sync/openvpn/health \\
  -H "key: YOUR_API_KEY"`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Auto Fix */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    Auto-Fix OpenVPN
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Tự động phát hiện và sửa các vấn đề của OpenVPN service
                                </CardDescription>
                            </div>
                            <Badge variant="default">POST</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Endpoint</h4>
                            <CodeBlock
                                language="bash"
                                code={`POST /sync/openvpn/fix`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Headers</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "key": "YOUR_API_KEY"
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Response (Success)</h4>
                            <CodeBlock
                                language="json"
                                code={`{
  "success": true,
  "msg": "OpenVPN auto-fix completed",
  "data": {
    "success": true,
    "actions_taken": [
      "Fixed missing IP in config",
      "Restarted OpenVPN service"
    ],
    "healthy": true
  }
}`}
                            />
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">cURL Example</h4>
                            <CodeBlock
                                language="bash"
                                code={`curl -X POST http://YOUR_NODE_IP:9090/sync/openvpn/fix \\
  -H "key: YOUR_API_KEY"`}
                            />
                        </div>

                        <Alert className="border-blue-200 bg-blue-50">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-blue-900">Tự động sửa lỗi</p>
                                <p className="text-sm text-blue-800 mt-1">
                                    Endpoint này sẽ tự động thực hiện các hành động sau nếu cần:
                                </p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                                    <li>• Sửa cấu hình OpenVPN thiếu IP</li>
                                    <li>• Enable service nếu chưa được enable</li>
                                    <li>• Khởi động lại service</li>
                                    <li>• Xác minh service đang chạy</li>
                                </ul>
                            </div>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Error Codes */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>HTTP Status Codes</CardTitle>
                        <CardDescription>Các mã trạng thái HTTP thường gặp</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Badge variant="outline" className="bg-green-100">200</Badge>
                                <div>
                                    <p className="font-semibold text-sm">OK</p>
                                    <p className="text-sm text-muted-foreground">Request thành công</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Badge variant="outline" className="bg-red-100">401</Badge>
                                <div>
                                    <p className="font-semibold text-sm">Unauthorized</p>
                                    <p className="text-sm text-muted-foreground">API key không hợp lệ hoặc thiếu</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <Badge variant="outline" className="bg-yellow-100">422</Badge>
                                <div>
                                    <p className="font-semibold text-sm">Unprocessable Entity</p>
                                    <p className="text-sm text-muted-foreground">Request body không hợp lệ</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <Badge variant="outline" className="bg-orange-100">500</Badge>
                                <div>
                                    <p className="font-semibold text-sm">Internal Server Error</p>
                                    <p className="text-sm text-muted-foreground">Lỗi server, kiểm tra logs</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rate Limiting */}
                <Card>
                    <CardHeader>
                        <CardTitle>Best Practices</CardTitle>
                        <CardDescription>Khuyến nghị khi sử dụng API</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Luôn kiểm tra <code className="bg-slate-100 px-1.5 py-0.5 rounded">success</code> field trong response</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Xử lý lỗi 401 bằng cách kiểm tra lại API key</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Sử dụng HTTPS trong production với reverse proxy (nginx)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Giữ API key bí mật và không commit vào git</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                <span>Sử dụng health check endpoint để monitoring</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </DocLayout>
    );
}
