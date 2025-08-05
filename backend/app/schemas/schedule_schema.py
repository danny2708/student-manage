from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, time 
    
class ScheduleBase(BaseModel):
    class_id: int = Field(..., example=1)
    day_of_week: str = Field(..., example="Monday", description="Thứ trong tuần: Monday, Tuesday, ...")
    start_time: time = Field(..., example="08:00:00", description="Thời gian bắt đầu (chỉ giờ và phút)")
    end_time: time = Field(..., example="09:30:00", description="Thời gian kết thúc (chỉ giờ và phút)")

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(ScheduleBase):
    class_id: Optional[int] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class Schedule(ScheduleBase):
    schedule_id: int = Field(..., example=1)

    class Config:
        from_attributes = True
