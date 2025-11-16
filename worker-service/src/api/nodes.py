"""
Node API routes for Cloudflare Workers
Migrated from backend/routers/node.py
"""
from typing import Dict, Any
from ..node.task import (
    add_node_handler,
    update_node_handler,
    delete_node_handler,
    list_nodes_handler,
    get_node_status_handler,
    download_ovpn_client_from_node,
    download_ovpn_from_best_node
)
from ..node.health_check import HealthCheckService
from ..node.sync import SyncService


async def add_node(request_data: Dict[str, Any], db_ops, config_kv) -> Dict[str, Any]:
    """Add a new node and automatically sync all existing users to it"""
    result = await add_node_handler(request_data, db_ops, config_kv)
    
    if result.get("success"):
        sync_info = result.get("sync_info", {})
        total = sync_info.get("total_users", 0)
        synced = sync_info.get("synced", 0)
        failed = sync_info.get("failed", 0)
        
        if total == 0:
            msg = "Node added successfully. No users to sync."
        elif failed == 0:
            msg = f"Node added successfully. All {synced} users synced to the new node."
        else:
            msg = f"Node added successfully. {synced}/{total} users synced ({failed} failed)."
    else:
        msg = result.get("error", "Failed to add node")
    
    return {
        "success": result.get("success", False),
        "msg": msg,
        "data": result
    }


async def update_node(
    address: str,
    request_data: Dict[str, Any],
    db_ops
) -> Dict[str, Any]:
    """Update a node"""
    result = await update_node_handler(address, request_data, db_ops)
    return {
        "success": result,
        "msg": "Node updated successfully" if result else "Failed to update node",
        "data": None
    }


async def get_node_status(address: str, db_ops) -> Dict[str, Any]:
    """Get node status"""
    node_status = await get_node_status_handler(address, db_ops)
    return {
        "success": True,
        "msg": "Node status retrieved successfully",
        "data": node_status
    }


async def list_nodes(db_ops) -> Dict[str, Any]:
    """Get all nodes with their cached health status"""
    nodes = await list_nodes_handler(db_ops)
    return {
        "success": True,
        "msg": "Nodes retrieved successfully",
        "data": nodes
    }


async def list_healthy_nodes(db_ops) -> Dict[str, Any]:
    """Get only healthy and active nodes for download selection"""
    all_nodes = await db_ops.get_all_nodes()
    healthy_nodes = [
        {
            "name": node['name'],
            "address": node['address'],
            "response_time": round(node['response_time'], 3) if node.get('response_time') else None
        }
        for node in all_nodes
        if node.get('status') and node.get('is_healthy')
    ]
    
    return {
        "success": True,
        "msg": f"Found {len(healthy_nodes)} healthy nodes",
        "data": healthy_nodes
    }


async def delete_node(address: str, db_ops) -> Dict[str, Any]:
    """Delete a node"""
    result = await delete_node_handler(address, db_ops)
    return {
        "success": result,
        "msg": "Node deleted successfully" if result else "Failed to delete node",
        "data": None
    }


async def health_check_all_nodes(db_ops) -> Dict[str, Any]:
    """Run health check on all nodes"""
    health_service = HealthCheckService(db_ops)
    results = await health_service.check_all_nodes()
    
    healthy_count = sum(1 for r in results if r.get("is_healthy"))
    
    return {
        "success": True,
        "msg": f"Health check completed: {healthy_count}/{len(results)} nodes healthy",
        "data": results
    }


async def health_check_node(address: str, db_ops) -> Dict[str, Any]:
    """Run health check on a specific node"""
    node = await db_ops.get_node_by_address(address)
    if not node:
        return {
            "success": False,
            "msg": "Node not found",
            "data": None
        }
    
    health_service = HealthCheckService(db_ops)
    result = await health_service.check_node_health(node)
    
    return {
        "success": result.get("is_healthy", False),
        "msg": f"Node is {'healthy' if result.get('is_healthy') else 'unhealthy'}",
        "data": result
    }


async def recover_nodes(db_ops) -> Dict[str, Any]:
    """Attempt to recover unhealthy nodes"""
    health_service = HealthCheckService(db_ops)
    recovered = await health_service.auto_recover_nodes()
    
    return {
        "success": True,
        "msg": f"Recovery completed: {len(recovered)} nodes recovered",
        "data": recovered
    }


async def sync_all_nodes(db_ops) -> Dict[str, Any]:
    """Synchronize all users to all healthy nodes"""
    sync_service = SyncService(db_ops)
    results = await sync_service.sync_all_nodes()
    
    total_synced = sum(r.get("synced", 0) for r in results)
    total_failed = sum(r.get("failed", 0) for r in results)
    
    return {
        "success": True,
        "msg": f"Sync completed: {total_synced} users synced, {total_failed} failed",
        "data": results
    }


async def sync_pending_nodes(db_ops) -> Dict[str, Any]:
    """Synchronize only nodes with pending sync status"""
    sync_service = SyncService(db_ops)
    results = await sync_service.sync_pending_nodes()
    
    return {
        "success": True,
        "msg": f"Pending sync completed for {len(results)} nodes",
        "data": results
    }


async def sync_single_node(address: str, db_ops) -> Dict[str, Any]:
    """Synchronize all users to a specific node"""
    node = await db_ops.get_node_by_address(address)
    if not node:
        return {
            "success": False,
            "msg": "Node not found",
            "data": None
        }
    
    if not node.get('is_healthy') or not node.get('status'):
        return {
            "success": False,
            "msg": "Cannot sync to unhealthy or inactive node",
            "data": None
        }
    
    sync_service = SyncService(db_ops)
    result = await sync_service.sync_all_users_to_node(node)
    
    return {
        "success": result.get("failed", 0) == 0,
        "msg": f"Sync completed: {result.get('synced', 0)} users synced",
        "data": result
    }


async def download_ovpn_from_node(
    address: str,
    name: str,
    db_ops
) -> tuple[bytes, str]:
    """Download OVPN from specific node with health validation"""
    content = await download_ovpn_client_from_node(name, address, db_ops)
    
    if content:
        filename = f"{name}.ovpn"
        return content, filename
    
    return None, None


async def download_ovpn_from_best(name: str, db_ops) -> tuple[bytes, str]:
    """Download OVPN from the best performing healthy node"""
    content = await download_ovpn_from_best_node(name, db_ops)
    
    if content:
        filename = f"{name}.ovpn"
        return content, filename
    
    return None, None



