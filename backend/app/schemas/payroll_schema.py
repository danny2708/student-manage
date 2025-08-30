# app/schemas/payroll_schema.py
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PayrollBase(BaseModel):
    teacher_id: int
    month: int
    base_salary: float
    reward_bonus: float
    sent_at: datetime

    @property
    def total(self) -> float:
        return self.base_salary + self.reward_bonus

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    month: Optional[int] = None
    base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    sent_at: Optional[datetime] = None

class Payroll(PayrollBase):
    payroll_id: int

    @property
    def total(self) -> float:
        return self.base_salary + self.reward_bonus

    class Config:
        from_attributes = True

class PayrollOut(BaseModel):
    payroll_id: int
    teacher_id: int
    month: int
    base_salary: float
    reward_bonus: float
    total: float
    sent_at: datetime
    notification_id: int
    notification_content: str
    notification_sent_at: datetime
