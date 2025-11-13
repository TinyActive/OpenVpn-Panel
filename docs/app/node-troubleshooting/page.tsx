"use client"

import { DocLayout } from "@/components/doc-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { AlertCircle, Terminal, CheckCircle2, XCircle, Activity, Shield } from "lucide-react";

export default function NodeTroubleshooting() {
    return (
        <DocLayout>
            <div className="max-w-4xl">
                <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight">Xử Lý Sự Cố OV-Node</h1>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Hướng dẫn giải quyết các vấn đề thường gặp với OV-Node
                    </p>
                </div>

                {/* Common Issues */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Sự Cố 1: Service Không Khởi Động
                        </CardTitle>
                        <CardDescription>
                            OV-Node service không chạy hoặc failed khi start
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-red-900">Triệu chứng</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo systemctl status ov-node
# Active: failed`}
                                />
                            </div>
                        </Alert>

                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-primary" />
                                Nguyên nhân & Giải pháp
                            </h4>

                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">1. Lỗi cấu hình .env</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Kiểm tra file .env
sudo cat /opt/ov-node/.env

# Đảm bảo có đủ các field bắt buộc:
# - SERVICE_PORT
# - API_KEY`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">2. Port đã được sử dụng</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Kiểm tra port
sudo netstat -tulpn | grep 9090

# Nếu port đang được dùng, đổi port trong .env
sudo nano /opt/ov-node/.env
# Thay SERVICE_PORT = 9091

sudo systemctl restart ov-node`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">3. Lỗi Python dependencies</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Reinstall dependencies
cd /opt/ov-node
sudo /opt/ov-node/venv/bin/pip install -r requirements.txt

sudo systemctl restart ov-node`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">4. Permission issues</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Fix permissions
sudo chown -R root:root /opt/ov-node
sudo chmod -R 755 /opt/ov-node

sudo systemctl restart ov-node`}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Connection Issues */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Sự Cố 2: Panel Không Kết Nối Được Node
                        </CardTitle>
                        <CardDescription>
                            Node hiển thị "Offline" hoặc "Connection Failed" trên Panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-yellow-900">Triệu chứng</p>
                                <p className="text-sm text-yellow-800 mt-1">
                                    Node không thể kết nối từ Panel, hiển thị offline
                                </p>
                            </div>
                        </Alert>

                        <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Các bước kiểm tra
                            </h4>

                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">1. Service đang chạy trên Node?</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo systemctl status ov-node`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">2. Port có mở không?</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo netstat -tulpn | grep 9090`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">3. Firewall có block không?</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Test từ Panel server
telnet NODE_IP 9090

# Nếu không kết nối được, mở port
sudo ufw allow 9090/tcp`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">4. API Key có đúng không?</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`# Check API key trên Node
sudo cat /opt/ov-node/.env | grep API_KEY

# So sánh với API key trên Panel`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">5. Test từ Panel server</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`curl -X POST http://NODE_IP:9090/sync/get-status \\
  -H "key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"set_new_setting": false}'`}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* OpenVPN Issues */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Sự Cố 3: OpenVPN Service Không Chạy
                        </CardTitle>
                        <CardDescription>
                            Health check endpoint báo "unhealthy"
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-3">Giải pháp nhanh</h4>

                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">1. Kiểm tra service status</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo systemctl status openvpn-server@server`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <p className="font-medium mb-2">2. Sử dụng auto-fix (Khuyến nghị)</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`curl -X POST http://localhost:9090/sync/openvpn/fix \\
  -H "key: YOUR_API_KEY"`}
                                    />
                                    <Alert className="mt-3 border-blue-200 bg-blue-100">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm text-blue-800 ml-2">
                                            Auto-fix sẽ tự động sửa các vấn đề phổ biến
                                        </p>
                                    </Alert>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">3. Manual restart</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo systemctl restart openvpn-server@server`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">4. Check config</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo cat /etc/openvpn/server/server.conf

# Test config
sudo openvpn --config /etc/openvpn/server/server.conf --test-crypto`}
                                    />
                                </div>

                                <div className="border rounded-lg p-4">
                                    <p className="font-medium mb-2">5. Check logs</p>
                                    <CodeBlock
                                        language="bash"
                                        code={`sudo journalctl -u openvpn-server@server -n 50`}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Creation Issues */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Sự Cố 4: Không Tạo Được User
                        </CardTitle>
                        <CardDescription>
                            API trả về "Failed to create user"
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">1. OpenVPN script có tồn tại?</p>
                                <CodeBlock
                                    language="bash"
                                    code={`ls -la /root/openvpn-install.sh`}
                                />
                            </div>

                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">2. Script có executable permission?</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo chmod +x /root/openvpn-install.sh`}
                                />
                            </div>

                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">3. Thử tạo user manually</p>
                                <CodeBlock
                                    language="bash"
                                    code={`cd /root
sudo bash openvpn-install.sh
# Chọn option 1 để add user`}
                                />
                            </div>

                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">4. Check disk space</p>
                                <CodeBlock
                                    language="bash"
                                    code={`df -h`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Issues */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Sự Cố 5: High CPU/Memory Usage
                        </CardTitle>
                        <CardDescription>
                            Node báo CPU hoặc RAM cao
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">1. Process resource usage</p>
                                <CodeBlock
                                    language="bash"
                                    code={`top -p $(pgrep -f "ov-node")`}
                                />
                            </div>

                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">2. Check connections</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo netstat -an | grep 9090 | wc -l`}
                                />
                            </div>

                            <div className="border rounded-lg p-4">
                                <p className="font-medium mb-2">3. Restart service</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo systemctl restart ov-node`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* API Errors */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Sự Cố 6: API Trả Về 401 Unauthorized
                        </CardTitle>
                        <CardDescription>
                            Tất cả API calls đều return 401
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <div className="ml-2">
                                <p className="text-sm font-medium text-red-900">Nguyên nhân</p>
                                <p className="text-sm text-red-800 mt-1">
                                    API key không khớp giữa Panel và Node
                                </p>
                            </div>
                        </Alert>

                        <div className="border rounded-lg p-4">
                            <p className="font-medium mb-2">Giải pháp</p>
                            <CodeBlock
                                language="bash"
                                code={`# Check API key trên Node
sudo cat /opt/ov-node/.env | grep API_KEY

# Update API key trên Panel để khớp
# Hoặc update API key trên Node và restart
sudo nano /opt/ov-node/.env
sudo systemctl restart ov-node`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Useful Logs */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            Logs Hữu Ích
                        </CardTitle>
                        <CardDescription>
                            Các lệnh để xem logs khi troubleshooting
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-sm mb-2">OV-Node application logs</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo journalctl -u ov-node -n 100 --no-pager`}
                                />
                            </div>

                            <div>
                                <p className="font-medium text-sm mb-2">OpenVPN logs</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo journalctl -u openvpn-server@server -n 100 --no-pager`}
                                />
                            </div>

                            <div>
                                <p className="font-medium text-sm mb-2">System logs</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo dmesg | tail -50`}
                                />
                            </div>

                            <div>
                                <p className="font-medium text-sm mb-2">Check for errors</p>
                                <CodeBlock
                                    language="bash"
                                    code={`sudo journalctl -p err -n 50`}
                                />
                            </div>

                            <div>
                                <p className="font-medium text-sm mb-2">Real-time logs</p>
                                <CodeBlock
                                    language="bash"
                                    code={`# Follow OV-Node logs
sudo journalctl -u ov-node -f

# Follow OpenVPN logs
sudo journalctl -u openvpn-server@server -f`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Diagnostic */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Quick Diagnostic Script
                        </CardTitle>
                        <CardDescription>
                            Script nhanh để kiểm tra tất cả
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            language="bash"
                            code={`#!/bin/bash

echo "=== OV-Node Diagnostic ==="
echo ""

echo "1. Service Status:"
systemctl is-active ov-node
systemctl is-active openvpn-server@server
echo ""

echo "2. Port Listening:"
netstat -tulpn | grep -E "(9090|1194)"
echo ""

echo "3. API Key:"
grep API_KEY /opt/ov-node/.env
echo ""

echo "4. Recent Errors:"
journalctl -u ov-node -p err -n 10 --no-pager
echo ""

echo "5. Disk Space:"
df -h | grep -E "(Filesystem|/$)"
echo ""

echo "6. Memory Usage:"
free -h
echo ""

echo "=== End Diagnostic ==="`}
                        />
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground mb-2">Để sử dụng:</p>
                            <CodeBlock
                                language="bash"
                                code={`# Tạo file
sudo nano /root/ov-node-diagnostic.sh

# Paste nội dung script ở trên, sau đó:
sudo chmod +x /root/ov-node-diagnostic.sh
sudo bash /root/ov-node-diagnostic.sh`}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DocLayout>
    );
}
