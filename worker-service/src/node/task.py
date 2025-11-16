"""
Node task management
Handles high-level node operations
Migrated from backend/node/task.py
"""
from typing import Dict, Any, List
from .requests import NodeRequests
from .health_check import HealthCheckService
from .sync import SyncService


async def add_node_handler(
    request_data: Dict[str, Any],
    db_ops,
    config_kv
) -> Dict[str, Any]:
    """
    Add a new node with health check and sync all users to it
    
    Args:
        request_data: Node creation data
        db_ops: DatabaseOperations instance
        config_kv: KV namespace for config
        
    Returns:
        dict with success status and sync information
    """
    new_node = NodeRequests(
        request_data['address'],
        request_data['port'],
        request_data['key'],
        request_data.get('tunnel_address'),
        request_data.get('protocol', 'tcp'),
        request_data.get('ovpn_port', 1194),
        request_data.get('set_new_setting', False),
        timeout=5,
        max_retries=1
    )
    
    # Check node health
    is_healthy, response_time = await new_node.check_node()
    
    if is_healthy:
        # Create node in database
        node = await db_ops.create_node(
            name=request_data['name'],
            address=request_data['address'],
            tunnel_address=request_data.get('tunnel_address'),
            protocol=request_data.get('protocol', 'tcp'),
            ovpn_port=request_data.get('ovpn_port', 1194),
            port=request_data['port'],
            key=request_data['key'],
            status=request_data.get('status', True)
        )
        
        # Update health status
        await db_ops.update_node_health(
            node['id'],
            is_healthy=True,
            response_time=response_time
        )
        
        # Mark as needing sync
        await db_ops.update_node_sync_status(node['id'], "never_synced")
        
        print(f"Node added successfully: {request_data['address']}:{request_data['port']}")
        
        # Sync all users to new node immediately
        print(f"Starting user synchronization for new node: {request_data['address']}:{request_data['port']}")
        sync_service = SyncService(db_ops)
        sync_result = await sync_service.sync_all_users_to_node(node)
        
        # Log sync results
        result = {
            "success": True,
            "node_address": request_data['address'],
            "node_port": request_data['port'],
            "sync_info": {}
        }
        
        if sync_result:
            total_users = sync_result.get("total_users", 0)
            synced = sync_result.get("synced", 0)
            failed = sync_result.get("failed", 0)
            
            result["sync_info"] = {
                "total_users": total_users,
                "synced": synced,
                "failed": failed
            }
            
            print(
                f"User synchronization completed for node {request_data['address']}:{request_data['port']}: "
                f"{synced}/{total_users} users synced successfully, {failed} failed"
            )
        
        return result
    else:
        print(f"Failed to add node - unhealthy: {request_data['address']}:{request_data['port']}")
        return {
            "success": False,
            "node_address": request_data['address'],
            "node_port": request_data['port'],
            "error": "Node health check failed"
        }


async def update_node_handler(
    address: str,
    request_data: Dict[str, Any],
    db_ops
) -> bool:
    """Update a node"""
    try:
        await db_ops.update_node(
            address=address,
            name=request_data['name'],
            tunnel_address=request_data.get('tunnel_address'),
            protocol=request_data.get('protocol', 'tcp'),
            ovpn_port=request_data.get('ovpn_port', 1194),
            port=request_data['port'],
            key=request_data['key'],
            status=request_data.get('status', True)
        )
        print(f"Node updated successfully: {address}")
        return True
    except Exception as e:
        print(f"Failed to update node {address}: {e}")
        return False


async def delete_node_handler(address: str, db_ops) -> bool:
    """Delete a node"""
    try:
        node = await db_ops.get_node_by_address(address)
        if node:
            await db_ops.delete_node(node['id'])
            print(f"Node deleted successfully: {address}")
            return True
        else:
            print(f"Node not found: {address}")
            return False
    except Exception as e:
        print(f"Failed to delete node {address}: {e}")
        return False


async def list_nodes_handler(db_ops) -> List[Dict[str, Any]]:
    """
    Retrieve all nodes with current health status from database only
    Does NOT perform health checks here to avoid blocking
    """
    nodes_list = []
    nodes = await db_ops.get_all_nodes()
    
    for node in nodes:
        # Determine actual status based on health and status
        is_active = node.get('status') and node.get('is_healthy')
        
        node_info = {
            "name": node['name'],
            "address": node['address'],
            "tunnel-address": node.get('tunnel_address'),
            "ovpn_port": node['ovpn_port'],
            "protocol": node['protocol'],
            "port": node['port'],
            "status": "active" if is_active else "inactive",
            "is_healthy": node.get('is_healthy'),
            "response_time": round(node['response_time'], 3) if node.get('response_time') else None,
            "last_health_check": node.get('last_health_check'),
            "sync_status": node.get('sync_status'),
            "last_sync_time": node.get('last_sync_time'),
            "consecutive_failures": node.get('consecutive_failures', 0)
        }
        nodes_list.append(node_info)
    
    return nodes_list


async def create_user_on_all_nodes(user_name: str, db_ops) -> List[Dict[str, Any]]:
    """Create a user on all healthy nodes only"""
    sync_service = SyncService(db_ops)
    results = await sync_service.sync_user_to_all_nodes(user_name)
    
    # Log summary
    success_count = sum(1 for r in results if r.get("success"))
    total_nodes = len(results)
    
    print(f"User '{user_name}' created on {success_count}/{total_nodes} healthy nodes")
    
    return results


async def delete_user_on_all_nodes(user_name: str, db_ops) -> List[Dict[str, Any]]:
    """Delete a user from all nodes"""
    sync_service = SyncService(db_ops)
    results = await sync_service.delete_user_from_all_nodes(user_name)
    
    # Log summary
    success_count = sum(1 for r in results if r.get("success"))
    total_nodes = len(results)
    
    print(f"User '{user_name}' deleted from {success_count}/{total_nodes} nodes")
    
    return results


async def get_node_status_handler(address: str, db_ops) -> Dict[str, Any]:
    """Get the status of a node with quick async check"""
    node = await db_ops.get_node_by_address(address)
    if not node:
        return None
    
    # Only fetch fresh status if node is marked healthy
    node_info = {}
    if node.get('is_healthy') and node.get('status'):
        try:
            node_request = NodeRequests(
                address=node['address'],
                port=node['port'],
                api_key=node['key'],
                timeout=3,  # Quick timeout
                max_retries=0  # No retries
            )
            node_info = await node_request.get_node_info()
        except Exception as e:
            print(f"Failed to get live info for node {address}: {e}")
            node_info = {"error": "Failed to fetch live data"}
    
    return {
        "address": node['address'],
        "port": node['port'],
        "status": "active" if (node.get('status') and node.get('is_healthy')) else "inactive",
        "is_healthy": node.get('is_healthy'),
        "last_health_check": node.get('last_health_check'),
        "response_time": node.get('response_time'),
        "node_info": node_info
    }


async def download_ovpn_client_from_node(
    name: str,
    node_address: str,
    db_ops
) -> bytes:
    """Download OVPN client from a specific node with health check"""
    node = await db_ops.get_node_by_address(node_address)
    
    if not node:
        print(f"Node not found: {node_address}")
        return None
    
    # Check if node is healthy before allowing download
    if not node.get('is_healthy'):
        print(
            f"Cannot download from unhealthy node {node_address}. "
            f"Health status: {node.get('is_healthy')}, Last check: {node.get('last_health_check')}"
        )
        return None
    
    if not node.get('status'):
        print(f"Cannot download from inactive node {node_address}")
        return None
    
    # Check sync status
    if node.get('sync_status') not in ["synced", "pending"]:
        print(
            f"Node {node_address} has sync_status '{node.get('sync_status')}', "
            f"may not have latest data. Last sync: {node.get('last_sync_time')}"
        )
    
    try:
        # Download OVPN file
        result = NodeRequests(
            address=node['address'],
            port=node['port'],
            api_key=node['key'],
            timeout=10,  # 10 seconds for download
            max_retries=0
        )
        
        content = await result.download_ovpn_client(f"{name}-{node['name']}")
        
        if content:
            print(f"OVPN client downloaded for user '{name}-{node['name']}' from node {node['address']}")
            return content
        
        # If download failed, mark node as potentially unhealthy
        print(f"Failed to download OVPN for user '{name}-{node['name']}' from node {node['address']}")
        await db_ops.update_node_health(
            node['id'],
            is_healthy=False,
            consecutive_failures=node.get('consecutive_failures', 0) + 1
        )
        
    except Exception as e:
        print(f"Exception downloading from node {node_address}: {e}")
        await db_ops.update_node_health(
            node['id'],
            is_healthy=False,
            consecutive_failures=node.get('consecutive_failures', 0) + 1
        )
    
    return None


async def download_ovpn_from_best_node(name: str, db_ops) -> bytes:
    """Download OVPN from the best available node"""
    best_node = await db_ops.get_best_node_for_download()
    
    if not best_node:
        print("No healthy nodes available for download")
        return None
    
    print(f"Selected best node {best_node['address']} for download")
    return await download_ovpn_client_from_node(name, best_node['address'], db_ops)



