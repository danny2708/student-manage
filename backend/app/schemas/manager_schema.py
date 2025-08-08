from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho Manager
class ManagerBase(BaseModel):
    user_id: int
    created_at: datetime = Field(..., example="2023-10-26T14:30:00")

# Schema để tạo Manager mới
class ManagerCreate(ManagerBase):
    pass

# Schema để đọc/trả về Manager hoàn chỉnh
class Manager(ManagerBase):
    id: int

    class Config:
        from_attributes = True

# Schema để cập nhật Manager
class ManagerUpdate(BaseModel):
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
