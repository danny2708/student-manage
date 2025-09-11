from pydantic import BaseModel, Field
from typing import Optional

class Stats(BaseModel):
    total_class: int
    total_teacher: int
    total_student: int
    total_schedule: int

    class Config:
        from_attributes = True

class SubjectStats(BaseModel):
    subject_id: int
    subject_name: str
    total_classes: int

    class Config:
        from_attributes = True