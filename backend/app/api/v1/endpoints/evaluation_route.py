# app/api/endpoints/evaluation_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.auth.auth import has_roles, get_current_active_user
from app.crud import evaluation_crud, teacher_crud, student_crud
from app.schemas import evaluation_schema
from app.api import deps
from app.services import evaluation_service
from app.models.evaluation_model import Evaluation
from app.schemas.auth_schema import AuthenticatedUser

router = APIRouter()

MANAGER_ONLY = has_roles(["manager"])
TEACHER_ONLY = has_roles(["teacher"])
MANAGER_TEACHER_AND_STUDENT = has_roles(["manager", "teacher", "student"])
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

@router.post(
    "/",
    response_model=evaluation_schema.Evaluation,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(TEACHER_ONLY)]
)
def create_new_evaluation_record(
    evaluation_in: evaluation_schema.EvaluationCreate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    db_teacher = teacher_crud.get_teacher(db, user_id=current_user.user_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with id {current_user.user_id} not found."
        )

    db_student = student_crud.get_student(db, user_id=evaluation_in.student_user_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {evaluation_in.student_user_id} not found."
        )

    allowed_students = teacher_crud.get_students(db, teacher_user_id=current_user.user_id)
    if evaluation_in.student_user_id not in allowed_students:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to evaluate this student."
        )

    return evaluation_crud.create_evaluation(
        db=db,
        evaluation=evaluation_in,
        teacher_user_id=current_user.user_id
    )

@router.get(
    "/",
    response_model=List[evaluation_schema.EvaluationView],
    summary="Lấy danh sách tất cả các đánh giá",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_evaluations_by_role(
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Lấy danh sách các đánh giá. Quản lý có thể xem tất cả,
    giáo viên chỉ có thể xem đánh giá do mình tạo.
    """
    if "manager" in current_user.roles:
        # Nếu là manager, trả về tất cả evaluations
        return evaluation_crud.get_all_evaluations_with_names(db, skip=skip, limit=limit)
    
    elif "teacher" in current_user.roles:
        # Nếu là teacher, chỉ trả về evaluations của chính họ
        teacher_id = current_user.user_id
        return evaluation_crud.get_evaluations_by_teacher_user_id(db, teacher_id, skip=skip, limit=limit)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập."
        )

@router.get(
    "/total_score/{student_user_id}",
    dependencies=[Depends(MANAGER_TEACHER_AND_STUDENT)]
)
def get_total_score_by_student(
    student_user_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    db_student = student_crud.get_student(db, user_id=student_user_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_user_id} not found."
        )

    # Student chỉ được xem chính mình
    if "student" in current_user.roles and current_user.user_id != student_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ được xem điểm của chính mình."
        )

    # Teacher chỉ được xem học sinh do mình phụ trách
    if "teacher" in current_user.roles:
        allowed_students = teacher_crud.get_students(db, teacher_user_id=current_user.user_id)
        if student_user_id not in allowed_students:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không được phép xem điểm của học sinh này."
            )

    total_points = evaluation_service.calculate_total_points_for_student(
        db, student_user_id=student_user_id
    )
    if total_points is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evaluation record found for student {student_user_id}"
        )
    return total_points


@router.get(
    "/summary_and_counts/{student_user_id}",
    response_model=evaluation_schema.EvaluationSummary,
    dependencies=[Depends(MANAGER_TEACHER_AND_STUDENT)]
)
def get_summary_and_counts(
    student_user_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    """
    Lấy điểm tổng (giới hạn 100) và số lần cộng/trừ điểm của một học sinh.
    - Manager: xem bất kỳ học sinh nào
    - Teacher: chỉ xem học sinh do mình phụ trách
    - Student: chỉ xem chính mình
    """
    db_student = student_crud.get_student(db, user_id=student_user_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {student_user_id} not found."
        )

    # Student chỉ được xem chính mình
    if "student" in current_user.roles and current_user.user_id != student_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn chỉ có thể xem điểm của chính mình."
        )

    # Teacher chỉ được xem học sinh do mình phụ trách
    if "teacher" in current_user.roles:
        allowed_students = teacher_crud.get_students(db, teacher_user_id=current_user.user_id)
        if student_user_id not in allowed_students:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không được phép xem điểm của học sinh này."
            )

    summary_data = evaluation_service.get_summary_and_counts_for_student(
        db, student_user_id=student_user_id
    )
    return summary_data


@router.get(
    "/{evaluation_id}",
    response_model=evaluation_schema.Evaluation,
    dependencies=[Depends(MANAGER_TEACHER_AND_STUDENT)]
)
def get_evaluation_record(
    evaluation_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    db_evaluation = evaluation_crud.get_evaluation(db, evaluation_id=evaluation_id)
    if db_evaluation is None:
        raise HTTPException(status_code=404, detail="Đánh giá không tìm thấy.")

    if "student" in current_user.roles and db_evaluation.student_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập bản ghi này.")

    if "teacher" in current_user.roles and db_evaluation.teacher_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập bản ghi này.")

    return db_evaluation


@router.get(
    "/student/{student_user_id}",
    response_model=List[evaluation_schema.EvaluationView],
    dependencies=[Depends(MANAGER_TEACHER_AND_STUDENT)]
)
def get_evaluations_of_student(
    student_user_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    if "student" in current_user.roles and current_user.user_id != student_user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đánh giá của học sinh khác.")

    if "teacher" in current_user.roles:
        return db.query(Evaluation).filter(
            Evaluation.student_user_id == student_user_id,
            Evaluation.teacher_user_id == current_user.user_id
        ).all()

    return evaluation_crud.get_evaluations_by_student_user_id(db, student_user_id)


@router.delete(
    "/{evaluation_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(TEACHER_ONLY)]
)
def delete_evaluation(
    evaluation_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    db_evaluation = evaluation_crud.get_evaluation(db, evaluation_id)
    if not db_evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found.")

    if db_evaluation.teacher_user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa đánh giá này.")

    result = evaluation_crud.delete_evaluation(db, evaluation_id)
    if "Đã xóa thành công" in result.get("message", ""):
        return {"message": "Đã xóa thành công."}
    raise HTTPException(status_code=404, detail=result["message"])

@router.get(
    "/teacher/{teacher_user_id}",
    response_model=List[evaluation_schema.EvaluationView],
    summary="Lấy danh sách đánh giá của một giáo viên",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_evaluations_of_teacher(
    teacher_user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    """
    Lấy danh sách các bản ghi đánh giá chi tiết của một giáo viên.
    - Manager: có thể xem đánh giá của bất kỳ giáo viên nào.
    - Teacher: chỉ có thể xem đánh giá của chính mình.
    """
    # Chỉ cho phép teacher truy cập đánh giá của chính họ
    if "teacher" in current_user.roles and current_user.user_id != teacher_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem đánh giá của giáo viên khác."
        )

    # Kiểm tra xem teacher_user_id có tồn tại không
    db_teacher = teacher_crud.get_teacher(db, teacher_user_id=teacher_user_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Giáo viên có ID {teacher_user_id} không tồn tại."
        )

    return evaluation_crud.get_evaluations_by_teacher_user_id(db, teacher_user_id)