# app/api/endpoints/evaluation_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các dependency cần thiết từ auth.py
from app.api.auth.auth import has_roles, AuthenticatedUser
from app.crud import evaluation_crud, teacher_crud, student_crud
from app.schemas import evaluation_schema
from app.api import deps
from app.services import evaluation_service 

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])


@router.post(
    "/",
    response_model=evaluation_schema.Evaluation,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def create_new_evaluation_record(
    evaluation_in: evaluation_schema.EvaluationCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một bản ghi đánh giá mới với điểm delta (thay đổi).
    Chỉ cho phép manager và Giáo viên tạo đánh giá.
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
    return evaluation_crud.create_evaluation(db=db, evaluation=evaluation_in)


@router.get(
    "/total_score/{student_id}",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_total_score_by_student(
    student_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Tính và trả về điểm tổng hiện tại của một học sinh.
    Chỉ manager và Giáo viên mới có thể xem.
    """
    # Kiểm tra sự tồn tại của student_id
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
        
    total_points = evaluation_service.calculate_total_points_for_student(db, student_id=student_id)
    
    if total_points is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation record found for student {student_id}"
        )
        
    return total_points


@router.get(
    "/summary_and_counts/{student_id}",
    response_model=evaluation_schema.EvaluationSummary,
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_summary_and_counts(
    student_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy điểm tổng (giới hạn 100) và số lần cộng/trừ điểm của một học sinh.
    Chỉ manager và Giáo viên mới có thể xem.
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


@router.get(
    "/{evaluation_id}",
    response_model=evaluation_schema.EvaluationRead,
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_evaluation_record(
    evaluation_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin một đánh giá chi tiết (delta) theo ID.
    Chỉ manager và Giáo viên mới có thể xem.
    """
    db_evaluation = evaluation_crud.get_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đánh giá không tìm thấy."
        )
    return db_evaluation


@router.get(
    "/by_student/{student_id}",
    response_model=List[evaluation_schema.EvaluationRead],
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_evaluations_by_student(
    student_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy tất cả các bản ghi đánh giá chi tiết của một học sinh theo student_id.
    Chỉ manager và Giáo viên mới có thể xem.
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_id} not found."
        )
    
    evaluations = evaluation_crud.get_evaluations_by_student_id(db, student_id=student_id)
    return evaluations


@router.delete(
    "/{evaluation_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(MANAGER_ONLY)]
)
def delete_evaluation_api(
    evaluation_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một bản ghi đánh giá chi tiết theo ID.
    Chỉ có manager mới có quyền thực hiện.
    """
    result = evaluation_crud.delete_evaluation(db, evaluation_id)
    
    if "Đã xóa thành công" in result.get("message", ""):
        return {"message": "Đã xóa thành công."}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["message"]
        )
