# app/schemas/parent_schema.py
from pydantic import BaseModel
from typing import Optional

class ParentBase(BaseModel):
    parent_user_id: int

    class Config:
        from_attributes = True

class ParentCreate(ParentBase):
    pass

class ParentUpdate(BaseModel):
    parent_user_id: Optional[int] = None

    class Config:
        from_attributes = True

class Parent(ParentBase):
    parent_user_id: int

    class Config:
        from_attributes = True

class ParentAssign(BaseModel):
    parent_user_id: int

    class Config:
        from_attributes = True
