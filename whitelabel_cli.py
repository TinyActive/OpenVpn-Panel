#!/usr/bin/env python3
"""
White-Label Instance Management CLI Tool

Command-line interface for managing OV-Panel white-label instances.
"""

import argparse
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.db.engine import sessionLocal
from backend.whitelabel.manager import WhiteLabelManager
from backend.whitelabel.systemd_service import SystemdServiceManager
from backend.db.models import WhiteLabelInstance
from colorama import Fore, Style, init

init(autoreset=True)


def list_instances():
    """List all white-label instances."""
    db = sessionLocal()
    try:
        instances = WhiteLabelManager.list_instances(db)
        
        if not instances:
            print(f"{Fore.YELLOW}No instances found.{Style.RESET_ALL}")
            return
        
        print(f"\n{Fore.CYAN}White-Label Instances:{Style.RESET_ALL}\n")
        print(f"{'ID':<40} {'Name':<20} {'Port':<8} {'Status':<10}")
        print("-" * 80)
        
        for instance in instances:
            systemd_status = SystemdServiceManager.get_instance_status(instance.instance_id)
            status_color = Fore.GREEN if systemd_status == "active" else Fore.RED
            print(f"{instance.instance_id:<40} {instance.name:<20} {instance.port:<8} {status_color}{systemd_status or 'unknown'}{Style.RESET_ALL}")
        
        print()
    finally:
        db.close()


def create_instance(name, username, password, port, has_openvpn=False):
    """Create a new white-label instance."""
    db = sessionLocal()
    try:
        print(f"\n{Fore.YELLOW}Creating instance '{name}'...{Style.RESET_ALL}")
        
        instance = WhiteLabelManager.create_instance(
            db=db,
            name=name,
            admin_username=username,
            admin_password=password,
            port=port,
            has_openvpn=has_openvpn,
        )
        
        if instance:
            print(f"{Fore.GREEN}Instance created successfully!{Style.RESET_ALL}")
            print(f"Instance ID: {instance.instance_id}")
            print(f"Name: {instance.name}")
            print(f"Port: {instance.port}")
            print(f"Admin Username: {instance.admin_username}")
            print(f"Has OpenVPN: {instance.has_openvpn}")
        else:
            print(f"{Fore.RED}Failed to create instance.{Style.RESET_ALL}")
            sys.exit(1)
    finally:
        db.close()


def start_instance(instance_id):
    """Start a white-label instance."""
    db = sessionLocal()
    try:
        print(f"\n{Fore.YELLOW}Starting instance {instance_id}...{Style.RESET_ALL}")
        
        if WhiteLabelManager.start_instance(db, instance_id):
            print(f"{Fore.GREEN}Instance started successfully!{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}Failed to start instance.{Style.RESET_ALL}")
            sys.exit(1)
    finally:
        db.close()


def stop_instance(instance_id):
    """Stop a white-label instance."""
    db = sessionLocal()
    try:
        print(f"\n{Fore.YELLOW}Stopping instance {instance_id}...{Style.RESET_ALL}")
        
        if WhiteLabelManager.stop_instance(db, instance_id):
            print(f"{Fore.GREEN}Instance stopped successfully!{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}Failed to stop instance.{Style.RESET_ALL}")
            sys.exit(1)
    finally:
        db.close()


def restart_instance(instance_id):
    """Restart a white-label instance."""
    print(f"\n{Fore.YELLOW}Restarting instance {instance_id}...{Style.RESET_ALL}")
    
    if SystemdServiceManager.restart_instance(instance_id):
        print(f"{Fore.GREEN}Instance restarted successfully!{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}Failed to restart instance.{Style.RESET_ALL}")
        sys.exit(1)


def delete_instance(instance_id, force=False):
    """Delete a white-label instance."""
    db = sessionLocal()
    try:
        if not force:
            confirm = input(f"{Fore.YELLOW}Are you sure you want to delete instance {instance_id}? (yes/no): {Style.RESET_ALL}")
            if confirm.lower() not in ["yes", "y"]:
                print(f"{Fore.YELLOW}Deletion cancelled.{Style.RESET_ALL}")
                return
        
        print(f"\n{Fore.YELLOW}Deleting instance {instance_id}...{Style.RESET_ALL}")
        
        if WhiteLabelManager.delete_instance(db, instance_id):
            print(f"{Fore.GREEN}Instance deleted successfully!{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}Failed to delete instance.{Style.RESET_ALL}")
            sys.exit(1)
    finally:
        db.close()


def get_instance_info(instance_id):
    """Get detailed information about an instance."""
    db = sessionLocal()
    try:
        instance = db.query(WhiteLabelInstance).filter(
            WhiteLabelInstance.instance_id == instance_id
        ).first()
        
        if not instance:
            print(f"{Fore.RED}Instance not found.{Style.RESET_ALL}")
            sys.exit(1)
        
        stats = WhiteLabelManager.get_instance_stats(instance_id)
        systemd_status = SystemdServiceManager.get_instance_status(instance_id)
        
        print(f"\n{Fore.CYAN}Instance Information:{Style.RESET_ALL}\n")
        print(f"Instance ID: {instance.instance_id}")
        print(f"Name: {instance.name}")
        print(f"Port: {instance.port}")
        print(f"Admin Username: {instance.admin_username}")
        print(f"Has OpenVPN: {instance.has_openvpn}")
        print(f"Status: {instance.status}")
        print(f"Systemd Status: {systemd_status or 'unknown'}")
        print(f"Created At: {instance.created_at}")
        print(f"Updated At: {instance.updated_at}")
        
        if stats:
            print(f"\n{Fore.CYAN}Statistics:{Style.RESET_ALL}")
            print(f"Output Log Size: {stats.get('output_log_size', 0)} bytes")
            print(f"Error Log Size: {stats.get('error_log_size', 0)} bytes")
        
        print()
    finally:
        db.close()


def initialize_system():
    """Initialize the white-label system."""
    print(f"\n{Fore.YELLOW}Initializing white-label system...{Style.RESET_ALL}")
    
    if not WhiteLabelManager.initialize_shared_directory():
        print(f"{Fore.RED}Failed to initialize shared directory.{Style.RESET_ALL}")
        sys.exit(1)
    
    if not SystemdServiceManager.create_service_template():
        print(f"{Fore.RED}Failed to create systemd service template.{Style.RESET_ALL}")
        sys.exit(1)
    
    print(f"{Fore.GREEN}White-label system initialized successfully!{Style.RESET_ALL}")


def main():
    parser = argparse.ArgumentParser(
        description="White-Label Instance Management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s list
  %(prog)s create --name "Instance A" --username admin --password secret --port 9001
  %(prog)s start --instance-id <uuid>
  %(prog)s stop --instance-id <uuid>
  %(prog)s restart --instance-id <uuid>
  %(prog)s delete --instance-id <uuid>
  %(prog)s info --instance-id <uuid>
  %(prog)s init
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # List command
    subparsers.add_parser("list", help="List all instances")
    
    # Create command
    create_parser = subparsers.add_parser("create", help="Create a new instance")
    create_parser.add_argument("--name", required=True, help="Instance name")
    create_parser.add_argument("--username", required=True, help="Admin username")
    create_parser.add_argument("--password", required=True, help="Admin password")
    create_parser.add_argument("--port", type=int, required=True, help="Port number")
    create_parser.add_argument("--with-openvpn", action="store_true", help="Install OpenVPN")
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start an instance")
    start_parser.add_argument("--instance-id", required=True, help="Instance ID")
    
    # Stop command
    stop_parser = subparsers.add_parser("stop", help="Stop an instance")
    stop_parser.add_argument("--instance-id", required=True, help="Instance ID")
    
    # Restart command
    restart_parser = subparsers.add_parser("restart", help="Restart an instance")
    restart_parser.add_argument("--instance-id", required=True, help="Instance ID")
    
    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete an instance")
    delete_parser.add_argument("--instance-id", required=True, help="Instance ID")
    delete_parser.add_argument("--force", action="store_true", help="Skip confirmation")
    
    # Info command
    info_parser = subparsers.add_parser("info", help="Get instance information")
    info_parser.add_argument("--instance-id", required=True, help="Instance ID")
    
    # Initialize command
    subparsers.add_parser("init", help="Initialize white-label system")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Execute command
    if args.command == "list":
        list_instances()
    elif args.command == "create":
        create_instance(args.name, args.username, args.password, args.port, args.with_openvpn)
    elif args.command == "start":
        start_instance(args.instance_id)
    elif args.command == "stop":
        stop_instance(args.instance_id)
    elif args.command == "restart":
        restart_instance(args.instance_id)
    elif args.command == "delete":
        delete_instance(args.instance_id, args.force)
    elif args.command == "info":
        get_instance_info(args.instance_id)
    elif args.command == "init":
        initialize_system()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Operation cancelled.{Style.RESET_ALL}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Fore.RED}Error: {e}{Style.RESET_ALL}")
        sys.exit(1)

