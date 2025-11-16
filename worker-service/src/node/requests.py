"""
Node communication module for Cloudflare Workers
Handles HTTP requests to node APIs using fetch
Migrated from backend/node/requests.py
"""
import asyncio
import time
from typing import Optional, Tuple, Dict, Any


class NodeRequests:
    """Handles requests to the node API with timeout and retry logic"""
    
    def __init__(
        self,
        address: str,
        port: int,
        api_key: str,
        tunnel_address: str = "ovpanel.com",
        protocol: str = "tcp",
        ovpn_port: int = 1194,
        set_new_setting: bool = False,
        timeout: int = 5,
        max_retries: int = 1
    ):
        self.address = f"{address}:{port}"
        self.api_key = api_key
        self.tunnel_address = tunnel_address
        self.protocol = protocol
        self.ovpn_port = ovpn_port
        self.set_new_setting = set_new_setting
        self.timeout = timeout
        self.max_retries = max_retries
    
    async def _make_request(
        self,
        method: str,
        url: str,
        json_data: Optional[Dict[str, Any]] = None
    ) -> Tuple[Optional[Dict[str, Any]], Optional[float]]:
        """
        Make HTTP request with timeout and retry logic
        Returns: Tuple of (response_data, response_time_in_seconds)
        """
        headers = {
            "key": self.api_key,
            "Content-Type": "application/json"
        }
        
        for attempt in range(self.max_retries + 1):
            try:
                start_time = time.time()
                
                # Prepare fetch options
                fetch_options = {
                    "method": method,
                    "headers": headers
                }
                
                if json_data and method in ["POST", "PUT"]:
                    import json
                    fetch_options["body"] = json.dumps(json_data)
                
                # Make fetch request with timeout
                # Note: In Python Workers, use the fetch API from js module
                from js import fetch, AbortController, setTimeout
                
                controller = AbortController()
                signal = controller.signal
                
                # Set timeout
                timeout_id = setTimeout(
                    lambda: controller.abort(),
                    self.timeout * 1000  # Convert to milliseconds
                )
                
                fetch_options["signal"] = signal
                
                response = await fetch(url, fetch_options)
                response_time = time.time() - start_time
                
                # Clear timeout
                from js import clearTimeout
                clearTimeout(timeout_id)
                
                if response.status >= 200 and response.status < 300:
                    try:
                        data = await response.json()
                        return data, response_time
                    except Exception:
                        return None, None
                else:
                    if attempt == self.max_retries:
                        return None, None
                
            except Exception as e:
                error_msg = str(e)
                if attempt == self.max_retries:
                    print(f"Request failed after {attempt + 1} attempts: {error_msg}")
                    return None, None
        
        return None, None
    
    async def check_node(self) -> Tuple[bool, Optional[float]]:
        """
        Check node status and set new settings if necessary
        Returns: Tuple of (is_healthy, response_time)
        """
        api = f"http://{self.address}/sync/get-status"
        data = {
            "tunnel_address": self.tunnel_address,
            "protocol": self.protocol,
            "ovpn_port": self.ovpn_port,
            "set_new_setting": self.set_new_setting
        }
        
        response, response_time = await self._make_request("POST", api, data)
        
        if response and response.get("success"):
            return True, response_time
        
        return False, None
    
    async def get_node_info(self) -> Dict[str, Any]:
        """Get detailed node information including CPU and memory"""
        api = f"http://{self.address}/sync/get-status"
        data = {
            "tunnel_address": self.tunnel_address,
            "protocol": self.protocol,
            "ovpn_port": self.ovpn_port,
            "set_new_setting": self.set_new_setting
        }
        
        response, response_time = await self._make_request("POST", api, data)
        
        if response and response.get("success"):
            node_data = response.get("data", {})
            node_data["response_time"] = response_time
            return node_data
        
        return {}
    
    async def create_user(self, name: str) -> bool:
        """Create user on node"""
        api = f"http://{self.address}/sync/create-user"
        data = {"name": name}
        
        response, _ = await self._make_request("POST", api, data)
        
        if response and response.get("success"):
            return True
        else:
            if response:
                print(f"Failed to create user on node {self.address}: {response.get('msg')}")
            return False
    
    async def delete_user(self, name: str) -> bool:
        """Delete user from node"""
        api = f"http://{self.address}/sync/delete-user"
        data = {"name": name}
        
        response, _ = await self._make_request("POST", api, data)
        
        if response and response.get("success"):
            return True
        else:
            if response:
                print(f"Failed to delete user on node {self.address}: {response.get('msg')}")
            return False
    
    async def download_ovpn_client(self, name: str) -> Optional[bytes]:
        """
        Download OVPN client configuration
        Returns bytes of the OVPN file or None
        """
        api = f"http://{self.address}/sync/download/ovpn/{name}"
        
        try:
            from js import fetch
            
            headers = {"key": self.api_key}
            response = await fetch(api, {"method": "GET", "headers": headers})
            
            if response.status == 200:
                # Get response as bytes
                array_buffer = await response.arrayBuffer()
                # Convert to Python bytes
                from js import Uint8Array
                uint8_array = Uint8Array.new(array_buffer)
                content = bytes(uint8_array)
                return content
            
            print(f"Error downloading OVPN client from node {self.address}")
            return None
            
        except Exception as e:
            print(f"Exception downloading OVPN from {self.address}: {e}")
            return None
    
    async def get_all_users(self) -> list:
        """Get all users from node"""
        api = f"http://{self.address}/sync/users"
        
        response, _ = await self._make_request("GET", api)
        
        if response and response.get("success"):
            return response.get("data", [])
        else:
            if response:
                print(f"Failed to get users from node {self.address}: {response.get('msg')}")
            return []



