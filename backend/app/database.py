import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

def get_database_url(db_path="sqlite.db"):
    """
    Function to get the database URL.
    Constructs the path to the database file relative to the project root.
    """
    # Get the directory of the current file
    current_dir = os.path.dirname(os.path.abspath(__file__))

    # Construct the path to the root of the project
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))

    # Construct the full path to the database file
    db_full_path = os.path.join(project_root, db_path)

    return f"sqlite:///{db_full_path}"

# SQLite database URL
SQLALCHEMY_DATABASE_URL = get_database_url()

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Only needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
