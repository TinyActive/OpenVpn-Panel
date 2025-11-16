"""
Pydantic models for request/response validation
Migrated from backend/schema
"""
from pydantic import BaseModel, Field
from datetime import date
from typing import Any, Optional


# ==================== REQUEST MODELS ====================

class CreateUser(BaseModel):
    name: str = Field(min_length=3, max_length=10)
    expiry_date: date


class UpdateUser(BaseModel):
    name: str
    expiry_date: Optional[date] = None


class NodeCreate(BaseModel):
    name: str = Field(max_length=10)
    address: str
    tunnel_address: Optional[str] = None
    protocol: str = Field(default="tcp")
    ovpn_port: int = Field(default=1194)
    port: int
    key: str = Field(min_length=10, max_length=40)
    status: bool = Field(default=True)
    set_new_setting: bool = Field(default=False)


class SettingsUpdate(BaseModel):
    tunnel_address: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminCreate(BaseModel):
    username: str
    password: str


# ==================== RESPONSE MODELS ====================

class ResponseModel(BaseModel):
    success: bool
    msg: str
    data: Optional[Any] = None


class UserResponse(BaseModel):
    name: str
    is_active: bool
    expiry_date: date
    owner: str


class SettingsResponse(BaseModel):
    tunnel_address: Optional[str] = None
    port: int
    protocol: Optional[str] = None


class AdminResponse(BaseModel):
    username: str


class ServerInfo(BaseModel):
    cpu: float
    memory_total: int
    memory_used: int
    memory_percent: float
    disk_total: int
    disk_used: int
    disk_percent: float
    uptime: int



