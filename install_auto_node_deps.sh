#!/bin/bash
# Installation script for Auto-Install Node feature
# This script is for manual installation if not using install.sh

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_DIR="$SCRIPT_DIR"
VENV_DIR="$INSTALL_DIR/venv"
SECURE_DIR="$INSTALL_DIR/data/secure"

echo "=========================================="
echo "Installing Auto-Install Node Dependencies"
echo "=========================================="
echo "Working directory: $INSTALL_DIR"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root or with sudo"
   exit 1
fi

# Check if venv exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Error: Virtual environment not found at $VENV_DIR"
    echo "Please run the main install.sh first"
    exit 1
fi

# Create secure config directory
echo "Creating secure config directory..."
mkdir -p "$SECURE_DIR"
chmod 700 "$SECURE_DIR"
chown root:root "$SECURE_DIR"

# Install Python dependencies into OV-Panel venv
echo "Installing Python dependencies into virtual environment..."
cd "$INSTALL_DIR"

source "$VENV_DIR/bin/activate"
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
    echo "- SSH credentials are encrypted and stored in: $SECURE_DIR"
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
