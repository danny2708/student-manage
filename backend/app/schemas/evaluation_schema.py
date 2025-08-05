from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class EvaluationBase(BaseModel):
    student_id: int = Field(..., example=1)
    description: Optional[str] = Field(None, example="Học sinh tích cực tham gia hoạt động nhóm.")
    type: str = Field(..., example="Behavior", description="Loại đánh giá: Behavior, Academic Progress, Participation")
    score: Optional[float] = Field(None, example=9.0)
    date_recorded: date = Field(..., example="2023-11-01")

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(EvaluationBase):
    student_id: Optional[int] = None
    description: Optional[str] = None
    type: Optional[str] = None
    score: Optional[float] = None
    date_recorded: Optional[date] = None

class Evaluation(BaseModel): # Changed from EvaluationBase to BaseModel for the final output schema
    evaluation_id: int = Field(..., example=1)
    student_id: int = Field(..., example=1)
    description: Optional[str] = Field(None, example="Học sinh tích cực tham gia hoạt động nhóm.")
    type: str = Field(..., example="Behavior", description="Loại đánh giá: Behavior, Academic Progress, Participation")
    score: Optional[float] = Field(None, example=9.0)
    date_recorded: date = Field(..., example="2023-11-01")

    class Config:
        from_attributes = True
