from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PayrollBase(BaseModel):
    staff_id: int = Field(..., example=1)
    amount: float = Field(..., example=5000.00)
    payment_date: date = Field(..., example="2023-10-26")

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(PayrollBase):
    staff_id: Optional[int] = None
    amount: Optional[float] = None
    payment_date: Optional[date] = None

class Payroll(PayrollBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True
