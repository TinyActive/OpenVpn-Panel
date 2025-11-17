from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class CreateUser(BaseModel):
    name: str = Field(min_length=3, max_length=10)
    # traffic: int = Field(default=0, ge=0, le=999) # canceled for now
    expiry_date: date


class UpdateUser(BaseModel):
    name: str
    expiry_date: Optional[date]


class NodeCreate(BaseModel):
    name: str = Field(max_length=10)
    address: str
    tunnel_address: str = Field(default=None)
    protocol: str = Field(default="tcp")
    ovpn_port: int = Field(default=1194)
    port: int
    key: str = Field(min_length=10, max_length=40)
    status: bool = Field(default=True)
    set_new_setting: bool = Field(default=False)


class SSHConfig(BaseModel):
    """SSH configuration for auto-installing node"""
    host: str
    port: int = Field(default=22)
    username: str = Field(default="root")
    password: Optional[str] = None
    use_key: bool = Field(default=False)
    key_content: Optional[str] = None  # SSH private key content


class R2Config(BaseModel):
    """Cloudflare R2 storage configuration"""
    access_key_id: str
    secret_access_key: str
    bucket_name: str
    account_id: str
    public_base_url: str = Field(default="api.openvpn.panel")
    download_token: str = Field(default="8638b5a1-77df-4d24-8253-58977fa508a4")


class NodeAutoInstall(BaseModel):
    """Schema for auto-installing a new node via SSH"""
    name: str = Field(max_length=10)
    ssh: SSHConfig
    r2: R2Config
    protocol: str = Field(default="tcp")
    ovpn_port: int = Field(default=1194)
    node_port: int = Field(default=9090, description="Port for OV-Node service")
    tunnel_address: Optional[str] = None
    status: bool = Field(default=True)
    set_new_setting: bool = Field(default=False)


class SettingsUpdate(BaseModel):
    tunnel_address: Optional[str] = None
    port: Optional[int]
    protocol: Optional[str]


# White-label instance schemas
class WhiteLabelInstanceCreate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    admin_username: str = Field(min_length=3, max_length=50)
    admin_password: str = Field(min_length=6)
    port: int = Field(ge=1024, le=65535)


class WhiteLabelInstanceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    admin_username: Optional[str] = Field(None, min_length=3, max_length=50)
    admin_password: Optional[str] = Field(None, min_length=6)
    port: Optional[int] = Field(None, ge=1024, le=65535)