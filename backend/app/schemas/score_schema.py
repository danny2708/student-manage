from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
                
class ScoreBase(BaseModel):
    student_id: int = Field(..., example=1)
    subject_id: int = Field(..., example=1)
    score: float = Field(..., example=8.5)
    exam_date: date = Field(..., example="2023-12-15")

class ScoreCreate(ScoreBase):
    pass

class ScoreUpdate(ScoreBase):
    student_id: Optional[int] = None
    subject_id: Optional[int] = None
    score: Optional[float] = None
    exam_date: Optional[date] = None

class Score(ScoreBase):
    score_id: int = Field(..., example=1)

    class Config:
        from_attributes = True