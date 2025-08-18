from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import attendance_crud 
from app.schemas import attendance_schema 
from app.api import deps

router = APIRouter()

@router.post("/", response_model=attendance_schema.Attendance, status_code=status.HTTP_201_CREATED)
def create_new_attendance(attendance: attendance_schema.AttendanceCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi điểm danh mới.
    """
    # Bạn có thể thêm kiểm tra xem student_id và class_id có tồn tại không
    return attendance_crud.create_attendance(db=db, attendance=attendance)

@router.get("/", response_model=List[attendance_schema.Attendance])
def get_all_attendances(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi điểm danh.
    """
    attendances = attendance_crud.get_all_attendances(db, skip=skip, limit=limit)
    return attendances

@router.get("/{attendance_id}", response_model=attendance_schema.Attendance)
def get_attendance(attendance_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi điểm danh cụ thể bằng ID.
    """
    db_attendance = attendance_crud.get_attendance(db, attendance_id=attendance_id)
    if db_attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm danh không tìm thấy."
        )
    return db_attendance

@router.put("/{attendance_id}", response_model=attendance_schema.Attendance)
def update_existing_attendance(attendance_id: int, attendance: attendance_schema.AttendanceUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi điểm danh cụ thể bằng ID.
    """
    db_attendance = attendance_crud.update_attendance(db, attendance_id=attendance_id, attendance_update=attendance)
    if db_attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm danh không tìm thấy."
        )
    return db_attendance

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_attendance(attendance_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi điểm danh cụ thể bằng ID.
    """
    db_attendance = attendance_crud.delete_attendance(db, attendance_id=attendance_id)
    if db_attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm danh không tìm thấy."
        )
    return {"message": "Điểm danh đã được xóa thành công."}

