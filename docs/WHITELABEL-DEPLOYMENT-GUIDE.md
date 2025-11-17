# Hướng Dẫn Triển Khai White-Label OV-Panel

## 📋 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
3. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
4. [Cài Đặt Super Admin Panel](#cài-đặt-super-admin-panel)
5. [Khởi Tạo Hệ Thống White-Label](#khởi-tạo-hệ-thống-white-label)
6. [Tạo và Quản Lý Instances](#tạo-và-quản-lý-instances)
7. [Quản Lý Qua CLI](#quản-lý-qua-cli)
8. [Quản Lý Systemd Services](#quản-lý-systemd-services)
9. [Cấu Hình Nâng Cao](#cấu-hình-nâng-cao)
10. [Bảo Mật](#bảo-mật)
11. [Monitoring và Maintenance](#monitoring-và-maintenance)
12. [Xử Lý Sự Cố](#xử-lý-sự-cố)

---

## 🎯 Giới Thiệu

Hệ thống White-Label OV-Panel cho phép bạn triển khai và quản lý nhiều instances độc lập của OV-Panel, mỗi instance phục vụ cho một khách hàng hoặc tổ chức khác nhau. Tất cả các instances được quản lý tập trung qua một Super Admin Panel duy nhất.

### Đặc Điểm Chính

- **Process Isolation**: Mỗi instance chạy như một process riêng biệt
- **Database Isolation**: Mỗi instance có database SQLite độc lập
- **Port Management**: Mỗi instance chạy trên port riêng
- **Shared Codebase**: Tất cả instances dùng chung source code qua symlinks
- **Systemd Integration**: Quản lý lifecycle qua systemd services
- **Centralized Management**: Quản lý tất cả instances từ một panel duy nhất

### Mô Hình Triển Khai

```
┌─────────────────────────────────────────────────────────┐
│          Super Admin Panel (Main Panel)                 │
│          Port: 9000 (mặc định)                          │
│          Database: /opt/ov-panel/data/ov-panel.db      │
│          Quản lý: Tất cả White-Label Instances         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ quản lý
                          ▼
    ┌─────────────────────────────────────────────────────┐
    │         White-Label Instances Directory             │
    │         /opt/ov-panel-instances/                    │
    └─────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Instance A        Instance B        Instance C
   Port: 9001       Port: 9002        Port: 9003
   Customer A       Customer B        Customer C
```

---

## 💻 Yêu Cầu Hệ Thống

### Phần Cứng

- **CPU**: Tối thiểu 2 cores (khuyến nghị 4+ cores cho nhiều instances)
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Disk**: Tối thiểu 10GB (mỗi instance chiếm ~500MB)
- **Network**: 1 IP công cộng

### Phần Mềm

- **OS**: Ubuntu 20.04/22.04 LTS hoặc Debian 10/11
- **Python**: 3.8 trở lên
- **Systemd**: Hỗ trợ systemd service management
- **Root Access**: Cần quyền root để cài đặt

### Ports Yêu Cầu

- **Super Admin Panel**: 9000 (hoặc port tùy chọn)
- **White-Label Instances**: 9001-9999 (hoặc ports tùy chọn)
- **OpenVPN** (nếu có): 1194/UDP (cho mỗi instance có OpenVPN)

### Kết Nối Internet

- Truy cập GitHub để clone repository
- Truy cập PyPI để cài đặt packages
- Truy cập các API endpoints (nếu cần)

---

## 🏗️ Kiến Trúc Hệ Thống

### Cấu Trúc Thư Mục

```
/opt/ov-panel/                          # Main Panel (Super Admin)
├── backend/                            # Backend source code
│   ├── alembic/                       # Database migrations
│   ├── auth/                          # Authentication module
│   ├── db/                            # Database models & CRUD
│   ├── node/                          # Node management
│   ├── operations/                    # Core operations
│   ├── routers/                       # API routers
│   │   └── whitelabel.py             # White-label API endpoints
│   ├── schema/                        # Pydantic schemas
│   └── whitelabel/                    # White-label management
│       ├── manager.py                 # Instance manager
│       ├── config_generator.py        # Config generator
│       └── systemd_service.py         # Systemd service manager
├── frontend/                           # Frontend source code
├── data/                              # Super admin data
│   ├── ov-panel.db                   # Super admin database
│   └── ov-panel-sample.db            # Template database cho instances
├── venv/                              # Python virtual environment
├── .env                               # Super admin config (IS_SUPER_ADMIN=True)
├── main.py                            # Application entry point
├── installer.py                       # Installation script
└── whitelabel_cli.py                 # CLI management tool

/opt/ov-panel-instances/                # White-Label Instances Directory
├── shared/                             # Shared codebase (symlinks)
│   ├── backend -> /opt/ov-panel/backend/
│   ├── frontend -> /opt/ov-panel/frontend/
│   ├── main.py -> /opt/ov-panel/main.py
│   └── pyproject.toml -> /opt/ov-panel/pyproject.toml
└── instance-{uuid}/                    # Mỗi instance
    ├── data/
    │   └── ov-panel.db                # Instance database (copy từ sample)
    ├── .env.{uuid}                    # Instance configuration
    └── logs/
        ├── output.log                 # Stdout logs
        └── error.log                  # Stderr logs

/etc/systemd/system/
├── ov-panel.service                    # Main panel service
└── ov-panel-instance@.service          # Instance service template
```

### Database Architecture

#### Super Admin Database (`/opt/ov-panel/data/ov-panel.db`)
- Bảng `whitelabel_instances`: Metadata của tất cả instances
- Bảng `admins`: Thông tin Super Admin
- Bảng `settings`: Cấu hình hệ thống
- **KHÔNG có**: Bảng users, nodes (vì không có OpenVPN)

#### Sample Database (`/opt/ov-panel/data/ov-panel-sample.db`)
- Template database với schema đầy đủ đã migrate
- Được copy vào mỗi instance khi tạo mới
- Chứa tất cả bảng cần thiết: users, nodes, settings, admins

#### Instance Databases (`/opt/ov-panel-instances/instance-{uuid}/data/ov-panel.db`)
- Copy từ sample database
- Cô lập hoàn toàn giữa các instances
- Chứa dữ liệu users, nodes của instance đó

### Systemd Service Architecture

#### Main Service (`ov-panel.service`)
```ini
[Unit]
Description=OV-Panel Super Admin Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ov-panel
ExecStart=/opt/ov-panel/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Instance Service Template (`ov-panel-instance@.service`)
```ini
[Unit]
Description=OV-Panel White-Label Instance %i
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ov-panel
EnvironmentFile=/opt/ov-panel-instances/instance-%i/.env.%i
Environment="INSTANCE_ID=%i"
ExecStart=/opt/ov-panel/venv/bin/python main.py
Restart=always
RestartSec=5
StandardOutput=append:/opt/ov-panel-instances/instance-%i/logs/output.log
StandardError=append:/opt/ov-panel-instances/instance-%i/logs/error.log

[Install]
WantedBy=multi-user.target
```

---

## 🚀 Cài Đặt Super Admin Panel

### Bước 1: Chuẩn Bị Hệ Thống

```bash
# Đăng nhập với quyền root
sudo su -

# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài đặt dependencies cơ bản
apt install -y python3 python3-pip python3-venv wget curl git net-tools
```

### Bước 2: Clone Repository

```bash
# Clone repository về /opt
cd /opt
git clone https://github.com/TinyActive/OpenVpn-Panel.git ov-panel
cd ov-panel
```

### Bước 3: Chạy Script Cài Đặt

```bash
# Chạy install.sh
bash install.sh
```

Script sẽ:
- Cập nhật system packages
- Tạo Python virtual environment
- Cài đặt dependencies
- Khởi chạy installer tương tác

### Bước 4: Cấu Hình Trong Installer

Khi installer chạy, bạn sẽ thấy menu:

```
  ██████╗ ██╗   ██╗██████╗  █████╗ ███╗   ██╗███████╗██╗     
 ██╔═══██╗██║   ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     
 ██║   ██║██║   ██║██████╔╝███████║██╔██╗ ██║█████╗  ██║     
 ██║   ██║╚██╗ ██╔╝██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     
 ╚██████╔╝ ╚████╔╝ ██║     ██║  ██║██║ ╚████║███████╗███████╗
  ╚═════╝   ╚═══╝  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝

Please choose an option:

  [1] Install as Standalone Panel (with OpenVPN)
  [2] Install as Super Admin Panel (White-Label Manager)  ← Chọn option này
  [3] Update
  [4] Restart
  [5] Uninstall
  [6] Exit
```

**Chọn option [2]** để cài đặt Super Admin Panel

### Bước 5: Nhập Thông Tin Cấu Hình

Installer sẽ hỏi:

```bash
# Super Admin Username
Enter Super Admin username: superadmin

# Super Admin Password
Enter Super Admin password: ********
Confirm password: ********

# Panel Port
Enter panel port [default: 9000]: 9000

# URL Path
Enter URL path [default: dashboard]: dashboard
```

### Bước 6: Hoàn Tất Cài Đặt

Installer sẽ:
1. Tạo file `.env` với `IS_SUPER_ADMIN=True`
2. Cài đặt Python dependencies từ `pyproject.toml`
3. Khởi tạo database và chạy migrations
4. Tạo Super Admin account
5. Build frontend (React + Vite)
6. Tạo systemd service `ov-panel.service`
7. Start và enable service

### Bước 7: Xác Nhận Cài Đặt

```bash
# Kiểm tra service status
systemctl status ov-panel

# Kiểm tra port đang listen
netstat -tulpn | grep 9000

# Kiểm tra logs
journalctl -u ov-panel -f
```

### Bước 8: Truy Cập Super Admin Panel

Mở trình duyệt và truy cập:
```
http://<server-ip>:9000/dashboard
```

Đăng nhập với:
- **Username**: superadmin (hoặc username bạn đã tạo)
- **Password**: password bạn đã nhập

---

## 🔧 Khởi Tạo Hệ Thống White-Label

Sau khi cài đặt Super Admin Panel, bạn cần khởi tạo hệ thống White-Label để có thể tạo instances.

### Phương Pháp 1: Qua Web UI

1. Đăng nhập vào Super Admin Panel
2. Vào menu **"White-Label Management"** (biểu tượng layers/boxes)
3. Click nút **"Initialize System"**
4. Đợi quá trình khởi tạo hoàn tất
5. Thông báo thành công sẽ hiện ra

### Phương Pháp 2: Qua Command Line

```bash
# Di chuyển vào thư mục cài đặt
cd /opt/ov-panel

# Chạy CLI init command
python3 whitelabel_cli.py init
```

### Quá Trình Initialize Thực Hiện

1. **Tạo thư mục instances**:
   ```bash
   mkdir -p /opt/ov-panel-instances/shared
   ```

2. **Tạo shared code symlinks**:
   ```bash
   ln -s /opt/ov-panel/backend /opt/ov-panel-instances/shared/backend
   ln -s /opt/ov-panel/frontend /opt/ov-panel-instances/shared/frontend
   ln -s /opt/ov-panel/main.py /opt/ov-panel-instances/shared/main.py
   ln -s /opt/ov-panel/pyproject.toml /opt/ov-panel-instances/shared/pyproject.toml
   ```

3. **Tạo systemd service template**:
   - Tạo file `/etc/systemd/system/ov-panel-instance@.service`
   - Template này sẽ được dùng cho tất cả instances
   - Reload systemd daemon

4. **Tạo sample database** (nếu chưa có):
   - Copy và migrate database template
   - Lưu tại `/opt/ov-panel/data/ov-panel-sample.db`

### Xác Nhận Initialize Thành Công

```bash
# Kiểm tra thư mục shared
ls -la /opt/ov-panel-instances/shared/

# Output mong đợi:
# lrwxrwxrwx 1 root root   backend -> /opt/ov-panel/backend
# lrwxrwxrwx 1 root root   frontend -> /opt/ov-panel/frontend
# lrwxrwxrwx 1 root root   main.py -> /opt/ov-panel/main.py
# lrwxrwxrwx 1 root root   pyproject.toml -> /opt/ov-panel/pyproject.toml

# Kiểm tra systemd template
ls -la /etc/systemd/system/ov-panel-instance@.service

# Kiểm tra sample database
ls -la /opt/ov-panel/data/ov-panel-sample.db
```

---

## 🎨 Tạo và Quản Lý Instances

### Tạo Instance Qua Web UI

#### Bước 1: Mở Create Instance Dialog

1. Vào menu **"White-Label Management"**
2. Click nút **"Create Instance"** (nút màu xanh với icon "+")
3. Form tạo instance sẽ hiện ra

#### Bước 2: Điền Thông Tin Instance

| Field | Mô Tả | Yêu Cầu |
|-------|-------|---------|
| **Instance Name** | Tên hiển thị của instance (VD: "Customer A", "Company XYZ") | Bắt buộc, không trùng |
| **Admin Username** | Username để đăng nhập vào instance | Bắt buộc, 3-50 ký tự |
| **Admin Password** | Password cho admin account | Bắt buộc, tối thiểu 6 ký tự |
| **Port** | Port để instance chạy | Bắt buộc, 1024-65535, không trùng |
| **Has OpenVPN** | Instance có cài OpenVPN hay không | Tùy chọn, mặc định: false |

**Ví dụ:**
```
Instance Name: Customer A Panel
Admin Username: admin_customer_a
Admin Password: SecurePass123!
Port: 9001
Has OpenVPN: ☐ (không check nếu chưa cài OpenVPN)
```

#### Bước 3: Submit và Đợi Tạo

1. Click nút **"Create"**
2. Hệ thống sẽ:
   - Validate thông tin input
   - Kiểm tra port conflict
   - Generate UUID cho instance
   - Tạo thư mục instance
   - Copy sample database
   - Generate file `.env`
   - Create và start systemd service
3. Đợi 10-30 giây (tùy cấu hình server)

#### Bước 4: Xác Nhận Instance Đã Tạo

Sau khi tạo thành công:
- Instance sẽ xuất hiện trong danh sách
- Status hiển thị màu **xanh** (Active) hoặc **đỏ** (Inactive)
- Có thể truy cập qua URL: `http://<server-ip>:<port>/dashboard`

### Quản Lý Instances Trong Web UI

#### Danh Sách Instances

Table hiển thị:
- **Instance ID**: UUID duy nhất
- **Name**: Tên instance
- **Port**: Port đang chạy
- **Status**: Trạng thái (Active/Inactive)
- **Users**: Số lượng users trong instance
- **Nodes**: Số lượng nodes trong instance
- **Created**: Ngày tạo
- **Actions**: Các thao tác

#### Actions Dropdown

Mỗi instance có dropdown với các actions:

| Action | Mô Tả | Icon |
|--------|-------|------|
| **Start** | Khởi động instance | ▶️ Play |
| **Stop** | Dừng instance | ⏸️ Pause |
| **Restart** | Restart instance | 🔄 Refresh |
| **View Stats** | Xem thống kê chi tiết | 📊 Chart |
| **Delete** | Xóa instance (có confirm) | 🗑️ Trash |

#### View Instance Stats

Click **"View Stats"** để xem:
- **User Statistics**: Tổng users, active users, expired users
- **Node Statistics**: Tổng nodes, active nodes, node health
- **Traffic Statistics**: Bandwidth usage, connections
- **System Info**: CPU, RAM, Disk usage của instance

### Port Management

#### Port Range Recommendations

| Range | Sử Dụng | Ghi Chú |
|-------|---------|---------|
| 1-1023 | System ports | **Không sử dụng** (cần root) |
| 1024-8999 | Reserved | Tránh conflict với services khác |
| 9000 | Super Admin | Main panel port |
| 9001-9999 | White-Label Instances | **Recommended** cho instances |
| 10000-65535 | Custom | Có thể dùng nếu cần nhiều instances |

#### Kiểm Tra Port Trước Khi Tạo

```bash
# Kiểm tra port đã dùng chưa
netstat -tulpn | grep <port>

# Hoặc
lsof -i :<port>

# Nếu không có output = port available
```

---

## 💻 Quản Lý Qua CLI

CLI tool (`whitelabel_cli.py`) cung cấp quản lý nhanh qua command line.

### Cấu Trúc Lệnh

```bash
python3 whitelabel_cli.py <command> [options]
```

### Initialize System

```bash
python3 whitelabel_cli.py init
```

**Output:**
```
Initializing White-Label system...
✓ Created shared directory
✓ Created symlinks
✓ Created systemd template
✓ System initialized successfully
```

### List Instances

```bash
python3 whitelabel_cli.py list
```

**Output:**
```
White-Label Instances:

ID                                       Name                 Port     Status    
--------------------------------------------------------------------------------
a1b2c3d4-5678-90ab-cdef-1234567890ab    Customer A           9001     active    
b2c3d4e5-6789-01bc-def0-234567890abc    Customer B           9002     inactive  
c3d4e5f6-7890-12cd-ef01-34567890abcd    Customer C           9003     active    
```

### Create Instance

**Cú pháp:**
```bash
python3 whitelabel_cli.py create \
  --name "<Instance Name>" \
  --username <admin_username> \
  --password <admin_password> \
  --port <port_number> \
  [--with-openvpn]
```

**Ví dụ 1: Instance không có OpenVPN**
```bash
python3 whitelabel_cli.py create \
  --name "Customer A Panel" \
  --username admin \
  --password SecurePass123 \
  --port 9001
```

**Ví dụ 2: Instance có OpenVPN**
```bash
python3 whitelabel_cli.py create \
  --name "Customer B Panel" \
  --username admin_b \
  --password SecurePass456 \
  --port 9002 \
  --with-openvpn
```

**Output:**
```
Creating instance 'Customer A Panel'...
✓ Instance created successfully!
Instance ID: a1b2c3d4-5678-90ab-cdef-1234567890ab
Name: Customer A Panel
Port: 9001
Admin Username: admin
Has OpenVPN: False
```

### Start Instance

```bash
python3 whitelabel_cli.py start --instance-id <uuid>
```

**Ví dụ:**
```bash
python3 whitelabel_cli.py start --instance-id a1b2c3d4-5678-90ab-cdef-1234567890ab
```

**Output:**
```
Starting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance started successfully!
```

### Stop Instance

```bash
python3 whitelabel_cli.py stop --instance-id <uuid>
```

**Output:**
```
Stopping instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance stopped successfully!
```

### Restart Instance

```bash
python3 whitelabel_cli.py restart --instance-id <uuid>
```

**Output:**
```
Restarting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance restarted successfully!
```

### Get Instance Info

```bash
python3 whitelabel_cli.py info --instance-id <uuid>
```

**Output:**
```
Instance Information:
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
  Active Users:  98
```

### Delete Instance

```bash
python3 whitelabel_cli.py delete --instance-id <uuid>
```

**Với confirmation:**
```
Are you sure you want to delete instance 'Customer A Panel'? (y/n): y
Deleting instance a1b2c3d4-5678-90ab-cdef-1234567890ab...
✓ Instance deleted successfully!
```

**Force delete (không hỏi):**
```bash
python3 whitelabel_cli.py delete --instance-id <uuid> --force
```

---

## ⚙️ Quản Lý Systemd Services

Mỗi instance được quản lý bởi systemd service với tên `ov-panel-instance@<uuid>.service`

### Service Commands

#### Check Status

```bash
systemctl status ov-panel-instance@<uuid>
```

**Output:**
```
● ov-panel-instance@a1b2c3d4-5678-90ab-cdef-1234567890ab.service - OV-Panel White-Label Instance a1b2c3d4-5678-90ab-cdef-1234567890ab
     Loaded: loaded (/etc/systemd/system/ov-panel-instance@.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2025-11-17 10:30:45 UTC; 2h 15min ago
   Main PID: 12345 (python)
      Tasks: 8 (limit: 4915)
     Memory: 85.2M
        CPU: 1min 23.456s
     CGroup: /system.slice/system-ov\x2dpanel\x2dinstance.slice/ov-panel-instance@a1b2c3d4-5678-90ab-cdef-1234567890ab.service
             └─12345 /opt/ov-panel/venv/bin/python main.py
```

#### Start Service

```bash
systemctl start ov-panel-instance@<uuid>
```

#### Stop Service

```bash
systemctl stop ov-panel-instance@<uuid>
```

#### Restart Service

```bash
systemctl restart ov-panel-instance@<uuid>
```

#### Enable Auto-Start (Boot)

```bash
systemctl enable ov-panel-instance@<uuid>
```

#### Disable Auto-Start

```bash
systemctl disable ov-panel-instance@<uuid>
```

### Log Management

#### View Real-time Logs (journalctl)

```bash
# Follow logs
journalctl -u ov-panel-instance@<uuid> -f

# Last 100 lines
journalctl -u ov-panel-instance@<uuid> -n 100

# Logs từ 1 giờ trước
journalctl -u ov-panel-instance@<uuid> --since "1 hour ago"

# Logs theo ngày
journalctl -u ov-panel-instance@<uuid> --since "2025-11-17" --until "2025-11-18"
```

#### View File Logs

Instance logs được lưu trong thư mục instance:

```bash
# Output logs (stdout)
tail -f /opt/ov-panel-instances/instance-<uuid>/logs/output.log

# Error logs (stderr)
tail -f /opt/ov-panel-instances/instance-<uuid>/logs/error.log

# View last 200 lines
tail -n 200 /opt/ov-panel-instances/instance-<uuid>/logs/output.log
```

### Batch Management

#### Start/Stop Multiple Instances

```bash
# Start tất cả instances
systemctl start ov-panel-instance@*.service

# Stop tất cả instances
systemctl stop ov-panel-instance@*.service

# Restart tất cả instances
systemctl restart ov-panel-instance@*.service
```

#### List All Instance Services

```bash
systemctl list-units 'ov-panel-instance@*'
```

**Output:**
```
UNIT                                                        LOAD   ACTIVE SUB     DESCRIPTION
ov-panel-instance@a1b2c3d4-5678-90ab-cdef-1234567890ab.service loaded active running OV-Panel White-Label Instance a1b2c3d4
ov-panel-instance@b2c3d4e5-6789-01bc-def0-234567890abc.service loaded active running OV-Panel White-Label Instance b2c3d4e5
ov-panel-instance@c3d4e5f6-7890-12cd-ef01-34567890abcd.service loaded active running OV-Panel White-Label Instance c3d4e5f6
```

---

## 🔐 Cấu Hình Nâng Cao

### Environment Variables

Mỗi instance có file `.env.<uuid>` riêng tại `/opt/ov-panel-instances/instance-<uuid>/.env.<uuid>`

#### Cấu Trúc File .env

```bash
# White-Label Instance Configuration
# Auto-generated - Do not edit manually

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=hashed_password_here

# UVICORN Settings
HOST=0.0.0.0
URLPATH=dashboard
PORT=9001

# Development Settings
DEBUG=WARNING
DOC=False

# Security Settings
JWT_SECRET_KEY=generated_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES=86400

# API Key Authentication
API_KEY=generated_api_key_here

# White-Label Configuration
IS_SUPER_ADMIN=False
INSTANCE_ID=a1b2c3d4-5678-90ab-cdef-1234567890ab
HAS_OPENVPN=False
```

#### Các Biến Quan Trọng

| Variable | Mô Tả | Giá Trị Mặc Định |
|----------|-------|------------------|
| `ADMIN_USERNAME` | Username admin của instance | user input |
| `ADMIN_PASSWORD` | Password admin (hashed) | user input (auto-hashed) |
| `HOST` | IP bind | 0.0.0.0 |
| `PORT` | Port instance | user input |
| `URLPATH` | URL path prefix | dashboard |
| `DEBUG` | Log level | WARNING |
| `DOC` | Enable API docs | False |
| `JWT_SECRET_KEY` | JWT signing key | auto-generated |
| `JWT_ACCESS_TOKEN_EXPIRES` | Token lifetime (seconds) | 86400 (1 day) |
| `API_KEY` | External API key | auto-generated |
| `IS_SUPER_ADMIN` | Super admin flag | False |
| `INSTANCE_ID` | UUID của instance | auto-generated |
| `HAS_OPENVPN` | OpenVPN enabled | False/True |

### SSL/TLS Configuration

Để enable HTTPS cho instances:

#### Bước 1: Có SSL Certificate

Sử dụng Let's Encrypt hoặc certificate khác:

```bash
# Cài certbot
apt install -y certbot

# Generate certificate
certbot certonly --standalone -d instance1.yourdomain.com
```

Certificates sẽ ở:
- Key: `/etc/letsencrypt/live/instance1.yourdomain.com/privkey.pem`
- Cert: `/etc/letsencrypt/live/instance1.yourdomain.com/fullchain.pem`

#### Bước 2: Update .env File

```bash
# Edit instance .env
nano /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>

# Thêm SSL config
SSL_KEYFILE=/etc/letsencrypt/live/instance1.yourdomain.com/privkey.pem
SSL_CERTFILE=/etc/letsencrypt/live/instance1.yourdomain.com/fullchain.pem
```

#### Bước 3: Restart Instance

```bash
systemctl restart ov-panel-instance@<uuid>
```

Instance sẽ listen trên HTTPS thay vì HTTP.

### Reverse Proxy với Nginx

Để expose instances qua domain names:

#### Cài Nginx

```bash
apt install -y nginx
```

#### Tạo Config File

```bash
nano /etc/nginx/sites-available/instance1
```

**Nội dung:**
```nginx
server {
    listen 80;
    server_name instance1.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Enable và Reload

```bash
ln -s /etc/nginx/sites-available/instance1 /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Truy cập: `http://instance1.yourdomain.com`

### Database Backup Strategy

#### Backup Script

Tạo script tự động backup:

```bash
#!/bin/bash
# /opt/backup-instances.sh

BACKUP_DIR="/opt/backups/instances"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup mỗi instance database
for instance in /opt/ov-panel-instances/instance-*/; do
    uuid=$(basename $instance | sed 's/instance-//')
    db_file="$instance/data/ov-panel.db"
    
    if [ -f "$db_file" ]; then
        cp "$db_file" "$BACKUP_DIR/${uuid}_${DATE}.db"
        echo "Backed up instance $uuid"
    fi
done

# Cleanup backups older than 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

#### Setup Cron Job

```bash
chmod +x /opt/backup-instances.sh

# Edit crontab
crontab -e

# Thêm dòng (backup mỗi ngày 2AM)
0 2 * * * /opt/backup-instances.sh >> /var/log/instance-backup.log 2>&1
```

---

## 🛡️ Bảo Mật

### Authentication & Authorization

#### Super Admin Level
- Chỉ Super Admin có quyền:
  - Tạo/xóa/quản lý instances
  - Xem thống kê tất cả instances
  - Access White-Label Management API

#### Instance Level
- Mỗi instance có admin riêng
- Không thể cross-access giữa instances
- JWT tokens chỉ valid cho instance đó

### Process Isolation

#### User Separation
- Tất cả services chạy với user `root` (có thể thay đổi)
- Có thể tạo dedicated user cho mỗi instance

**Ví dụ:**
```bash
# Tạo user cho instance
useradd -r -s /bin/false ov-instance1

# Update systemd service
# User=ov-instance1

# Update permissions
chown -R ov-instance1:ov-instance1 /opt/ov-panel-instances/instance-<uuid>
```

### Database Security

#### SQLite File Permissions

```bash
# Chỉ root có quyền đọc/ghi
chmod 600 /opt/ov-panel-instances/instance-*/data/ov-panel.db

# Hoặc per-instance user
chown ov-instance1:ov-instance1 /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db
chmod 600 /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db
```

#### Password Hashing

Passwords được hash bằng bcrypt:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(plain_password)
```

### Network Security

#### Firewall Configuration

```bash
# UFW firewall
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow Super Admin Panel
ufw allow 9000/tcp

# Allow instance ports (range)
ufw allow 9001:9999/tcp

# Enable firewall
ufw enable
```

#### Port Binding

Mặc định bind `0.0.0.0` (tất cả interfaces). Để restrict:

```bash
# Edit .env
HOST=127.0.0.1  # Chỉ localhost

# Sau đó dùng reverse proxy (Nginx/Caddy)
```

### API Security

#### JWT Token
- Auto-expire sau 24h (mặc định)
- Refresh token mechanism
- Secure signing với secret key

#### API Key
- Mỗi instance có API key riêng
- Dùng cho external integrations
- Rotate định kỳ

#### Rate Limiting

Thêm rate limiting trong Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location / {
        limit_req zone=mylimit burst=20;
        proxy_pass http://127.0.0.1:9001;
    }
}
```

---

## 📊 Monitoring và Maintenance

### System Monitoring

#### Resource Usage per Instance

```bash
# CPU và Memory của một instance
systemctl status ov-panel-instance@<uuid> | grep -E 'Memory|CPU'

# Tất cả instances
for svc in $(systemctl list-units 'ov-panel-instance@*' --no-legend | awk '{print $1}'); do
    echo "=== $svc ==="
    systemctl status $svc | grep -E 'Memory|CPU'
done
```

#### Disk Usage

```bash
# Instance directories
du -sh /opt/ov-panel-instances/instance-*

# Database sizes
du -sh /opt/ov-panel-instances/instance-*/data/ov-panel.db
```

### Log Monitoring

#### Centralized Logging

Setup rsyslog để tập trung logs:

```bash
# /etc/rsyslog.d/50-instances.conf
$ModLoad imfile

# Instance logs
$InputFileName /opt/ov-panel-instances/instance-*/logs/output.log
$InputFileTag instance-output:
$InputFileStateFile stat-instance-output
$InputFileSeverity info
$InputFileFacility local3
$InputRunFileMonitor

*.* @@logserver.local:514
```

#### Error Detection

Script tự động detect errors:

```bash
#!/bin/bash
# /opt/check-instance-errors.sh

for logfile in /opt/ov-panel-instances/instance-*/logs/error.log; do
    uuid=$(echo $logfile | grep -oP 'instance-\K[^/]+')
    
    # Check for errors in last 1 hour
    errors=$(find $logfile -mmin -60 -exec grep -i "error\|exception\|critical" {} \; | wc -l)
    
    if [ $errors -gt 10 ]; then
        echo "WARNING: Instance $uuid has $errors errors in last hour"
        # Send alert (email, Slack, etc.)
    fi
done
```

### Health Checks

#### HTTP Health Check Script

```bash
#!/bin/bash
# /opt/health-check-instances.sh

# Read instances từ database hoặc file
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
        # Send alert
    fi
done
```

#### Cron Job

```bash
# Chạy health check mỗi 5 phút
*/5 * * * * /opt/health-check-instances.sh >> /var/log/instance-health.log 2>&1
```

### Update & Maintenance

#### Update Shared Codebase

Khi có update code mới:

```bash
cd /opt/ov-panel

# Pull latest code
git pull

# Update dependencies
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Run migrations (nếu có)
cd backend
alembic upgrade head

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart main panel
systemctl restart ov-panel

# Restart tất cả instances (vì dùng shared code)
systemctl restart ov-panel-instance@*.service
```

#### Database Migration cho Instances

Nếu có schema changes:

```bash
# Update sample database
export IS_SUPER_ADMIN=False
export INSTANCE_ID=sample
cd /opt/ov-panel/backend
alembic upgrade head

# Copy updated sample
cp /opt/ov-panel/data/ov-panel.db /opt/ov-panel/data/ov-panel-sample.db

# Migrate existing instances
for instance in /opt/ov-panel-instances/instance-*/; do
    uuid=$(basename $instance | sed 's/instance-//')
    echo "Migrating instance $uuid..."
    
    export INSTANCE_ID=$uuid
    alembic upgrade head
done
```

---

## 🔧 Xử Lý Sự Cố

### Instance Không Start

#### Triệu chứng
```bash
systemctl status ov-panel-instance@<uuid>
# Output: Active: failed (Result: exit-code)
```

#### Các bước kiểm tra

1. **Check logs chi tiết**:
```bash
journalctl -u ov-panel-instance@<uuid> -n 100
```

2. **Kiểm tra port conflict**:
```bash
netstat -tulpn | grep <port>
# Nếu port đã dùng, đổi port trong .env
```

3. **Kiểm tra .env file**:
```bash
cat /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
# Đảm bảo format đúng, không có syntax errors
```

4. **Kiểm tra database file**:
```bash
ls -la /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db
# Đảm bảo file tồn tại và có quyền đọc/ghi
```

5. **Test start manually**:
```bash
cd /opt/ov-panel
export INSTANCE_ID=<uuid>
source /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
/opt/ov-panel/venv/bin/python main.py
# Xem error trực tiếp
```

#### Giải pháp

**Port conflict:**
```bash
# Edit .env và đổi port
nano /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
# PORT=9005

# Update database
python3 -c "
from backend.db.engine import sessionLocal
from backend.db.models import WhiteLabelInstance
db = sessionLocal()
instance = db.query(WhiteLabelInstance).filter_by(instance_id='<uuid>').first()
instance.port = 9005
db.commit()
"

# Restart
systemctl restart ov-panel-instance@<uuid>
```

**Database corruption:**
```bash
# Backup old db
mv /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db \
   /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db.bak

# Copy fresh sample
cp /opt/ov-panel/data/ov-panel-sample.db \
   /opt/ov-panel-instances/instance-<uuid>/data/ov-panel.db

# Restart
systemctl restart ov-panel-instance@<uuid>

# Note: Mất dữ liệu, cần restore từ backup
```

### Instance Running nhưng Không Truy Cập Được

#### Triệu chứng
- Service status = active
- Nhưng không truy cập được qua browser

#### Các bước kiểm tra

1. **Verify port listening**:
```bash
netstat -tulpn | grep <port>
# Phải thấy python process listening
```

2. **Test local connection**:
```bash
curl http://localhost:<port>/dashboard
# Hoặc
wget -O- http://localhost:<port>/dashboard
```

3. **Check firewall**:
```bash
ufw status
iptables -L -n -v
```

4. **Check logs for errors**:
```bash
tail -f /opt/ov-panel-instances/instance-<uuid>/logs/error.log
```

#### Giải pháp

**Firewall blocking:**
```bash
ufw allow <port>/tcp
```

**Wrong HOST binding:**
```bash
# Nếu HOST=127.0.0.1, không access từ ngoài
# Edit .env
nano /opt/ov-panel-instances/instance-<uuid>/.env.<uuid>
# HOST=0.0.0.0

systemctl restart ov-panel-instance@<uuid>
```

### Database Migration Failed

#### Triệu chứng
```
alembic.util.exc.CommandError: Target database is not up to date
```

#### Giải pháp

```bash
# Kiểm tra migration version hiện tại
cd /opt/ov-panel/backend
export INSTANCE_ID=<uuid>
alembic current

# Force upgrade
alembic upgrade head

# Nếu vẫn lỗi, stamp version
alembic stamp head
```

### Super Admin Panel Không Show Instances

#### Triệu chứng
- Web UI không hiển thị instances
- API trả về empty list

#### Các bước kiểm tra

1. **Verify database**:
```bash
sqlite3 /opt/ov-panel/data/ov-panel.db "SELECT * FROM whitelabel_instances;"
```

2. **Check API endpoint**:
```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"yourpassword"}' \
  | jq -r '.data.access_token')

# List instances
curl http://localhost:9000/api/whitelabel/list \
  -H "Authorization: Bearer $TOKEN"
```

3. **Check logs**:
```bash
journalctl -u ov-panel -n 100
```

### Shared Directory Symlinks Broken

#### Triệu chứng
```bash
ls -la /opt/ov-panel-instances/shared/
# Symlinks màu đỏ (broken)
```

#### Giải pháp

```bash
# Re-initialize shared directory
python3 whitelabel_cli.py init

# Hoặc manual
cd /opt/ov-panel-instances/shared
rm -f backend frontend main.py pyproject.toml
ln -s /opt/ov-panel/backend backend
ln -s /opt/ov-panel/frontend frontend
ln -s /opt/ov-panel/main.py main.py
ln -s /opt/ov-panel/pyproject.toml pyproject.toml

# Restart instances
systemctl restart ov-panel-instance@*.service
```

### Performance Issues

#### Triệu chứng
- Instances chậm
- High CPU/Memory usage

#### Monitoring

```bash
# Top processes
top -u root | grep python

# Instance-specific
systemctl status ov-panel-instance@<uuid> | grep -E 'Memory|CPU'
```

#### Solutions

**Too many connections:**
```bash
# Check connection count
netstat -an | grep <port> | wc -l

# Optimize database connections in code
# Or add connection pooling
```

**Memory leak:**
```bash
# Restart instance để free memory
systemctl restart ov-panel-instance@<uuid>

# Schedule periodic restarts
# Crontab: 0 4 * * 0 systemctl restart ov-panel-instance@<uuid>
```

**Disk full:**
```bash
# Check disk space
df -h

# Clean old logs
find /opt/ov-panel-instances/instance-*/logs/ -name "*.log" -mtime +30 -delete

# Rotate logs
logrotate -f /etc/logrotate.d/ov-panel-instances
```

---

## 📝 Best Practices

### Deployment Checklist

- [ ] Server đáp ứng yêu cầu tối thiểu (CPU, RAM, Disk)
- [ ] Firewall configured đúng ports
- [ ] SSL certificates (nếu dùng HTTPS)
- [ ] Backup strategy thiết lập
- [ ] Monitoring/alerting setup
- [ ] Documentation cho team
- [ ] Test recovery procedures

### Security Checklist

- [ ] Đổi default passwords
- [ ] Enable firewall (UFW)
- [ ] Restrict SSH access (key-only)
- [ ] Use strong passwords (>12 chars)
- [ ] Regular security updates
- [ ] Rotate API keys định kỳ
- [ ] Monitor logs for suspicious activity
- [ ] Backup encryption

### Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| System updates | Weekly | `apt update && apt upgrade` |
| Database backup | Daily | `/opt/backup-instances.sh` |
| Log cleanup | Weekly | `find ... -mtime +30 -delete` |
| Health check | 5 minutes | `/opt/health-check-instances.sh` |
| Security audit | Monthly | Review logs, access patterns |
| SSL renewal | 60 days | `certbot renew` |

---

## 🆘 Support & Resources

### Documentation
- [Main README](README.md)
- [White-Label Technical Doc](README-WHITELABEL.md)
- [API Documentation](http://<server-ip>:9000/docs) (khi `DOC=True`)

### Community
- **Telegram Channel**: [@OVPanel](https://t.me/OVPanel)
- **GitHub Issues**: [TinyActive/OpenVpn-Panel/issues](https://github.com/TinyActive/OpenVpn-Panel/issues)

### Logs Location
- Super Admin: `/var/log/syslog` + `journalctl -u ov-panel`
- Instances: `/opt/ov-panel-instances/instance-<uuid>/logs/`

### Quick Commands Reference

```bash
# List all instances
python3 whitelabel_cli.py list

# Create instance
python3 whitelabel_cli.py create --name "Name" --username admin --password pass --port 9001

# Start/Stop instance
systemctl start ov-panel-instance@<uuid>
systemctl stop ov-panel-instance@<uuid>

# View logs
journalctl -u ov-panel-instance@<uuid> -f

# Check health
systemctl status ov-panel-instance@<uuid>
```

---

## 📄 License

OV-Panel is open source under MIT License. See [LICENSE](LICENSE) file.

---

**🎉 Chúc bạn triển khai thành công hệ thống White-Label OV-Panel!**

*Last Updated: 2025-11-17*
