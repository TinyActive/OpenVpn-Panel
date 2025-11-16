"""
Frontend serving utilities for Cloudflare Workers
Serves React frontend from R2 bucket
"""


async def serve_frontend_file(r2_bucket, path: str):
    """
    Serve a file from R2 bucket
    
    Args:
        r2_bucket: R2 bucket binding
        path: Path to file in bucket
        
    Returns:
        Response with file content or None if not found
    """
    # Remove leading slash
    if path.startswith('/'):
        path = path[1:]
    
    # Default to index.html for root path
    if not path or path == '':
        path = 'index.html'
    
    # Get file from R2
    try:
        obj = await r2_bucket.get(path)
        
        if obj is None:
            # Try index.html for SPA routing
            if not path.endswith('.html') and not path.startswith('assets/'):
                obj = await r2_bucket.get('index.html')
                if obj:
                    return await create_html_response(obj)
            return None
        
        # Determine content type
        content_type = get_content_type(path)
        
        # Get file content
        body = await obj.arrayBuffer()
        
        return {
            "body": body,
            "content_type": content_type,
            "status": 200
        }
        
    except Exception as e:
        print(f"Error serving file {path}: {e}")
        return None


def get_content_type(path: str) -> str:
    """Get content type based on file extension"""
    if path.endswith('.html'):
        return 'text/html'
    elif path.endswith('.js'):
        return 'application/javascript'
    elif path.endswith('.css'):
        return 'text/css'
    elif path.endswith('.json'):
        return 'application/json'
    elif path.endswith('.png'):
        return 'image/png'
    elif path.endswith('.jpg') or path.endswith('.jpeg'):
        return 'image/jpeg'
    elif path.endswith('.svg'):
        return 'image/svg+xml'
    elif path.endswith('.webp'):
        return 'image/webp'
    elif path.endswith('.ico'):
        return 'image/x-icon'
    elif path.endswith('.woff'):
        return 'font/woff'
    elif path.endswith('.woff2'):
        return 'font/woff2'
    elif path.endswith('.ttf'):
        return 'font/ttf'
    elif path.endswith('.eot'):
        return 'application/vnd.ms-fontobject'
    else:
        return 'application/octet-stream'


async def create_html_response(obj):
    """Create HTML response from R2 object"""
    body = await obj.arrayBuffer()
    return {
        "body": body,
        "content_type": "text/html",
        "status": 200
    }



