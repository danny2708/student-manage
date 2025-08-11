# app/api/v1/endpoints/subject_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import subject_crud
from app.schemas import subject_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=subject_schema.Subject, status_code=status.HTTP_201_CREATED)
def create_new_subject(subject_in: subject_schema.SubjectCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một môn học mới.
    """
    # Kiểm tra xem tên môn học đã tồn tại chưa
    db_subject = subject_crud.get_subject_by_name(db, name=subject_in.name)
    if db_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên môn học đã tồn tại."
        )
    # Tạo môn học nếu tên chưa tồn tại
    return subject_crud.create_subject(db=db, subject=subject_in)

@router.get("/", response_model=List[subject_schema.Subject])
def read_all_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả môn học.
    """
    subjects = subject_crud.get_all_subjects(db, skip=skip, limit=limit)
    return subjects

@router.get("/{subject_id}", response_model=subject_schema.Subject)
def read_subject(subject_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một môn học cụ thể bằng ID.
    """
    db_subject = subject_crud.get_subject(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học không tìm thấy."
        )
    return db_subject

@router.put("/{subject_id}", response_model=subject_schema.Subject)
def update_existing_subject(subject_id: int, subject_update: subject_schema.SubjectUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một môn học cụ thể bằng ID.
    """
    db_subject = subject_crud.update_subject(db, subject_id=subject_id, subject_update=subject_update)
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
    db_subject = subject_crud.delete_subject(db, subject_id=subject_id)
    if db_subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Môn học không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
