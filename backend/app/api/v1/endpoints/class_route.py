from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
# Import các CRUD operations
from app.crud import class_crud
# Import các schemas cần thiết trực tiếp từ module
from app.schemas import class_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=class_schema.Class, status_code=status.HTTP_201_CREATED)
def create_new_class(class_in: class_schema.ClassCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một lớp học mới.
    """
    # Kiểm tra xem tên lớp học đã tồn tại chưa
    db_class = class_crud.get_class_by_name(db, class_name=class_in.class_name)
    if db_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên lớp học đã tồn tại."
        )
    # Tạo lớp học mới
    return class_crud.create_class(db=db, class_data=class_in)

@router.get("/", response_model=List[class_schema.Class])
def read_all_classes(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các lớp học.
    """
    classes = class_crud.get_all_classes(db, skip=skip, limit=limit)
    return classes

@router.get("/{class_id}", response_model=class_schema.Class)
def read_class(class_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một lớp học cụ thể bằng ID.
    """
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

@router.put("/{class_id}", response_model=class_schema.Class)
def update_existing_class(class_id: int, class_update: class_schema.ClassUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một lớp học cụ thể bằng ID.
    """
    db_class = class_crud.update_class(db, class_id=class_id, class_update=class_update)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lớp học không tìm thấy."
        )
    return db_class

@router.delete("/{class_id}", response_model=dict)
def delete_existing_class(class_id: int, db: Session = Depends(deps.get_db)):
    db_class = class_crud.get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )

    deleted_class = class_crud.delete_class(db, class_id=class_id)

    return {
        "deleted_class": class_schema.Class.from_orm(deleted_class).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }
