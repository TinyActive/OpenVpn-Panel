# OV-Panel White-Label System Documentation

## Tổng quan

Hệ thống White-Label cho phép bạn tạo và quản lý nhiều instances độc lập của OV-Panel, mỗi instance chạy trên port riêng với database và cấu hình riêng biệt. Điều này cho phép bạn cung cấp dịch vụ OV-Panel cho nhiều khách hàng khác nhau với sự cô lập hoàn toàn.

## Kiến trúc

### 1. Super Admin Panel (Main Panel)
- **Không có OpenVPN server** - Tránh xung đột cấu hình
- Quản lý tất cả white-label instances
- CRUD operations cho instances
- Giám sát và thống kê instances

### 2. White-Label Instances
- Mỗi instance là một process độc lập
- Database SQLite riêng biệt
- Environment variables riêng
- Có thể có hoặc không có OpenVPN server
- Quản lý bởi systemd service template

## Cấu trúc thư mục

```
/opt/ov-panel/                    # Main panel (super admin)
├── backend/
├── frontend/
├── data/
│   ├── ov-panel.db              # Super admin database
│   └── ov-panel-sample.db       # Sample database template cho instances
├── .env                          # Super admin config (IS_SUPER_ADMIN=True)
└── main.py

/opt/ov-panel-instances/          # White-label instances
├── instance-{uuid}/
│   ├── data/
│   │   └── ov-panel.db          # Instance database (copied từ sample)
│   ├── .env.{uuid}              # Instance config
│   └── logs/
│       ├── output.log
│       └── error.log
└── shared/                       # Shared codebase (symlinks)
    ├── backend/ -> /opt/ov-panel/backend/
    ├── frontend/ -> /opt/ov-panel/frontend/
    └── main.py -> /opt/ov-panel/main.py
```

## Database Management

### Sample Database (`ov-panel-sample.db`)

Hệ thống sử dụng một file database mẫu (`data/ov-panel-sample.db`) làm template cho tất cả các whitelabel instances. Khi tạo instance mới:
- **KHÔNG chạy database migration** - Giúp tạo instance nhanh hơn và nhất quán
- **Copy file `ov-panel-sample.db`** vào thư mục `data/` của instance
- File sample database đã được migrate đầy đủ và chứa cấu trúc bảng chuẩn

**Lưu ý quan trọng:**
- File `ov-panel-sample.db` phải tồn tại trong thư mục `data/` của main panel
- Nếu bạn cập nhật schema database, cần cập nhật lại file sample này
- Tất cả instances sẽ sử dụng cùng một schema từ file sample

## Cài đặt

### Bước 1: Cài đặt Super Admin Panel

```bash
# Clone repository
git clone https://github.com/TinyActive/OpenVpn-Panel.git
cd OpenVpn-Panel

# Chạy installer
python3 installer.py
```

Trong menu, chọn:
```
[2] Install as Super Admin Panel (White-Label Manager)
```

Nhập thông tin:
- Super Admin username
- Super Admin password  
- Panel port (mặc định: 9000)
- Panel path (mặc định: dashboard)

### Bước 2: Khởi tạo hệ thống White-Label

Sau khi cài đặt, truy cập panel và vào menu "White-Label Instances", sau đó click "Initialize System" để:
- Tạo thư mục shared code
- Tạo systemd service template

Hoặc sử dụng CLI:
```bash
python3 whitelabel_cli.py init
```

## Quản lý Instances

### Qua Web UI

1. Đăng nhập vào Super Admin Panel
2. Vào menu "White-Label Instances"
3. Click "Create Instance"
4. Điền thông tin:
   - Instance name
   - Admin username
   - Admin password
   - Port number (1024-65535)
   - Has OpenVPN (optional)
5. Click "Create"

### Qua Command Line

#### Liệt kê instances
```bash
python3 whitelabel_cli.py list
```

#### Tạo instance mới
```bash
python3 whitelabel_cli.py create \
  --name "Customer A" \
  --username admin \
  --password secret123 \
  --port 9001
```

Với OpenVPN:
```bash
python3 whitelabel_cli.py create \
  --name "Customer B" \
  --username admin \
  --password secret456 \
  --port 9002 \
  --with-openvpn
```

#### Khởi động instance
```bash
python3 whitelabel_cli.py start --instance-id <uuid>
```

#### Dừng instance
```bash
python3 whitelabel_cli.py stop --instance-id <uuid>
```

#### Restart instance
```bash
python3 whitelabel_cli.py restart --instance-id <uuid>
```

#### Xem thông tin instance
```bash
python3 whitelabel_cli.py info --instance-id <uuid>
```

#### Xóa instance
```bash
python3 whitelabel_cli.py delete --instance-id <uuid>
```

Force delete (không hỏi xác nhận):
```bash
python3 whitelabel_cli.py delete --instance-id <uuid> --force
```

## Systemd Service Management

Mỗi instance được quản lý bởi systemd service:

```bash
# Xem status
systemctl status ov-panel-instance@<uuid>

# Start
systemctl start ov-panel-instance@<uuid>

# Stop
systemctl stop ov-panel-instance@<uuid>

# Restart
systemctl restart ov-panel-instance@<uuid>

# Enable auto-start
systemctl enable ov-panel-instance@<uuid>

# Disable auto-start
systemctl disable ov-panel-instance@<uuid>

# Xem logs
journalctl -u ov-panel-instance@<uuid> -f
```

## API Endpoints

### White-Label Management APIs

**Base URL:** `/api/whitelabel`

**Authentication:** JWT Bearer token (Super Admin only)

#### POST /whitelabel/initialize
Khởi tạo hệ thống white-label (shared directory và systemd template)

#### POST /whitelabel/create
Tạo instance mới

Request body:
```json
{
  "name": "Instance Name",
  "admin_username": "admin",
  "admin_password": "password",
  "port": 9001,
  "has_openvpn": false
}
```

#### GET /whitelabel/list
Liệt kê tất cả instances

#### GET /whitelabel/{instance_id}
Lấy thông tin chi tiết instance

#### PUT /whitelabel/{instance_id}/start
Khởi động instance

#### PUT /whitelabel/{instance_id}/stop
Dừng instance

#### PUT /whitelabel/{instance_id}/restart
Restart instance

#### DELETE /whitelabel/{instance_id}
Xóa instance

#### GET /whitelabel/{instance_id}/stats
Lấy thống kê instance

## Bảo mật

### Process Isolation
- Mỗi instance chạy như một process riêng biệt
- Không thể truy cập dữ liệu của instance khác

### Database Isolation
- Mỗi instance có SQLite database riêng
- Không chia sẻ dữ liệu giữa các instances

### JWT Secret riêng
- Mỗi instance có JWT secret độc lập
- Token của instance A không hoạt động trên instance B

### API Key riêng
- Mỗi instance có API key riêng cho external integrations
- Tự động generate khi tạo instance

### Port Validation
- Kiểm tra port conflict trước khi tạo instance
- Chỉ cho phép port trong range 1024-65535

### Super Admin Authentication
- Chỉ Super Admin mới có quyền quản lý instances
- Các instance không thể truy cập Super Admin API

## Troubleshooting

### Instance không khởi động được

1. Kiểm tra logs:
```bash
journalctl -u ov-panel-instance@<uuid> -n 50
```

2. Kiểm tra port conflict:
```bash
netstat -tulpn | grep <port>
```

3. Kiểm tra file cấu hình:
```bash
cat /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
```

### Database migration lỗi

Chạy migration thủ công:
```bash
export INSTANCE_ID=<uuid>
cd /opt/ov-panel/backend
/opt/ov-panel/venv/bin/alembic upgrade head
```

### Shared directory bị lỗi

Khởi tạo lại:
```bash
python3 whitelabel_cli.py init
```

### Instance bị orphan (database có nhưng file không tồn tại)

Xóa record trong database:
```bash
sqlite3 /opt/ov-panel/data/ov-panel.db
DELETE FROM whitelabel_instances WHERE instance_id='<uuid>';
```

## Best Practices

### 1. Backup
Backup định kỳ:
- Super Admin database: `/opt/ov-panel/data/ov-panel.db`
- Instance databases: `/opt/ov-panel-instances/instance-{uuid}/data/ov-panel.db`

```bash
# Backup script example
#!/bin/bash
BACKUP_DIR="/backup/ov-panel/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup super admin
cp /opt/ov-panel/data/ov-panel.db $BACKUP_DIR/super-admin.db

# Backup instances
for instance in /opt/ov-panel-instances/instance-*/; do
    uuid=$(basename $instance | sed 's/instance-//')
    cp $instance/data/ov-panel.db $BACKUP_DIR/instance-$uuid.db
done
```

### 2. Monitoring
Giám sát các instance:
- Systemd status
- Log file sizes
- Port availability
- Response time

### 3. Resource Management
- Giới hạn số lượng instances dựa trên tài nguyên server
- Monitor CPU và memory usage
- Cân nhắc sử dụng reverse proxy (nginx) cho SSL termination

### 4. Update Strategy
Khi update OV-Panel:
1. Backup tất cả instances
2. Stop tất cả instances
3. Update main panel code
4. Test với 1 instance
5. Start tất cả instances

```bash
# Stop all instances
for uuid in $(python3 whitelabel_cli.py list | grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'); do
    python3 whitelabel_cli.py stop --instance-id $uuid
done

# Update code
git pull
/opt/ov-panel/venv/bin/pip install -e .

# Run migrations
cd /opt/ov-panel/backend
/opt/ov-panel/venv/bin/alembic upgrade head

# Start all instances
for uuid in $(python3 whitelabel_cli.py list | grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'); do
    python3 whitelabel_cli.py start --instance-id $uuid
done
```

## Giới hạn và Lưu ý

1. **Không cài OpenVPN trên Super Admin Panel**
   - Super Admin Panel chỉ để quản lý, không để sử dụng trực tiếp
   - Tạo instance riêng nếu cần sử dụng OpenVPN

2. **Port Range**
   - Chỉ cho phép port 1024-65535
   - Tránh port đã được sử dụng bởi services khác

3. **Resource Limits**
   - Mỗi instance tiêu tốn ~100-200MB RAM
   - Tính toán số lượng instance dựa trên tài nguyên server

4. **Shared Code**
   - Tất cả instances dùng chung code từ `/opt/ov-panel`
   - Update code sẽ ảnh hưởng tất cả instances

5. **Database Size**
   - SQLite có giới hạn ~281TB
   - Thực tế, nên giữ database dưới 1GB cho performance tốt

## Support

Nếu gặp vấn đề:
1. Kiểm tra logs
2. Xem [GitHub Issues](https://github.com/TinyActive/OpenVpn-Panel/issues)
3. Tạo issue mới với thông tin chi tiết

## License

Kế thừa license từ OV-Panel chính. Xem file `LICENSE`.

