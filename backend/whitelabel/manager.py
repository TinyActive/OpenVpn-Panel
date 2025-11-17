"""
White-label instance manager.

Handles creation, deletion, and management of white-label instances.
"""

import uuid
import shutil
import subprocess
import requests
import os
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
    def _get_sample_db_path() -> Path:
        """Get the path to the sample database file."""
        source_code_path = WhiteLabelManager._get_source_code_path()
        return source_code_path / "data" / "ov-panel-sample.db"
    
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
        Creates symlinks to the main OV-Panel installation and template database.
        
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
            
            # Verify sample database exists
            sample_db_path = WhiteLabelManager._get_sample_db_path()
            if not sample_db_path.exists():
                logger.error(f"Sample database not found at {sample_db_path}")
                raise FileNotFoundError(f"Sample database file not found: {sample_db_path}")
            
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
    ) -> Optional[WhiteLabelInstance]:
        """
        Create a new white-label instance.
        
        Args:
            db: Database session
            name: Instance name
            admin_username: Admin username for the instance
            admin_password: Admin password (plain text)
            port: Port number for the instance
        
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
                has_openvpn=False,  # Always False for white-label instances
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
                has_openvpn=False,  # Always False
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            
            db.add(instance)
            db.commit()
            db.refresh(instance)
            
            # Copy sample database to instance
            instance_db_path = data_dir / "ov-panel.db"
            sample_db_path = WhiteLabelManager._get_sample_db_path()
            
            if not sample_db_path.exists():
                logger.error(f"Sample database not found at {sample_db_path}")
                raise FileNotFoundError(f"Sample database file required: {sample_db_path}")
            
            shutil.copy2(sample_db_path, instance_db_path)
            logger.info(f"Copied sample database from {sample_db_path} to instance {instance_id}")
            
            logger.info(f"Instance {instance_id} ({name}) created successfully")
            return instance
            
        except Exception as e:
            logger.error(f"Failed to create instance: {e}")
            db.rollback()
            return None
    

    
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
    def cleanup_instance_users_via_api(instance: WhiteLabelInstance) -> dict:
        """
        Cleanup all users of an instance by calling the instance's API.
        The instance will handle deleting users from all nodes.
        
        Args:
            instance: WhiteLabelInstance object with port and api_key
        
        Returns:
            Dictionary with cleanup statistics
        """
        logger.info(f"=== Starting cleanup users for instance {instance.instance_id} via API ===")
        
        try:
            # Check if instance is running
            instance_status = SystemdServiceManager.get_instance_status(instance.instance_id)
            logger.info(f"Instance status: {instance_status}")
            
            # If instance is not running, try to start it temporarily for cleanup
            was_stopped = False
            if instance_status != "active":
                logger.info(f"Instance is not running, starting temporarily for cleanup")
                if not SystemdServiceManager.start_instance(instance.instance_id):
                    logger.error(f"Failed to start instance for cleanup")
                    return {"success": False, "error": "Cannot start instance for cleanup"}
                was_stopped = True
                # Wait a bit for instance to start
                import time
                time.sleep(3)
            
            # Get all users from instance via API
            api_url = f"http://localhost:{instance.port}/api/user/all"
            headers = {"key": instance.api_key}
            
            logger.info(f"Fetching users from instance API: {api_url}")
            
            try:
                response = requests.get(api_url, headers=headers, timeout=10)
                response.raise_for_status()
                
                data = response.json()
                if not data.get("success"):
                    logger.error(f"API returned error: {data.get('msg')}")
                    return {"success": False, "error": data.get('msg')}
                
                users = data.get("data", [])
                logger.info(f"Found {len(users)} users in instance: {[u.get('name') for u in users]}")
                
                if not users:
                    logger.info("No users to cleanup")
                    if was_stopped:
                        SystemdServiceManager.stop_instance(instance.instance_id)
                    return {"success": True, "users_found": 0, "deleted": 0, "failed": 0}
                
                # Delete each user via instance API
                deleted_count = 0
                failed_count = 0
                
                for user in users:
                    user_name = user.get("name")
                    if not user_name:
                        continue
                    
                    logger.info(f"Deleting user '{user_name}' via instance API")
                    
                    try:
                        delete_url = f"http://localhost:{instance.port}/api/user/delete/{user_name}"
                        delete_response = requests.delete(delete_url, headers=headers, timeout=30)
                        delete_response.raise_for_status()
                        
                        delete_data = delete_response.json()
                        if delete_data.get("success"):
                            deleted_count += 1
                            logger.info(f"✓ Successfully deleted user '{user_name}'")
                        else:
                            failed_count += 1
                            logger.warning(f"✗ Failed to delete user '{user_name}': {delete_data.get('msg')}")
                    
                    except Exception as e:
                        failed_count += 1
                        logger.error(f"✗ Exception deleting user '{user_name}': {e}")
                
                # Stop instance if it was stopped before
                if was_stopped:
                    logger.info("Stopping instance after cleanup")
                    SystemdServiceManager.stop_instance(instance.instance_id)
                
                result = {
                    "success": True,
                    "users_found": len(users),
                    "deleted": deleted_count,
                    "failed": failed_count
                }
                logger.info(f"=== Cleanup completed: {result} ===")
                return result
            
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to connect to instance API: {e}")
                if was_stopped:
                    SystemdServiceManager.stop_instance(instance.instance_id)
                return {"success": False, "error": f"API connection failed: {str(e)}"}
        
        except Exception as e:
            logger.error(f"!!! CRITICAL: Failed to cleanup users for instance {instance.instance_id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def delete_instance(db: Session, instance_id: str) -> bool:
        """
        Delete a white-label instance.
        Cleans up all users via instance API before deletion.
        
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
            
            # First, cleanup all users via instance API
            logger.info(f"Starting cleanup of users for instance {instance_id} via API")
            cleanup_result = WhiteLabelManager.cleanup_instance_users_via_api(instance)
            logger.info(f"Cleanup result: {cleanup_result}")
            
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
    def get_instance(db: Session, instance_id: str) -> Optional[WhiteLabelInstance]:
        """
        Get a white-label instance by ID.
        
        Args:
            db: Database session
            instance_id: Instance identifier
        
        Returns:
            WhiteLabelInstance or None if not found
        """
        return db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
    
    @staticmethod
    def get_instance_user_and_node_count(instance: WhiteLabelInstance) -> Dict[str, int]:
        """
        Get user and node count for an instance by calling its API.
        
        Args:
            instance: WhiteLabelInstance object
        
        Returns:
            Dictionary with user_count and node_count
        """
        try:
            # Check if instance is running
            instance_status = SystemdServiceManager.get_instance_status(instance.instance_id)
            
            if instance_status != "active":
                # Return 0 if instance is not running
                return {"user_count": 0, "node_count": 0}
            
            headers = {"key": instance.api_key}
            
            # Get user count
            user_count = 0
            try:
                user_response = requests.get(
                    f"http://localhost:{instance.port}/api/user/all",
                    headers=headers,
                    timeout=5
                )
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if user_data.get("success"):
                        users = user_data.get("data", [])
                        user_count = len(users) if isinstance(users, list) else 0
            except Exception as e:
                logger.warning(f"Failed to get user count for instance {instance.instance_id}: {e}")
            
            # Get node count
            node_count = 0
            try:
                node_response = requests.get(
                    f"http://localhost:{instance.port}/api/node/all",
                    headers=headers,
                    timeout=5
                )
                if node_response.status_code == 200:
                    node_data = node_response.json()
                    if node_data.get("success"):
                        nodes = node_data.get("data", [])
                        node_count = len(nodes) if isinstance(nodes, list) else 0
            except Exception as e:
                logger.warning(f"Failed to get node count for instance {instance.instance_id}: {e}")
            
            return {"user_count": user_count, "node_count": node_count}
        
        except Exception as e:
            logger.error(f"Failed to get stats for instance {instance.instance_id}: {e}")
            return {"user_count": 0, "node_count": 0}
    
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

