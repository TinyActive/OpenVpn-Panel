import os
from pydantic_settings import BaseSettings
from typing import Optional


class Setting(BaseSettings):
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    URLPATH: str = "dashboard"
    HOST: str = "0.0.0.0"
    PORT: int = 9000
    DEBUG: str = "WARNING"
    DOC: bool = False
    SSL_KEYFILE: Optional[str] = None
    SSL_CERTFILE: Optional[str] = None
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRES: int = 86400  # in seconds
    API_KEY: Optional[str] = None  # Optional API key for external integrations
    
    # White-label configuration
    IS_SUPER_ADMIN: bool = False  # True if this is the super admin panel (no local OpenVPN)
    INSTANCE_ID: Optional[str] = None  # UUID for white-label instances
    HAS_OPENVPN: bool = True  # Whether this instance has OpenVPN installed

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")


config = Setting()
