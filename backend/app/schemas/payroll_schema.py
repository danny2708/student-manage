from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PayrollBase(BaseModel):
    month: date = Field(..., example="2023-01-01", description="Chỉ tháng và năm là quan trọng.")
    base_salary: float = Field(..., example=45000.0)
    reward_bonus: float = Field(..., example=5000.0)
    total: float = Field(..., example=50000.0)
    sent_date: date = Field(..., example="2023-01-31")

class PayrollCreate(PayrollBase):
    user_id: int = Field(..., example=4)

class PayrollUpdate(PayrollBase):
    month: Optional[date] = None
    base_salary: Optional[float] = None
    reward_bonus: Optional[float] = None
    total: Optional[float] = None
    sent_date: Optional[date] = None
    user_id: Optional[int] = None

class Payroll(PayrollBase):
    payroll_id: int = Field(..., example=1)
    user_id: int = Field(..., example=4)

    class Config:
        from_attributes = True

