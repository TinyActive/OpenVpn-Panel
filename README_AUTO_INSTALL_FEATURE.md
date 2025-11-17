# Tính Năng Tự Động Cài Đặt Node qua SSH

## Tổng Quan

Tính năng này cho phép OV-Panel tự động cài đặt và cấu hình OpenVPN node mới qua SSH, thay thế hoàn toàn việc phải add node thủ công với các thông tin như API key, port, address.

## Thay Đổi Chính

### 1. Backend Changes

#### Modules Mới Được Tạo:

**`backend/node/ssh_installer.py`**
- Class `SSHNodeInstaller` để xử lý kết nối SSH và cài đặt tự động
- Các method chính:
  - `test_connection()`: Kiểm tra kết nối SSH
  - `install_node()`: Cài đặt node tự động
  - `execute_command()`: Thực thi lệnh từ xa
  - `get_server_info()`: Lấy thông tin server

**`backend/node/secure_config.py`**
- Class `SecureConfigManager` để mã hóa và lưu trữ credentials
- Sử dụng Fernet encryption (AES-128)
- Lưu trữ tại `/opt/ov-panel-secure/` với permissions 0700
- Các method:
  - `save_node_credentials()`: Lưu SSH + R2 credentials mã hóa
  - `load_node_credentials()`: Đọc và giải mã credentials
  - `delete_node_credentials()`: Xóa credentials
  - `update_node_credentials()`: Cập nhật credentials

**`backend/node/auto_installer.py`**
- Script Python helper để tự động hóa cài đặt OV-Node
- Được upload lên server và thực thi trong quá trình cài đặt

#### Schema Mới:

**`backend/schema/_input.py`**
- `SSHConfig`: Cấu hình SSH (host, port, username, password/key)
- `R2Config`: Cấu hình Cloudflare R2 storage
- `NodeAutoInstall`: Schema tổng hợp cho auto-install

#### API Endpoint Mới:

**POST `/node/auto-install`**
- Nhận thông tin SSH và R2 từ frontend
- Thực hiện cài đặt tự động
- Trả về kết quả chi tiết từng bước

#### Updates trong `backend/node/task.py`:
- `auto_install_node_handler()`: Handler chính cho auto-install
- Tích hợp với existing `add_node_handler()` để sync users

#### Updates trong `backend/routers/node.py`:
- Import `NodeAutoInstall` schema
- Thêm route `/auto-install`

### 2. Frontend Changes

**`frontend/src/components/AddNodeModal.jsx`** - Hoàn toàn được viết lại:

**Form cũ (Manual):**
- Node Name
- Address
- Port
- API Key
- Protocol
- OpenVPN Port
- Tunnel Address

**Form mới (Auto-Install):**

**Node Information:**
- Node Name

**SSH Configuration:**
- Server IP/Hostname
- SSH Port (default: 22)
- SSH Username (default: root)
- Password hoặc SSH Key (toggle)

**Cloudflare R2 Configuration:**
- R2 Access Key ID
- R2 Secret Access Key
- R2 Bucket Name
- R2 Account ID
- R2 Public Base URL
- R2 Download Token

**OpenVPN Configuration:**
- Protocol (TCP/UDP)
- OpenVPN Port (default: 1194)
- OV-Node Service Port (default: 9090)
- Tunnel Address (optional)

**UI Improvements:**
- Progress indicator khi đang install
- Sections được tách biệt rõ ràng
- Better validation và error messages
- Responsive modal với scroll

### 3. Dependencies

**Thêm vào `pyproject.toml`:**
```toml
"paramiko",      # SSH client
"cryptography",  # Encryption
```

## Quy Trình Cài Đặt Node

### Các Bước Thực Hiện:

1. **Test SSH Connection**
   - Kiểm tra kết nối SSH đến server
   - Verify authentication
   - Test basic command execution

2. **Get Server Info**
   - Lấy OS information
   - Lấy public IP
   - Lấy hostname

3. **Install Dependencies**
   - Update apt packages
   - Install python3, pip, git, wget, curl
   - Install python3-venv

4. **Download Installation Script**
   - Download install.sh từ https://node-vpn.nginxwaf.me/
   - Set executable permissions

5. **Prepare Configuration**
   - Tạo .env file với thông tin R2 và API key
   - Upload auto_installer.py helper

6. **Run Installation**
   - Execute install.sh
   - Script sẽ:
     - Clone OpenVPN-Panel-Node repository
     - Create Python virtual environment
     - Install requirements
     - Run installer.py (with automated inputs)

7. **Configure Node**
   - Copy .env file to /opt/ov-node/
   - Set correct file permissions (0600)

8. **Setup Systemd Service**
   - Create /etc/systemd/system/ov-node.service
   - Enable service
   - Start service

9. **Verify Installation**
   - Check service status
   - Test API endpoint (http://localhost:PORT/api/health)
   - Get detailed logs

10. **Add to Database**
    - Add node to OV-Panel database
    - Update health status
    - Sync all existing users to new node

## Bảo Mật

### Encryption của Credentials:

1. **Master Key Generation:**
   - Tạo random password (32 bytes)
   - Sử dụng PBKDF2 với SHA256
   - 100,000 iterations
   - Salt ngẫu nhiên (16 bytes)

2. **Storage:**
   - Location: `/opt/ov-panel-secure/`
   - Master key: `.master.key`
   - Salt: `.salt`
   - Node configs: `node_<address>.enc`

3. **Permissions:**
   - Directory: 0700 (rwx------)
   - Files: 0600 (rw-------)
   - Owner: root

4. **Data Structure (encrypted):**
```json
{
  "node_address": "192.168.1.100",
  "ssh": {
    "host": "192.168.1.100",
    "port": 22,
    "username": "root",
    "password": "encrypted",
    "use_key": false,
    "key_content": null
  },
  "r2": {
    "access_key_id": "encrypted",
    "secret_access_key": "encrypted",
    "bucket_name": "encrypted",
    "account_id": "encrypted",
    "public_base_url": "api.openvpn.panel",
    "download_token": "encrypted"
  },
  "node": {
    "port": 9090,
    "api_key": "encrypted",
    "protocol": "tcp",
    "ovpn_port": 1194
  }
}
```

### Không Lưu Vào Database:

❌ SSH password  
❌ SSH private key  
❌ R2 credentials  
✅ Chỉ lưu encrypted trong file system

## Cài Đặt

### 1. Install Dependencies:

```bash
cd /root/OpenVpn-Panel
sudo bash install_auto_node_deps.sh
```

Hoặc thủ công:

```bash
# Create secure directory
sudo mkdir -p /opt/ov-panel-secure
sudo chmod 700 /opt/ov-panel-secure

# Install Python packages
pip3 install paramiko cryptography
```

### 2. Khởi động lại OV-Panel:

```bash
sudo systemctl restart ov-panel
```

## Sử Dụng

### Từ Frontend:

1. Login vào OV-Panel
2. Vào trang **Node Management**
3. Click **Add Node**
4. Điền thông tin:
   - Node name
   - SSH credentials (IP, port, username, password/key)
   - R2 configuration
   - OpenVPN settings
5. Click **Install Node**
6. Đợi 5-10 phút
7. Kiểm tra kết quả

### Từ API:

```bash
curl -X POST "http://your-panel-url/api/node/auto-install" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node-US-1",
    "ssh": {
      "host": "192.168.1.100",
      "port": 22,
      "username": "root",
      "password": "your-password",
      "use_key": false
    },
    "r2": {
      "access_key_id": "your-key",
      "secret_access_key": "your-secret",
      "bucket_name": "your-bucket",
      "account_id": "your-account-id",
      "public_base_url": "api.openvpn.panel",
      "download_token": "your-token"
    },
    "protocol": "tcp",
    "ovpn_port": 1194,
    "node_port": 9090
  }'
```

## Troubleshooting

### SSH Connection Failed:

```bash
# Test manually
ssh root@your-server-ip -p 22

# Check firewall
sudo ufw status
sudo ufw allow 22/tcp
```

### Installation Failed:

```bash
# SSH into server and check logs
ssh root@your-server-ip
tail -f /tmp/install.log
journalctl -u ov-node -f
```

### Service Not Running:

```bash
# Check service status
systemctl status ov-node

# Check .env file
cat /opt/ov-node/.env

# Restart service
systemctl restart ov-node
```

### Credentials Not Saved:

```bash
# Check secure directory
ls -la /opt/ov-panel-secure/

# Check permissions
stat /opt/ov-panel-secure/
```

## Known Limitations

1. **Linux Only**: Chỉ hỗ trợ Ubuntu/Debian servers
2. **Root Required**: Cần quyền root SSH access
3. **Single Protocol**: Mỗi node chỉ một protocol (TCP hoặc UDP)
4. **No Rollback**: Nếu cài đặt fail, cần cleanup thủ công
5. **SSH Key Support**: Hiện tại chưa fully test với SSH keys

## Future Enhancements

- [ ] Multi-protocol support per node
- [ ] Installation progress streaming (WebSocket)
- [ ] Automatic rollback on failure
- [ ] Support for non-root users with sudo
- [ ] Batch installation (multiple nodes)
- [ ] Pre-flight checks before installation
- [ ] Custom installation scripts
- [ ] CentOS/RHEL support
- [ ] Docker-based node installation
- [ ] Re-installation capability
- [ ] Credential rotation

## Files Changed/Created

### Created:
- `backend/node/ssh_installer.py`
- `backend/node/secure_config.py`
- `backend/node/auto_installer.py`
- `install_auto_node_deps.sh`
- `docs/AUTO_INSTALL_NODE.md`
- `README_AUTO_INSTALL_FEATURE.md`

### Modified:
- `backend/schema/_input.py`
- `backend/node/task.py`
- `backend/routers/node.py`
- `frontend/src/components/AddNodeModal.jsx`
- `pyproject.toml`

## Testing Checklist

- [ ] SSH connection với password
- [ ] SSH connection với SSH key
- [ ] R2 configuration validation
- [ ] Node installation success
- [ ] Service starts correctly
- [ ] API responds properly
- [ ] Users sync to new node
- [ ] Credentials encryption/decryption
- [ ] Error handling cho failed connections
- [ ] Error handling cho failed installations
- [ ] Frontend form validation
- [ ] Progress indicators
- [ ] Multiple nodes installation

## Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của OV-Panel: `journalctl -u ov-panel -f`
2. Installation logs: `/tmp/install.log` trên node server
3. Node service logs: `journalctl -u ov-node -f`
4. Encrypted configs: `/opt/ov-panel-secure/`

## Credits

Tính năng được phát triển để tự động hóa việc deployment OpenVPN nodes, giảm thiểu thời gian và lỗi thủ công khi mở rộng hệ thống.
