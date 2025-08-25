# app/services/schedule_service.py
from datetime import date as dt_date, time as dt_time
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List

from app.crud import schedule_crud, class_crud
from app.schemas import schedule_schema
from app.models.schedule_model import Schedule, DayOfWeekEnum

def check_schedule_conflict(
    db: Session, 
    class_id: int,
    day_of_week: DayOfWeekEnum, 
    start_time: dt_time, 
    end_time: dt_time, 
    date: dt_date = None,
    room: str = None
):
    """
    Kiểm tra xung đột lịch trình dựa trên hai tiêu chí:
    1. Lịch trình của cùng một lớp học không được chồng chéo.
    2. Lịch trình trong cùng một phòng học không được chồng chéo.
    """

    # --- Kiểm tra xung đột lịch trình của chính lớp học ---
    # Lấy tất cả lịch trình của lớp học này vào ngày/thứ cụ thể
    class_conflicts = schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        day_of_week=day_of_week,
        date=date
    )
    
    for schedule in class_conflicts:
        # Nếu lịch trình tìm thấy là chính lịch trình đang được cập nhật, bỏ qua
        # Logic này hữu ích khi hàm này được sử dụng cho cả tạo và cập nhật
        if (date and schedule.date == date) or (day_of_week and schedule.day_of_week == day_of_week):
             # Kiểm tra xung đột thời gian
            if (schedule.start_time <= start_time < schedule.end_time or
                schedule.start_time < end_time <= schedule.end_time or
                (start_time <= schedule.start_time and end_time >= schedule.end_time)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Lịch trình mới bị chồng chéo với lịch trình đã có của lớp {class_id}."
                )
    
    # --- Kiểm tra xung đột phòng học ---
    # Lấy tất cả lịch trình trong cùng một phòng vào ngày/thứ cụ thể
    if room:
        room_conflicts = schedule_crud.search_schedules(
            db=db,
            room=room,
            day_of_week=day_of_week,
            date=date
        )

        for schedule in room_conflicts:
             # Kiểm tra xung đột thời gian
            if (schedule.start_time <= start_time < schedule.end_time or
                schedule.start_time < end_time <= schedule.end_time or
                (start_time <= schedule.start_time and end_time >= schedule.end_time)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Phòng {room} đã có lịch trình vào thời gian này với lớp {schedule.class_id}."
                )

def create_schedule(db: Session, schedule_in: schedule_schema.ScheduleCreate):
    """
    Tạo một lịch trình mới sau khi kiểm tra xung đột và trả về đối tượng Schedule.
    """
    # Kiểm tra xung đột trước khi tạo
    check_schedule_conflict(
        db=db,
        class_id=schedule_in.class_id,
        day_of_week=schedule_in.day_of_week,
        start_time=schedule_in.start_time,
        end_time=schedule_in.end_time,
        date=schedule_in.date,
        room=schedule_in.room
    )

    # Nếu không có xung đột, tạo lịch trình
    return schedule_crud.create_schedule(db=db, schedule_in=schedule_in)

def get_schedules_for_teacher(db: Session, teacher_id: int) -> List[Schedule]:
    """
    Lấy danh sách các lịch trình của một giáo viên cụ thể.
    """
    teacher_classes = class_crud.get_classes_by_teacher_id(db, teacher_id=teacher_id)
    if not teacher_classes:
        return []
    
    class_ids = [cls.class_id for cls in teacher_classes]
    schedules = schedule_crud.get_schedules_by_class_ids(db=db, class_ids=class_ids)
    return schedules

def get_schedules_for_student(db: Session, student_id: int) -> List[Schedule]:
    """
    Lấy danh sách các lịch trình của một sinh viên cụ thể.
    """
    student_class_ids = schedule_crud.get_class_ids_for_student(db, student_id=student_id)
    if not student_class_ids:
        return []
    
    schedules = schedule_crud.get_schedules_by_class_ids(db=db, class_ids=student_class_ids)
    return schedules
