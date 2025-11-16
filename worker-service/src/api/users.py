"""
User API routes for Cloudflare Workers
Migrated from backend/routers/users.py
"""
from typing import Dict, Any
from ..models.schemas import CreateUser, UpdateUser, ResponseModel
from ..node.task import create_user_on_all_nodes, delete_user_on_all_nodes


async def get_all_users_handler(db_ops) -> Dict[str, Any]:
    """Get all users"""
    all_users = await db_ops.get_all_users()
    users_list = [
        {
            "name": user['name'],
            "is_active": bool(user['is_active']),
            "expiry_date": user['expiry_date'],
            "owner": user['owner']
        }
        for user in all_users
    ]
    return {
        "success": True,
        "msg": "Users retrieved successfully",
        "data": users_list
    }


async def create_user_handler(
    request_data: Dict[str, Any],
    db_ops
) -> Dict[str, Any]:
    """Create a new user (NO local OpenVPN - only on nodes)"""
    name = request_data['name']
    expiry_date = request_data['expiry_date']
    
    # Check if user already exists
    check_user = await db_ops.get_user_by_name(name)
    if check_user is not None:
        return {
            "success": False,
            "msg": "User with this name already exists",
            "data": None
        }
    
    # Create user on all nodes (NO local OpenVPN server)
    await create_user_on_all_nodes(name, db_ops)
    
    # Create user in database
    await db_ops.create_user(name, expiry_date, "owner")
    
    return {
        "success": True,
        "msg": "User created successfully",
        "data": name
    }


async def update_user_handler(
    request_data: Dict[str, Any],
    db_ops
) -> Dict[str, Any]:
    """Update user expiry date"""
    try:
        result = await db_ops.update_user(
            request_data['name'],
            request_data['expiry_date']
        )
        return {
            "success": True,
            "msg": "User updated successfully",
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "msg": str(e),
            "data": None
        }


async def delete_user_handler(
    name: str,
    db_ops
) -> Dict[str, Any]:
    """Delete user from database and all nodes"""
    # Delete from all nodes (NO local OpenVPN server)
    await delete_user_on_all_nodes(name, db_ops)
    
    # Delete from database
    try:
        db_result = await db_ops.delete_user(name)
        return {
            "success": True,
            "msg": "User deleted successfully",
            "data": db_result
        }
    except Exception as e:
        return {
            "success": False,
            "msg": str(e),
            "data": None
        }



