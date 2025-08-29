# app/api/v1/endpoints/payroll_route.py
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

# Import các CRUD operations và schemas trực tiếp
from app.crud import payroll_crud
from app.crud import teacher_crud
from app.crud import notification_crud
from app.schemas import payroll_schema
from app.schemas.notification_schema import NotificationCreate
from app.api import deps
from app.services import payroll_service
from app.crud import user_crud

# Import dependency factory
from app.api.auth.auth import get_current_active_user, has_roles

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

@router.post(
    "/",
    response_model=payroll_schema.Payroll,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager tạo bản ghi
)
def create_new_payroll(
    payroll_in: payroll_schema.PayrollCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Tạo một bản ghi bảng lương mới. Chỉ có manager mới có quyền.
    """
    # Bước 1: Kiểm tra xem teacher_id có tồn tại trong bảng teachers không
    db_teacher = teacher_crud.get_teacher(db, teacher_id=payroll_in.teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Teacher with teacher_id {payroll_in.teacher_id} not found."
        )

    # Bước 2: Tạo bản ghi bảng lương
    return payroll_crud.create_payroll_record(db=db, payroll=payroll_in)

@router.get(
    "/",
    response_model=List[payroll_schema.Payroll],
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager xem tất cả
)
def get_all_payrolls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả các bản ghi bảng lương. Chỉ có manager mới có quyền.
    """
    payrolls = payroll_crud.get_all_payrolls(db, skip=skip, limit=limit)
    return payrolls

@router.get(
    "/run_payroll",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager chạy quá trình này
)
def run_payroll(
    db: Session = Depends(deps.get_db)
):
    """
    Chạy quá trình tính lương hàng tháng (thủ công).
    Sau khi tạo payroll sẽ tự động gửi thông báo.
    Trả về danh sách payroll + notification.
    """
    try:
        results = payroll_service.run_monthly_payroll(db)
        return {
            "message": "Monthly payroll process completed successfully.",
            "processed": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during payroll processing: {str(e)}"
        )


@router.get(
    "/{payroll_id}",
    response_model=payroll_schema.Payroll
)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    """
    Lấy thông tin của một bản ghi bảng lương cụ thể bằng ID.
    Giáo viên chỉ có thể xem bảng lương của chính họ. Manager có thể xem bất kỳ.
    """
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    
    # Kiểm tra quyền: Người dùng hiện tại là manager HOẶC là giáo viên của bảng lương này
    if not current_user.is_manager:
        db_teacher = teacher_crud.get_teacher_by_user_id(db, user_id=current_user.id)
        if not db_teacher or db_payroll.teacher_id != db_teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem bảng lương này."
            )

    return db_payroll

@router.put(
    "/{payroll_id}",
    response_model=payroll_schema.Payroll,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager cập nhật
)
def update_existing_payroll(
    payroll_id: int,
    payroll_update: payroll_schema.PayrollUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin của một bản ghi bảng lương cụ thể bằng ID. Chỉ có manager mới có quyền.
    """
    db_payroll = payroll_crud.update_payroll(db, payroll_id=payroll_id, payroll_update=payroll_update)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )
    return db_payroll

@router.delete(
    "/{payroll_id}",
    response_model=dict,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager xóa
)
def delete_existing_payroll(
    payroll_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một bản ghi bảng lương. Chỉ có manager mới có quyền.
    """
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bảng lương nào!"
        )

    deleted_payroll = payroll_crud.delete_payroll(db, payroll_id=payroll_id)

    return {
        "deleted_payroll": payroll_schema.Payroll.from_orm(deleted_payroll).dict(),
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    }


@router.get(
    "/teacher/{teacher_id}",
    response_model=List[payroll_schema.Payroll]
)
def get_teacher_payrolls(
    teacher_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    """
    Lấy danh sách các bản ghi bảng lương của một giáo viên cụ thể.
    Giáo viên chỉ có thể xem bảng lương của chính họ. Manager có thể xem bất kỳ.
    """
    # Kiểm tra quyền: Người dùng hiện tại là manager HOẶC là giáo viên này
    if not current_user.is_manager:
        db_teacher = teacher_crud.get_teacher_by_user_id(db, user_id=current_user.id)
        if not db_teacher or teacher_id != db_teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem bảng lương của giáo viên khác."
            )

    payrolls = payroll_crud.get_payrolls_by_teacher_id(db, teacher_id=teacher_id, skip=skip, limit=limit)
    if not payrolls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bảng lương nào cho người dùng này."
        )
    return payrolls
