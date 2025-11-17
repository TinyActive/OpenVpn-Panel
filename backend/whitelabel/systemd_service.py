"""
Systemd service management for white-label instances.

Handles creation, start, stop, and removal of systemd services for instances.
"""

import subprocess
from pathlib import Path
from typing import Optional
from backend.logger import logger


class SystemdServiceManager:
    """Manager for systemd services of white-label instances."""
    
    TEMPLATE_SERVICE_PATH = Path("/etc/systemd/system/ov-panel-instance@.service")
    
    @staticmethod
    def create_service_template(install_dir: str, venv_python: str) -> bool:
        """
        Create the systemd service template for white-label instances.
        
        Args:
            install_dir: Installation directory of the main panel
            venv_python: Path to venv python executable
        
        Returns:
            True if successful, False otherwise
        """
        import os
        instances_base = os.getenv("OV_INSTANCES_DIR", "/opt/ov-panel-instances")
        
        template_content = f"""[Unit]
Description=OV-Panel White-Label Instance %i
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory={install_dir}
EnvironmentFile={instances_base}/instance-%i/.env.%i
Environment="INSTANCE_ID=%i"
Environment="OV_INSTANCES_DIR={instances_base}"
ExecStart={venv_python} main.py
Restart=always
RestartSec=5
StandardOutput=append:{instances_base}/instance-%i/logs/output.log
StandardError=append:{instances_base}/instance-%i/logs/error.log

[Install]
WantedBy=multi-user.target
"""
        
        try:
            with open(SystemdServiceManager.TEMPLATE_SERVICE_PATH, 'w') as f:
                f.write(template_content)
            
            subprocess.run(["systemctl", "daemon-reload"], check=True)
            logger.info("Systemd service template created successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to create systemd service template: {e}")
            return False
    
    @staticmethod
    def start_instance(instance_id: str) -> bool:
        """
        Start a white-label instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subprocess.run(
                ["systemctl", "start", f"ov-panel-instance@{instance_id}"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info(f"Instance {instance_id} started successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to start instance {instance_id}: {e.stderr}")
            return False
    
    @staticmethod
    def stop_instance(instance_id: str) -> bool:
        """
        Stop a white-label instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subprocess.run(
                ["systemctl", "stop", f"ov-panel-instance@{instance_id}"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info(f"Instance {instance_id} stopped successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to stop instance {instance_id}: {e.stderr}")
            return False
    
    @staticmethod
    def restart_instance(instance_id: str) -> bool:
        """
        Restart a white-label instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subprocess.run(
                ["systemctl", "restart", f"ov-panel-instance@{instance_id}"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info(f"Instance {instance_id} restarted successfully")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to restart instance {instance_id}: {e.stderr}")
            return False
    
    @staticmethod
    def enable_instance(instance_id: str) -> bool:
        """
        Enable a white-label instance to start on boot.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subprocess.run(
                ["systemctl", "enable", f"ov-panel-instance@{instance_id}"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info(f"Instance {instance_id} enabled for auto-start")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to enable instance {instance_id}: {e.stderr}")
            return False
    
    @staticmethod
    def disable_instance(instance_id: str) -> bool:
        """
        Disable a white-label instance from starting on boot.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subprocess.run(
                ["systemctl", "disable", f"ov-panel-instance@{instance_id}"],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info(f"Instance {instance_id} disabled from auto-start")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to disable instance {instance_id}: {e.stderr}")
            return False
    
    @staticmethod
    def get_instance_status(instance_id: str) -> Optional[str]:
        """
        Get the status of a white-label instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            Status string or None if failed
        """
        try:
            result = subprocess.run(
                ["systemctl", "is-active", f"ov-panel-instance@{instance_id}"],
                capture_output=True,
                text=True
            )
            status = result.stdout.strip()
            return status  # active, inactive, failed, etc.
        except Exception as e:
            logger.error(f"Failed to get status for instance {instance_id}: {e}")
            return None
    
    @staticmethod
    def remove_instance_service(instance_id: str) -> bool:
        """
        Remove systemd service for an instance (stop and disable).
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Stop the service
            SystemdServiceManager.stop_instance(instance_id)
            
            # Disable the service
            SystemdServiceManager.disable_instance(instance_id)
            
            # Reload systemd
            subprocess.run(["systemctl", "daemon-reload"], check=True)
            subprocess.run(["systemctl", "reset-failed"], check=False)
            
            logger.info(f"Service for instance {instance_id} removed successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to remove service for instance {instance_id}: {e}")
            return False

