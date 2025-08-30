# app/services/schedule_service.py
from datetime import date as dt_date, time as dt_time
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.crud import schedule_crud, class_crud
from app.schemas import schedule_schema
from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from app.schemas.auth_schema import AuthenticatedUser

def validate_day_of_week_with_date(day_of_week: DayOfWeekEnum, date: dt_date):
    """
    Đảm bảo rằng ngày (date) khớp với thứ trong tuần (day_of_week).
    """
    if date is None:
        return
    
    # Python weekday(): Monday=0, Sunday=6
    weekday_map = {
        0: DayOfWeekEnum.MONDAY,
        1: DayOfWeekEnum.TUESDAY,
        2: DayOfWeekEnum.WEDNESDAY,
        3: DayOfWeekEnum.THURSDAY,
        4: DayOfWeekEnum.FRIDAY,
        5: DayOfWeekEnum.SATURDAY,
        6: DayOfWeekEnum.SUNDAY,
    }

    actual_day = weekday_map[date.weekday()]
    if actual_day != day_of_week:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ngày {date} là {actual_day}, không phải {day_of_week}."
        )

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
    #  Check ngày và thứ khớp nhau ---
    validate_day_of_week_with_date(day_of_week, date)

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


def create_schedule(db: Session, schedule_in: schedule_schema.ScheduleCreate, current_user):
    """
    Tạo một lịch trình mới sau khi kiểm tra xung đột và trả về đối tượng Schedule.
    """
    # Check role
    if not any(role in ["manager", "teacher"] for role in current_user.roles):
        raise PermissionError("Bạn không có quyền tạo lịch.")

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

def search_schedules_by_user_role(
    db: Session,
    current_user: AuthenticatedUser,
    class_id: Optional[int] = None,
    schedule_type: Optional[ScheduleTypeEnum] = None,
    day_of_week: Optional[DayOfWeekEnum] = None,
    date: Optional[dt_date] = None,
    room: Optional[str] = None
) -> List[Schedule]:
    """
    Tìm kiếm schedules theo role của user:
      - Manager: thấy tất cả
      - Teacher: chỉ thấy schedules của lớp mình dạy
      - Student: chỉ thấy schedules lớp mình học
      - Parent: chỉ thấy schedules lớp của con mình
    """

    # --- Nếu là Manager: trả về tất cả ---
    if "manager" in current_user.roles:
        return schedule_crud.search_schedules(
            db=db,
            class_id=class_id,
            schedule_type=schedule_type,
            day_of_week=day_of_week,
            date=date,
            room=room
        )

    # --- Nếu là Teacher ---
    if "teacher" in current_user.roles:
        teacher_classes = class_crud.get_classes_by_teacher_id(db, teacher_id=current_user.user_id)
        class_ids = [cls.class_id for cls in teacher_classes]
        return schedule_crud.search_schedules(
            db=db,
            class_ids=class_ids,
            class_id=class_id,
            schedule_type=schedule_type,
            day_of_week=day_of_week,
            date=date,
            room=room
        )

    # --- Nếu là Student ---
    if "student" in current_user.roles:
        class_ids = schedule_crud.get_class_ids_for_student(db, student_id=current_user.user_id)
        return schedule_crud.search_schedules(
            db=db,
            class_ids=class_ids,
            class_id=class_id,
            schedule_type=schedule_type,
            day_of_week=day_of_week,
            date=date,
            room=room
        )

    # --- Nếu là Parent ---
    if "parent" in current_user.roles:
        student_ids = schedule_crud.get_student_ids_by_parent(db, parent_id=current_user.user_id)
        class_ids = []
        for sid in student_ids:
            class_ids.extend(schedule_crud.get_class_ids_for_student(db, student_id=sid))
        return schedule_crud.search_schedules(
            db=db,
            class_ids=class_ids,
            class_id=class_id,
            schedule_type=schedule_type,
            day_of_week=day_of_week,
            date=date,
            room=room
        )

    # --- Default: không có quyền ---
    return []