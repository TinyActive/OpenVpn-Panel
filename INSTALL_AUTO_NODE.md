# Auto-Install Node Feature - Installation Guide

## Automatic Installation (Recommended)

Tính năng Auto-Install Node đã được **tích hợp sẵn** vào script cài đặt chính.

### Cài đặt OV-Panel mới:

```bash
cd /root/OpenVpn-Panel
sudo bash install.sh
```

Script sẽ tự động:
1. ✓ Tạo thư mục secure `/opt/ov-panel-secure`
2. ✓ Cài đặt `paramiko` và `cryptography` vào venv (qua pyproject.toml)
3. ✓ Cấu hình permissions (0700)
4. ✓ Sẵn sàng sử dụng tính năng auto-install node

**Không cần chạy thêm script nào khác!**

## Manual Installation (Chỉ khi cần)

Nếu bạn đã cài đặt OV-Panel trước đó và muốn thêm tính năng này:

```bash
cd /root/OpenVpn-Panel
sudo bash install_auto_node_deps.sh
```

Script này sẽ:
1. Kiểm tra OV-Panel đã được cài đặt
2. Tạo thư mục secure nếu chưa có
3. Cài đặt dependencies vào venv hiện tại
4. Restart service

## Verify Installation

Kiểm tra dependencies đã được cài đặt:

```bash
cd /opt/ov-panel
source venv/bin/activate
python3 -c "import paramiko; import cryptography; print('✓ OK')"
```

Kiểm tra thư mục secure:

```bash
ls -la /opt/ov-panel-secure/
# Kết quả mong đợi: drwx------ 2 root root
```

## Usage

Sau khi cài đặt xong:

1. Truy cập OV-Panel frontend
2. Vào **Node Management**
3. Click **Add Node**
4. Điền thông tin SSH + R2
5. Click **Install Node**

## Troubleshooting

### Dependencies không được cài đặt:

```bash
cd /opt/ov-panel
source venv/bin/activate
pip install paramiko cryptography
systemctl restart ov-panel
```

### Thư mục secure không tồn tại:

```bash
sudo mkdir -p /opt/ov-panel-secure
sudo chmod 700 /opt/ov-panel-secure
sudo chown root:root /opt/ov-panel-secure
```

### Permission denied:

```bash
sudo chmod 700 /opt/ov-panel-secure
sudo chown root:root /opt/ov-panel-secure
```

## What's Included

### install.sh (Main Installer)
- ✓ Tạo `/opt/ov-panel-secure/` với permissions 0700
- ✓ Thông báo về tính năng auto-install
- ✓ Dependencies được cài tự động qua pyproject.toml

### pyproject.toml
```toml
dependencies = [
    ...
    "paramiko",      # SSH client
    "cryptography",  # Encryption
]
```

### installer.py
- ✓ Function `install_dependencies()` đọc pyproject.toml
- ✓ Tự động cài tất cả dependencies vào venv
- ✓ Không cần chỉnh sửa thêm

## Security Notes

- 🔒 Thư mục `/opt/ov-panel-secure/` chỉ root mới truy cập được
- 🔒 Credentials được mã hóa bằng Fernet (AES-128)
- 🔒 Master key được tạo với PBKDF2 + 100,000 iterations
- 🔒 Không lưu thông tin nhạy cảm vào database

## Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `journalctl -u ov-panel -f`
2. Kiểm tra venv: `source /opt/ov-panel/venv/bin/activate && pip list | grep -E "paramiko|cryptography"`
3. Kiểm tra permissions: `ls -la /opt/ov-panel-secure/`

## Documentation

- 📖 Chi tiết API: `docs/AUTO_INSTALL_NODE.md`
- 📖 Tổng quan kỹ thuật: `README_AUTO_INSTALL_FEATURE.md`
