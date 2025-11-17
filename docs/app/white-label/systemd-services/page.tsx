import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Activity, FileText, BarChart, Server, Clock, HardDrive } from "lucide-react";

export default function SystemdServicesPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Systemd Services & Monitoring</h1>
                <Badge>System Administration</Badge>
            </div>

            <p className="lead">
                Hướng dẫn chi tiết về quản lý systemd services cho White-Label instances,
                monitoring logs, resource usage và maintenance tasks.
            </p>

            <Alert variant="info">
                <AlertDescription>
                    Mỗi instance được quản lý bởi systemd service với tên format: <code>ov-panel-instance@&lt;uuid&gt;.service</code>
                </AlertDescription>
            </Alert>

            <h2>Quản lý Systemd Services</h2>

            <h3>Service Commands cơ bản</h3>

            <div className="space-y-6 my-8">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle>Check Service Status</CardTitle>
                        <CardDescription>Kiểm tra trạng thái và thông tin chi tiết của instance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`systemctl status ov-panel-instance@<uuid>`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <p className="font-semibold mb-2">Output mẫu:</p>
                            <CodeBlock
                                code={`● ov-panel-instance@a1b2c3d4-5678-90ab-cdef-1234567890ab.service
     Loaded: loaded (/etc/systemd/system/ov-panel-instance@.service; enabled)
     Active: active (running) since Mon 2025-11-17 10:30:45 UTC; 2h 15min ago
   Main PID: 12345 (python)
      Tasks: 8 (limit: 4915)
     Memory: 85.2M
        CPU: 1min 23.456s
     CGroup: /system.slice/ov-panel-instance@a1b2c3d4.service
             └─12345 /opt/ov-panel/venv/bin/python main.py`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle>Start / Stop / Restart</CardTitle>
                        <CardDescription>Điều khiển lifecycle của instance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold mb-2">Start instance:</p>
                                <CodeBlock
                                    code={`systemctl start ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Stop instance:</p>
                                <CodeBlock
                                    code={`systemctl stop ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Restart instance:</p>
                                <CodeBlock
                                    code={`systemctl restart ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <CardTitle>Enable / Disable Auto-Start</CardTitle>
                        <CardDescription>Cấu hình instance tự động start khi boot</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold mb-2">Enable auto-start:</p>
                                <CodeBlock
                                    code={`systemctl enable ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Instance sẽ tự động start khi server reboot
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Disable auto-start:</p>
                                <CodeBlock
                                    code={`systemctl disable ov-panel-instance@<uuid>`}
                                    language="bash"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Instance sẽ KHÔNG tự động start khi reboot
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h3>Batch Management</h3>

            <p>Quản lý nhiều instances cùng lúc:</p>

            <div className="space-y-4 my-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Start/Stop tất cả instances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Start tất cả instances
systemctl start ov-panel-instance@*.service

# Stop tất cả instances
systemctl stop ov-panel-instance@*.service

# Restart tất cả instances
systemctl restart ov-panel-instance@*.service`}
                            language="bash"
                        />

                        <Alert variant="warning" className="mt-4">
                            <AlertDescription>
                                <strong>Cảnh báo:</strong> Lệnh này sẽ ảnh hưởng đến TẤT CẢ instances.
                                Sử dụng cẩn thận trong môi trường production.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">List tất cả Instance Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`systemctl list-units 'ov-panel-instance@*'`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <p className="font-semibold mb-2">Output mẫu:</p>
                            <CodeBlock
                                code={`UNIT                                                        LOAD   ACTIVE SUB     
ov-panel-instance@a1b2c3d4-5678-90ab-cdef-1234567890ab.service loaded active running
ov-panel-instance@b2c3d4e5-6789-01bc-def0-234567890abc.service loaded active running
ov-panel-instance@c3d4e5f6-7890-12cd-ef01-34567890abcd.service loaded active running`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2>Log Management</h2>

            <h3>Journalctl Logs</h3>

            <div className="space-y-6 my-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <div>
                                <CardTitle>View Real-time Logs</CardTitle>
                                <CardDescription>Theo dõi logs trực tiếp từ journalctl</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold mb-2">Follow logs (real-time):</p>
                                <CodeBlock
                                    code={`journalctl -u ov-panel-instance@<uuid> -f`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Last 100 lines:</p>
                                <CodeBlock
                                    code={`journalctl -u ov-panel-instance@<uuid> -n 100`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Logs từ 1 giờ trước:</p>
                                <CodeBlock
                                    code={`journalctl -u ov-panel-instance@<uuid> --since "1 hour ago"`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Logs theo ngày cụ thể:</p>
                                <CodeBlock
                                    code={`journalctl -u ov-panel-instance@<uuid> \\
  --since "2025-11-17" \\
  --until "2025-11-18"`}
                                    language="bash"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h3>File Logs</h3>

            <p>Instance logs được lưu trong thư mục riêng:</p>

            <div className="overflow-x-auto my-6">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">File</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Mô tả</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Command</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3"><code>output.log</code></td>
                            <td className="p-3">Stdout logs</td>
                            <td className="p-3">
                                <code className="text-xs">tail -f /opt/ov-panel-instances/instance-&lt;uuid&gt;/logs/output.log</code>
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3"><code>error.log</code></td>
                            <td className="p-3">Stderr logs</td>
                            <td className="p-3">
                                <code className="text-xs">tail -f /opt/ov-panel-instances/instance-&lt;uuid&gt;/logs/error.log</code>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <CodeBlock
                code={`# View last 200 lines of output log
tail -n 200 /opt/ov-panel-instances/instance-<uuid>/logs/output.log

# Follow error log
tail -f /opt/ov-panel-instances/instance-<uuid>/logs/error.log

# Search for specific errors
grep -i "error\|exception" /opt/ov-panel-instances/instance-<uuid>/logs/error.log`}
                title="Log Commands"
                language="bash"
            />

            <h2>Resource Monitoring</h2>

            <div className="space-y-6 my-8">
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Activity className="h-6 w-6 text-purple-600" />
                            <div>
                                <CardTitle>CPU & Memory Usage</CardTitle>
                                <CardDescription>Kiểm tra resource usage của instances</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold mb-2">Một instance cụ thể:</p>
                                <CodeBlock
                                    code={`systemctl status ov-panel-instance@<uuid> | grep -E 'Memory|CPU'

# Output:
     Memory: 85.2M
        CPU: 1min 23.456s`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Tất cả instances:</p>
                                <CodeBlock
                                    code={`for svc in $(systemctl list-units 'ov-panel-instance@*' --no-legend | awk '{print $1}'); do
    echo "=== $svc ==="
    systemctl status $svc | grep -E 'Memory|CPU'
done`}
                                    language="bash"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-6 w-6 text-orange-600" />
                            <div>
                                <CardTitle>Disk Usage</CardTitle>
                                <CardDescription>Kiểm tra dung lượng đĩa của instances</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`# Instance directories
du -sh /opt/ov-panel-instances/instance-*

# Database sizes
du -sh /opt/ov-panel-instances/instance-*/data/ov-panel.db

# Output mẫu:
150M    /opt/ov-panel-instances/instance-a1b2c3d4
230M    /opt/ov-panel-instances/instance-b2c3d4e5
180M    /opt/ov-panel-instances/instance-c3d4e5f6`}
                            language="bash"
                        />
                    </CardContent>
                </Card>
            </div>

            <h2>Automated Monitoring Scripts</h2>

            <Card className="my-6">
                <CardHeader>
                    <CardTitle>Health Check Script</CardTitle>
                    <CardDescription>Script tự động kiểm tra và alert khi có vấn đề</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`#!/bin/bash
# /opt/scripts/health-check-instances.sh

# Get all instances from database
instances=$(python3 -c "
from backend.db.engine import sessionLocal
from backend.db.models import WhiteLabelInstance
db = sessionLocal()
instances = db.query(WhiteLabelInstance).all()
for i in instances:
    print(f'{i.instance_id}:{i.port}')
")

for entry in $instances; do
    IFS=':' read -r uuid port <<< "$entry"
    
    # HTTP health check
    if curl -sf "http://localhost:$port/api/health" > /dev/null; then
        echo "✓ Instance $uuid (port $port) is healthy"
    else
        echo "✗ Instance $uuid (port $port) is DOWN"
        
        # Send alert (email, Slack, etc.)
        # mail -s "Alert: Instance $uuid DOWN" admin@example.com
        
        # Auto restart (optional)
        # systemctl restart ov-panel-instance@$uuid
    fi
done`}
                        language="bash"
                        title="health-check-instances.sh"
                    />

                    <div className="mt-4">
                        <p className="font-semibold mb-2">Setup Cron Job:</p>
                        <CodeBlock
                            code={`# Chạy health check mỗi 5 phút
crontab -e

# Thêm dòng:
*/5 * * * * /opt/scripts/health-check-instances.sh >> /var/log/instance-health.log 2>&1`}
                            language="bash"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="my-6">
                <CardHeader>
                    <CardTitle>Error Detection Script</CardTitle>
                    <CardDescription>Tự động phát hiện errors trong logs</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`#!/bin/bash
# /opt/scripts/check-instance-errors.sh

for logfile in /opt/ov-panel-instances/instance-*/logs/error.log; do
    uuid=$(echo $logfile | grep -oP 'instance-\\K[^/]+')
    
    # Check for errors in last 1 hour
    errors=$(find $logfile -mmin -60 -exec grep -i "error\\|exception\\|critical" {} \\; | wc -l)
    
    if [ $errors -gt 10 ]; then
        echo "WARNING: Instance $uuid has $errors errors in last hour"
        
        # Send alert
        # Example: Slack webhook
        # curl -X POST -H 'Content-type: application/json' \\
        #   --data "{\\"text\\":\\"Instance $uuid has $errors errors\\"}" \\
        #   https://hooks.slack.com/services/YOUR/WEBHOOK/URL
    fi
done`}
                        language="bash"
                        title="check-instance-errors.sh"
                    />
                </CardContent>
            </Card>

            <h2>Backup và Recovery</h2>

            <Card className="my-6">
                <CardHeader>
                    <CardTitle>Automated Backup Script</CardTitle>
                    <CardDescription>Backup databases định kỳ</CardDescription>
                </CardHeader>
                <CardContent>
                    <CodeBlock
                        code={`#!/bin/bash
# /opt/scripts/backup-instances.sh

BACKUP_DIR="/opt/backups/instances"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup mỗi instance database
for instance in /opt/ov-panel-instances/instance-*/; do
    uuid=$(basename $instance | sed 's/instance-//')
    db_file="$instance/data/ov-panel.db"
    
    if [ -f "$db_file" ]; then
        cp "$db_file" "$BACKUP_DIR/\${uuid}_\${DATE}.db"
        echo "Backed up instance $uuid"
    fi
done

# Cleanup backups older than 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completed at $(date)"`}
                        language="bash"
                        title="backup-instances.sh"
                    />

                    <div className="mt-4">
                        <p className="font-semibold mb-2">Setup Cron Job (Daily 2AM):</p>
                        <CodeBlock
                            code={`0 2 * * * /opt/scripts/backup-instances.sh >> /var/log/instance-backup.log 2>&1`}
                            language="bash"
                        />
                    </div>
                </CardContent>
            </Card>

            <h2>Maintenance Tasks</h2>

            <div className="overflow-x-auto my-6">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Task</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Frequency</th>
                            <th className="text-left p-3 bg-slate-50 dark:bg-slate-900">Command</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3">Health Check</td>
                            <td className="p-3"><Badge>5 minutes</Badge></td>
                            <td className="p-3"><code className="text-xs">/opt/scripts/health-check-instances.sh</code></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">Database Backup</td>
                            <td className="p-3"><Badge variant="secondary">Daily</Badge></td>
                            <td className="p-3"><code className="text-xs">/opt/scripts/backup-instances.sh</code></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">Log Cleanup</td>
                            <td className="p-3"><Badge variant="outline">Weekly</Badge></td>
                            <td className="p-3"><code className="text-xs">find /opt/ov-panel-instances/*/logs/ -mtime +30 -delete</code></td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">System Updates</td>
                            <td className="p-3"><Badge variant="outline">Weekly</Badge></td>
                            <td className="p-3"><code className="text-xs">apt update && apt upgrade</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Alert variant="success">
                <AlertDescription>
                    <strong>Bước tiếp theo:</strong> Tìm hiểu cách <a href="/white-label/troubleshooting" className="text-primary underline">xử lý sự cố</a> khi gặp vấn đề với instances.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
