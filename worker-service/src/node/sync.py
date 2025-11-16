"""
Synchronization service for keeping nodes in sync
Migrated from backend/node/sync.py
"""
import asyncio
from typing import List, Dict, Any
from .requests import NodeRequests


class SyncService:
    """Service for synchronizing data between nodes"""
    
    def __init__(self, db_ops):
        """
        Initialize sync service
        Args:
            db_ops: DatabaseOperations instance
        """
        self.db = db_ops
    
    async def sync_user_to_node(
        self,
        user_name: str,
        node: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Sync a single user to a node
        
        Args:
            user_name: Name of the user
            node: Node dictionary from database
            
        Returns:
            dict with sync result
        """
        try:
            node_request = NodeRequests(
                address=node['address'],
                port=node['port'],
                api_key=node['key'],
                timeout=10,
                max_retries=2
            )
            
            # Create user with node-specific name
            user_name_with_node = f"{user_name}-{node['name']}"
            success = await node_request.create_user(user_name_with_node)
            
            if success:
                print(f"Synced user '{user_name_with_node}' to node {node['address']}")
                return {
                    "node_id": node['id'],
                    "address": node['address'],
                    "user": user_name,
                    "success": True
                }
            else:
                print(f"Failed to sync user '{user_name_with_node}' to node {node['address']}")
                return {
                    "node_id": node['id'],
                    "address": node['address'],
                    "user": user_name,
                    "success": False
                }
                
        except Exception as e:
            print(f"Error syncing user '{user_name}' to node {node['address']}: {e}")
            return {
                "node_id": node['id'],
                "address": node['address'],
                "user": user_name,
                "success": False,
                "error": str(e)
            }
    
    async def sync_all_users_to_node(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync all users from database to a specific node
        
        Args:
            node: Node dictionary from database
            
        Returns:
            dict with sync statistics
        """
        try:
            # Get all active users from database
            users = await self.db.get_all_users()
            
            if not users:
                print(f"No users to sync to node {node['address']}")
                return {
                    "node_id": node['id'],
                    "address": node['address'],
                    "total_users": 0,
                    "synced": 0,
                    "failed": 0
                }
            
            print(f"Syncing {len(users)} users to node {node['address']}")
            
            # Sync all users
            tasks = [self.sync_user_to_node(user['name'], node) for user in users]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Count successes and failures
            valid_results = [r for r in results if isinstance(r, dict)]
            synced_count = sum(1 for r in valid_results if r.get("success"))
            failed_count = len(valid_results) - synced_count
            
            # Update node sync status
            if failed_count == 0:
                await self.db.update_node_sync_status(node['id'], "synced")
            elif synced_count > 0:
                await self.db.update_node_sync_status(node['id'], "pending")
            else:
                await self.db.update_node_sync_status(node['id'], "failed")
            
            print(
                f"Sync completed for node {node['address']}: "
                f"{synced_count} succeeded, {failed_count} failed"
            )
            
            return {
                "node_id": node['id'],
                "address": node['address'],
                "total_users": len(users),
                "synced": synced_count,
                "failed": failed_count
            }
            
        except Exception as e:
            print(f"Error syncing users to node {node['address']}: {e}")
            await self.db.update_node_sync_status(node['id'], "failed")
            return {
                "node_id": node['id'],
                "address": node['address'],
                "error": str(e)
            }
    
    async def sync_all_nodes(self) -> List[Dict[str, Any]]:
        """
        Sync all users to all healthy nodes
        
        Returns:
            List of sync results for each node
        """
        # Get only healthy nodes
        nodes = await self.db.get_healthy_nodes()
        
        if not nodes:
            print("No healthy nodes available for sync")
            return []
        
        print(f"Starting full sync for {len(nodes)} healthy nodes")
        
        # Sync all nodes concurrently
        tasks = [self.sync_all_users_to_node(node) for node in nodes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_results = [r for r in results if isinstance(r, dict)]
        
        total_synced = sum(r.get("synced", 0) for r in valid_results)
        total_failed = sum(r.get("failed", 0) for r in valid_results)
        
        print(
            f"Full sync completed: {total_synced} users synced, "
            f"{total_failed} failed across {len(valid_results)} nodes"
        )
        
        return valid_results
    
    async def sync_pending_nodes(self) -> List[Dict[str, Any]]:
        """
        Sync only nodes that have pending sync status
        
        Returns:
            List of sync results for pending nodes
        """
        nodes = await self.db.get_nodes_needing_sync()
        
        if not nodes:
            print("No nodes need sync")
            return []
        
        print(f"Syncing {len(nodes)} nodes with pending status")
        
        tasks = [self.sync_all_users_to_node(node) for node in nodes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_results = [r for r in results if isinstance(r, dict)]
        
        print(f"Pending sync completed for {len(valid_results)} nodes")
        
        return valid_results
    
    async def sync_user_to_all_nodes(self, user_name: str) -> List[Dict[str, Any]]:
        """
        Sync a single user to all healthy nodes
        
        Args:
            user_name: Name of the user to sync
            
        Returns:
            List of sync results
        """
        nodes = await self.db.get_healthy_nodes()
        
        if not nodes:
            print(f"No healthy nodes to sync user '{user_name}'")
            return []
        
        print(f"Syncing user '{user_name}' to {len(nodes)} healthy nodes")
        
        tasks = [self.sync_user_to_node(user_name, node) for node in nodes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_results = [r for r in results if isinstance(r, dict)]
        success_count = sum(1 for r in valid_results if r.get("success"))
        
        print(f"User '{user_name}' synced to {success_count}/{len(valid_results)} nodes")
        
        return valid_results
    
    async def delete_user_from_all_nodes(self, user_name: str) -> List[Dict[str, Any]]:
        """
        Delete a user from all nodes
        
        Args:
            user_name: Name of the user to delete
            
        Returns:
            List of deletion results
        """
        nodes = await self.db.get_all_nodes()
        
        if not nodes:
            return []
        
        print(f"Deleting user '{user_name}' from {len(nodes)} nodes")
        
        results = []
        for node in nodes:
            try:
                node_request = NodeRequests(
                    address=node['address'],
                    port=node['port'],
                    api_key=node['key'],
                    timeout=10,
                    max_retries=2
                )
                
                user_name_with_node = f"{user_name}-{node['name']}"
                success = await node_request.delete_user(user_name_with_node)
                
                results.append({
                    "node_id": node['id'],
                    "address": node['address'],
                    "user": user_name,
                    "success": success
                })
                
            except Exception as e:
                print(f"Error deleting user '{user_name}' from node {node['address']}: {e}")
                results.append({
                    "node_id": node['id'],
                    "address": node['address'],
                    "user": user_name,
                    "success": False,
                    "error": str(e)
                })
        
        success_count = sum(1 for r in results if r.get("success"))
        print(f"User '{user_name}' deleted from {success_count}/{len(results)} nodes")
        
        return results



