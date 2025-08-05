from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import student_crud as crud_student
from app.schemas import student_schema as schemas_student
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_student.Student, status_code=status.HTTP_201_CREATED)
def create_new_student(student: schemas_student.StudentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một học sinh mới.
    """
    existing_student = crud_student.get_student_by_user_id(db, user_id=student.user_id)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một học sinh khác."
        )
    return crud_student.create_student(db=db, student=student)

@router.get("/", response_model=List[schemas_student.Student])
def read_all_students(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả học sinh.
    """
    students = crud_student.get_all_students(db, skip=skip, limit=limit)
    return students

@router.get("/{student_id}", response_model=schemas_student.Student)
def read_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một học sinh cụ thể bằng ID.
    """
    db_student = crud_student.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.put("/{student_id}", response_model=schemas_student.Student)
def update_existing_student(student_id: int, student: schemas_student.StudentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một học sinh cụ thể bằng ID.
    """
    db_student = crud_student.update_student(db, student_id=student_id, student_update=student)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một học sinh cụ thể bằng ID.
    """
    db_student = crud_student.delete_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return {"message": "Học sinh đã được xóa thành công."}

