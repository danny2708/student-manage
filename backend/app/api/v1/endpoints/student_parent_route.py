# app/api/v1/endpoints/studentparent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations và schemas
from app.crud import student_parent_crud
from app.crud import student_crud # Giả định có một crud cho student
from app.crud import parent_crud # Giả định có một crud cho parent
from app.schemas import student_parent_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=student_parent_schema.StudentParent, status_code=status.HTTP_201_CREATED)
def create_new_student_parent(student_parent_in: student_parent_schema.StudentParentAssociationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một liên kết học sinh-phụ huynh mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=student_parent_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_parent_in.student_id} not found."
        )

    # Bước 2: Kiểm tra xem parent_id có tồn tại không
    db_parent = parent_crud.get_parent(db, parent_id=student_parent_in.parent_id)
    if not db_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parent with id {student_parent_in.parent_id} not found."
        )

    # Bước 3: Tạo bản ghi liên kết
    return student_parent_crud.create_student_parent(db=db, student_parent=student_parent_in)

@router.get("/", response_model=List[student_parent_schema.StudentParent])
def get_all_student_parents(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các liên kết học sinh-phụ huynh.
    """
    student_parents = student_parent_crud.get_all_student_parents(db, skip=skip, limit=limit)
    return student_parents

@router.get("/{studentparent_id}", response_model=student_parent_schema.StudentParent)
def get_student_parent(studentparent_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một liên kết học sinh-phụ huynh cụ thể bằng ID.
    """
    db_student_parent = student_parent_crud.get_student_parent(db, studentparent_id=studentparent_id)
    if db_student_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-phụ huynh không tìm thấy."
        )
    return db_student_parent

@router.put("/{studentparent_id}", response_model=student_parent_schema.StudentParent)
def update_existing_student_parent(studentparent_id: int, student_parent_update: student_parent_schema.StudentParentAssociationCreate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một liên kết học sinh-phụ huynh cụ thể bằng ID.
    """
    db_student_parent = student_parent_crud.update_student_parent(db, studentparent_id=studentparent_id, student_parent_update=student_parent_update)
    if db_student_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-phụ huynh không tìm thấy."
        )
    return db_student_parent

@router.delete("/{studentparent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_student_parent(studentparent_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một liên kết học sinh-phụ huynh cụ thể bằng ID.
    """
    db_student_parent = student_parent_crud.delete_student_parent(db, studentparent_id=studentparent_id)
    if db_student_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-phụ huynh không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
