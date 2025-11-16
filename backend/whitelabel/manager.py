"""
White-label instance manager.

Handles creation, deletion, and management of white-label instances.
"""

import uuid
import shutil
import subprocess
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.db.models import WhiteLabelInstance
from backend.logger import logger
from .config_generator import create_instance_env_file, generate_instance_config
from .systemd_service import SystemdServiceManager


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class WhiteLabelManager:
    """Manager for white-label OV-Panel instances."""
    
    BASE_PATH = Path("/opt/ov-panel-instances")
    SHARED_CODE_PATH = BASE_PATH / "shared"
    SOURCE_CODE_PATH = None  # Will be set dynamically
    
    @staticmethod
    def _get_source_code_path() -> Path:
        """
        Get the source code path from the main service file.
        
        Returns:
            Path to the main OV-Panel installation
        
        Raises:
            RuntimeError: If unable to detect source code path
        """
        if WhiteLabelManager.SOURCE_CODE_PATH is None:
            try:
                with open("/etc/systemd/system/ov-panel.service", "r") as f:
                    content = f.read()
                    
                import re
                working_dir_match = re.search(r'WorkingDirectory=(.+)', content)
                
                if working_dir_match:
                    WhiteLabelManager.SOURCE_CODE_PATH = Path(working_dir_match.group(1).strip())
                    logger.info(f"Detected source code path: {WhiteLabelManager.SOURCE_CODE_PATH}")
                else:
                    raise RuntimeError("Could not parse WorkingDirectory from main service file")
            except FileNotFoundError:
                raise RuntimeError("Main service file /etc/systemd/system/ov-panel.service not found")
            except Exception as e:
                logger.error(f"Error detecting source code path: {e}")
                raise RuntimeError(f"Failed to detect source code path: {e}")
        
        return WhiteLabelManager.SOURCE_CODE_PATH
    
    @staticmethod
    def initialize_shared_directory() -> bool:
        """
        Initialize the shared code directory for white-label instances.
        Creates symlinks to the main OV-Panel installation.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            WhiteLabelManager.BASE_PATH.mkdir(parents=True, exist_ok=True)
            
            # Get source code path
            source_code_path = WhiteLabelManager._get_source_code_path()
            logger.info(f"Using source code path: {source_code_path}")
            
            # Create shared directory if it doesn't exist
            if not WhiteLabelManager.SHARED_CODE_PATH.exists():
                WhiteLabelManager.SHARED_CODE_PATH.mkdir(parents=True, exist_ok=True)
                
                # Create symlinks to main installation
                for item in ["backend", "frontend", "main.py", "pyproject.toml"]:
                    source = source_code_path / item
                    target = WhiteLabelManager.SHARED_CODE_PATH / item
                    
                    if source.exists() and not target.exists():
                        if source.is_dir():
                            # For directories, create symlink
                            target.symlink_to(source, target_is_directory=True)
                        else:
                            # For files, create symlink
                            target.symlink_to(source)
                
                logger.info("Shared directory initialized successfully")
            
            return True
        except Exception as e:
            logger.error(f"Failed to initialize shared directory: {e}")
            return False
    
    @staticmethod
    def check_port_available(db: Session, port: int, exclude_id: Optional[int] = None) -> bool:
        """
        Check if a port is available for use.
        
        Args:
            db: Database session
            port: Port number to check
            exclude_id: Optional instance ID to exclude from check
        
        Returns:
            True if port is available, False otherwise
        """
        query = db.query(WhiteLabelInstance).filter(WhiteLabelInstance.port == port)
        if exclude_id:
            query = query.filter(WhiteLabelInstance.id != exclude_id)
        
        return query.first() is None
    
    @staticmethod
    def create_instance(
        db: Session,
        name: str,
        admin_username: str,
        admin_password: str,
        port: int,
        has_openvpn: bool = False,
    ) -> Optional[WhiteLabelInstance]:
        """
        Create a new white-label instance.
        
        Args:
            db: Database session
            name: Instance name
            admin_username: Admin username for the instance
            admin_password: Admin password (plain text)
            port: Port number for the instance
            has_openvpn: Whether to install OpenVPN for this instance
        
        Returns:
            Created WhiteLabelInstance or None if failed
        """
        try:
            # Check if port is available
            if not WhiteLabelManager.check_port_available(db, port):
                logger.error(f"Port {port} is already in use")
                return None
            
            # Generate instance ID
            instance_id = str(uuid.uuid4())
            
            # Initialize shared directory
            WhiteLabelManager.initialize_shared_directory()
            
            # Create instance directory structure
            instance_dir = WhiteLabelManager.BASE_PATH / f"instance-{instance_id}"
            data_dir = instance_dir / "data"
            logs_dir = instance_dir / "logs"
            
            data_dir.mkdir(parents=True, exist_ok=True)
            logs_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate configuration
            config = generate_instance_config(
                instance_id=instance_id,
                admin_username=admin_username,
                admin_password=admin_password,
                port=port,
                has_openvpn=has_openvpn,
            )
            
            # Create .env file
            env_file = instance_dir / f".env.{instance_id}"
            from .config_generator import write_env_file
            write_env_file(config, env_file)
            
            # Hash password for database storage
            password_hash = pwd_context.hash(admin_password)
            
            # Create database record
            instance = WhiteLabelInstance(
                instance_id=instance_id,
                name=name,
                port=port,
                status="stopped",
                admin_username=admin_username,
                admin_password_hash=password_hash,
                jwt_secret=config["JWT_SECRET_KEY"],
                api_key=config["API_KEY"],
                has_openvpn=has_openvpn,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            
            db.add(instance)
            db.commit()
            db.refresh(instance)
            
            # Run database migrations for the instance
            WhiteLabelManager._run_instance_migrations(instance_id)
            
            logger.info(f"Instance {instance_id} ({name}) created successfully")
            return instance
            
        except Exception as e:
            logger.error(f"Failed to create instance: {e}")
            db.rollback()
            return None
    
    @staticmethod
    def _run_instance_migrations(instance_id: str) -> bool:
        """
        Run database migrations for an instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            instance_dir = WhiteLabelManager.BASE_PATH / f"instance-{instance_id}"
            source_code_path = WhiteLabelManager._get_source_code_path()
            backend_dir = source_code_path / "backend"
            venv_bin = source_code_path / "venv" / "bin"
            
            # Set environment variable for instance
            env = {
                "INSTANCE_ID": instance_id,
                "PATH": f"{venv_bin}:/usr/local/bin:/usr/bin:/bin",
            }
            
            # Run alembic upgrade
            venv_alembic = venv_bin / "alembic"
            subprocess.run(
                [str(venv_alembic), "upgrade", "head"],
                cwd=str(backend_dir),
                env=env,
                check=True,
                capture_output=True,
                text=True
            )
            
            logger.info(f"Database migrations completed for instance {instance_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to run migrations for instance {instance_id}: {e}")
            return False
    
    @staticmethod
    def start_instance(db: Session, instance_id: str) -> bool:
        """
        Start a white-label instance.
        
        Args:
            db: Database session
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        instance = db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
        
        if not instance:
            logger.error(f"Instance {instance_id} not found")
            return False
        
        # Start systemd service
        if SystemdServiceManager.start_instance(instance_id):
            instance.status = "active"
            instance.updated_at = datetime.utcnow()
            db.commit()
            return True
        else:
            instance.status = "error"
            instance.updated_at = datetime.utcnow()
            db.commit()
            return False
    
    @staticmethod
    def stop_instance(db: Session, instance_id: str) -> bool:
        """
        Stop a white-label instance.
        
        Args:
            db: Database session
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        instance = db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
        
        if not instance:
            logger.error(f"Instance {instance_id} not found")
            return False
        
        # Stop systemd service
        if SystemdServiceManager.stop_instance(instance_id):
            instance.status = "stopped"
            instance.updated_at = datetime.utcnow()
            db.commit()
            return True
        else:
            return False
    
    @staticmethod
    def delete_instance(db: Session, instance_id: str) -> bool:
        """
        Delete a white-label instance.
        
        Args:
            db: Database session
            instance_id: Instance identifier
        
        Returns:
            True if successful, False otherwise
        """
        try:
            instance = db.query(WhiteLabelInstance).filter(
                WhiteLabelInstance.instance_id == instance_id
            ).first()
            
            if not instance:
                logger.error(f"Instance {instance_id} not found")
                return False
            
            # Stop and remove systemd service
            SystemdServiceManager.remove_instance_service(instance_id)
            
            # Remove instance directory
            instance_dir = WhiteLabelManager.BASE_PATH / f"instance-{instance_id}"
            if instance_dir.exists():
                shutil.rmtree(instance_dir)
            
            # Remove database record
            db.delete(instance)
            db.commit()
            
            logger.info(f"Instance {instance_id} deleted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete instance {instance_id}: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def get_instance_stats(instance_id: str) -> Optional[Dict]:
        """
        Get statistics for an instance.
        
        Args:
            instance_id: Instance identifier
        
        Returns:
            Dictionary with instance stats or None if failed
        """
        try:
            status = SystemdServiceManager.get_instance_status(instance_id)
            
            # Get log file sizes
            instance_dir = WhiteLabelManager.BASE_PATH / f"instance-{instance_id}"
            logs_dir = instance_dir / "logs"
            
            output_log_size = 0
            error_log_size = 0
            
            if (logs_dir / "output.log").exists():
                output_log_size = (logs_dir / "output.log").stat().st_size
            
            if (logs_dir / "error.log").exists():
                error_log_size = (logs_dir / "error.log").stat().st_size
            
            return {
                "status": status,
                "output_log_size": output_log_size,
                "error_log_size": error_log_size,
            }
        except Exception as e:
            logger.error(f"Failed to get stats for instance {instance_id}: {e}")
            return None
    
    @staticmethod
    def list_instances(db: Session) -> List[WhiteLabelInstance]:
        """
        List all white-label instances.
        
        Args:
            db: Database session
        
        Returns:
            List of WhiteLabelInstance objects
        """
        return db.query(WhiteLabelInstance).all()

