from pydantic import BaseModel, Field
from typing import Optional

class Stats(BaseModel):
    total_class: int
    total_teacher: int
    total_student: int
    total_schedule: int

    class Config:
        from_attributes = True