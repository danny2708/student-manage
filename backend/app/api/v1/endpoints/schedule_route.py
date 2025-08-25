# app/api/v1/endpoints/schedule_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as dt_date, time as dt_time

# Tự động nhập tất cả các module cần thiết
from app.crud import schedule_crud, class_crud
from app.schemas import schedule_schema
from app.api import deps
from app.models.schedule_model import DayOfWeekEnum, ScheduleTypeEnum

# Import service layer
from app.services import schedule_service

router = APIRouter()

@router.post("/schedules/", response_model=schedule_schema.Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule_route(
    schedule_in: schedule_schema.ScheduleCreate, 
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một lịch trình mới sau khi kiểm tra xung đột.
    """
    # Lấy đối tượng Class từ database để kiểm tra tồn tại và đảm bảo integrity
    # Đã sửa lỗi: Dùng class_crud.get_class thay vì get_class_by_id
    db_class = class_crud.get_class(db, class_id=schedule_in.class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {schedule_in.class_id} not found."
        )

    # Gọi service layer để xử lý logic tạo lịch, bao gồm cả kiểm tra xung đột
    try:
        db_schedule = schedule_service.create_schedule(db=db, schedule_in=schedule_in)
        return db_schedule
    except HTTPException as e:
        # Re-raise HTTPException để FastAPI xử lý
        raise e

@router.get("/schedules/", response_model=List[schedule_schema.Schedule])
def search_schedules_route(
    db: Session = Depends(deps.get_db),
    class_id: Optional[int] = Query(None, description="Lọc theo ID lớp học"),
    schedule_type: Optional[ScheduleTypeEnum] = Query(None, description="Lọc theo loại lịch trình (WEEKLY hoặc ONE_OFF)"),
    day_of_week: Optional[DayOfWeekEnum] = Query(None, description="Lọc theo ngày trong tuần"),
    date: Optional[dt_date] = Query(None, description="Lọc theo ngày cụ thể"),
    room: Optional[str] = Query(None, description="Lọc theo phòng học")
):
    """
    Tìm kiếm và lấy danh sách các lịch trình với các tùy chọn lọc.
    """
    schedules = schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        schedule_type=schedule_type,
        day_of_week=day_of_week,
        date=date,
        room=room
    )
    # Trả về danh sách rỗng nếu không tìm thấy kết quả, thay vì 404
    return schedules

@router.get("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def get_schedule_route(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    return db_schedule

@router.put("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def update_existing_schedule_route(
    schedule_id: int, 
    schedule_update: schedule_schema.ScheduleUpdate, 
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin của một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )

    updated_schedule = schedule_crud.update_schedule(db, schedule=db_schedule, schedule_in=schedule_update)
    return updated_schedule

@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_schedule_route(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.get_schedule_by_id(db, schedule_id=schedule_id)
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    
    schedule_crud.delete_schedule(db, schedule=db_schedule)
    return

@router.get("/teachers/{teacher_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_teacher_schedules_route(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách các lịch trình của một giáo viên cụ thể.
    """
    schedules = schedule_service.get_schedules_for_teacher(db=db, teacher_id=teacher_id)
    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho giáo viên này."
        )
    return schedules

@router.get("/students/{student_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_student_schedules_route(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách các lịch trình của một sinh viên cụ thể.
    """
    schedules = schedule_service.get_schedules_for_student(db=db, student_id=student_id)
    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho sinh viên này."
        )
    return schedules
