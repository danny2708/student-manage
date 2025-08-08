from pydantic import BaseModel, Field
from datetime import time
from typing import Optional

class ScheduleBase(BaseModel):
    class_id: int = Field(..., example=1)
    day_of_week: str = Field(..., example="Monday")
    start_time: time = Field(..., example="08:00:00")
    end_time: time = Field(..., example="09:30:00")

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(ScheduleBase):
    class_id: Optional[int] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class Schedule(ScheduleBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True