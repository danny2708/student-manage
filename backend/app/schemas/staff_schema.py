from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho Staff
class StaffBase(BaseModel):
    user_id: int
    role: str
    created_at: datetime = Field(..., example="2023-10-26T14:30:00")

# Schema để tạo Staff mới
class StaffCreate(StaffBase):
    pass

# Schema để đọc/trả về Staff hoàn chỉnh
class Staff(StaffBase):
    id: int

    class Config:
        from_attributes = True

# Schema để cập nhật Staff
class StaffUpdate(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
    created_at: Optional[datetime] = None
