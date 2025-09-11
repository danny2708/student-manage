from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.payroll_model import PaymentStatus

class PayrollBase(BaseModel):
    teacher_user_id: int
    month: int
    total_base_salary: float = 0.0
    reward_bonus: float = 0.0
    sent_at: datetime
    payment_status: PaymentStatus = Field("paid")

    class Config:
        from_attributes = True

class PayrollCreate(PayrollBase):
    pass


class PayrollUpdate(BaseModel):
    month: Optional[int] = None
    total_base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    sent_at: Optional[datetime] = None
    payment_status: Optional[PaymentStatus] = None
    class Config:
        from_attributes = True


class Payroll(PayrollBase):
    payroll_id: int
    total: float   # chỉ xuất hiện ở response
    payment_status: PaymentStatus 
    
    class Config:
        from_attributes = True

class PayrollView(BaseModel):
    id: int
    teacher: str
    base_salary: float
    bonus: float
    total: float
    status: PaymentStatus
    sent_at: datetime
