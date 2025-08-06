from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import subject_crud as crud_subject # Đảm bảo import đúng tên module
from app.schemas import subject_schema as schemas_subject # Schema vẫn là subject
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_subject.Subject, status_code=status.HTTP_201_CREATED)
def create_new_subject(subject: schemas_subject.SubjectCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một môn học mới.
    """
    db_subject = crud_subject.get_subject_by_name(db, subject_name=subject.subject_name)
    if db_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên môn học đã tồn tại."
        )
    return crud_subject.create_subject(db=db, subject=subject)

@router.get("/", response_model=List[schemas_subject.Subject])
def read_all_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả môn học.
    """
    subjects = crud_subject.get_all_subjects(db, skip=skip, limit=limit)
    return subjects

@router.get("/{subject_id}", response_model=schemas_subject.Subject)
def read_subject(subject_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một môn học cụ thể bằng ID.
    """
    db_subject = crud_subject.get_subject(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học không tìm thấy."
        )
    return db_subject

@router.put("/{subject_id}", response_model=schemas_subject.Subject)
def update_existing_subject(subject_id: int, subject: schemas_subject.SubjectUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một môn học cụ thể bằng ID.
    """
    db_subject = crud_subject.update_subject(db, subject_id=subject_id, subject_update=subject)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học không tìm thấy."
        )
    return db_subject

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_subject(subject_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một môn học cụ thể bằng ID.
    """
    db_subject = crud_subject.delete_subject(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học không tìm thấy."
        )
    return {"message": "Môn học đã được xóa thành công."}

