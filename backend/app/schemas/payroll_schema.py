# app/schemas/payroll_schema.py
from typing import Optional
from pydantic import BaseModel
from datetime import date

class PayrollBase(BaseModel):
    teacher_id: int
    month: int
    base_salary: float
    reward_bonus: float
    total: float
    sent_date: date

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    month: Optional[int] = None
    base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    total: Optional[float] = None
    sent_date: Optional[date] = None

class Payroll(PayrollBase):
    payroll_id: int

    class Config:
        from_attributes = True