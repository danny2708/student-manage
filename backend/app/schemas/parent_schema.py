# app/schemas/parent_schema.py
from pydantic import BaseModel
from typing import Optional

class ParentBase(BaseModel):
    user_id: int

    class Config:
        from_attributes = True

class ParentCreate(ParentBase):
    pass

class ParentUpdate(BaseModel):
    pass

class Parent(ParentBase):
    parent_id: int

    class Config:
        from_attributes = True

class ParentAssign(BaseModel):
    user_id: int


