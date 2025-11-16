"""
Main entry point for Cloudflare Workers
OpenVPN Panel - Python Workers Edition
"""
from js import Response, Headers, Request
import json
from urllib.parse import urlparse, parse_qs

from .database.operations import DatabaseOperations
from .auth.auth import AuthService, extract_auth_from_request
from .api import auth, users, nodes, admins, settings
from .operations.scheduled_tasks import handle_cron_trigger
from .utils.frontend import serve_frontend_file


async def handle_request(request, env):
    """
    Main request handler
    
    Args:
        request: Incoming request object
        env: Environment bindings (DB, CONFIG, FRONTEND_ASSETS)
    """
    # Parse request
    url = urlparse(request.url)
    path = url.path
    method = request.method
    
    # Initialize services
    db_ops = DatabaseOperations(env.DB)
    auth_service = AuthService(env.CONFIG, db_ops)
    
    # CORS headers
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, key",
        "Access-Control-Max-Age": "86400"
    }
    
    # Handle OPTIONS (preflight)
    if method == "OPTIONS":
        return create_response("", 200, cors_headers)
    
    try:
        # API Routes
        if path.startswith("/api/"):
            response_data = await handle_api_request(
                path, method, request, db_ops, auth_service, env.CONFIG
            )
            return create_json_response(response_data, cors_headers)
        
        # Serve frontend from R2
        else:
            # Get URLPATH from config (default to "dashboard")
            urlpath = await env.CONFIG.get("URLPATH") or "dashboard"
            
            # Handle root or dashboard path
            if path == "/" or path == f"/{urlpath}" or path == f"/{urlpath}/":
                file_data = await serve_frontend_file(env.FRONTEND_ASSETS, "index.html")
            else:
                file_data = await serve_frontend_file(env.FRONTEND_ASSETS, path)
            
            if file_data:
                headers_dict = {
                    "Content-Type": file_data["content_type"],
                    **cors_headers
                }
                return create_response(
                    file_data["body"],
                    file_data["status"],
                    headers_dict
                )
            else:
                # Return index.html for SPA routing
                file_data = await serve_frontend_file(env.FRONTEND_ASSETS, "index.html")
                if file_data:
                    headers_dict = {
                        "Content-Type": "text/html",
                        **cors_headers
                    }
                    return create_response(
                        file_data["body"],
                        200,
                        headers_dict
                    )
                else:
                    return create_json_response(
                        {"success": False, "msg": "Frontend not found", "data": None},
                        cors_headers,
                        404
                    )
    
    except Exception as e:
        print(f"Error handling request: {e}")
        return create_json_response(
            {"success": False, "msg": f"Internal server error: {str(e)}", "data": None},
            cors_headers,
            500
        )


async def handle_api_request(path, method, request, db_ops, auth_service, config_kv):
    """
    Route API requests to appropriate handlers
    
    Args:
        path: Request path
        method: HTTP method
        request: Request object
        db_ops: DatabaseOperations instance
        auth_service: AuthService instance
        config_kv: KV namespace for config
    """
    # Extract request body for POST/PUT
    request_data = {}
    if method in ["POST", "PUT"]:
        try:
            body_text = await request.text()
            if body_text:
                request_data = json.loads(body_text)
        except Exception as e:
            print(f"Error parsing request body: {e}")
    
    # Authentication (except for login endpoint)
    if path != "/api/login":
        bearer_token, api_key = extract_auth_from_request(request)
        auth_result = await auth_service.verify_jwt_or_api_key(bearer_token, api_key)
        
        if not auth_result:
            return {
                "success": False,
                "msg": "Unauthorized - Invalid or missing authentication",
                "data": None
            }
    
    # Route to handlers
    
    # Auth routes
    if path == "/api/login" and method == "POST":
        return await auth.login_handler(
            request_data.get('username'),
            request_data.get('password'),
            auth_service
        )
    
    # User routes
    elif path == "/api/user/all" and method == "GET":
        return await users.get_all_users_handler(db_ops)
    
    elif path == "/api/user/create" and method == "POST":
        return await users.create_user_handler(request_data, db_ops)
    
    elif path == "/api/user/update" and method == "PUT":
        return await users.update_user_handler(request_data, db_ops)
    
    elif path.startswith("/api/user/delete/") and method == "DELETE":
        name = path.split("/")[-1]
        return await users.delete_user_handler(name, db_ops)
    
    # Node routes
    elif path == "/api/node/add" and method == "POST":
        return await nodes.add_node(request_data, db_ops, config_kv)
    
    elif path.startswith("/api/node/update/") and method == "PUT":
        address = path.split("/")[-1]
        return await nodes.update_node(address, request_data, db_ops)
    
    elif path.startswith("/api/node/delete/") and method == "DELETE":
        address = path.split("/")[-1]
        return await nodes.delete_node(address, db_ops)
    
    elif path == "/api/node/list" and method == "GET":
        return await nodes.list_nodes(db_ops)
    
    elif path == "/api/node/list/healthy" and method == "GET":
        return await nodes.list_healthy_nodes(db_ops)
    
    elif path.startswith("/api/node/status/") and method == "GET":
        address = path.split("/")[-1]
        return await nodes.get_node_status(address, db_ops)
    
    elif path.startswith("/api/node/download/ovpn/best/") and method == "GET":
        name = path.split("/")[-1]
        content, filename = await nodes.download_ovpn_from_best(name, db_ops)
        if content:
            return {"_file": True, "content": content, "filename": filename}
        else:
            return {
                "success": False,
                "msg": "No healthy nodes available for download",
                "data": None
            }
    
    elif path.startswith("/api/node/download/ovpn/") and method == "GET":
        parts = path.split("/")
        if len(parts) >= 6:
            address = parts[-2]
            name = parts[-1]
            content, filename = await nodes.download_ovpn_from_node(address, name, db_ops)
            if content:
                return {"_file": True, "content": content, "filename": filename}
            else:
                return {
                    "success": False,
                    "msg": "Failed to download OVPN file",
                    "data": None
                }
    
    elif path == "/api/node/health-check/all" and method == "POST":
        return await nodes.health_check_all_nodes(db_ops)
    
    elif path.startswith("/api/node/health-check/") and method == "POST":
        address = path.split("/")[-1]
        return await nodes.health_check_node(address, db_ops)
    
    elif path == "/api/node/recover" and method == "POST":
        return await nodes.recover_nodes(db_ops)
    
    elif path == "/api/node/sync/all" and method == "POST":
        return await nodes.sync_all_nodes(db_ops)
    
    elif path == "/api/node/sync/pending" and method == "POST":
        return await nodes.sync_pending_nodes(db_ops)
    
    elif path.startswith("/api/node/sync/") and method == "POST":
        address = path.split("/")[-1]
        return await nodes.sync_single_node(address, db_ops)
    
    # Admin routes
    elif path == "/api/admin/all" and method == "GET":
        return await admins.get_all_admins_handler(db_ops)
    
    # Settings routes
    elif path == "/api/settings/" and method == "GET":
        return await settings.get_settings_handler(db_ops)
    
    elif path == "/api/settings/update" and method == "PUT":
        return await settings.update_settings_handler(request_data, db_ops)
    
    else:
        return {
            "success": False,
            "msg": f"Endpoint not found: {method} {path}",
            "data": None
        }


async def handle_cron(event, env):
    """
    Handle scheduled cron triggers
    
    Args:
        event: Cron event object
        env: Environment bindings
    """
    cron = event.cron
    print(f"Cron trigger: {cron}")
    
    # Initialize database operations
    db_ops = DatabaseOperations(env.DB)
    
    # Handle cron trigger
    await handle_cron_trigger(cron, db_ops)


def create_response(body, status=200, headers=None):
    """Create a Response object"""
    if headers is None:
        headers = {}
    
    headers_obj = Headers.new()
    for key, value in headers.items():
        headers_obj.set(key, value)
    
    return Response.new(body, {"status": status, "headers": headers_obj})


def create_json_response(data, headers=None, status=200):
    """Create a JSON response"""
    if headers is None:
        headers = {}
    
    # Handle file downloads
    if isinstance(data, dict) and data.get("_file"):
        headers["Content-Type"] = "application/x-openvpn-profile"
        headers["Content-Disposition"] = f"attachment; filename={data['filename']}"
        return create_response(data["content"], status, headers)
    
    # Regular JSON response
    headers["Content-Type"] = "application/json"
    body = json.dumps(data)
    return create_response(body, status, headers)


# Export handlers for Cloudflare Workers
async def on_fetch(request, env, ctx):
    """Fetch event handler"""
    return await handle_request(request, env)


async def scheduled(event, env, ctx):
    """Scheduled event handler (cron triggers)"""
    await handle_cron(event, env)



