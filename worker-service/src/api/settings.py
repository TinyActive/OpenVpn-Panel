"""
Settings API routes for Cloudflare Workers
Migrated from backend/routers/setting.py
"""
from typing import Dict, Any


async def get_settings_handler(db_ops) -> Dict[str, Any]:
    """Get settings"""
    settings = await db_ops.get_settings()
    return {
        "success": True,
        "msg": "Settings retrieved successfully",
        "data": {
            "tunnel_address": settings.get('tunnel_address'),
            "port": settings['port'],
            "protocol": settings.get('protocol')
        }
    }


async def update_settings_handler(
    request_data: Dict[str, Any],
    db_ops
) -> Dict[str, Any]:
    """Update settings"""
    try:
        await db_ops.update_settings(
            tunnel_address=request_data.get('tunnel_address'),
            port=request_data.get('port', 1194),
            protocol=request_data.get('protocol', 'tcp')
        )
        return {
            "success": True,
            "msg": "Settings updated successfully",
            "data": None
        }
    except Exception as e:
        return {
            "success": False,
            "msg": f"Failed to update settings: {str(e)}",
            "data": None
        }



