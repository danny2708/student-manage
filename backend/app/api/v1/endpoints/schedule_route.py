from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as dt_date, time as dt_time

from app.crud import schedule_crud, class_crud
from app.schemas import schedule_schema
from app.api import deps
from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum

router = APIRouter()

@router.post("/schedules/", response_model=schedule_schema.Schedule, status_code=status.HTTP_201_CREATED)
def create_schedule(
    schedule_in: schedule_schema.ScheduleCreate, 
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một lịch trình mới (định kỳ hoặc đột xuất).
    Dữ liệu được gửi trong body request dưới dạng JSON.
    """
    # Kiểm tra class_id có tồn tại không
    db_class = class_crud.get_class(db, class_id=schedule_in.class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {schedule_in.class_id} not found."
        )

    # Sử dụng schedule_crud để tạo lịch trình từ schema Pydantic
    try:
        db_schedule = schedule_crud.create_schedule(db=db, schedule=schedule_in)
        return db_schedule
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/schedules/", response_model=List[schedule_schema.Schedule])
def search_schedules(
    db: Session = Depends(deps.get_db),
    class_id: Optional[int] = Query(None, description="Lọc theo ID lớp học"),
    schedule_type: Optional[ScheduleTypeEnum] = Query(None, description="Lọc theo loại lịch trình (WEEKLY hoặc ONE_OFF)"),
    day_of_week: Optional[DayOfWeekEnum] = Query(None, description="Lọc theo ngày trong tuần"),
    date: Optional[dt_date] = Query(None, description="Lọc theo ngày cụ thể"),
):
    """
    Tìm kiếm và lấy danh sách các lịch trình với các tùy chọn lọc.
    """
    schedules = schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        schedule_type=schedule_type,
        day_of_week=day_of_week,
        date=date
    )
    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình phù hợp với tiêu chí tìm kiếm."
        )
    return schedules

@router.get("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def get_schedule(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.get_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    return db_schedule

@router.put("/schedules/{schedule_id}", response_model=schedule_schema.Schedule)
def update_existing_schedule(
    schedule_id: int, 
    schedule_update: schedule_schema.ScheduleUpdate, 
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin của một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.update_schedule(db, schedule_id=schedule_id, schedule_update=schedule_update)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    return db_schedule

@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_schedule(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một lịch trình cụ thể bằng ID.
    """
    db_schedule = schedule_crud.delete_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch trình không tìm thấy."
        )
    return

@router.get("/teachers/{teacher_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_teacher_schedules(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách các lịch trình của một giáo viên cụ thể bằng cách truy vấn trung gian qua bảng classes.
    """
    # Bước 1: Lấy danh sách class_id mà giáo viên đó phụ trách
    teacher_classes = class_crud.get_classes_by_teacher_id(db, teacher_id=teacher_id)
    if not teacher_classes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học nào cho giáo viên này."
        )
    
    class_ids = [cls.class_id for cls in teacher_classes]
    
    # Bước 2: Lấy tất cả lịch trình từ các class_id tìm được
    schedules = schedule_crud.get_schedules_by_class_ids(db=db, class_ids=class_ids)

    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho giáo viên này."
        )
    return schedules

# Endpoint mới cho sinh viên xem lịch trình
@router.get("/students/{student_id}/schedules/", response_model=List[schedule_schema.Schedule])
def get_student_schedules(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách các lịch trình của một sinh viên cụ thể bằng cách truy vấn trung gian qua bảng student_classes.
    """
    # Bước 1: Lấy danh sách class_id mà sinh viên đang học
    student_class_ids = schedule_crud.get_student_class_ids(db, student_id=student_id)
    if not student_class_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp học nào cho sinh viên này."
        )

    # Bước 2: Lấy tất cả lịch trình từ các class_id tìm được
    schedules = schedule_crud.get_schedules_by_class_ids(db=db, class_ids=student_class_ids)

    if not schedules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch trình nào cho sinh viên này."
        )
    return schedules
