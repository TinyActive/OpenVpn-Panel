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
    has_openvpn: bool = Field(default=False)


class WhiteLabelInstanceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    admin_username: Optional[str] = Field(None, min_length=3, max_length=50)
    admin_password: Optional[str] = Field(None, min_length=6)
    port: Optional[int] = Field(None, ge=1024, le=65535)