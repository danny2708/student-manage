# app/schemas/manager_schema.py
from pydantic import BaseModel
from typing import Optional

class ManagerBase(BaseModel):
    manager_user_id: int

    class Config:
        from_attributes = True

class ManagerCreate(ManagerBase):
    pass

class ManagerUpdate(BaseModel):
    manager_user_id: Optional[int] = None

    class Config:
        from_attributes = True

class ManagerRead(ManagerBase):
    """Schema khi đọc từ DB"""
    manager_user_id: int

    class Config:
        from_attributes = True
