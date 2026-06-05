from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

DB_PATH = "docmind_local.db"
# If running as a packaged app, we might need to adjust the path to the app's local app data dir.
# For the MVP, we use the local directory.

engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    document_type = Column(String, default="Unknown") # Invoice, Resume, etc.
    classification_confidence = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Processing, Completed, Error
    total_pages = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class ExtractionResult(Base):
    __tablename__ = "extraction_results"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, index=True)
    raw_text = Column(Text, default="")
    json_structured = Column(JSON, default={})
    tables = Column(JSON, default=[]) # Store table structures
    images = Column(JSON, default=[]) # Store paths to extracted images

def init_db():
    Base.metadata.create_all(bind=engine)
