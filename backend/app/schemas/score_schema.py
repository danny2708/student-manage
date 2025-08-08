from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ScoreBase(BaseModel):
    student_id: int = Field(..., example=1)
    subject_id: int = Field(..., example=1)
    score: float = Field(..., example=8.5)
    score_date: date = Field(..., example="2023-10-26")

class ScoreCreate(ScoreBase):
    pass

class ScoreUpdate(ScoreBase):
    student_id: Optional[int] = None
    subject_id: Optional[int] = None
    score: Optional[float] = None
    score_date: Optional[date] = None

class Score(ScoreBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True