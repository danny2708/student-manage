from pydantic import BaseModel, Field
from typing import Optional

class ManagerBase(BaseModel):
    name: str = Field(..., example="Le Thi B")

class ManagerCreate(ManagerBase):
    user_id: int = Field(..., example=3)

class ManagerUpdate(ManagerBase):
    name: Optional[str] = None
    user_id: Optional[int] = None

class Manager(ManagerBase):
    manager_id: int = Field(..., example=1)
    user_id: int = Field(..., example=3)

    class Config:
        from_attributes = True

