# app/api/v1/endpoints/teacherpoint_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations và schemas
from app.crud import teacherpoint_crud
from app.crud import teacher_crud  # Giả định có một crud cho teacher
from app.schemas import teacherpoint_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=teacherpoint_schema.TeacherPoint, status_code=status.HTTP_201_CREATED)
def create_new_teacher_point(teacher_point_in: teacherpoint_schema.TeacherPointCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi điểm thưởng/phạt giáo viên mới.
    """
    # Bước 1: Kiểm tra xem teacher_id có tồn tại không
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_point_in.teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {teacher_point_in.teacher_id} not found."
        )
        
    # Bước 2: Tạo bản ghi điểm thưởng/phạt
    return teacherpoint_crud.create_teacher_point(db=db, teacher_point=teacher_point_in)

@router.get("/", response_model=List[teacherpoint_schema.TeacherPoint])
def read_all_teacher_points(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi điểm thưởng/phạt giáo viên.
    """
    teacher_points = teacherpoint_crud.get_all_teacher_points(db, skip=skip, limit=limit)
    return teacher_points

@router.get("/{point_id}", response_model=teacherpoint_schema.TeacherPoint)
def read_teacher_point(point_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = teacherpoint_crud.get_teacher_point(db, point_id=point_id)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    return db_teacher_point

@router.put("/{point_id}", response_model=teacherpoint_schema.TeacherPoint)
def update_existing_teacher_point(point_id: int, teacher_point_update: teacherpoint_schema.TeacherPointUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = teacherpoint_crud.update_teacher_point(db, point_id=point_id, teacher_point_update=teacher_point_update)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    return db_teacher_point

@router.delete("/{point_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_teacher_point(point_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi điểm thưởng/phạt giáo viên cụ thể bằng ID.
    """
    db_teacher_point = teacherpoint_crud.delete_teacher_point(db, point_id=point_id)
    if db_teacher_point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Điểm thưởng/phạt giáo viên không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
