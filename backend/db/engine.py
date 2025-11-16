from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent


def get_database_url():
    """
    Get database URL based on instance configuration.
    
    For super admin panel: /opt/ov-panel/data/ov-panel.db
    For white-label instances: /opt/ov-panel-instances/instance-{id}/data/ov-panel.db
    For development: ./data/ov-panel.db
    """
    instance_id = os.getenv("INSTANCE_ID")
    
    if instance_id:
        # White-label instance
        db_path = f"/opt/ov-panel-instances/instance-{instance_id}/data/ov-panel.db"
    else:
        # Super admin panel or standalone installation
        db_path = f"{BASE_DIR.parent.parent}/data/ov-panel.db"
    
    return f"sqlite:///{db_path}"


DATABASE_URL = get_database_url()
engin = create_engine(url=DATABASE_URL, connect_args={"check_same_thread": False})

Base = declarative_base()

sessionLocal = sessionmaker(bind=engin, autoflush=False)


def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()
