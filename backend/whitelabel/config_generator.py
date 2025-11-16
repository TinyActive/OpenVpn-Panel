"""
Configuration generator for white-label instances.

Generates .env files and configuration for each white-label instance.
"""

import secrets
import base64
from pathlib import Path
from typing import Dict, Optional


def create_secret_key(length: int = 64) -> str:
    """Generate a secure random secret key."""
    random_bytes = secrets.token_bytes(length)
    secret_key = base64.b64encode(random_bytes).decode("utf-8").rstrip("=")
    return secret_key


def generate_api_key(length: int = 32) -> str:
    """Generate a secure API key."""
    return secrets.token_urlsafe(length)


def generate_instance_config(
    instance_id: str,
    admin_username: str,
    admin_password: str,
    port: int,
    jwt_secret: Optional[str] = None,
    api_key: Optional[str] = None,
    has_openvpn: bool = False,
) -> Dict[str, str]:
    """
    Generate configuration dictionary for a white-label instance.
    
    Args:
        instance_id: Unique identifier for the instance
        admin_username: Admin username for the instance
        admin_password: Admin password (plain text, will be hashed by the system)
        port: Port number for the instance
        jwt_secret: Optional JWT secret (will be generated if not provided)
        api_key: Optional API key (will be generated if not provided)
        has_openvpn: Whether this instance has OpenVPN installed
    
    Returns:
        Dictionary of configuration key-value pairs
    """
    if jwt_secret is None:
        jwt_secret = create_secret_key()
    
    if api_key is None:
        api_key = generate_api_key()
    
    config = {
        "ADMIN_USERNAME": admin_username,
        "ADMIN_PASSWORD": admin_password,
        "URLPATH": "dashboard",
        "HOST": "0.0.0.0",
        "PORT": str(port),
        "DEBUG": "WARNING",
        "DOC": "False",
        "SSL_KEYFILE": "",
        "SSL_CERTFILE": "",
        "JWT_SECRET_KEY": jwt_secret,
        "JWT_ACCESS_TOKEN_EXPIRES": "86400",
        "API_KEY": api_key,
        "IS_SUPER_ADMIN": "False",
        "INSTANCE_ID": instance_id,
    }
    
    return config


def write_env_file(config: Dict[str, str], env_file_path: Path) -> None:
    """
    Write configuration to .env file.
    
    Args:
        config: Configuration dictionary
        env_file_path: Path to the .env file
    """
    env_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    lines = []
    lines.append("# White-Label Instance Configuration")
    lines.append("# Auto-generated - Do not edit manually\n")
    lines.append("# Admin Credentials")
    lines.append(f"ADMIN_USERNAME={config['ADMIN_USERNAME']}")
    lines.append(f"ADMIN_PASSWORD={config['ADMIN_PASSWORD']}\n")
    lines.append("# UVICORN Settings")
    lines.append(f"HOST={config['HOST']}")
    lines.append(f"URLPATH={config['URLPATH']}")
    lines.append(f"PORT={config['PORT']}\n")
    
    if config.get('SSL_KEYFILE'):
        lines.append("### SSL Configuration")
        lines.append(f"SSL_KEYFILE={config['SSL_KEYFILE']}")
        lines.append(f"SSL_CERTFILE={config['SSL_CERTFILE']}\n")
    
    lines.append("### Development Settings")
    lines.append(f"DEBUG={config['DEBUG']}")
    lines.append(f"DOC={config['DOC']}\n")
    lines.append("### Security Settings")
    lines.append(f"JWT_SECRET_KEY={config['JWT_SECRET_KEY']}")
    lines.append(f"JWT_ACCESS_TOKEN_EXPIRES={config['JWT_ACCESS_TOKEN_EXPIRES']}\n")
    lines.append("# API Key Authentication")
    lines.append(f"API_KEY={config['API_KEY']}\n")
    lines.append("# White-Label Configuration")
    lines.append(f"IS_SUPER_ADMIN={config['IS_SUPER_ADMIN']}")
    lines.append(f"INSTANCE_ID={config['INSTANCE_ID']}\n")
    
    with open(env_file_path, 'w') as f:
        f.write('\n'.join(lines))


def create_instance_env_file(
    instance_id: str,
    admin_username: str,
    admin_password: str,
    port: int,
    base_path: Path = Path("/opt/ov-panel-instances"),
    jwt_secret: Optional[str] = None,
    api_key: Optional[str] = None,
) -> Path:
    """
    Create .env file for a white-label instance.
    
    Args:
        instance_id: Unique identifier for the instance
        admin_username: Admin username
        admin_password: Admin password
        port: Port number
        base_path: Base path for instances
        jwt_secret: Optional JWT secret
        api_key: Optional API key
    
    Returns:
        Path to the created .env file
    """
    config = generate_instance_config(
        instance_id=instance_id,
        admin_username=admin_username,
        admin_password=admin_password,
        port=port,
        jwt_secret=jwt_secret,
        api_key=api_key,
    )
    
    instance_dir = base_path / f"instance-{instance_id}"
    env_file_path = instance_dir / f".env.{instance_id}"
    
    write_env_file(config, env_file_path)
    
    return env_file_path

