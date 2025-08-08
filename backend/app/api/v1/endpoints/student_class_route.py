# app/api/v1/endpoints/studentclass_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations và schemas
from app.crud import student_class_crud
from app.crud import student_crud # Giả định có một crud cho student
from app.crud import class_crud # Giả định có một crud cho class
from app.schemas.student_class_association_schema import StudentClassAssociation, StudentClassAssociationCreate, StudentClassAssociationUpdate
from app.api import deps

router = APIRouter()

@router.post("/", response_model=StudentClassAssociation, status_code=status.HTTP_201_CREATED)
def create_new_student_class(student_class_in: StudentClassAssociationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một liên kết học sinh-lớp học mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=student_class_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_class_in.student_id} not found."
        )
    
    # Bước 2: Kiểm tra xem class_id có tồn tại không
    db_class = class_crud.get_class(db, class_id=student_class_in.class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {student_class_in.class_id} not found."
        )

    # Bước 3: Tạo bản ghi liên kết
    return student_class_crud.create_student_class(db=db, student_class=student_class_in)

@router.get("/", response_model=List[StudentClassAssociation])
def read_all_student_classes(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các liên kết học sinh-lớp học.
    """
    student_classes = student_class_crud.get_all_student_classes(db, skip=skip, limit=limit)
    return student_classes

@router.get("/{studentclass_id}", response_model=StudentClassAssociation)
def read_student_class(studentclass_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một liên kết học sinh-lớp học cụ thể bằng ID.
    """
    db_student_class = student_class_crud.get_student_class(db, studentclass_id=studentclass_id)
    if db_student_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-lớp học không tìm thấy."
        )
    return db_student_class

@router.put("/{studentclass_id}", response_model=StudentClassAssociation)
def update_existing_student_class(studentclass_id: int, student_class_update: StudentClassAssociationUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một liên kết học sinh-lớp học cụ thể bằng ID.
    """
    db_student_class = student_class_crud.update_student_class(db, studentclass_id=studentclass_id, student_class_update=student_class_update)
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
    db_student_class = student_class_crud.delete_student_class(db, studentclass_id=studentclass_id)
    if db_student_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-lớp học không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
