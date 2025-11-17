#!/usr/bin/env python3
"""
Automated installer for OV-Node
This script is called by the SSH installer and receives configuration via stdin or args
"""
import os
import sys
import subprocess
import shutil
from pathlib import Path


def install_ovnode_auto(service_port: str, api_key: str, env_file_content: str):
    """
    Automated installation of OV-Node
    
    Args:
        service_port: Port for OV-Node service
        api_key: API key for authentication
        env_file_content: Full .env file content
    """
    try:
        install_dir = "/opt/ov-node"
        env_file = os.path.join(install_dir, ".env")
        
        print(f"[INFO] Installing OV-Node to {install_dir}")
        
        # Create .env file with provided content
        with open(env_file, 'w') as f:
            f.write(env_file_content)
        
        print("[INFO] Configuration file created")
        
        # Run the service setup
        run_ovnode()
        
        print("[SUCCESS] OV-Node installation completed successfully")
        return True
        
    except Exception as e:
        print(f"[ERROR] Installation failed: {e}")
        return False


def run_ovnode():
    """Create and run a systemd service for OV-Node"""
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

    with open("/etc/systemd/system/ov-node.service", "w") as f:
        f.write(service_content)

    subprocess.run(["systemctl", "daemon-reload"], check=True)
    subprocess.run(["systemctl", "enable", "ov-node"], check=True)
    subprocess.run(["systemctl", "start", "ov-node"], check=True)
    
    print("[INFO] OV-Node service created and started")


if __name__ == "__main__":
    # Read configuration from stdin
    # Expected format:
    # Line 1: SERVICE_PORT
    # Line 2: API_KEY
    # Line 3+: .env file content (until EOF)
    
    if len(sys.argv) > 2:
        # Arguments provided
        service_port = sys.argv[1]
        api_key = sys.argv[2]
        
        # Read .env content from stdin
        env_content = sys.stdin.read()
        
    else:
        # Read from stdin (old method)
        try:
            service_port = input().strip() or "9090"
            api_key = input().strip()
            
            # Read remaining content as .env
            env_content = sys.stdin.read()
            
        except EOFError:
            print("[ERROR] Failed to read configuration from stdin")
            sys.exit(1)
    
    if not api_key:
        print("[ERROR] API key is required")
        sys.exit(1)
    
    if not env_content:
        print("[ERROR] .env content is required")
        sys.exit(1)
    
    success = install_ovnode_auto(service_port, api_key, env_content)
    sys.exit(0 if success else 1)
