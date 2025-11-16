from sqlalchemy.orm import Mapped, mapped_column
from .engine import Base
from datetime import date, datetime
from typing import Optional


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(unique=True)
    expiry_date: Mapped[date]
    is_active: Mapped[bool] = mapped_column(default=True)
    owner: Mapped[str] = mapped_column(nullable=False)


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str] = mapped_column()


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column()
    address: Mapped[str] = mapped_column()
    tunnel_address: Mapped[str] = mapped_column(nullable=True)
    protocol: Mapped[str] = mapped_column()
    ovpn_port: Mapped[int] = mapped_column()
    port: Mapped[int] = mapped_column()
    key: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[bool] = mapped_column(default=True)
    
    # Health check fields
    is_healthy: Mapped[bool] = mapped_column(default=True)
    last_health_check: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    response_time: Mapped[Optional[float]] = mapped_column(nullable=True)  # in seconds
    consecutive_failures: Mapped[int] = mapped_column(default=0)
    
    # Sync fields
    last_sync_time: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    sync_status: Mapped[str] = mapped_column(default="synced")  # synced, pending, failed, never_synced


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tunnel_address: Mapped[str] = mapped_column(nullable=True)
    port: Mapped[int] = mapped_column(default=1194, nullable=False)
    protocol: Mapped[str] = mapped_column(default="tcp", nullable=False)


class WhiteLabelInstance(Base):
    __tablename__ = "whitelabel_instances"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    instance_id: Mapped[str] = mapped_column(unique=True, index=True)  # UUID
    name: Mapped[str] = mapped_column()  # Tên instance
    port: Mapped[int] = mapped_column(unique=True)
    status: Mapped[str] = mapped_column(default="stopped")  # active, stopped, error
    admin_username: Mapped[str] = mapped_column()
    admin_password_hash: Mapped[str] = mapped_column()
    jwt_secret: Mapped[str] = mapped_column()
    api_key: Mapped[Optional[str]] = mapped_column(nullable=True)
    has_openvpn: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)