from pydantic import BaseModel, Field
from typing import Optional

class Stats(BaseModel):
    total_classes: int
    total_teachers: int
    total_students: int
    total_schedules: int

    class Config:
        from_attributes = True

class SubjectStats(BaseModel):
    subject_id: int
    subject_name: str
    total_classes: int

    class Config:
        from_attributes = True