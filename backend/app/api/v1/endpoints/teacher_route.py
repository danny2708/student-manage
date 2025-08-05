# app/api/v1/endpoints/teacher_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import teacher_crud as crud_teacher
from app.schemas import teacher_schema as schemas_teacher
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_teacher.Teacher, status_code=status.HTTP_201_CREATED)
def create_new_teacher(teacher: schemas_teacher.TeacherCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một giáo viên mới.
    """
    db_teacher_by_email = crud_teacher.get_teacher_by_email(db, email=teacher.email)
    if db_teacher_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại."
        )
    existing_teacher = crud_teacher.get_teacher_by_user_id(db, user_id=teacher.user_id)
    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một giáo viên khác."
        )
    return crud_teacher.create_teacher(db=db, teacher=teacher)

@router.get("/", response_model=List[schemas_teacher.Teacher])
def read_all_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả giáo viên.
    """
    teachers = crud_teacher.get_all_teachers(db, skip=skip, limit=limit)
    return teachers

@router.get("/{teacher_id}", response_model=schemas_teacher.Teacher)
def read_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một giáo viên cụ thể bằng ID.
    """
    db_teacher = crud_teacher.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher

@router.put("/{teacher_id}", response_model=schemas_teacher.Teacher)
def update_existing_teacher(teacher_id: int, teacher: schemas_teacher.TeacherUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một giáo viên cụ thể bằng ID.
    """
    db_teacher = crud_teacher.update_teacher(db, teacher_id=teacher_id, teacher_update=teacher)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher

@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một giáo viên cụ thể bằng ID.
    """
    db_teacher = crud_teacher.delete_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return {"message": "Giáo viên đã được xóa thành công."}

