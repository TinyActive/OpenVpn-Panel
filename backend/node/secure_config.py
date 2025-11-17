"""
Encryption Module for Sensitive Data
Handles encryption/decryption of SSH credentials and R2 configuration
"""
import os
import json
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import base64
from typing import Dict, Optional
from backend.logger import logger


def get_default_secure_dir() -> str:
    """
    Get the default secure directory path.
    Uses INSTALL_DIR/data/secure instead of hardcoded /opt/ov-panel-secure
    """
    # Try to get from environment variable first
    if "OV_PANEL_DIR" in os.environ:
        base_dir = os.environ["OV_PANEL_DIR"]
    else:
        # Get the backend directory (where this file is located)
        current_file = Path(__file__).resolve()
        # Go up to project root: backend/node/secure_config.py -> backend/node -> backend -> root
        project_root = current_file.parent.parent.parent
        base_dir = str(project_root)
    
    secure_dir = os.path.join(base_dir, "data", "secure")
    return secure_dir


class SecureConfigManager:
    """Manages encrypted storage of sensitive node configuration"""
    
    def __init__(self, config_dir: Optional[str] = None):
        """
        Initialize secure config manager
        
        Args:
            config_dir: Directory to store encrypted config files.
                       If None, uses INSTALL_DIR/data/secure
        """
        if config_dir is None:
            config_dir = get_default_secure_dir()
        
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
        
        # Set restrictive permissions on config directory
        os.chmod(self.config_dir, 0o700)
        
        self.key_file = self.config_dir / ".master.key"
        self.salt_file = self.config_dir / ".salt"
        
        # Initialize or load encryption key
        self.cipher = self._initialize_cipher()
    
    def _initialize_cipher(self) -> Fernet:
        """Initialize or load the encryption cipher"""
        
        # Generate or load salt
        if self.salt_file.exists():
            with open(self.salt_file, 'rb') as f:
                salt = f.read()
        else:
            salt = os.urandom(16)
            with open(self.salt_file, 'wb') as f:
                f.write(salt)
            os.chmod(self.salt_file, 0o600)
        
        # Generate or load master key
        if self.key_file.exists():
            with open(self.key_file, 'rb') as f:
                key = f.read()
        else:
            # Generate new master key from system entropy
            password = os.urandom(32)
            
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
                backend=default_backend()
            )
            key = base64.urlsafe_b64encode(kdf.derive(password))
            
            with open(self.key_file, 'wb') as f:
                f.write(key)
            os.chmod(self.key_file, 0o600)
            
            logger.info("Generated new master encryption key")
        
        return Fernet(key)
    
    def _get_node_config_path(self, node_address: str) -> Path:
        """Get the path to a node's encrypted config file"""
        # Sanitize node address for filename
        safe_name = node_address.replace(":", "_").replace(".", "_")
        return self.config_dir / f"node_{safe_name}.enc"
    
    def save_node_credentials(
        self,
        node_address: str,
        ssh_config: Dict,
        r2_config: Dict,
        node_config: Dict
    ) -> bool:
        """
        Save encrypted node credentials
        
        Args:
            node_address: Node address (IP or hostname)
            ssh_config: SSH configuration dict
            r2_config: R2 configuration dict
            node_config: Additional node configuration
        
        Returns:
            bool: Success status
        """
        try:
            # Prepare data structure
            data = {
                "node_address": node_address,
                "ssh": {
                    "host": ssh_config.get("host"),
                    "port": ssh_config.get("port", 22),
                    "username": ssh_config.get("username", "root"),
                    "password": ssh_config.get("password"),
                    "use_key": ssh_config.get("use_key", False),
                    "key_content": ssh_config.get("key_content")
                },
                "r2": {
                    "access_key_id": r2_config.get("access_key_id"),
                    "secret_access_key": r2_config.get("secret_access_key"),
                    "bucket_name": r2_config.get("bucket_name"),
                    "account_id": r2_config.get("account_id"),
                    "public_base_url": r2_config.get("public_base_url"),
                    "download_token": r2_config.get("download_token")
                },
                "node": {
                    "port": node_config.get("port"),
                    "api_key": node_config.get("api_key"),
                    "protocol": node_config.get("protocol"),
                    "ovpn_port": node_config.get("ovpn_port")
                }
            }
            
            # Convert to JSON and encrypt
            json_data = json.dumps(data)
            encrypted_data = self.cipher.encrypt(json_data.encode())
            
            # Save to file
            config_path = self._get_node_config_path(node_address)
            with open(config_path, 'wb') as f:
                f.write(encrypted_data)
            
            # Set restrictive permissions
            os.chmod(config_path, 0o600)
            
            logger.info(f"Saved encrypted credentials for node {node_address}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save node credentials: {str(e)}")
            return False
    
    def load_node_credentials(self, node_address: str) -> Optional[Dict]:
        """
        Load and decrypt node credentials
        
        Args:
            node_address: Node address
        
        Returns:
            Dict with decrypted credentials or None if not found
        """
        try:
            config_path = self._get_node_config_path(node_address)
            
            if not config_path.exists():
                logger.warning(f"No credentials found for node {node_address}")
                return None
            
            # Read and decrypt
            with open(config_path, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = self.cipher.decrypt(encrypted_data)
            data = json.loads(decrypted_data.decode())
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to load node credentials: {str(e)}")
            return None
    
    def delete_node_credentials(self, node_address: str) -> bool:
        """
        Delete node credentials
        
        Args:
            node_address: Node address
        
        Returns:
            bool: Success status
        """
        try:
            config_path = self._get_node_config_path(node_address)
            
            if config_path.exists():
                config_path.unlink()
                logger.info(f"Deleted credentials for node {node_address}")
                return True
            else:
                logger.warning(f"No credentials to delete for node {node_address}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete node credentials: {str(e)}")
            return False
    
    def list_nodes_with_credentials(self) -> list:
        """
        List all nodes that have stored credentials
        
        Returns:
            List of node addresses
        """
        try:
            nodes = []
            for config_file in self.config_dir.glob("node_*.enc"):
                # Extract node address from filename
                filename = config_file.stem  # node_x_x_x_x
                node_address = filename.replace("node_", "").replace("_", ".")
                nodes.append(node_address)
            
            return nodes
            
        except Exception as e:
            logger.error(f"Failed to list nodes with credentials: {str(e)}")
            return []
    
    def update_node_credentials(
        self,
        node_address: str,
        ssh_config: Optional[Dict] = None,
        r2_config: Optional[Dict] = None,
        node_config: Optional[Dict] = None
    ) -> bool:
        """
        Update specific parts of node credentials
        
        Args:
            node_address: Node address
            ssh_config: New SSH config (optional)
            r2_config: New R2 config (optional)
            node_config: New node config (optional)
        
        Returns:
            bool: Success status
        """
        try:
            # Load existing credentials
            existing = self.load_node_credentials(node_address)
            
            if not existing:
                logger.error(f"No existing credentials for node {node_address}")
                return False
            
            # Update only provided fields
            if ssh_config:
                existing["ssh"].update(ssh_config)
            
            if r2_config:
                existing["r2"].update(r2_config)
            
            if node_config:
                existing["node"].update(node_config)
            
            # Save updated credentials
            return self.save_node_credentials(
                node_address,
                existing["ssh"],
                existing["r2"],
                existing["node"]
            )
            
        except Exception as e:
            logger.error(f"Failed to update node credentials: {str(e)}")
            return False


# Global instance
_secure_config_manager = None


def get_secure_config_manager() -> SecureConfigManager:
    """Get or create the global secure config manager instance"""
    global _secure_config_manager
    
    if _secure_config_manager is None:
        _secure_config_manager = SecureConfigManager()
    
    return _secure_config_manager
