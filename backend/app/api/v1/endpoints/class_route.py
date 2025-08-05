from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import class_crud as crud_class # Đổi tên import để tránh xung đột
from app.schemas import class_schema as schemas_class
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_class.Class, status_code=status.HTTP_201_CREATED)
def create_new_class(class_data: schemas_class.ClassCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một lớp học mới.
    """
    db_class = crud_class.get_class_by_name(db, class_name=class_data.class_name)
    if db_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên lớp học đã tồn tại."
        )
    return crud_class.create_class(db=db, class_data=class_data)

@router.get("/", response_model=List[schemas_class.Class])
def read_all_classes(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các lớp học.
    """
    classes = crud_class.get_all_classes(db, skip=skip, limit=limit)
    return classes

@router.get("/{class_id}", response_model=schemas_class.Class)
def read_class(class_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một lớp học cụ thể bằng ID.
    """
    db_class = crud_class.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

@router.put("/{class_id}", response_model=schemas_class.Class)
def update_existing_class(class_id: int, class_data: schemas_class.ClassUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một lớp học cụ thể bằng ID.
    """
    db_class = crud_class.update_class(db, class_id=class_id, class_update=class_data)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_class(class_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một lớp học cụ thể bằng ID.
    """
    db_class = crud_class.delete_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return {"message": "Lớp học đã được xóa thành công."}

