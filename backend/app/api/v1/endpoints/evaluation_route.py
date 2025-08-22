# app/api/v1/endpoints/teacher_review_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Sử dụng đúng tên crud và schema của bạn
from app.crud import evaluation_crud
from app.crud import teacher_crud
from app.crud import student_crud
from app.schemas import evaluation_schema
from app.api import deps
from app.services import evaluation_service 

router = APIRouter()

@router.post("/", response_model=evaluation_schema.Evaluation, status_code=status.HTTP_201_CREATED)
def create_new_evaluation_record(evaluation_in: evaluation_schema.EvaluationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đánh giá mới với điểm delta (thay đổi).
    
    Điểm số thực tế sẽ được lưu vào cơ sở dữ liệu.
    Nội dung đánh giá cũng được lưu kèm theo.
    """
    # Bước 1 & 2: Kiểm tra sự tồn tại của teacher_id và student_id
    db_teacher = teacher_crud.get_teacher(db, teacher_id=evaluation_in.teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {evaluation_in.teacher_id} not found."
        )
    
    db_student = student_crud.get_student(db, student_id=evaluation_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {evaluation_in.student_id} not found."
        )
        
    # Bước 3: Tạo bản ghi đánh giá chi tiết
    # Endpoint này chỉ đơn giản là lưu bản ghi mới, không tính toán điểm tổng.
    # Điểm tổng sẽ được tính sau khi cần hiển thị.
    return evaluation_crud.create_evaluation(db=db, evaluation=evaluation_in)


@router.get("/total_score/{student_id}")
def get_total_score_by_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Tính và trả về điểm tổng hiện tại của một học sinh.
    
    Điểm tổng được tính bằng cách cộng tất cả các bản ghi delta.
    """
    # Kiểm tra sự tồn tại của student_id
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
        
    total_points = evaluation_service.calculate_total_points_for_student(db, student_id=student_id)
    
    if not total_points:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation record found for student {student_id}"
        )
        
    return total_points


@router.get("/summary_and_counts/{student_id}", response_model=evaluation_schema.EvaluationSummary)
def get_summary_and_counts(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy điểm tổng (giới hạn 100) và số lần cộng/trừ điểm của một học sinh.
    """
    # Kiểm tra sự tồn tại của student_id
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )

    summary_data = evaluation_service.get_summary_and_counts_for_student(db, student_id=student_id)
    return summary_data


@router.get("/{evaluation_id}", response_model=evaluation_schema.EvaluationRead)
def get_evaluation_record(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin một đánh giá chi tiết (delta) theo ID.
    """
    db_evaluation = evaluation_crud.get_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation


@router.get("/by_student/{student_id}", response_model=List[evaluation_schema.EvaluationRead])
def get_evaluations_by_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy tất cả các bản ghi đánh giá chi tiết của một học sinh theo student_id.
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
    
    evaluations = evaluation_crud.get_evaluations_by_student_id(db, student_id=student_id)
    return evaluations


@router.delete("/{evaluation_id}", status_code=status.HTTP_200_OK)
def delete_evaluation_api(evaluation_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi đánh giá chi tiết theo ID.
    """
    result = evaluation_crud.delete_evaluation(db, evaluation_id)
    
    if "Đã xóa thành công" in result.get("message", ""):
        return {"message": "Đã xóa thành công."}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )
