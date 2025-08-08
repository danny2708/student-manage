from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TuitionBase(BaseModel):
    student_id: int = Field(..., example=1)
    amount: float = Field(..., example=1500.00)
    payment_date: date = Field(..., example="2023-10-26")
    is_paid: bool = Field(False, example=True)

class TuitionCreate(TuitionBase):
    pass

class TuitionUpdate(TuitionBase):
    student_id: Optional[int] = None
    amount: Optional[float] = None
    payment_date: Optional[date] = None
    is_paid: Optional[bool] = None

class Tuition(TuitionBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True