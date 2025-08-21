# app/api/v1/endpoints/teacher_review_route.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.crud import teacher_review_crud
from app.crud import teacher_crud
from app.crud import student_crud
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
    
    # Bước 2: Kiểm tra student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=teacher_review_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {teacher_review_in.student_id} not found."
        )
        
    # Bước 3: Tạo bản ghi đánh giá
    return teacher_review_crud.create_teacher_review(db=db, teacher_review=teacher_review_in)

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

@router.get("/by_teacher/{teacher_id}", response_model=List[teacher_review_schema.TeacherReview])
def get_reviews_by_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy tất cả đánh giá của một giáo viên theo teacher_id.
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {teacher_id} not found."
        )
    
    reviews = teacher_review_crud.get_teacher_reviews_by_teacher_id(db, teacher_id=teacher_id)
    return reviews

@router.get("/by_student/{student_id}", response_model=List[teacher_review_schema.TeacherReview])
def get_reviews_by_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy tất cả đánh giá của một học sinh theo student_id.
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
    
    reviews = teacher_review_crud.get_teacher_reviews_by_student_id(db, student_id=student_id)
    return reviews

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

# Đã sửa lại endpoint DELETE để khớp với các endpoint khác
@router.delete("/{review_id}", status_code=status.HTTP_200_OK)
def delete_teacher_review_api(review_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một đánh giá giáo viên theo ID và trả về kết quả.
    """
    result = teacher_review_crud.delete_teacher_review(db, review_id)
    
    # Kiểm tra xem có bản ghi đã xóa không
    if "deleted_review" in result:
        return result
    else:
        # Nếu không tìm thấy, trả về lỗi 404 Not Found
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )
