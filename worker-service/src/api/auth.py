"""
Authentication API routes for Cloudflare Workers
Migrated from backend/auth/auth.py
"""
from typing import Dict, Any
from datetime import timedelta


async def login_handler(
    username: str,
    password: str,
    auth_service
) -> Dict[str, Any]:
    """
    Handle login request
    Returns access token if successful
    """
    # Authenticate user
    admin = await auth_service.authenticate_user(username, password)
    
    if not admin:
        return {
            "success": False,
            "msg": "The username or password is incorrect",
            "data": None
        }
    
    # Create access token
    access_token = await auth_service.create_access_token(
        data={"sub": admin["username"], "role": admin["type"]}
    )
    
    return {
        "success": True,
        "msg": "Login successful",
        "data": {
            "access_token": access_token,
            "token_type": "bearer"
        }
    }



