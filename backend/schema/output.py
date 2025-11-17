from pydantic import BaseModel, Field
from datetime import date
from typing import Any, Optional


class ResponseModel(BaseModel):
    success: bool
    msg: str
    data: Optional[Any] = None


class Users(BaseModel):
    name: str
    is_active: bool
    expiry_date: date
    owner: str

    class Config:
        from_attributes = True


class ServerInfo(BaseModel):
    cpu: float
    memory_total: int
    memory_used: int
    memory_percent: float
    disk_total: int
    disk_used: int
    disk_percent: float
    uptime: int

    class Config:
        from_attributes = True


class Settings(BaseModel):
    tunnel_address: Optional[str] = None
    port: int
    protocol: Optional[str]

    class Config:
        from_attributes = True


class Admins(BaseModel):
    username: str

    class Config:
        from_attributes = True


# White-label instance output schemas
class WhiteLabelInstanceOutput(BaseModel):
    id: int
    instance_id: str
    name: str
    port: int
    status: str
    admin_username: str
    created_at: Any
    updated_at: Any
    # Statistics (optional, populated separately)
    user_count: Optional[int] = None
    node_count: Optional[int] = None

    class Config:
        from_attributes = True


class WhiteLabelInstanceStats(BaseModel):
    instance_id: str
    name: str
    port: int
    status: str
    systemd_status: Optional[str] = None
    output_log_size: Optional[int] = None
    error_log_size: Optional[int] = None
    user_count: Optional[int] = None
    node_count: Optional[int] = None