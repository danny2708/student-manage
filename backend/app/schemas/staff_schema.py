from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class StaffBase(BaseModel):
    name: str = Field(..., example="Nguyen Van A")
    role: str = Field(..., example="Admin Assistant")
    date_of_birth: date = Field(..., example="1990-01-15")
    salary: float = Field(..., example=50000.0)

class StaffCreate(StaffBase):
    user_id: int = Field(..., example=2)

class StaffUpdate(StaffBase):
    name: Optional[str] = None
    role: Optional[str] = None
    date_of_birth: Optional[date] = None
    salary: Optional[float] = None
    user_id: Optional[int] = None # Có thể cập nhật user_id nếu cần chuyển đổi tài khoản

class Staff(StaffBase):
    staff_id: int = Field(..., example=1)
    user_id: int = Field(..., example=2) # Đảm bảo user_id xuất hiện trong response

    class Config:
        from_attributes = True

