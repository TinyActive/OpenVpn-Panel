import uvicorn
import os
from pathlib import Path
from backend.config import config


def load_instance_env():
    """
    Load environment file for white-label instance if INSTANCE_ID is set.
    This allows each instance to have its own configuration.
    """
    instance_id = os.getenv("INSTANCE_ID")
    
    if instance_id:
        # Load instance-specific .env file
        instance_env_file = Path(f"/opt/ov-panel-instances/instance-{instance_id}/.env.{instance_id}")
        
        if instance_env_file.exists():
            # Load environment variables from instance .env file
            from dotenv import load_dotenv
            load_dotenv(instance_env_file, override=True)
            print(f"Loaded configuration for instance: {instance_id}")
        else:
            print(f"Warning: Instance env file not found: {instance_env_file}")


def main():
    # Load instance-specific environment if applicable
    load_instance_env()
    
    # Reload config after loading instance env
    from backend.config import Setting
    instance_config = Setting()
    
    uvicorn.run(
        "backend.app:api",
        host=str(instance_config.HOST),
        port=instance_config.PORT,
        reload=False,  # Disable reload for production instances
        ssl_keyfile=instance_config.SSL_KEYFILE,
        ssl_certfile=instance_config.SSL_CERTFILE,
    )


if __name__ == "__main__":
    main()
