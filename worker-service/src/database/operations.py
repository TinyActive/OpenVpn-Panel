"""
Database operations for Cloudflare D1
Migrated from SQLAlchemy ORM to raw SQL queries
"""
from datetime import datetime, date
from typing import Optional, List, Dict, Any


class DatabaseOperations:
    """Database operations wrapper for D1"""
    
    def __init__(self, db):
        """
        Initialize with D1 database binding
        Args:
            db: Cloudflare D1 database binding from env
        """
        self.db = db
    
    # ==================== USER OPERATIONS ====================
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users"""
        result = await self.db.prepare("SELECT * FROM users").all()
        return result.results if result else []
    
    async def get_user_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get user by name"""
        result = await self.db.prepare(
            "SELECT * FROM users WHERE name = ?"
        ).bind(name).first()
        return result if result else None
    
    async def create_user(self, name: str, expiry_date: str, owner: str) -> Dict[str, Any]:
        """Create a new user"""
        # Check if user exists
        existing = await self.get_user_by_name(name)
        if existing:
            raise ValueError(f"User with name {name} already exists")
        
        await self.db.prepare(
            "INSERT INTO users (name, expiry_date, is_active, owner) VALUES (?, ?, 1, ?)"
        ).bind(name, expiry_date, owner).run()
        
        return await self.get_user_by_name(name)
    
    async def update_user(self, name: str, expiry_date: str) -> Dict[str, Any]:
        """Update user expiry date"""
        user = await self.get_user_by_name(name)
        if not user:
            raise ValueError(f"User {name} not found")
        
        await self.db.prepare(
            "UPDATE users SET expiry_date = ? WHERE name = ?"
        ).bind(expiry_date, name).run()
        
        return {"detail": "User updated successfully"}
    
    async def change_user_status(self, name: str, status: bool) -> bool:
        """Change user active status"""
        try:
            await self.db.prepare(
                "UPDATE users SET is_active = ? WHERE name = ?"
            ).bind(1 if status else 0, name).run()
            return True
        except Exception as e:
            print(f"Error changing user status: {e}")
            return False
    
    async def get_expired_users(self) -> List[Dict[str, Any]]:
        """Get all expired active users"""
        today = datetime.now().date().isoformat()
        result = await self.db.prepare(
            "SELECT * FROM users WHERE expiry_date < ? AND is_active = 1"
        ).bind(today).all()
        return result.results if result else []
    
    async def delete_user(self, name: str) -> Dict[str, Any]:
        """Delete a user"""
        user = await self.get_user_by_name(name)
        if not user:
            raise ValueError(f"User {name} not found")
        
        await self.db.prepare(
            "DELETE FROM users WHERE name = ?"
        ).bind(name).run()
        
        return {"detail": "User deleted successfully"}
    
    # ==================== ADMIN OPERATIONS ====================
    
    async def get_all_admins(self) -> List[Dict[str, Any]]:
        """Get all admins"""
        result = await self.db.prepare("SELECT * FROM admins").all()
        return result.results if result else []
    
    async def get_admin_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get admin by username"""
        result = await self.db.prepare(
            "SELECT * FROM admins WHERE username = ?"
        ).bind(username).first()
        return result if result else None
    
    async def create_admin(self, username: str, hashed_password: str) -> Dict[str, Any]:
        """Create a new admin"""
        await self.db.prepare(
            "INSERT INTO admins (username, password) VALUES (?, ?)"
        ).bind(username, hashed_password).run()
        
        return await self.get_admin_by_username(username)
    
    async def delete_admin(self, username: str) -> Dict[str, Any]:
        """Delete an admin"""
        await self.db.prepare(
            "DELETE FROM admins WHERE username = ?"
        ).bind(username).run()
        
        return {"detail": "Admin deleted successfully"}
    
    # ==================== NODE OPERATIONS ====================
    
    async def get_all_nodes(self) -> List[Dict[str, Any]]:
        """Get all nodes"""
        result = await self.db.prepare("SELECT * FROM nodes").all()
        return result.results if result else []
    
    async def get_node_by_id(self, node_id: int) -> Optional[Dict[str, Any]]:
        """Get node by ID"""
        result = await self.db.prepare(
            "SELECT * FROM nodes WHERE id = ?"
        ).bind(node_id).first()
        return result if result else None
    
    async def get_node_by_address(self, address: str) -> Optional[Dict[str, Any]]:
        """Get node by address"""
        result = await self.db.prepare(
            "SELECT * FROM nodes WHERE address = ?"
        ).bind(address).first()
        return result if result else None
    
    async def create_node(
        self,
        name: str,
        address: str,
        tunnel_address: Optional[str],
        protocol: str,
        ovpn_port: int,
        port: int,
        key: str,
        status: bool = True
    ) -> Dict[str, Any]:
        """Create a new node"""
        await self.db.prepare(
            """INSERT INTO nodes 
            (name, address, tunnel_address, protocol, ovpn_port, port, key, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""
        ).bind(name, address, tunnel_address, protocol, ovpn_port, port, key, 1 if status else 0).run()
        
        return await self.get_node_by_address(address)
    
    async def update_node(
        self,
        address: str,
        name: str,
        tunnel_address: Optional[str],
        protocol: str,
        ovpn_port: int,
        port: int,
        key: str,
        status: bool
    ) -> Dict[str, Any]:
        """Update a node"""
        node = await self.get_node_by_address(address)
        if not node:
            raise ValueError(f"Node {address} not found")
        
        await self.db.prepare(
            """UPDATE nodes 
            SET name = ?, tunnel_address = ?, protocol = ?, ovpn_port = ?, 
                port = ?, key = ?, status = ?
            WHERE address = ?"""
        ).bind(name, tunnel_address, protocol, ovpn_port, port, key, 1 if status else 0, address).run()
        
        return await self.get_node_by_address(address)
    
    async def delete_node(self, node_id: int) -> Dict[str, Any]:
        """Delete a node"""
        node = await self.get_node_by_id(node_id)
        if not node:
            raise ValueError(f"Node with id {node_id} not found")
        
        await self.db.prepare(
            "DELETE FROM nodes WHERE id = ?"
        ).bind(node_id).run()
        
        return {"detail": "Node deleted successfully"}
    
    async def update_node_health(
        self,
        node_id: int,
        is_healthy: bool,
        response_time: Optional[float] = None,
        consecutive_failures: int = 0
    ) -> Dict[str, Any]:
        """Update node health status"""
        node = await self.get_node_by_id(node_id)
        if not node:
            raise ValueError(f"Node with id {node_id} not found")
        
        now = datetime.now().isoformat()
        
        # Auto-disable node if too many failures
        status = 0 if consecutive_failures >= 3 else node.get('status', 1)
        
        await self.db.prepare(
            """UPDATE nodes 
            SET is_healthy = ?, last_health_check = ?, response_time = ?, 
                consecutive_failures = ?, status = ?
            WHERE id = ?"""
        ).bind(
            1 if is_healthy else 0,
            now,
            response_time,
            consecutive_failures,
            status,
            node_id
        ).run()
        
        return await self.get_node_by_id(node_id)
    
    async def update_node_sync_status(
        self,
        node_id: int,
        sync_status: str
    ) -> Dict[str, Any]:
        """Update node sync status"""
        node = await self.get_node_by_id(node_id)
        if not node:
            raise ValueError(f"Node with id {node_id} not found")
        
        now = datetime.now().isoformat() if sync_status == "synced" else node.get('last_sync_time')
        
        await self.db.prepare(
            "UPDATE nodes SET sync_status = ?, last_sync_time = ? WHERE id = ?"
        ).bind(sync_status, now, node_id).run()
        
        return await self.get_node_by_id(node_id)
    
    async def get_healthy_nodes(self) -> List[Dict[str, Any]]:
        """Get all healthy and active nodes"""
        result = await self.db.prepare(
            "SELECT * FROM nodes WHERE status = 1 AND is_healthy = 1"
        ).all()
        return result.results if result else []
    
    async def get_nodes_needing_sync(self) -> List[Dict[str, Any]]:
        """Get nodes that need synchronization"""
        result = await self.db.prepare(
            """SELECT * FROM nodes 
            WHERE status = 1 AND is_healthy = 1 
            AND sync_status IN ('pending', 'failed', 'never_synced')"""
        ).all()
        return result.results if result else []
    
    async def get_best_node_for_download(self) -> Optional[Dict[str, Any]]:
        """Get the best node for downloading OVPN based on health and performance"""
        # Try to get best performing synced node
        result = await self.db.prepare(
            """SELECT * FROM nodes 
            WHERE status = 1 AND is_healthy = 1 
            AND sync_status = 'synced' AND consecutive_failures = 0
            ORDER BY response_time ASC
            LIMIT 1"""
        ).first()
        
        if result:
            return result
        
        # Fallback to any active node
        result = await self.db.prepare(
            "SELECT * FROM nodes WHERE status = 1 LIMIT 1"
        ).first()
        
        return result if result else None
    
    # ==================== SETTINGS OPERATIONS ====================
    
    async def get_settings(self) -> Dict[str, Any]:
        """Get settings (create default if not exists)"""
        result = await self.db.prepare("SELECT * FROM settings LIMIT 1").first()
        
        if not result:
            # Create default settings
            await self.db.prepare(
                "INSERT INTO settings (tunnel_address, port, protocol) VALUES (NULL, 1194, 'tcp')"
            ).run()
            result = await self.db.prepare("SELECT * FROM settings LIMIT 1").first()
        
        return result
    
    async def update_settings(
        self,
        tunnel_address: Optional[str],
        port: int,
        protocol: str
    ) -> Dict[str, Any]:
        """Update settings"""
        # Ensure settings exist
        await self.get_settings()
        
        await self.db.prepare(
            "UPDATE settings SET tunnel_address = ?, port = ?, protocol = ? WHERE id = 1"
        ).bind(tunnel_address, port, protocol).run()
        
        return await self.get_settings()



