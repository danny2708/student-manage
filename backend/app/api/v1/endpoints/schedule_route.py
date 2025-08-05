from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import schedule_crud as crud_schedule
from app.schemas import schedule_schema as schemas_schedule
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_schedule.Schedule, status_code=status.HTTP_201_CREATED)
def create_new_schedule(schedule: schemas_schedule.ScheduleCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi lịch học mới.
    """
    # Bạn có thể thêm kiểm tra xem class_id có tồn tại không
    return crud_schedule.create_schedule(db=db, schedule=schedule)

@router.get("/", response_model=List[schemas_schedule.Schedule])
def read_all_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi lịch học.
    """
    schedules = crud_schedule.get_all_schedules(db, skip=skip, limit=limit)
    return schedules

@router.get("/{schedule_id}", response_model=schemas_schedule.Schedule)
def read_schedule(schedule_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi lịch học cụ thể bằng ID.
    """
    db_schedule = crud_schedule.get_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch học không tìm thấy."
        )
    return db_schedule

@router.put("/{schedule_id}", response_model=schemas_schedule.Schedule)
def update_existing_schedule(schedule_id: int, schedule: schemas_schedule.ScheduleUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi lịch học cụ thể bằng ID.
    """
    db_schedule = crud_schedule.update_schedule(db, schedule_id=schedule_id, schedule_update=schedule)
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
    db_schedule = crud_schedule.delete_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lịch học không tìm thấy."
        )
    return {"message": "Lịch học đã được xóa thành công."}

