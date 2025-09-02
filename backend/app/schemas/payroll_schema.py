# app/schemas/payroll_schema.py
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PayrollBase(BaseModel):
    teacher_user_id: int
    month: int
    base_salary: float
    reward_bonus: float
    total: float
    sent_at: datetime

    class Config:
        from_attributes = True

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    month: Optional[int] = None
    base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    total: Optional[float] = None
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Payroll(PayrollBase):
    payroll_id: int

    class Config:
        from_attributes = True
