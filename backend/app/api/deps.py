# app/api/deps.py
from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """Dependency để lấy phiên cơ sở dữ liệu."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



