"""
White-label instance management module.

This module provides functionality to create, manage, and monitor
white-label OV-Panel instances with full isolation.
"""

from .manager import WhiteLabelManager
from .config_generator import generate_instance_config
from .systemd_service import SystemdServiceManager

__all__ = [
    "WhiteLabelManager",
    "generate_instance_config",
    "SystemdServiceManager",
]

