# app/schemas/Manager_schema.py
from datetime import datetime
from pydantic import BaseModel

class ManagerBase(BaseModel):
    user_id: int
    
    class Config:
        from_attributes = True

class ManagerCreate(ManagerBase):
    pass

class ManagerUpdate(ManagerBase):
    user_id: int | None = None

class Manager(ManagerBase):
    manager_id: int
    user_id: int

class ManagerAssign(BaseModel):
    user_id: int

    class Config:
        from_attributes = True
