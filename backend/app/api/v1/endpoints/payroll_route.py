# app/api/v1/endpoints/payroll_route.py
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
# Import các CRUD operations và schemas trực tiếp
from app.crud import payroll_crud
from app.crud import teacher_crud
from app.schemas import payroll_schema
from app.api import deps
from app.services import payroll_service
from app.crud import user_crud

# Import dependency factory
from app.api.auth.auth import get_current_active_user, has_roles
from app.models.teacher_model import Teacher

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

router = APIRouter(prefix="/payrolls", tags=["Payrolls"])

@router.post("/", response_model=payroll_schema.PayrollOut, dependencies=[Depends(MANAGER_ONLY)])
def create_new_payroll(
    payroll_in: payroll_schema.PayrollCreate,
    db: Session = Depends(deps.get_db)
):
    teacher = db.query(Teacher).filter(Teacher.teacher_id == payroll_in.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Chỉ gọi service, notification được tạo bên trong service
    result = payroll_service.create_payroll(db, teacher, payroll_in)
    return result


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

@router.post(
    "/run_payrolls",
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
    current_user: user_crud.User = Depends(get_current_active_user),
    _: user_crud.User = Depends(MANAGER_ONLY)  # Nếu là manager, bỏ qua quyền khác
):
    db_payroll = payroll_crud.get_payroll(db, payroll_id=payroll_id)
    if db_payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bảng lương không tìm thấy."
        )

    # Nếu không phải manager, kiểm tra giáo viên
    try:
        # Nếu người dùng có role manager, dependency đã pass, không vào except
        pass
    except HTTPException:
        db_teacher = teacher_crud.get_teacher_by_user_id(db, user_id=current_user.id)
        if not db_teacher or db_payroll.teacher_id != db_teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem bảng lương này."
            )

    return db_payroll

# endpoint
@router.put("/{payroll_id}", response_model=payroll_schema.PayrollOut, dependencies=[Depends(MANAGER_ONLY)])
def update_payroll_endpoint(
    payroll_id: int,
    payroll_update: payroll_schema.PayrollUpdate,
    db: Session = Depends(deps.get_db)
):
    result = payroll_service.update_payroll_with_notification(db, payroll_id, payroll_update)
    if not result:
        raise HTTPException(status_code=404, detail="Bảng lương không tìm thấy")
    return result


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
    current_user=Depends(get_current_active_user)
):
    # Lấy thông tin giáo viên
    db_teacher = teacher_crud.get_teacher_by_teacher_id(db, teacher_id=teacher_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giáo viên."
        )

    # Chỉ cho phép manager hoặc chính giáo viên đó xem
    if "manager" not in current_user.roles and current_user.id != db_teacher.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem bảng lương của giáo viên khác."
        )

    payrolls = payroll_crud.get_payrolls_by_teacher_id(
        db, teacher_id=teacher_id, skip=skip, limit=limit
    )
    if not payrolls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bảng lương nào cho giáo viên này."
        )

    return payrolls