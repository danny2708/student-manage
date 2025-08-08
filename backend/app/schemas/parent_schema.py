from pydantic import BaseModel, Field

class ParentBase(BaseModel):
    user_id: int = Field(..., example=1)

class ParentCreate(ParentBase):
    pass

class Parent(ParentBase):
    id: int = Field(..., example=1)

class ParentUpdate(ParentBase):
    pass
    
    class Config:
        from_attributes = True