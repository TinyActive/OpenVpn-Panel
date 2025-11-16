"""
Health check service for monitoring node status
Migrated from backend/node/health_check.py
"""
import asyncio
from typing import List, Dict, Any
from .requests import NodeRequests


class HealthCheckService:
    """Service for checking node health and updating status"""
    
    def __init__(self, db_ops):
        """
        Initialize health check service
        Args:
            db_ops: DatabaseOperations instance
        """
        self.db = db_ops
    
    async def check_node_health(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check health of a single node with async request
        
        Args:
            node: Node dictionary from database
            
        Returns:
            dict with health status information
        """
        try:
            node_request = NodeRequests(
                address=node['address'],
                port=node['port'],
                api_key=node['key'],
                timeout=3,  # 3 second timeout for health checks
                max_retries=0  # No retries for health checks
            )
            
            # Check node health
            is_healthy, response_time = await node_request.check_node()
            
            # Update consecutive failures
            if is_healthy:
                consecutive_failures = 0
            else:
                consecutive_failures = node.get('consecutive_failures', 0) + 1
            
            # Update node health in database
            await self.db.update_node_health(
                node['id'],
                is_healthy=is_healthy,
                response_time=response_time,
                consecutive_failures=consecutive_failures
            )
            
            status_msg = "healthy" if is_healthy else "unhealthy"
            time_msg = f"({response_time:.3f}s)" if response_time else "timeout"
            print(f"Health check for node {node['address']}: {status_msg} {time_msg}")
            
            return {
                "node_id": node['id'],
                "address": node['address'],
                "is_healthy": is_healthy,
                "response_time": response_time,
                "consecutive_failures": consecutive_failures
            }
            
        except Exception as e:
            print(f"Error checking health for node {node['address']}: {e}")
            
            # Mark as unhealthy on exception
            consecutive_failures = node.get('consecutive_failures', 0) + 1
            await self.db.update_node_health(
                node['id'],
                is_healthy=False,
                response_time=None,
                consecutive_failures=consecutive_failures
            )
            
            return {
                "node_id": node['id'],
                "address": node['address'],
                "is_healthy": False,
                "response_time": None,
                "consecutive_failures": consecutive_failures,
                "error": str(e)
            }
    
    async def check_all_nodes(self) -> List[Dict[str, Any]]:
        """
        Check health of all nodes
        
        Returns:
            List of health check results
        """
        nodes = await self.db.get_all_nodes()
        
        if not nodes:
            print("No nodes found for health check")
            return []
        
        print(f"Starting health check for {len(nodes)} nodes")
        
        # Check all nodes concurrently
        tasks = [self.check_node_health(node) for node in nodes]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and count healthy nodes
        valid_results = [r for r in results if isinstance(r, dict)]
        healthy_count = sum(1 for r in valid_results if r.get("is_healthy"))
        
        print(f"Health check completed: {healthy_count}/{len(valid_results)} nodes healthy")
        
        return valid_results
    
    async def auto_recover_nodes(self) -> List[Dict[str, Any]]:
        """
        Attempt to recover nodes that were previously unhealthy
        
        Returns:
            List of nodes that recovered
        """
        # Get all nodes
        all_nodes = await self.db.get_all_nodes()
        unhealthy_nodes = [
            n for n in all_nodes 
            if not n.get('is_healthy') or not n.get('status')
        ]
        
        if not unhealthy_nodes:
            return []
        
        print(f"Attempting to recover {len(unhealthy_nodes)} unhealthy nodes")
        
        recovered_nodes = []
        for node in unhealthy_nodes:
            result = await self.check_node_health(node)
            if result.get("is_healthy"):
                # Reset status and mark as needing sync
                await self.db.update_node(
                    node['address'],
                    name=node['name'],
                    tunnel_address=node.get('tunnel_address'),
                    protocol=node['protocol'],
                    ovpn_port=node['ovpn_port'],
                    port=node['port'],
                    key=node['key'],
                    status=True
                )
                await self.db.update_node_sync_status(node['id'], "pending")
                
                recovered_nodes.append(result)
                print(f"Node {node['address']} recovered successfully")
        
        if recovered_nodes:
            print(f"Successfully recovered {len(recovered_nodes)} nodes")
        
        return recovered_nodes



