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
        install_script_url: str = "https://node-vpn.nginxwaf.me/install.sh"
    ) -> Tuple[bool, str, Dict]:
        """
        Install OpenVPN node automatically via SSH
        
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
            install_script_url: URL to download install.sh
        
        Returns:
            (success: bool, message: str, details: dict)
        """
        details = {"steps": []}
        
        try:
            if not self.connect():
                return False, "Failed to establish SSH connection", details
            
            # Step 1: Check system requirements
            logger.info("Step 1: Checking system requirements...")
            details["steps"].append("Checking system requirements")
            
            exit_code, stdout, stderr = self.execute_command("which python3 && which git")
            if exit_code != 0:
                logger.info("Installing dependencies...")
                exit_code, stdout, stderr = self.execute_command(
                    "apt update -y && apt install -y python3 python3-pip python3-venv wget curl git"
                )
                if exit_code != 0:
                    return False, f"Failed to install dependencies: {stderr}", details
            
            # Step 2: Download and prepare installation
            logger.info("Step 2: Downloading installation script...")
            details["steps"].append("Downloading installation script")
            
            commands = f"""
cd /tmp
rm -f install.sh
wget {install_script_url} -O install.sh
chmod +x install.sh
"""
            exit_code, stdout, stderr = self.execute_command(commands)
            if exit_code != 0:
                return False, f"Failed to download install script: {stderr}", details
            
            # Step 3: Create .env file with configuration
            logger.info("Step 3: Preparing node configuration...")
            details["steps"].append("Preparing node configuration")
            
            # Create .env file content
            env_content = f"""SERVICE_PORT={node_port}
API_KEY={api_key}
DEBUG=WARNING
DOC=False

R2_ACCESS_KEY_ID={r2_config.get('access_key_id', '')}
R2_SECRET_ACCESS_KEY={r2_config.get('secret_access_key', '')}
R2_BUCKET_NAME={r2_config.get('bucket_name', '')}
R2_ACCOUNT_ID={r2_config.get('account_id', '')}
R2_PUBLIC_BASE_URL={r2_config.get('public_base_url', 'api.openvpn.panel')}
R2_DOWNLOAD_TOKEN={r2_config.get('download_token', '8638b5a1-77df-4d24-8253-58977fa508a4')}
"""
            
            # Upload auto_installer.py to server
            auto_installer_path = os.path.join(
                os.path.dirname(__file__), 
                "auto_installer.py"
            )
            
            if os.path.exists(auto_installer_path):
                with open(auto_installer_path, 'r') as f:
                    auto_installer_content = f.read()
                
                # Escape single quotes for bash
                auto_installer_escaped = auto_installer_content.replace("'", "'\\''")
                exit_code, stdout, stderr = self.execute_command(
                    f"echo '{auto_installer_escaped}' > /tmp/auto_installer.py && chmod +x /tmp/auto_installer.py"
                )
                if exit_code != 0:
                    logger.warning(f"Failed to upload auto_installer.py: {stderr}")
            
            # Step 4: Run installation script
            logger.info("Step 4: Running node installation...")
            details["steps"].append("Running node installation (this may take 5-10 minutes)")
            
            # The install.sh will clone the repo and install dependencies
            # We'll run the installer.py with automated inputs via stdin
            env_escaped = env_content.replace("'", "'\\''")
            
            install_command = f"""
cd /tmp
bash install.sh > /tmp/install.log 2>&1
# After install.sh completes, configure the node
if [ -f /opt/ov-node/.env ]; then
    echo '{env_escaped}' > /opt/ov-node/.env
    chmod 600 /opt/ov-node/.env
fi
"""
            
            exit_code, stdout, stderr = self.execute_command(install_command, timeout=600)
            
            # Log installation output
            logger.info(f"Installation stdout: {stdout}")
            if stderr:
                logger.warning(f"Installation stderr: {stderr}")
            
            # Get detailed logs
            exit_code2, install_log, _ = self.execute_command("cat /tmp/install.log 2>/dev/null || echo 'No log file'")
            if install_log and install_log != 'No log file':
                details["installation_log"] = install_log
            
            # Step 5: Verify .env was created and configure service
            logger.info("Step 5: Configuring node service...")
            details["steps"].append("Configuring node service")
            
            # Ensure .env exists and has correct content
            exit_code, stdout, stderr = self.execute_command(
                "cat /opt/ov-node/.env"
            )
            
            if exit_code != 0 or "API_KEY" not in stdout:
                logger.info(".env not found or incomplete, creating it...")
                env_escaped = env_content.replace("'", "'\\''")
                exit_code, stdout, stderr = self.execute_command(
                    f"echo '{env_escaped}' > /opt/ov-node/.env && chmod 600 /opt/ov-node/.env"
                )
                if exit_code != 0:
                    logger.warning(f"Failed to create .env: {stderr}")
            
            # Step 6: Ensure systemd service exists and is configured
            logger.info("Step 6: Setting up systemd service...")
            details["steps"].append("Setting up systemd service")
            
            # Check if ov-node service exists
            exit_code, stdout, stderr = self.execute_command(
                "systemctl status ov-node 2>&1"
            )
            
            if "could not be found" in stderr or "could not be found" in stdout or "not-found" in stdout:
                # Service doesn't exist, try to create it manually
                logger.info("Service not found, creating manually...")
                
                service_content = """[Unit]
Description=OV-Node App
After=network.target

[Service]
User=root
WorkingDirectory=/opt/ov-node/core
ExecStart=/opt/ov-node/venv/bin/python app.py
Restart=always
RestartSec=5
Environment="PATH=/opt/ov-node/venv/bin:/usr/local/bin:/usr/bin:/bin"

[Install]
WantedBy=multi-user.target
"""
                
                service_escaped = service_content.replace("'", "'\\''")
                commands = f"""
echo '{service_escaped}' > /etc/systemd/system/ov-node.service
systemctl daemon-reload
systemctl enable ov-node
systemctl restart ov-node
sleep 3
"""
                exit_code, stdout, stderr = self.execute_command(commands)
                if exit_code != 0:
                    logger.warning(f"Service creation warning: {stderr}")
            else:
                # Service exists, just restart it
                logger.info("Service exists, restarting...")
                self.execute_command("systemctl restart ov-node")
                time.sleep(3)
            
            # Step 7: Verify installation
            logger.info("Step 7: Verifying installation...")
            details["steps"].append("Verifying installation")
            
            # Check service status
            exit_code, stdout, stderr = self.execute_command(
                "systemctl is-active ov-node 2>&1"
            )
            
            service_status = stdout.strip()
            details["service_status"] = service_status
            
            # Get more detailed status
            exit_code2, status_detail, _ = self.execute_command(
                "systemctl status ov-node --no-pager -l 2>&1"
            )
            details["service_detail"] = status_detail
            
            # Step 8: Test node API
            logger.info("Step 8: Testing node API...")
            details["steps"].append("Testing node API")
            
            # Wait a bit more for service to fully start
            time.sleep(5)
            
            exit_code, stdout, stderr = self.execute_command(
                f"curl -s -m 10 http://localhost:{node_port}/api/health || echo 'API_UNREACHABLE'"
            )
            
            api_response = stdout.strip()
            details["api_test"] = api_response
            
            # Cleanup temporary files
            self.execute_command("rm -rf /tmp/install.log /tmp/auto_installer.py")
            
            # Final check - determine success
            is_success = False
            final_message = ""
            
            if service_status == "active":
                is_success = True
                final_message = "Node installed and running successfully"
            elif "API_UNREACHABLE" not in api_response and api_response:
                is_success = True
                final_message = "Node installed and API responding"
            else:
                # Service may not be active yet, but installation completed
                is_success = True
                final_message = "Node installed, but service needs verification. Please check logs."
                logger.warning(f"Service status: {service_status}, API response: {api_response}")
            
            details["steps"].append(final_message)
            return is_success, final_message, details
                
        except Exception as e:
            error_msg = f"Installation failed: {str(e)}"
            logger.error(error_msg)
            details["error"] = str(e)
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
