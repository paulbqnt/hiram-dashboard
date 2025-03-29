from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

def get_database_url(db_path="sqlite.db"):
    """
    Function to get the database URL.
    You can modify this function to return different database URLs based on your needs.
    """
    return f"sqlite:///{db_path}"



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