"""
Scheduled task handlers for Cloudflare Workers Cron Triggers
Migrated from backend/app.py and backend/node/scheduler.py
"""
from datetime import datetime
from ..node.health_check import HealthCheckService
from ..node.sync import SyncService


async def check_user_expiry_date(db_ops):
    """
    Check users' expiration dates and deactivate expired users
    Runs daily at midnight UTC
    Migrated from backend/operations/daily_checks.py
    """
    print("Running scheduled user expiry check...")
    
    try:
        expired_users = await db_ops.get_expired_users()
        
        for user in expired_users:
            # Deactivate user
            await db_ops.change_user_status(user['name'], False)
            print(f"Deactivated expired user: {user['name']}")
        
        print(f"User expiry check completed: {len(expired_users)} users deactivated")
        
    except Exception as e:
        print(f"Error in user expiry check: {e}")


async def health_check_job(db_ops):
    """
    Scheduled job to check health of all nodes
    Runs every minute (Cloudflare Workers cron minimum)
    Migrated from backend/node/scheduler.py
    """
    print("Running scheduled health check...")
    
    try:
        health_service = HealthCheckService(db_ops)
        results = await health_service.check_all_nodes()
        
        healthy_count = sum(1 for r in results if r.get("is_healthy"))
        print(
            f"Scheduled health check completed: "
            f"{healthy_count}/{len(results)} nodes healthy"
        )
        
        # Try to recover unhealthy nodes
        recovered = await health_service.auto_recover_nodes()
        if recovered:
            print(f"Auto-recovered {len(recovered)} nodes")
            
    except Exception as e:
        print(f"Error in health check job: {e}")


async def sync_pending_job(db_ops):
    """
    Scheduled job to sync pending nodes
    Runs every 5 minutes
    Migrated from backend/node/scheduler.py
    """
    print("Running scheduled sync for pending nodes...")
    
    try:
        sync_service = SyncService(db_ops)
        results = await sync_service.sync_pending_nodes()
        
        if results:
            total_synced = sum(r.get("synced", 0) for r in results)
            print(
                f"Scheduled sync completed: "
                f"{total_synced} users synced to {len(results)} nodes"
            )
        else:
            print("No pending nodes to sync")
            
    except Exception as e:
        print(f"Error in sync pending job: {e}")


async def full_sync_job(db_ops):
    """
    Scheduled job for full system sync
    Runs every 5 minutes
    Migrated from backend/node/scheduler.py
    """
    print("Running scheduled full system sync...")
    
    try:
        sync_service = SyncService(db_ops)
        results = await sync_service.sync_all_nodes()
        
        total_synced = sum(r.get("synced", 0) for r in results)
        total_failed = sum(r.get("failed", 0) for r in results)
        
        print(
            f"Full sync completed: {total_synced} users synced, "
            f"{total_failed} failed across {len(results)} nodes"
        )
        
    except Exception as e:
        print(f"Error in full sync job: {e}")


async def handle_cron_trigger(cron: str, db_ops):
    """
    Route cron trigger to appropriate handler
    
    Args:
        cron: Cron expression that triggered this execution
        db_ops: DatabaseOperations instance
    """
    print(f"Cron trigger received: {cron}")
    
    if cron == "0 0 * * *":
        # Daily at midnight UTC - user expiry check
        await check_user_expiry_date(db_ops)
    
    elif cron == "*/1 * * * *":
        # Every minute - health check
        await health_check_job(db_ops)
    
    elif cron == "*/5 * * * *":
        # Every 5 minutes - sync operations
        await sync_pending_job(db_ops)
        # Also run full sync
        await full_sync_job(db_ops)
    
    else:
        print(f"Unknown cron trigger: {cron}")



