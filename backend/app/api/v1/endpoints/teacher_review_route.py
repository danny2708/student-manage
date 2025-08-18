# app/api/v1/endpoints/teacher_review_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import teacher_review_crud
from app.crud import teacher_crud  # CRUD cho teacher
from app.schemas import teacher_review_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=teacher_review_schema.TeacherReview, status_code=status.HTTP_201_CREATED)
def create_new_teacher_review(teacher_review_in: teacher_review_schema.TeacherReviewCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đánh giá giáo viên mới.
    """
    # Bước 1: Kiểm tra teacher_id có tồn tại không
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_review_in.teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {teacher_review_in.teacher_id} not found."
        )
        
    # Bước 2: Tạo bản ghi đánh giá
    return teacher_review_crud.create_teacher_review(db=db, teacher_review=teacher_review_in)

@router.get("/", response_model=List[teacher_review_schema.TeacherReview])
def get_all_teacher_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả đánh giá giáo viên.
    """
    return teacher_review_crud.get_all_teacher_reviews(db, skip=skip, limit=limit)

@router.get("/{review_id}", response_model=teacher_review_schema.TeacherReview)
def get_teacher_review(review_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin một đánh giá giáo viên theo ID.
    """
    db_teacher_review = teacher_review_crud.get_teacher_review(db, review_id=review_id)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    return db_teacher_review

@router.put("/{review_id}", response_model=teacher_review_schema.TeacherReview)
def update_existing_teacher_review(review_id: int, teacher_review_update: teacher_review_schema.TeacherReviewUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin một đánh giá giáo viên theo ID.
    """
    db_teacher_review = teacher_review_crud.update_teacher_review(db, review_id=review_id, teacher_review_update=teacher_review_update)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    return db_teacher_review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_teacher_review(review_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi đánh giá giáo viên theo ID (lưu log trước khi xóa).
    """
    db_teacher_review = teacher_review_crud.delete_teacher_review(db, review_id=review_id)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    return
