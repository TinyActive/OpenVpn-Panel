#!/bin/bash
# Installation script for Auto-Install Node feature
# This script is for manual installation if not using install.sh

echo "=========================================="
echo "Installing Auto-Install Node Dependencies"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root or with sudo"
   exit 1
fi

# Check if OV-Panel is installed
if [ ! -d "/opt/ov-panel" ]; then
    echo "Error: OV-Panel is not installed at /opt/ov-panel"
    echo "Please run the main install.sh first"
    exit 1
fi

# Create secure config directory
echo "Creating secure config directory..."
mkdir -p /opt/ov-panel-secure
chmod 700 /opt/ov-panel-secure
chown root:root /opt/ov-panel-secure

# Install Python dependencies into OV-Panel venv
echo "Installing Python dependencies into OV-Panel virtual environment..."
cd /opt/ov-panel

if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found at /opt/ov-panel/venv"
    echo "Please run the main installer first"
    exit 1
fi

source venv/bin/activate
pip install paramiko cryptography

# Verify installation
echo ""
echo "Verifying installation..."
python3 -c "import paramiko; import cryptography; print('✓ All dependencies installed successfully')"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Installation completed successfully!"
    echo "=========================================="
    echo ""
    echo "The Auto-Install Node feature is now ready to use."
    echo "You can add new nodes via SSH from the Node Management page."
    echo ""
    echo "Security Note:"
    echo "- SSH credentials are encrypted and stored in: /opt/ov-panel-secure/"
    echo "- Only root can access these files (permissions: 0700)"
    echo ""
    echo "Restarting OV-Panel service..."
    systemctl restart ov-panel
    echo "✓ Service restarted"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "Installation failed!"
    echo "=========================================="
    echo "Please check the error messages above and try again."
    exit 1
fi
