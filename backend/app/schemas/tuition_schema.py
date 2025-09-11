from datetime import date
from typing import Optional
from pydantic import BaseModel, Field
from app.models.tuition_model import PaymentStatus 

class TuitionBase(BaseModel):
    student_user_id: int
    amount: float = Field(..., gt=0)
    term: int
    due_date: date

# Schema dùng để tạo mới
class TuitionCreate(TuitionBase):
    pass

# Schema dùng để đọc dữ liệu từ DB
class TuitionRead(TuitionBase):
    tuition_id: int
    payment_status: PaymentStatus
    payment_date: Optional[date] = None

    class Config:
        from_attributes = True

# Schema dùng để cập nhật chi tiết học phí
class TuitionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    term: Optional[int] = None
    due_date: Optional[date] = None

# Schema dùng để cập nhật trạng thái thanh toán
class TuitionPaymentStatusUpdate(BaseModel):
    payment_status: PaymentStatus  = Field("paid")

class TuitionView(BaseModel):
    id: int
    student: str
    amount: float
    term: int
    status: PaymentStatus
    due_date: date