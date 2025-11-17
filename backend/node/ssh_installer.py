"""
SSH Node Auto-Installer Module
Handles automatic installation of OpenVPN nodes via SSH
"""
import paramiko
import time
import os
from typing import Optional, Dict, Tuple
from backend.logger import logger
import socket
import re


class SSHNodeInstaller:
    """Handles SSH connection and automated node installation"""
    
    def __init__(
        self,
        host: str,
        port: int = 22,
        username: str = "root",
        password: Optional[str] = None,
        key_filename: Optional[str] = None,
        timeout: int = 30
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.key_filename = key_filename
        self.timeout = timeout
        self.client = None
        
    def test_connection(self) -> Tuple[bool, str]:
        """
        Test SSH connection to the node
        Returns: (success: bool, message: str)
        """
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Try to connect
            if self.key_filename:
                client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    key_filename=self.key_filename,
                    timeout=self.timeout,
                    banner_timeout=self.timeout
                )
            else:
                client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    password=self.password,
                    timeout=self.timeout,
                    banner_timeout=self.timeout
                )
            
            # Test basic command
            stdin, stdout, stderr = client.exec_command("echo test")
            result = stdout.read().decode().strip()
            
            if result == "test":
                client.close()
                return True, "SSH connection successful"
            else:
                client.close()
                return False, "SSH connection test failed"
                
        except paramiko.AuthenticationException:
            return False, "Authentication failed. Please check username/password or SSH key."
        except paramiko.SSHException as e:
            return False, f"SSH error: {str(e)}"
        except socket.timeout:
            return False, f"Connection timeout to {self.host}:{self.port}"
        except Exception as e:
            return False, f"Connection error: {str(e)}"
    
    def connect(self) -> bool:
        """Establish SSH connection"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            if self.key_filename:
                self.client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    key_filename=self.key_filename,
                    timeout=self.timeout,
                    banner_timeout=self.timeout
                )
            else:
                self.client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    password=self.password,
                    timeout=self.timeout,
                    banner_timeout=self.timeout
                )
            
            logger.info(f"SSH connected to {self.host}:{self.port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect SSH: {str(e)}")
            return False
    
    def disconnect(self):
        """Close SSH connection"""
        if self.client:
            self.client.close()
            self.client = None
            logger.info(f"SSH disconnected from {self.host}")
    
    def execute_command(self, command: str, timeout: int = 300) -> Tuple[int, str, str]:
        """
        Execute a command via SSH
        Returns: (exit_code, stdout, stderr)
        """
        if not self.client:
            raise Exception("SSH client not connected")
        
        try:
            stdin, stdout, stderr = self.client.exec_command(command, timeout=timeout)
            exit_code = stdout.channel.recv_exit_status()
            stdout_text = stdout.read().decode()
            stderr_text = stderr.read().decode()
            
            return exit_code, stdout_text, stderr_text
            
        except socket.timeout:
            raise Exception(f"Command execution timeout after {timeout} seconds")
        except Exception as e:
            raise Exception(f"Command execution failed: {str(e)}")
    
    def install_node(
        self,
        node_port: int,
        api_key: str,
        r2_config: Dict[str, str],
        protocol: str = "tcp",
        ovpn_port: int = 1194,
        auto_install_script_url: str = "https://raw.githubusercontent.com/TinyActive/OpenVpn-Panel-Node/main/auto_install.sh"
    ) -> Tuple[bool, str, Dict]:
        """
        Install OpenVPN node automatically via SSH (Non-Interactive)
        
        Args:
            node_port: Port for OV-Node service
            api_key: API key for node authentication
            r2_config: R2 configuration dict with keys:
                - access_key_id
                - secret_access_key
                - bucket_name
                - account_id
                - public_base_url
                - download_token
            protocol: OpenVPN protocol (tcp/udp)
            ovpn_port: OpenVPN port
            auto_install_script_url: URL to non-interactive installation script
        
        Returns:
            (success: bool, message: str, details: dict)
        """
        details = {"steps": []}
        
        try:
            if not self.connect():
                return False, "Failed to establish SSH connection", details
            
            # Step 1: Create fully automated installation script (inline)
            logger.info("Step 1: Creating non-interactive installation script...")
            details["steps"].append("Creating automated installation script")
            
            # Step 2: Create fully automated, non-interactive installation script
            logger.info("Step 2: Preparing automated installation...")
            details["steps"].append("Preparing installation configuration")
            
            # Create a complete non-interactive installation script
            # This bypasses the menu-driven installer.py entirely
            auto_install_script = f"""#!/bin/bash
set -e

# Color codes
GREEN="\\033[0;32m"
YELLOW="\\033[1;33m"
RED="\\033[0;31m"
BLUE="\\033[0;34m"
NC="\\033[0m"

log_info() {{ echo -e "${{BLUE}}[INFO]${{NC}} $1"; }}
log_success() {{ echo -e "${{GREEN}}[SUCCESS]${{NC}} $1"; }}
log_error() {{ echo -e "${{RED}}[ERROR]${{NC}} $1"; }}

# Configuration
APP_NAME="ov-node"
INSTALL_DIR="/opt/$APP_NAME"
REPO_URL="https://github.com/TinyActive/OpenVpn-Panel-Node"
PYTHON="/usr/bin/python3"
VENV_DIR="$INSTALL_DIR/venv"
NODE_SERVICE_PORT="{node_port}"
NODE_API_KEY="{api_key}"
R2_ACCESS_KEY_ID="{r2_config.get('access_key_id', '')}"
R2_SECRET_ACCESS_KEY="{r2_config.get('secret_access_key', '')}"
R2_BUCKET_NAME="{r2_config.get('bucket_name', '')}"
R2_ACCOUNT_ID="{r2_config.get('account_id', '')}"
R2_PUBLIC_BASE_URL="{r2_config.get('public_base_url', 'api.openvpn.panel')}"
R2_DOWNLOAD_TOKEN="{r2_config.get('download_token', '8638b5a1-77df-4d24-8253-58977fa508a4')}"
OPENVPN_PORT="{ovpn_port}"
OPENVPN_PROTOCOL="{protocol.lower()}"

log_info "Starting OV-Node automated installation..."

# Install system dependencies
log_info "Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y python3 python3-pip python3-venv wget curl git iptables openssl ca-certificates

# Install OpenVPN if not already installed
if [ ! -f "/etc/openvpn/server/server.conf" ]; then
    log_info "Installing OpenVPN..."
    
    # Download openvpn-install.sh
    wget https://git.io/vpn -O /root/openvpn-install.sh
    chmod +x /root/openvpn-install.sh
    
    # Run with automated responses (the script auto-selects everything)
    printf '\\n\\n\\n\\n\\n\\n\\n\\n' | bash /root/openvpn-install.sh || true
    
    # Verify installation
    if [ -f "/etc/openvpn/server/server.conf" ]; then
        log_success "OpenVPN installed"
        systemctl enable openvpn-server@server || true
        systemctl start openvpn-server@server || true
    else
        log_error "OpenVPN installation may have failed"
    fi
else
    log_info "OpenVPN already installed"
fi

# Clone OV-Node repository
log_info "Cloning OV-Node repository..."
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Create Python virtual environment
log_info "Setting up Python environment..."
$PYTHON -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --upgrade pip

# Install Python dependencies
if [ -f "$INSTALL_DIR/requirements.txt" ]; then
    "$VENV_DIR/bin/pip" install -r "$INSTALL_DIR/requirements.txt"
else
    "$VENV_DIR/bin/pip" install fastapi uvicorn psutil pydantic_settings python-dotenv colorama pexpect requests boto3
fi

# Configure .env file
log_info "Configuring environment variables..."
if [ -f "$INSTALL_DIR/.env.example" ]; then
    cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
else
    log_error ".env.example not found"
    exit 1
fi

# Update .env with configuration
sed -i "s/^SERVICE_PORT = .*/SERVICE_PORT = $NODE_SERVICE_PORT/" "$INSTALL_DIR/.env"
sed -i "s/^API_KEY = .*/API_KEY = $NODE_API_KEY/" "$INSTALL_DIR/.env"
sed -i "s/^R2_ACCESS_KEY_ID = .*/R2_ACCESS_KEY_ID = $R2_ACCESS_KEY_ID/" "$INSTALL_DIR/.env"
sed -i "s/^R2_SECRET_ACCESS_KEY = .*/R2_SECRET_ACCESS_KEY = $R2_SECRET_ACCESS_KEY/" "$INSTALL_DIR/.env"
sed -i "s/^R2_BUCKET_NAME = .*/R2_BUCKET_NAME = $R2_BUCKET_NAME/" "$INSTALL_DIR/.env"
sed -i "s/^R2_ACCOUNT_ID = .*/R2_ACCOUNT_ID = $R2_ACCOUNT_ID/" "$INSTALL_DIR/.env"
sed -i "s|^R2_PUBLIC_BASE_URL = .*|R2_PUBLIC_BASE_URL = $R2_PUBLIC_BASE_URL|" "$INSTALL_DIR/.env"
sed -i "s/^R2_DOWNLOAD_TOKEN = .*/R2_DOWNLOAD_TOKEN = $R2_DOWNLOAD_TOKEN/" "$INSTALL_DIR/.env"

# Create systemd service
log_info "Creating systemd service..."
cat > /etc/systemd/system/ov-node.service << 'EOFSERVICE'
[Unit]
Description=OV-Node App
After=network.target openvpn-server@server.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/core
ExecStart=$VENV_DIR/bin/python app.py
Restart=always
RestartSec=5
Environment="PATH=$VENV_DIR/bin:/usr/local/bin:/usr/bin:/bin"

[Install]
WantedBy=multi-user.target
EOFSERVICE

# Replace variables in service file
sed -i "s|\\$INSTALL_DIR|$INSTALL_DIR|g" /etc/systemd/system/ov-node.service
sed -i "s|\\$VENV_DIR|$VENV_DIR|g" /etc/systemd/system/ov-node.service

systemctl daemon-reload
systemctl enable ov-node
systemctl start ov-node

# Wait for service to start
sleep 3

if systemctl is-active --quiet ov-node; then
    log_success "OV-Node service is running"
else
    log_error "OV-Node service failed to start"
    systemctl status ov-node --no-pager || true
    exit 1
fi

log_success "Installation completed successfully!"
echo "INSTALL_EXIT_CODE=0"
"""
            
            # Upload auto-install script
            script_escaped = auto_install_script.replace("'", "'\\''")
            exit_code, stdout, stderr = self.execute_command(
                f"echo '{script_escaped}' > /tmp/ov_auto_install.sh && chmod +x /tmp/ov_auto_install.sh"
            )
            if exit_code != 0:
                return False, f"Failed to create installation script: {stderr}", details
            
            logger.info("Automated installation script created successfully")
            
            # Step 3: Run non-interactive installation
            logger.info("Step 3: Running automated installation (this may take 5-10 minutes)...")
            details["steps"].append("Running automated installation (5-10 minutes)")
            
            install_command = """
cd /tmp
bash /tmp/ov_auto_install.sh > /tmp/ov_install.log 2>&1
echo "INSTALL_EXIT_CODE=$?" >> /tmp/ov_install.log
"""
            
            exit_code, stdout, stderr = self.execute_command(install_command, timeout=900)
            
            # Get installation log
            exit_code2, install_log, _ = self.execute_command("cat /tmp/ov_install.log 2>/dev/null || echo 'No log file'")
            if install_log and install_log != 'No log file':
                details["installation_log"] = install_log[-5000:]  # Last 5000 chars
                logger.info(f"Installation log (last 5000 chars): {install_log[-5000:]}")
            
            # Step 4: Verify installation
            logger.info("Step 4: Verifying installation...")
            details["steps"].append("Verifying installation")
            
            # Check service status
            exit_code, stdout, stderr = self.execute_command(
                "systemctl is-active ov-node 2>&1"
            )
            
            service_status = stdout.strip()
            details["service_status"] = service_status
            
            # Get detailed status
            exit_code2, status_detail, _ = self.execute_command(
                "systemctl status ov-node --no-pager -l 2>&1 | head -50"
            )
            details["service_detail"] = status_detail
            
            # Step 5: Test node API
            logger.info("Step 5: Testing node API...")
            details["steps"].append("Testing node API")
            
            # Wait for service to fully start
            time.sleep(5)
            
            exit_code, stdout, stderr = self.execute_command(
                f"curl -s -m 10 http://localhost:{node_port}/api/health || echo 'API_UNREACHABLE'"
            )
            
            api_response = stdout.strip()
            details["api_test"] = api_response
            
            # Get OpenVPN status and tunnel address
            exit_code, stdout, stderr = self.execute_command(
                "systemctl is-active openvpn-server@server 2>&1"
            )
            details["openvpn_status"] = stdout.strip()
            
            # Extract client remote IP (public IP that clients connect to) from client-common.txt
            exit_code, stdout, stderr = self.execute_command(
                "grep -E '^remote ' /etc/openvpn/server/client-common.txt 2>/dev/null | awk '{print $2}' | head -1"
            )
            client_remote_ip = None
            if exit_code == 0 and stdout.strip():
                client_remote_ip = stdout.strip()
                logger.info(f"Detected client remote IP from client-common.txt: {client_remote_ip}")
            else:
                logger.warning("Could not detect client remote IP from client-common.txt")
            
            # Get actual public IP of the server
            exit_code, stdout, stderr = self.execute_command(
                "curl -s -m 10 ifconfig.me || curl -s -m 10 icanhazip.com || echo ''"
            )
            actual_public_ip = stdout.strip() if exit_code == 0 and stdout.strip() else None
            
            if actual_public_ip:
                logger.info(f"Detected actual public IP: {actual_public_ip}")
                
                # Fix client-common.txt if remote IP is wrong
                if client_remote_ip and client_remote_ip != actual_public_ip:
                    logger.warning(f"⚠️  client-common.txt has wrong IP: {client_remote_ip}, fixing to {actual_public_ip}")
                    
                    # Fix the remote line in client-common.txt
                    fix_cmd = f"""
sed -i 's|^remote .*$|remote {actual_public_ip} {ovpn_port}|' /etc/openvpn/server/client-common.txt
echo "Fixed client-common.txt"
"""
                    exit_code, stdout, stderr = self.execute_command(fix_cmd)
                    if exit_code == 0:
                        logger.info(f"✅ Successfully fixed client-common.txt with public IP: {actual_public_ip}")
                        client_remote_ip = actual_public_ip
                    else:
                        logger.error(f"Failed to fix client-common.txt: {stderr}")
                elif not client_remote_ip:
                    logger.warning(f"client-common.txt missing remote line, adding it...")
                    
                    # Add remote line if missing
                    fix_cmd = f"""
sed -i '3 i\\remote {actual_public_ip} {ovpn_port}' /etc/openvpn/server/client-common.txt
echo "Added remote line to client-common.txt"
"""
                    exit_code, stdout, stderr = self.execute_command(fix_cmd)
                    if exit_code == 0:
                        logger.info(f"✅ Successfully added remote line to client-common.txt")
                        client_remote_ip = actual_public_ip
                    else:
                        logger.error(f"Failed to add remote line: {stderr}")
                else:
                    logger.info(f"✅ client-common.txt already has correct public IP")
            else:
                logger.warning("Could not detect actual public IP, skipping client-common.txt fix")
            
            details["client_remote_ip"] = client_remote_ip
            details["actual_public_ip"] = actual_public_ip
            
            # Cleanup temporary files
            self.execute_command("rm -f /tmp/ov_auto_install.sh /tmp/ov_install.log")
            
            # Final check - determine success
            is_success = False
            final_message = ""
            
            if service_status == "active":
                if "API_UNREACHABLE" not in api_response and api_response:
                    is_success = True
                    final_message = "✅ Node installed successfully! Service is running and API is responding."
                else:
                    is_success = True
                    final_message = "⚠️  Node service is running but API needs time to initialize. Please wait 1-2 minutes."
            else:
                # Check installation log for success markers
                if "Installation Completed Successfully" in details.get("installation_log", ""):
                    is_success = True
                    final_message = "✅ Installation completed. Service may need manual restart: systemctl restart ov-node"
                else:
                    is_success = False
                    final_message = f"❌ Installation failed. Service status: {service_status}"
            
            details["steps"].append(final_message)
            details["success"] = is_success
            
            return is_success, final_message, details
                
        except Exception as e:
            error_msg = f"Installation failed: {str(e)}"
            logger.error(error_msg)
            details["error"] = str(e)
            details["success"] = False
            return False, error_msg, details
            
        finally:
            self.disconnect()
    
    def get_server_info(self) -> Dict:
        """Get server information for verification"""
        if not self.client:
            if not self.connect():
                return {}
        
        try:
            info = {}
            
            # Get OS info
            exit_code, stdout, stderr = self.execute_command("cat /etc/os-release")
            if exit_code == 0:
                info["os"] = stdout.strip()
            
            # Get IP
            exit_code, stdout, stderr = self.execute_command("curl -4 ifconfig.me")
            if exit_code == 0:
                info["public_ip"] = stdout.strip()
            
            # Get hostname
            exit_code, stdout, stderr = self.execute_command("hostname")
            if exit_code == 0:
                info["hostname"] = stdout.strip()
            
            return info
            
        except Exception as e:
            logger.error(f"Failed to get server info: {str(e)}")
            return {}
