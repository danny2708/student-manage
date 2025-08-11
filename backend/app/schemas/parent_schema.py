# app/schemas/Parent_schema.py
from datetime import datetime
from pydantic import BaseModel

class ParentBase(BaseModel):
    user_id: int

    class Config:
        from_attributes = True
        
class ParentCreate(ParentBase):
    pass

class ParentUpdate(BaseModel):
    user_id: int | None = None

class Parent(ParentBase):
    parent_id: int
    user_id: int

    class Config:
        from_attributes = True

class ParentAssign(ParentBase):
    user_id: int