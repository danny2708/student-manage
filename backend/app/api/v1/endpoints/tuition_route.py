# app/api/v1/endpoints/tuition_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import tuition_crud
from app.crud import student_crud # Giả định có một crud cho student
from app.crud import subject_crud # Giả định có một crud cho subject
from app.schemas import tuition_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=tuition_schema.Tuition, status_code=status.HTTP_201_CREATED)
def create_new_tuition(tuition_in: tuition_schema.TuitionCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi học phí mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=tuition_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {tuition_in.student_id} not found."
        )

    # Bước 2: Kiểm tra xem subject_id có tồn tại không
    db_subject = subject_crud.get_subject(db, subject_id=tuition_in.subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id {tuition_in.subject_id} not found."
        )

    # Bước 3: Tạo bản ghi học phí
    return tuition_crud.create_tuition(db=db, tuition=tuition_in)

@router.get("/", response_model=List[tuition_schema.Tuition])
def get_all_tuitions(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi học phí.
    """
    tuitions = tuition_crud.get_all_tuitions(db, skip=skip, limit=limit)
    return tuitions

@router.get("/{tuition_id}", response_model=tuition_schema.Tuition)
def get_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = tuition_crud.get_tuition(db, tuition_id=tuition_id)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return db_tuition

@router.put("/{tuition_id}", response_model=tuition_schema.Tuition)
def update_existing_tuition(tuition_id: int, tuition_update: tuition_schema.TuitionUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = tuition_crud.update_tuition(db, tuition_id=tuition_id, tuition_update=tuition_update)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return db_tuition

@router.delete("/{tuition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_tuition(tuition_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi học phí cụ thể bằng ID.
    """
    db_tuition = tuition_crud.delete_tuition(db, tuition_id=tuition_id)
    if db_tuition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học phí không tìm thấy."
        )
    return
