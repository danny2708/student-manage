from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import studentparent_crud as crud_studentparent # Đảm bảo import đúng tên module
from app.schemas import studentparent_schema as schemas_studentparent
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_studentparent.StudentParent, status_code=status.HTTP_201_CREATED)
def create_new_student_parent(student_parent: schemas_studentparent.StudentParentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một liên kết học sinh-phụ huynh mới.
    """
    # Bạn có thể thêm kiểm tra xem student_id và parent_id có tồn tại không
    return crud_studentparent.create_student_parent(db=db, student_parent=student_parent)

@router.get("/", response_model=List[schemas_studentparent.StudentParent])
def read_all_student_parents(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các liên kết học sinh-phụ huynh.
    """
    student_parents = crud_studentparent.get_all_student_parents(db, skip=skip, limit=limit)
    return student_parents

@router.get("/{studentparent_id}", response_model=schemas_studentparent.StudentParent)
def read_student_parent(studentparent_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một liên kết học sinh-phụ huynh cụ thể bằng ID.
    """
    db_student_parent = crud_studentparent.get_student_parent(db, studentparent_id=studentparent_id)
    if db_student_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-phụ huynh không tìm thấy."
        )
    return db_student_parent

@router.put("/{studentparent_id}", response_model=schemas_studentparent.StudentParent)
def update_existing_student_parent(studentparent_id: int, student_parent: schemas_studentparent.StudentParentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một liên kết học sinh-phụ huynh cụ thể bằng ID.
    """
    db_student_parent = crud_studentparent.update_student_parent(db, studentparent_id=studentparent_id, student_parent_update=student_parent)
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
    db_student_parent = crud_studentparent.delete_student_parent(db, studentparent_id=studentparent_id)
    if db_student_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liên kết học sinh-phụ huynh không tìm thấy."
        )
    return {"message": "Liên kết học sinh-phụ huynh đã được xóa thành công."}

