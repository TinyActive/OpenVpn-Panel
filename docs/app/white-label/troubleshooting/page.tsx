import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle, Zap, Database, Network, Shield, HelpCircle } from "lucide-react";

export default function TroubleshootingPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Xử lý sự cố White-Label System</h1>
                <Badge variant="warning">Troubleshooting</Badge>
            </div>

            <p className="lead">
                Hướng dẫn chi tiết về cách chẩn đoán và khắc phục các vấn đề thường gặp
                khi triển khai và vận hành hệ thống White-Label OV-Panel.
            </p>

            <h2>Vấn đề: Instance không khởi động</h2>

            <Card className="my-6 border-l-4 border-l-red-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Service status hiển thị failed hoặc inactive</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`systemctl status ov-panel-instance@<uuid>
# Output: Active: failed (Result: exit-code)`}
                        language="bash"
                    />
                </CardContent>
            </Card>

            <h3>Các bước chẩn đoán</h3>

            <div className="space-y-6 my-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">1. Kiểm tra logs chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Xem logs từ journalctl
journalctl -u ov-panel-instance@<uuid> -n 100

# Xem error log file
tail -n 50 /opt/ov-panel-instances/instance-<uuid>/logs/error.log`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">2. Kiểm tra port conflict</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Kiểm tra port đã được sử dụng chưa
netstat -tulpn | grep <port>

# Hoặc
lsof -i :<port>

# Nếu có output = port đã bị chiếm`}
                            language="bash"
                        />

                        <Alert variant="tip" className="mt-4">
                            <AlertDescription>
                                <strong>Giải pháp:</strong> Đổi port trong file .env và database, sau đó restart instance.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">3. Kiểm tra file .env</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Xem nội dung .env
cat /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>

# Kiểm tra:
# - Có đầy đủ variables không?
# - Format đúng không? (KEY=VALUE)
# - Port có đúng không?`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">4. Kiểm tra database file</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Kiểm tra file tồn tại và permissions
ls -la /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db

# Output mong đợi:
-rw-r--r-- 1 root root 245760 Nov 17 10:30 ov-panel.db`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">5. Test start manually</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`cd /opt/ov-panel
export INSTANCE_ID=<uuid>
source /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
/opt/ov-panel/venv/bin/python main.py

# Xem error trực tiếp nếu có`}
                            language="bash"
                        />
                    </CardContent>
                </Card>
            </div>

            <h3>Giải pháp phổ biến</h3>

            <div className="space-y-4 my-6">
                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardTitle className="text-base">Port conflict</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# 1. Edit .env và đổi port
nano /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
# PORT=9005

# 2. Update database
cd /opt/ov-panel
python3 -c "
from backend.db.engine import sessionLocal
from backend.db.models import WhiteLabelInstance
db = sessionLocal()
instance = db.query(WhiteLabelInstance).filter_by(instance_id='<uuid>').first()
instance.port = 9005
db.commit()
print('Port updated to 9005')
"

# 3. Restart instance
systemctl restart ov-panel-instance@<uuid>`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="text-base">Database corruption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# 1. Backup old database
mv /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db \\
   /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db.bak

# 2. Copy fresh sample
cp /opt/ov-panel/data/ov-panel-sample.db \\
   /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db

# 3. Restart instance
systemctl restart ov-panel-instance@<uuid>`}
                            language="bash"
                        />

                        <Alert variant="warning" className="mt-4">
                            <AlertDescription>
                                <strong>Lưu ý:</strong> Thao tác này sẽ mất dữ liệu. Chỉ sử dụng khi database bị lỗi nghiêm trọng.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>

            <h2>Vấn đề: Instance chạy nhưng không truy cập được</h2>

            <Card className="my-6 border-l-4 border-l-yellow-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Service = active nhưng không mở được trong browser</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`systemctl status ov-panel-instance@<uuid>
# Output: Active: active (running)

# Nhưng trình duyệt báo: Connection refused / Timeout`}
                        language="bash"
                    />
                </CardContent>
            </Card>

            <h3>Các bước kiểm tra</h3>

            <div className="space-y-4 my-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">1. Verify port listening</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`netstat -tulpn | grep <port>

# Phải thấy python process listening trên port đó
tcp        0      0 0.0.0.0:9001       0.0.0.0:*       LISTEN      12345/python`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">2. Test local connection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Test từ localhost
curl http://localhost:<port>/dashboard

# Nếu thành công = instance đang chạy OK
# Nếu failed = vấn đề ở application`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">3. Kiểm tra firewall</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Check UFW status
ufw status

# Check iptables
iptables -L -n -v | grep <port>`}
                            language="bash"
                        />
                    </CardContent>
                </Card>
            </div>

            <h3>Giải pháp</h3>

            <div className="space-y-4 my-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="text-base">Firewall blocking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Mở port trong UFW
ufw allow <port>/tcp

# Hoặc mở range ports
ufw allow 9001:9999/tcp

# Reload firewall
ufw reload`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="text-base">Wrong HOST binding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Nếu HOST=127.0.0.1 thì chỉ access từ localhost
# Edit .env
nano /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>

# Đổi thành:
HOST=0.0.0.0

# Restart
systemctl restart ov-panel-instance@<uuid>`}
                            language="bash"
                        />
                    </CardContent>
                </Card>
            </div>

            <h2>Vấn đề: Database Migration Failed</h2>

            <Card className="my-6 border-l-4 border-l-purple-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Database className="h-6 w-6 text-purple-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Lỗi migration khi update code hoặc database</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`alembic.util.exc.CommandError: Target database is not up to date`}
                        language="text"
                    />
                </CardContent>
            </Card>

            <h3>Giải pháp</h3>

            <CodeBlock
                code={`# 1. Kiểm tra migration version hiện tại
cd /opt/ov-panel/backend
export INSTANCE_ID=<uuid>
alembic current

# 2. Force upgrade
alembic upgrade head

# 3. Nếu vẫn lỗi, stamp version
alembic stamp head

# 4. Restart instance
systemctl restart ov-panel-instance@<uuid>`}
                language="bash"
                title="Migration Fix"
            />

            <h2>Vấn đề: Super Admin Panel không show instances</h2>

            <Card className="my-6 border-l-4 border-l-orange-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <HelpCircle className="h-6 w-6 text-orange-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Web UI không hiển thị instances hoặc API trả về empty list</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <h3>Các bước kiểm tra</h3>

            <div className="space-y-4 my-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">1. Verify database</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`sqlite3 /opt/ov-panel/data/ov-panel.db "SELECT * FROM whitelabel_instances;"

# Phải thấy instances nếu đã tạo`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">2. Test API endpoint</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Get JWT token
TOKEN=$(curl -X POST http://localhost:9000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"superadmin","password":"yourpassword"}' \\
  | jq -r '.data.access_token')

# List instances via API
curl http://localhost:9000/api/whitelabel/list \\
  -H "Authorization: Bearer $TOKEN" | jq`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">3. Check logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`journalctl -u ov-panel -n 100 | grep -i "error\|exception"`}
                            language="bash"
                        />
                    </CardContent>
                </Card>
            </div>

            <h2>Vấn đề: Shared symlinks broken</h2>

            <Card className="my-6 border-l-4 border-l-red-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Symlinks màu đỏ hoặc broken khi list</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`ls -la /opt/ov-panel-instances/shared/
# Symlinks hiển thị màu đỏ (broken)`}
                        language="bash"
                    />
                </CardContent>
            </Card>

            <h3>Giải pháp</h3>

            <CodeBlock
                code={`# Re-initialize shared directory
python3 /opt/ov-panel/whitelabel_cli.py init

# Hoặc manual fix
cd /opt/ov-panel-instances/shared
rm -f backend frontend main.py pyproject.toml

ln -s /opt/ov-panel/backend backend
ln -s /opt/ov-panel/frontend frontend
ln -s /opt/ov-panel/main.py main.py
ln -s /opt/ov-panel/pyproject.toml pyproject.toml

# Restart tất cả instances
systemctl restart ov-panel-instance@*.service`}
                language="bash"
                title="Fix Symlinks"
            />

            <h2>Vấn đề hiệu suất</h2>

            <Card className="my-6 border-l-4 border-l-yellow-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Zap className="h-6 w-6 text-yellow-600" />
                        <div>
                            <CardTitle>Triệu chứng</CardTitle>
                            <CardDescription>Instances chậm, high CPU/Memory usage</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <h3>Monitoring & Solutions</h3>

            <div className="space-y-4 my-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Monitor resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Top processes
top -u root | grep python

# Instance-specific
systemctl status ov-panel-instance@<uuid> | grep -E 'Memory|CPU'

# All instances
for svc in $(systemctl list-units 'ov-panel-instance@*' --no-legend | awk '{print $1}'); do
    echo "=== $svc ==="
    systemctl status $svc | grep -E 'Memory|CPU'
done`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Solutions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold mb-1">Too many connections:</p>
                                <CodeBlock
                                    code={`# Check connection count
netstat -an | grep <port> | wc -l

# Consider adding connection pooling or rate limiting`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-1">Memory leak:</p>
                                <CodeBlock
                                    code={`# Restart instance để free memory
systemctl restart ov-panel-instance@<uuid>

# Schedule periodic restarts (weekly)
# Crontab: 0 4 * * 0 systemctl restart ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-1">Disk full:</p>
                                <CodeBlock
                                    code={`# Check disk space
df -h

# Clean old logs
find /opt/ov-panel-instances/instance-*/logs/ -name "*.log" -mtime +30 -delete

# Rotate logs
logrotate -f /etc/logrotate.d/ov-panel-instances`}
                                    language="bash"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2>Best Practices để tránh vấn đề</h2>

            <div className="grid md:grid-cols-2 gap-4 my-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Regular Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Setup health check scripts (5 phút)</p>
                        <p>• Monitor resource usage daily</p>
                        <p>• Check logs for errors/warnings</p>
                        <p>• Track disk space growth</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Backup Strategy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Daily database backups</p>
                        <p>• Keep backups 30+ days</p>
                        <p>• Test restore procedures</p>
                        <p>• Backup configuration files</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Security Measures
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Strong passwords (>12 chars)</p>
                        <p>• Firewall properly configured</p>
                        <p>• Regular security updates</p>
                        <p>• Monitor suspicious activities</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Documentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p>• Document instance configurations</p>
                        <p>• Keep port assignment list</p>
                        <p>• Record maintenance history</p>
                        <p>• Share knowledge with team</p>
                    </CardContent>
                </Card>
            </div>

            <h2>Liên hệ hỗ trợ</h2>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border border-blue-200 dark:border-blue-800 p-6 my-6">
                <h3 className="text-lg font-semibold mb-4">Cần thêm hỗ trợ?</h3>

                <div className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold">Telegram Community:</p>
                        <a href="https://t.me/vouuvhb" className="text-primary hover:underline">@vouuvhb</a>
                    </div>

                    <div>
                        <p className="font-semibold">GitHub Issues:</p>
                        <a href="https://github.com/TinyActive/OpenVpn-Panel/issues" className="text-primary hover:underline">
                            TinyActive/OpenVpn-Panel/issues
                        </a>
                    </div>

                    <div>
                        <p className="font-semibold">Documentation:</p>
                        <p className="text-muted-foreground">Quay lại <a href="/white-label/introduction" className="text-primary underline">trang giới thiệu</a> để xem lại tài liệu</p>
                    </div>
                </div>
            </div>

            <Alert variant="tip">
                <AlertDescription>
                    <strong>Pro tip:</strong> Khi báo cáo vấn đề, hãy include: instance ID, logs,
                    system info (OS, RAM, CPU) và các bước bạn đã thử để dễ dàng nhận được hỗ trợ nhanh hơn.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
