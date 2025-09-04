from datetime import date
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.schemas.tuition_schema import (
    TuitionCreate,
    TuitionUpdate,
    TuitionRead,
    TuitionPaymentStatusUpdate
)
from app.services import tuition_service
from app.api.auth.auth import has_roles, get_current_active_user
from app.crud import tuition_crud
from app.schemas.auth_schema import AuthenticatedUser

router = APIRouter()

# Dependency cho quyền truy cập
MANAGER_ONLY = has_roles(["manager"])
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])
STUDENT_ONLY = has_roles(["student"])
PARENT_ONLY = has_roles(["parent"])
PARENT_OR_MANAGER = has_roles(["manager", "parent"])

@router.post(
    "/",
    response_model=TuitionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một bản ghi học phí mới",
    dependencies=[Depends(MANAGER_ONLY)]
)
def create_tuition(
    tuition_in: TuitionCreate, 
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một bản ghi học phí mới và gửi thông báo cho phụ huynh.
    """
    return tuition_service.create_tuition_record(db, tuition_in)


@router.get(
    "/{tuition_id}",
    response_model=TuitionRead,
    summary="Lấy thông tin học phí bằng ID",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_tuition(
    tuition_id: int, 
    db: Session = Depends(deps.get_db)
):
    db_tuition = tuition_crud.get_tuition(db, tuition_id)
    if not db_tuition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
    return db_tuition


@router.get(
    "/",
    response_model=List[TuitionRead],
    summary="Lấy danh sách tất cả học phí",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def list_tuitions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db)
):
    return tuition_crud.get_all_tuitions(db, skip=skip, limit=limit)


@router.get(
    "/by_student/{student_user_id}",
    response_model=List[TuitionRead],
    summary="Lấy học phí theo student_user_id",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_tuitions_by_student_user_id(
    student_user_id: int,
    db: Session = Depends(deps.get_db)
):
    tuitions = tuition_crud.get_tuitions_by_student_user_id(db, student_user_id=student_user_id)
    if not tuitions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy học phí cho học sinh này.")
    return tuitions


@router.get(
    "/by_parent/{parent_id}",
    response_model=List[TuitionRead],
    summary="Lấy tất cả học phí theo parent",
    dependencies=[Depends(PARENT_OR_MANAGER)]
)
def get_tuitions_by_parent(
    parent_id: int,
    db: Session = Depends(deps.get_db),
    current_user: AuthenticatedUser = Depends(get_current_active_user)
):
    # Nếu user là parent → chỉ được xem học phí của chính con mình
    if "parent" in current_user.roles:
        parent_id = current_user.user_id  

    # Nếu user là manager → có thể xem theo parent_id được truyền vào URL
    elif "manager" in current_user.roles:
        pass  # giữ nguyên parent_id từ param

    else:
        raise HTTPException(status_code=403, detail="Không có quyền truy cập")

    return tuition_crud.get_tuitions_by_parent_id(db, parent_id=parent_id)



@router.put(
    "/{tuition_id}",
    response_model=TuitionRead,
    summary="Cập nhật chi tiết học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_tuition_details(
    tuition_id: int,
    tuition_in: TuitionUpdate,
    db: Session = Depends(deps.get_db)
):
    updated = tuition_crud.update_tuition_details(db, tuition_id, tuition_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found hoặc đã thanh toán")
    return updated


@router.patch(
    "/{tuition_id}/status",
    response_model=TuitionRead,
    summary="Cập nhật trạng thái thanh toán học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_tuition_payment_status(
    tuition_id: int,
    status_in: TuitionPaymentStatusUpdate,
    db: Session = Depends(deps.get_db)
):
    updated = tuition_crud.update_tuition_payment_status(db, tuition_id, status_in.payment_status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
    return updated


@router.delete(
    "/{tuition_id}",
    summary="Xóa học phí",
    dependencies=[Depends(MANAGER_ONLY)]
)
def delete_tuition(
    tuition_id: int, 
    db: Session = Depends(deps.get_db)
):
    deleted = tuition_crud.delete_tuition(db, tuition_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tuition not found")
    return {
        "message": "Bản ghi học phí đã được xóa thành công.",
        "deleted_tuition_id": deleted.tuition_id,
        "status": "success"
    }


@router.post(
    "/generate-all",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Sinh học phí cho tất cả học sinh",
    dependencies=[Depends(MANAGER_ONLY)]
)
def generate_tuition_for_all_students_route(
    background_tasks: BackgroundTasks,
    term: int = Query(..., gt=0, description="Kỳ học để tạo học phí"),
    due_date: date = Query(..., description="Hạn thanh toán"),
    db: Session = Depends(deps.get_db),  # dùng session từ FastAPI
):
    background_tasks.add_task(
        tuition_service.create_tuition_for_all_students,
        db=db,           # truyền session vào
        due_date=due_date,
        term=term
    )
    return {"message": "Đã chấp nhận yêu cầu. Quá trình tạo học phí đang chạy ngầm."}
