# app/api/v1/endpoints/schedule_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations và schemas trực tiếp
from app.crud import schedule_crud
from app.crud import class_crud # Giả định rằng có một crud cho class
from app.schemas import schedule_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schedule_schema.Schedule, status_code=status.HTTP_201_CREATED)
def create_new_schedule(schedule_in: schedule_schema.ScheduleCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi lịch học mới.
    """
    # Bước 1: Kiểm tra xem class_id có tồn tại trong bảng classes không
    db_class = class_crud.get_class(db, class_id=schedule_in.class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {schedule_in.class_id} not found."
        )

    # Bước 2: Tạo bản ghi lịch học
    return schedule_crud.create_schedule(db=db, schedule=schedule_in)

@router.get("/", response_model=List[schedule_schema.Schedule])
def get_all_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi lịch học.
    """
    schedules = schedule_crud.get_all_schedules(db, skip=skip, limit=limit)
    return schedules

@router.get("/{schedule_id}", response_model=schedule_schema.Schedule)
def get_schedule(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi lịch học cụ thể bằng ID.
    """
    db_schedule = schedule_crud.get_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch học không tìm thấy."
        )
    return db_schedule

@router.put("/{schedule_id}", response_model=schedule_schema.Schedule)
def update_existing_schedule(schedule_id: int, schedule_update: schedule_schema.ScheduleUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi lịch học cụ thể bằng ID.
    """
    db_schedule = schedule_crud.update_schedule(db, schedule_id=schedule_id, schedule_update=schedule_update)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch học không tìm thấy."
        )
    return db_schedule

@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_schedule(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi lịch học cụ thể bằng ID.
    """
    db_schedule = schedule_crud.delete_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch học không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
