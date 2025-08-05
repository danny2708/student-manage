from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TuitionBase(BaseModel):
    student_id: int = Field(..., example=1)
    amount: float = Field(..., example=1500000.0)
    due_date: date = Field(..., example="2024-01-01")
    status: str = Field(..., example="Pending")
    sent_date: date = Field(..., example="2023-12-20")

class TuitionCreate(TuitionBase):
    pass

class TuitionUpdate(TuitionBase):
    student_id: Optional[int] = None
    amount: Optional[float] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    sent_date: Optional[date] = None

class Tuition(TuitionBase):
    tuition_id: int = Field(..., example=1)

    class Config:
        from_attributes = True

