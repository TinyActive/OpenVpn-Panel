"""
Authentication module for Cloudflare Workers
Handles JWT and API key authentication
Migrated from backend/auth/auth.py
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


class AuthService:
    """Authentication service for JWT and API key validation"""
    
    def __init__(self, config_kv, db_ops):
        """
        Initialize auth service
        Args:
            config_kv: KV namespace for configuration
            db_ops: DatabaseOperations instance
        """
        self.config = config_kv
        self.db = db_ops
    
    async def get_config_value(self, key: str, default: Any = None) -> Any:
        """Get configuration value from KV"""
        value = await self.config.get(key)
        return value if value is not None else default
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception:
            return False
    
    async def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, str]]:
        """
        Authenticate user against main admin or database admins
        Returns user info dict if valid, None otherwise
        """
        # Check main admin from KV config
        main_admin_username = await self.get_config_value("ADMIN_USERNAME")
        main_admin_password = await self.get_config_value("ADMIN_PASSWORD")
        
        if username == main_admin_username and password == main_admin_password:
            return {"username": username, "type": "main_admin"}
        
        # Check database admins
        admin = await self.db.get_admin_by_username(username)
        if admin:
            if self.verify_password(password, admin.get('password', '')):
                return {"username": admin['username'], "type": "admin"}
        
        return None
    
    async def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        # Get expiry from config or use default
        if expires_delta is None:
            expires_seconds = int(await self.get_config_value("JWT_ACCESS_TOKEN_EXPIRES", 86400))
            expires_delta = timedelta(seconds=expires_seconds)
        
        expire = datetime.utcnow() + expires_delta
        to_encode.update({"exp": expire})
        
        # Get secret key from config
        secret_key = await self.get_config_value("JWT_SECRET_KEY")
        if not secret_key:
            raise ValueError("JWT_SECRET_KEY not configured in KV")
        
        encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
        return encoded_jwt
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and return payload
        Returns None if invalid
        """
        try:
            secret_key = await self.get_config_value("JWT_SECRET_KEY")
            if not secret_key:
                return None
            
            payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            username = payload.get("sub")
            user_type = payload.get("role")
            
            if username is None:
                return None
            
            return {
                "username": username,
                "type": user_type,
                "authenticated": True
            }
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Verify API key against configured value
        Returns auth info if valid, None otherwise
        """
        configured_key = await self.get_config_value("API_KEY")
        
        if not configured_key:
            return None  # API key auth not configured
        
        if api_key == configured_key:
            return {
                "type": "api_key",
                "authenticated": True
            }
        
        return None
    
    async def verify_jwt_or_api_key(
        self,
        bearer_token: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Verify either JWT token or API key
        Priority: API key first, then JWT
        Returns auth info if valid, None otherwise
        """
        # Try API key first if provided
        if api_key:
            result = await self.verify_api_key(api_key)
            if result:
                return result
        
        # Try JWT token
        if bearer_token:
            # Remove "Bearer " prefix if present
            if bearer_token.startswith("Bearer "):
                bearer_token = bearer_token[7:]
            
            result = await self.verify_token(bearer_token)
            if result:
                return result
        
        return None


def extract_auth_from_request(request) -> tuple[Optional[str], Optional[str]]:
    """
    Extract authentication credentials from request
    Returns (bearer_token, api_key) tuple
    """
    headers = request.headers
    
    # Extract Bearer token from Authorization header
    bearer_token = None
    auth_header = headers.get("Authorization") or headers.get("authorization")
    if auth_header:
        bearer_token = auth_header
    
    # Extract API key from 'key' header
    api_key = headers.get("key") or headers.get("Key")
    
    return bearer_token, api_key



