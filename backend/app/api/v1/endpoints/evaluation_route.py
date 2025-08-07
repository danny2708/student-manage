# app/api/v1/endpoints/evaluation_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import evaluation_crud
from app.crud import student_crud
from app.crud import enrollment_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import evaluation_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=evaluation_schema.Evaluation, status_code=status.HTTP_201_CREATED)
def create_new_evaluation(evaluation_in: evaluation_schema.EvaluationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đánh giá mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=evaluation_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {evaluation_in.student_id} not found."
        )

    # Bước 2: Kiểm tra xem enrollment_id có tồn tại không
    db_enrollment = enrollment_crud.get_enrollment(db, enrollment_id=evaluation_in.enrollment_id)
    if not db_enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with id {evaluation_in.enrollment_id} not found."
        )

    # Bước 3: Tạo bản ghi đánh giá mới
    return evaluation_crud.create_evaluation(db=db, evaluation=evaluation_in)

@router.get("/", response_model=List[evaluation_schema.Evaluation])
def read_all_evaluations(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi đánh giá.
    """
    evaluations = evaluation_crud.get_all_evaluations(db, skip=skip, limit=limit)
    return evaluations

@router.get("/{evaluation_id}", response_model=evaluation_schema.Evaluation)
def read_evaluation(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = evaluation_crud.get_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation

@router.put("/{evaluation_id}", response_model=evaluation_schema.Evaluation)
def update_existing_evaluation(evaluation_id: int, evaluation_update: evaluation_schema.EvaluationUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = evaluation_crud.update_evaluation(db, evaluation_id=evaluation_id, evaluation_update=evaluation_update)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation

@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_evaluation(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi đánh giá cụ thể bằng ID.
    """
    db_evaluation = evaluation_crud.delete_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, vì đây là tiêu chuẩn cho xóa thành công
    return
