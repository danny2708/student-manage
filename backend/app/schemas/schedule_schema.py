from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import time, date as dt_date
from enum import Enum

# Định nghĩa Enum cho các ngày trong tuần
class DayOfWeekEnum(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"

# Định nghĩa Enum mới cho loại lịch
class ScheduleTypeEnum(str, Enum):
    WEEKLY = "WEEKLY"
    ONE_OFF = "ONE_OFF"

# ScheduleBase là schema cơ bản chứa các trường chung
class ScheduleBase(BaseModel):
    class_id: int
    start_time: time
    end_time: time
    
    # Trường để xác định loại lịch
    schedule_type: ScheduleTypeEnum

    # Trường 'room'
    room: Optional[str] = None

    # day_of_week và date là tùy chọn (Optional)
    # Vì một lịch chỉ có thể là tuần lặp lại hoặc đột xuất, không thể là cả hai
    day_of_week: Optional[DayOfWeekEnum] = None
    date: Optional[dt_date] = None

    @field_validator('day_of_week')
    @classmethod
    def validate_weekly_schedule(cls, value, info):
        """
        Validator này đảm bảo day_of_week phải được cung cấp cho lịch WEEKLY.
        """
        if info.data.get('schedule_type') == ScheduleTypeEnum.WEEKLY:
            if value is None:
                raise ValueError('day_of_week must be provided for a WEEKLY schedule')
        return value

    @field_validator('date')
    @classmethod
    def validate_one_off_schedule(cls, value, info):
        """
        Validator này đảm bảo date phải được cung cấp cho lịch ONE_OFF.
        """
        if info.data.get('schedule_type') == ScheduleTypeEnum.ONE_OFF:
            if value is None:
                raise ValueError('date must be provided for a ONE_OFF schedule')
        return value

# ScheduleCreate để tạo một lịch mới
# Người dùng phải cung cấp schedule_type và một trong hai trường day_of_week hoặc date
class ScheduleCreate(ScheduleBase):
    pass

# ScheduleUpdate để cập nhật một lịch hiện có
# Tất cả các trường đều tùy chọn để có thể cập nhật từng phần
class ScheduleUpdate(ScheduleBase):
    pass

# Schedule là schema đại diện cho dữ liệu đã được lưu
class Schedule(ScheduleBase):
    schedule_id: int

    class Config:
        from_attributes = True

