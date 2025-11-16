"""
White-label instance management router.

Provides endpoints for creating, managing, and monitoring white-label instances.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.db.engine import get_db
from backend.auth.auth import get_current_user
from backend.config import config
from backend.schema._input import WhiteLabelInstanceCreate, WhiteLabelInstanceUpdate
from backend.schema.output import (
    ResponseModel,
    WhiteLabelInstanceOutput,
    WhiteLabelInstanceStats,
)
from backend.whitelabel.manager import WhiteLabelManager
from backend.whitelabel.systemd_service import SystemdServiceManager
from backend.db.models import WhiteLabelInstance
from backend.logger import logger


router = APIRouter(tags=["White-Label Management"], prefix="/whitelabel")


def check_super_admin():
    """Verify that this is a super admin panel."""
    if not config.IS_SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only available on Super Admin Panel"
        )


@router.post("/create", response_model=ResponseModel)
async def create_instance(
    request: WhiteLabelInstanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        # Check if port is available
        if not WhiteLabelManager.check_port_available(db, request.port):
            return ResponseModel(
                success=False,
                msg=f"Port {request.port} is already in use",
                data=None
            )
        
        # Create instance
        instance = WhiteLabelManager.create_instance(
            db=db,
            name=request.name,
            admin_username=request.admin_username,
            admin_password=request.admin_password,
            port=request.port,
            has_openvpn=request.has_openvpn,
        )
        
        if instance:
            return ResponseModel(
                success=True,
                msg="Instance created successfully",
                data={
                    "instance_id": instance.instance_id,
                    "name": instance.name,
                    "port": instance.port,
                }
            )
        else:
            return ResponseModel(
                success=False,
                msg="Failed to create instance",
                data=None
            )
    
    except Exception as e:
        logger.error(f"Error creating instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/list", response_model=List[WhiteLabelInstanceOutput])
async def list_instances(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    List all white-label instances.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        instances = WhiteLabelManager.list_instances(db)
        return instances
    except Exception as e:
        logger.error(f"Error listing instances: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{instance_id}", response_model=WhiteLabelInstanceOutput)
async def get_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get details of a specific white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        instance = db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instance not found"
            )
        
        return instance
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{instance_id}/start", response_model=ResponseModel)
async def start_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Start a white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        if WhiteLabelManager.start_instance(db, instance_id):
            return ResponseModel(
                success=True,
                msg="Instance started successfully",
                data=None
            )
        else:
            return ResponseModel(
                success=False,
                msg="Failed to start instance",
                data=None
            )
    except Exception as e:
        logger.error(f"Error starting instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{instance_id}/stop", response_model=ResponseModel)
async def stop_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Stop a white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        if WhiteLabelManager.stop_instance(db, instance_id):
            return ResponseModel(
                success=True,
                msg="Instance stopped successfully",
                data=None
            )
        else:
            return ResponseModel(
                success=False,
                msg="Failed to stop instance",
                data=None
            )
    except Exception as e:
        logger.error(f"Error stopping instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{instance_id}/restart", response_model=ResponseModel)
async def restart_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Restart a white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        if SystemdServiceManager.restart_instance(instance_id):
            return ResponseModel(
                success=True,
                msg="Instance restarted successfully",
                data=None
            )
        else:
            return ResponseModel(
                success=False,
                msg="Failed to restart instance",
                data=None
            )
    except Exception as e:
        logger.error(f"Error restarting instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{instance_id}", response_model=ResponseModel)
async def delete_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        if WhiteLabelManager.delete_instance(db, instance_id):
            return ResponseModel(
                success=True,
                msg="Instance deleted successfully",
                data=None
            )
        else:
            return ResponseModel(
                success=False,
                msg="Failed to delete instance",
                data=None
            )
    except Exception as e:
        logger.error(f"Error deleting instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{instance_id}/stats", response_model=WhiteLabelInstanceStats)
async def get_instance_stats(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get statistics for a white-label instance.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        instance = db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
        
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Instance not found"
            )
        
        stats = WhiteLabelManager.get_instance_stats(instance_id)
        
        return WhiteLabelInstanceStats(
            instance_id=instance.instance_id,
            name=instance.name,
            port=instance.port,
            status=instance.status,
            systemd_status=stats.get("status") if stats else None,
            output_log_size=stats.get("output_log_size") if stats else None,
            error_log_size=stats.get("error_log_size") if stats else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting instance stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/initialize", response_model=ResponseModel)
async def initialize_whitelabel_system(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Initialize the white-label system.
    Creates shared directory and systemd template.
    
    Only available on Super Admin Panel.
    """
    check_super_admin()
    
    try:
        # Initialize shared directory
        if not WhiteLabelManager.initialize_shared_directory():
            return ResponseModel(
                success=False,
                msg="Failed to initialize shared directory",
                data=None
            )
        
        # Create systemd service template
        if not SystemdServiceManager.create_service_template():
            return ResponseModel(
                success=False,
                msg="Failed to create systemd service template",
                data=None
            )
        
        return ResponseModel(
            success=True,
            msg="White-label system initialized successfully",
            data=None
        )
    except Exception as e:
        logger.error(f"Error initializing white-label system: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

