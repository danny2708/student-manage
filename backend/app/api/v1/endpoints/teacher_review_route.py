# app/api/v1/endpoints/teacher_review_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import teacher_review_crud
from app.crud import teacher_crud
from app.crud import student_crud
from app.schemas import teacher_review_schema
from app.api import deps
# Import các dependencies cần thiết từ auth.py
from app.api.auth.auth import get_current_active_user, has_roles

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Student hoặc Parent
STUDENT_OR_PARENT = has_roles(["student", "parent"])

@router.post(
    "/", 
    response_model=teacher_review_schema.TeacherReview, 
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một bản ghi đánh giá giáo viên mới",
    dependencies=[Depends(STUDENT_OR_PARENT)] # Chỉ student hoặc parent mới có quyền tạo review
)
def create_new_teacher_review(
    teacher_review_in: teacher_review_schema.TeacherReviewCreate, 
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một bản ghi đánh giá giáo viên mới.
    
    Quyền truy cập: **student**, **parent**
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

@router.get(
    "/{review_id}", 
    response_model=teacher_review_schema.TeacherReview,
    summary="Lấy thông tin một đánh giá giáo viên theo ID",
    dependencies=[Depends(get_current_active_user)] # Bất kỳ người dùng đã đăng nhập nào cũng có thể xem
)
def get_teacher_review(
    review_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin một đánh giá giáo viên theo ID.
    
    Quyền truy cập: **all authenticated users**
    """
    db_teacher_review = teacher_review_crud.get_teacher_review(db, review_id=review_id)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    return db_teacher_review

@router.get(
    "/by_teacher/{teacher_id}", 
    response_model=List[teacher_review_schema.TeacherReview],
    summary="Lấy tất cả đánh giá của một giáo viên theo teacher_id",
    dependencies=[Depends(get_current_active_user)] # Bất kỳ người dùng đã đăng nhập nào cũng có thể xem
)
def get_reviews_by_teacher(
    teacher_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy tất cả đánh giá của một giáo viên theo teacher_id.
    
    Quyền truy cập: **all authenticated users**
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {teacher_id} not found."
        )
    
    reviews = teacher_review_crud.get_teacher_reviews_by_teacher_id(db, teacher_id=teacher_id)
    return reviews

@router.get(
    "/by_student/{student_id}", 
    response_model=List[teacher_review_schema.TeacherReview],
    summary="Lấy tất cả đánh giá của một học sinh theo student_id",
    dependencies=[Depends(get_current_active_user)] # Bất kỳ người dùng đã đăng nhập nào cũng có thể xem
)
def get_reviews_by_student(
    student_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy tất cả đánh giá của một học sinh theo student_id.
    
    Quyền truy cập: **all authenticated users**
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
    
    reviews = teacher_review_crud.get_teacher_reviews_by_student_id(db, student_id=student_id)
    return reviews

@router.put(
    "/{review_id}", 
    response_model=teacher_review_schema.TeacherReview,
    summary="Cập nhật thông tin một đánh giá giáo viên theo ID",
    dependencies=[Depends(STUDENT_OR_PARENT)] # Chỉ student hoặc parent mới có quyền cập nhật
)
def update_existing_teacher_review(
    review_id: int, 
    teacher_review_update: teacher_review_schema.TeacherReviewUpdate, 
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin một đánh giá giáo viên theo ID.
    
    Quyền truy cập: **student**, **parent** (người tạo ra review đó)
    """
    db_teacher_review = teacher_review_crud.get_teacher_review(db, review_id=review_id)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    
    updated_review = teacher_review_crud.update_teacher_review(
        db=db, 
        db_obj=db_teacher_review, 
        obj_in=teacher_review_update
    )
    return updated_review

# Đã sửa lại endpoint DELETE để khớp với các endpoint khác
@router.delete(
    "/{review_id}", 
    status_code=status.HTTP_200_OK,
    summary="Xóa một đánh giá giáo viên theo ID",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền xóa review
)
def delete_teacher_review_api(
    review_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một đánh giá giáo viên theo ID và trả về kết quả.
    
    Quyền truy cập: **manager**
    """
    db_teacher_review = teacher_review_crud.get_teacher_review(db, review_id=review_id)
    if db_teacher_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá giáo viên không tìm thấy."
        )
    
    deleted_review = teacher_review_crud.delete_teacher_review(db=db, db_obj=db_teacher_review)
    return {
        "message": "Đánh giá giáo viên đã được xóa thành công.",
        "deleted_review_id": deleted_review.id,
        "status": "success"
    }
