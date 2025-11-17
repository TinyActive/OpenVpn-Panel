import { DocLayout } from "@/components/doc-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Code, Play, Trash2, Info, List } from "lucide-react";

export default function CLIManagementPage() {
    return (
        <DocLayout>
            <div className="flex items-center gap-3 mb-6">
                <h1 className="!mb-0">Quản lý qua CLI Tool</h1>
                <Badge variant="secondary">Command Line</Badge>
            </div>

            <p className="lead">
                CLI tool (<code>whitelabel_cli.py</code>) cung cấp cách quản lý nhanh và mạnh mẽ các
                White-Label instances trực tiếp từ command line, phù hợp cho automation và scripting.
            </p>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Location:</strong> CLI tool nằm tại <code>/opt/ov-panel/whitelabel_cli.py</code>
                </AlertDescription>
            </Alert>

            <h2>Cú pháp cơ bản</h2>

            <CodeBlock
                code={`python3 whitelabel_cli.py <command> [options]`}
                title="Syntax"
                language="bash"
            />

            <h2>Các lệnh CLI</h2>

            <div className="space-y-6 my-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Terminal className="h-6 w-6 text-blue-600" />
                            <div>
                                <CardTitle>init - Khởi tạo hệ thống</CardTitle>
                                <CardDescription>Tạo shared directory, symlinks và systemd template</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py init`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <p className="font-semibold mb-2">Output mong đợi:</p>
                            <CodeBlock
                                code={`Initializing White-Label system...
✓ Created shared directory
✓ Created symlinks
✓ Created systemd template
✓ System initialized successfully`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <List className="h-6 w-6 text-green-600" />
                            <div>
                                <CardTitle>list - Liệt kê instances</CardTitle>
                                <CardDescription>Hiển thị danh sách tất cả instances với status</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py list`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <p className="font-semibold mb-2">Output mẫu:</p>
                            <CodeBlock
                                code={`White-Label Instances:

ID                                       Name                 Port     Status    
--------------------------------------------------------------------------------
a1b2c3d4-5678-90ab-cdef-1234567890ab    Customer A           9001     active    
b2c3d4e5-6789-01bc-def0-234567890abc    Customer B           9002     inactive  
c3d4e5f6-7890-12cd-ef01-34567890abcd    Customer C           9003     active`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Code className="h-6 w-6 text-purple-600" />
                            <div>
                                <CardTitle>create - Tạo instance mới</CardTitle>
                                <CardDescription>Tạo và khởi động instance mới với cấu hình chi tiết</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold mb-2">Cú pháp đầy đủ:</p>
                                <CodeBlock
                                    code={`python3 whitelabel_cli.py create \\
  --name "<Instance Name>" \\
  --username <admin_username> \\
  --password <admin_password> \\
  --port <port_number> \\
  [--with-openvpn]`}
                                    language="bash"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 bg-slate-50 dark:bg-slate-900">Option</th>
                                            <th className="text-left p-2 bg-slate-50 dark:bg-slate-900">Mô tả</th>
                                            <th className="text-left p-2 bg-slate-50 dark:bg-slate-900">Bắt buộc</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="p-2"><code>--name</code></td>
                                            <td className="p-2">Tên instance</td>
                                            <td className="p-2"><Badge variant="destructive">Yes</Badge></td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><code>--username</code></td>
                                            <td className="p-2">Admin username</td>
                                            <td className="p-2"><Badge variant="destructive">Yes</Badge></td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><code>--password</code></td>
                                            <td className="p-2">Admin password</td>
                                            <td className="p-2"><Badge variant="destructive">Yes</Badge></td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><code>--port</code></td>
                                            <td className="p-2">Port number</td>
                                            <td className="p-2"><Badge variant="destructive">Yes</Badge></td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><code>--with-openvpn</code></td>
                                            <td className="p-2">Enable OpenVPN</td>
                                            <td className="p-2"><Badge>Optional</Badge></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Ví dụ 1: Instance không có OpenVPN</p>
                                <CodeBlock
                                    code={`python3 whitelabel_cli.py create \\
  --name "Customer A Panel" \\
  --username admin \\
  --password SecurePass123 \\
  --port 9001`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Ví dụ 2: Instance có OpenVPN</p>
                                <CodeBlock
                                    code={`python3 whitelabel_cli.py create \\
  --name "Customer B Panel" \\
  --username admin_b \\
  --password SecurePass456 \\
  --port 9002 \\
  --with-openvpn`}
                                    language="bash"
                                />
                            </div>

                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="font-semibold mb-2">Output thành công:</p>
                                <CodeBlock
                                    code={`Creating instance 'Customer A Panel'...
✓ Instance created successfully!
Instance ID: a1b2c3d4-5678-90ab-cdef-1234567890ab
Name: Customer A Panel
Port: 9001
Admin Username: admin
Has OpenVPN: False`}
                                    language="text"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Play className="h-6 w-6 text-green-600" />
                            <div>
                                <CardTitle>start - Khởi động instance</CardTitle>
                                <CardDescription>Start một instance đã dừng</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py start --instance-id <uuid>

# Ví dụ:
python3 whitelabel_cli.py start --instance-id a1b2c3d4-5678-90ab-cdef-1234567890ab`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <CodeBlock
                                code={`Starting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance started successfully!`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Terminal className="h-6 w-6 text-orange-600" />
                            <div>
                                <CardTitle>stop - Dừng instance</CardTitle>
                                <CardDescription>Stop một instance đang chạy</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py stop --instance-id <uuid>

# Output:
Stopping instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance stopped successfully!`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Terminal className="h-6 w-6 text-blue-600" />
                            <div>
                                <CardTitle>restart - Restart instance</CardTitle>
                                <CardDescription>Restart instance để apply changes</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py restart --instance-id <uuid>

# Output:
Restarting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance restarted successfully!`}
                            language="bash"
                        />
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Info className="h-6 w-6 text-purple-600" />
                            <div>
                                <CardTitle>info - Xem thông tin chi tiết</CardTitle>
                                <CardDescription>Hiển thị thông tin đầy đủ về một instance</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`python3 whitelabel_cli.py info --instance-id <uuid>`}
                            language="bash"
                        />

                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <p className="font-semibold mb-2">Output mẫu:</p>
                            <CodeBlock
                                code={`Instance Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID:              a1b2c3d4-5678-90ab-cdef-1234567890ab
Name:            Customer A Panel
Port:            9001
Status:          active
Admin Username:  admin
Has OpenVPN:     False
Created:         2025-11-15 10:30:45
Updated:         2025-11-17 14:22:10

Statistics:
  Users:         125
  Nodes:         3
  Active Users:  98`}
                                language="text"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-6 w-6 text-red-600" />
                            <div>
                                <CardTitle>delete - Xóa instance</CardTitle>
                                <CardDescription>Xóa instance vĩnh viễn (có confirm)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold mb-2">Với confirmation:</p>
                                <CodeBlock
                                    code={`python3 whitelabel_cli.py delete --instance-id <uuid>

# Hệ thống sẽ hỏi:
Are you sure you want to delete instance 'Customer A Panel'? (y/n): y
Deleting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance deleted successfully!`}
                                    language="bash"
                                />
                            </div>

                            <div>
                                <p className="font-semibold mb-2">Force delete (không hỏi):</p>
                                <CodeBlock
                                    code={`python3 whitelabel_cli.py delete --instance-id <uuid> --force`}
                                    language="bash"
                                />
                            </div>

                            <Alert variant="warning">
                                <AlertDescription>
                                    <strong>Cảnh báo:</strong> Lệnh delete sẽ xóa toàn bộ dữ liệu instance không thể khôi phục.
                                    Hãy backup trước khi xóa.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2>Use Cases thực tế</h2>

            <div className="space-y-6 my-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Operations - Tạo nhiều instances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`#!/bin/bash
# create_multiple_instances.sh

# Array of customer data
declare -a customers=(
  "CompanyA:admin_a:Pass123:9001"
  "CompanyB:admin_b:Pass456:9002"
  "CompanyC:admin_c:Pass789:9003"
)

# Loop và create
for customer in "\${customers[@]}"; do
  IFS=':' read -r name username password port <<< "$customer"
  
  echo "Creating instance for $name..."
  python3 /opt/ov-panel/whitelabel_cli.py create \\
    --name "$name Panel" \\
    --username "$username" \\
    --password "$password" \\
    --port "$port"
  
  sleep 5
done

echo "All instances created!"`}
                            language="bash"
                            title="Batch Create Script"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Health Check Script</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`#!/bin/bash
# health_check.sh

# Get all instances
instances=$(python3 /opt/ov-panel/whitelabel_cli.py list | grep -E '^[a-f0-9-]{36}' | awk '{print $1}')

for uuid in $instances; do
  # Get instance info
  info=$(python3 /opt/ov-panel/whitelabel_cli.py info --instance-id $uuid)
  
  # Check status
  status=$(echo "$info" | grep "Status:" | awk '{print $2}')
  
  if [ "$status" != "active" ]; then
    echo "WARNING: Instance $uuid is $status"
    # Send alert or restart
    python3 /opt/ov-panel/whitelabel_cli.py start --instance-id $uuid
  fi
done`}
                            language="bash"
                            title="Health Check Script"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Auto Restart Script (Maintenance)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock
                            code={`#!/bin/bash
# auto_restart.sh
# Crontab: 0 3 * * 0 /opt/scripts/auto_restart.sh

echo "Starting weekly maintenance restart..."

# Get all active instances
instances=$(python3 /opt/ov-panel/whitelabel_cli.py list | grep 'active' | awk '{print $1}')

for uuid in $instances; do
  echo "Restarting instance $uuid..."
  python3 /opt/ov-panel/whitelabel_cli.py restart --instance-id $uuid
  sleep 10
done

echo "Maintenance complete!"`}
                            language="bash"
                            title="Weekly Restart Script"
                        />
                    </CardContent>
                </Card>
            </div>

            <h2>Tips & Tricks</h2>

            <div className="space-y-3 my-6">
                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Alias:</strong> Tạo alias trong <code>~/.bashrc</code> để gõ lệnh nhanh hơn:
                        <CodeBlock
                            code={`alias wl='python3 /opt/ov-panel/whitelabel_cli.py'

# Sử dụng:
wl list
wl create --name "Test" --username admin --password pass --port 9001`}
                            language="bash"
                            className="mt-2"
                        />
                    </AlertDescription>
                </Alert>

                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Output to file:</strong> Lưu danh sách instances ra file để xử lý:
                        <CodeBlock
                            code={`python3 whitelabel_cli.py list > instances.txt
cat instances.txt`}
                            language="bash"
                            className="mt-2"
                        />
                    </AlertDescription>
                </Alert>

                <Alert variant="tip">
                    <AlertDescription>
                        <strong>Grep specific:</strong> Filter instances theo status:
                        <CodeBlock
                            code={`# Chỉ active instances
python3 whitelabel_cli.py list | grep 'active'

# Chỉ inactive instances
python3 whitelabel_cli.py list | grep 'inactive'`}
                            language="bash"
                            className="mt-2"
                        />
                    </AlertDescription>
                </Alert>
            </div>

            <Alert variant="info">
                <AlertDescription>
                    <strong>Tiếp theo:</strong> Tìm hiểu về <a href="/white-label/systemd-services" className="text-primary underline">quản lý Systemd Services</a> để kiểm soát chi tiết hơn.
                </AlertDescription>
            </Alert>
        </DocLayout>
    );
}
