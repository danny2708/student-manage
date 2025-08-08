from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class EvaluationBase(BaseModel):
    score_id: int = Field(..., example=1)
    evaluation_date: date = Field(..., example="2023-10-26")
    # Các trường khác có thể thêm vào đây

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(EvaluationBase):
    score_id: Optional[int] = None
    evaluation_date: Optional[date] = None

class Evaluation(EvaluationBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True