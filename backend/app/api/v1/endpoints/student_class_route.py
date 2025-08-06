from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import studentclass_crud as crud_studentclass
from app.schemas.studentclass_schema import StudentClass, StudentClassCreate, StudentClassUpdate
from app.api import deps

router = APIRouter()

@router.post("/", response_model=StudentClass, status_code=status.HTTP_201_CREATED)
def create_new_student_class(student_class: StudentClassCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một liên kết học sinh-lớp học mới.
    """
    # Bạn có thể thêm kiểm tra xem student_id và class_id có tồn tại không
    return crud_studentclass.create_student_class(db=db, student_class=student_class)

@router.get("/", response_model=List[StudentClass])
def read_all_student_classes(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các liên kết học sinh-lớp học.
    """
    student_classes = crud_studentclass.get_all_student_classes(db, skip=skip, limit=limit)
    return student_classes

@router.get("/{studentclass_id}", response_model=StudentClass)
def read_student_class(studentclass_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một liên kết học sinh-lớp học cụ thể bằng ID.
    """
    db_student_class = crud_studentclass.get_student_class(db, studentclass_id=studentclass_id)
    if db_student_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-lớp học không tìm thấy."
        )
    return db_student_class

@router.put("/{studentclass_id}", response_model=StudentClass)
def update_existing_student_class(studentclass_id: int, student_class: StudentClassUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một liên kết học sinh-lớp học cụ thể bằng ID.
    """
    db_student_class = crud_studentclass.update_student_class(db, studentclass_id=studentclass_id, student_class_update=student_class)
    if db_student_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-lớp học không tìm thấy."
        )
    return db_student_class

@router.delete("/{studentclass_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_student_class(studentclass_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một liên kết học sinh-lớp học cụ thể bằng ID.
    """
    db_student_class = crud_studentclass.delete_student_class(db, studentclass_id=studentclass_id)
    if db_student_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-lớp học không tìm thấy."
        )
    return {"message": "Liên kết học sinh-lớp học đã được xóa thành công."}

