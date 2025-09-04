# app/schemas/parent_schema.py
from pydantic import BaseModel

class ParentBase(BaseModel):
    user_id: int

    class Config:
        from_attributes = True


class ParentUpdate(ParentBase):
    pass

class ParentCreate(ParentBase):
    pass


