"""
Admin API routes for Cloudflare Workers
Migrated from backend/routers/admins.py
"""
from typing import Dict, Any


async def get_all_admins_handler(db_ops) -> Dict[str, Any]:
    """Get all admins"""
    result = await db_ops.get_all_admins()
    admins_list = [
        {"username": admin['username']}
        for admin in result
    ]
    return {
        "success": True,
        "msg": "Admins retrieved successfully",
        "data": admins_list
    }



