from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent


def get_database_url():
    """
    Get database URL based on instance configuration.
    
    For white-label instances: Uses INSTANCE_ID env var to locate database
    For super admin/standalone: Uses relative path from BASE_DIR
    """
    instance_id = os.getenv("INSTANCE_ID")
    
    if instance_id:
        # White-label instance - database is in instance-specific directory
        instances_base = os.getenv("OV_INSTANCES_DIR", "/opt/ov-panel-instances")
        db_path = f"{instances_base}/instance-{instance_id}/data/ov-panel.db"
    else:
        # Super admin panel or standalone installation - database is relative to code location
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
