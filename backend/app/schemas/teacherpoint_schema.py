from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TeacherPointBase(BaseModel):
    teacher_id: int = Field(..., example=1)
    point_value: float = Field(..., example=10.0, description="Giá trị điểm thưởng/phạt")
    reason: str = Field(..., example="Hoàn thành xuất sắc nhiệm vụ")
    created_at: datetime = Field(..., example="2023-11-05T10:00:00")

class TeacherPointCreate(TeacherPointBase):
    pass

class TeacherPointUpdate(TeacherPointBase):
    teacher_id: Optional[int] = None
    point_value: Optional[float] = None
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

class TeacherPoint(TeacherPointBase):
    point_id: int = Field(..., example=1)

    class Config:
        from_attributes = True

