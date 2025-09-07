from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PayrollBase(BaseModel):
    teacher_user_id: int
    month: int
    total_base_salary: float = 0.0
    reward_bonus: float = 0.0
    sent_at: datetime

    class Config:
        from_attributes = True


class PayrollCreate(PayrollBase):
    pass


class PayrollUpdate(BaseModel):
    month: Optional[int] = None
    total_base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Payroll(PayrollBase):
    payroll_id: int
    total: float   # chỉ xuất hiện ở response

    class Config:
        from_attributes = True