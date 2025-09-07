import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.crud import payroll_crud, teacher_crud
from app.schemas import payroll_schema
from app.api import deps
from app.services import payroll_service
from app.api.auth.auth import get_current_active_user, has_roles

router = APIRouter()
MANAGER_ONLY = has_roles(["manager"])

@router.post(
    "/",
    response_model=payroll_schema.Payroll,
    dependencies=[Depends(MANAGER_ONLY)]
)
def create_new_payroll(
    payroll_in: payroll_schema.PayrollCreate,
    db: Session = Depends(deps.get_db)
):
    teacher = teacher_crud.get_teacher(db, payroll_in.teacher_user_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    result = payroll_service.create_payroll(db, teacher, payroll_in)
    return result


@router.get(
    "/",
    response_model=List[payroll_schema.Payroll],
    dependencies=[Depends(MANAGER_ONLY)]
)
def get_all_payrolls(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    return payroll_crud.get_all_payrolls(db, skip=skip, limit=limit)


@router.post(
    "/run_payrolls",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(MANAGER_ONLY)]
)
def run_payrolls(
    db: Session = Depends(deps.get_db)
):
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


@router.get("/{payroll_id}", response_model=payroll_schema.Payroll)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    db_payroll = payroll_crud.get_payroll(db, payroll_id)
    if not db_payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")

    # Manager có quyền xem tất cả
    if "manager" in current_user.roles:
        return db_payroll

    # Nếu không phải manager, chỉ giáo viên liên quan mới xem được
    teacher = teacher_crud.get_teacher_by_user_id(db, user_id=current_user.user_id)
    if not teacher or db_payroll.teacher_user_id != teacher.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this payroll")

    return db_payroll


@router.put(
    "/{payroll_id}",
    response_model=payroll_schema.Payroll,
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_payroll_endpoint(
    payroll_id: int,
    payroll_update: payroll_schema.PayrollUpdate,
    db: Session = Depends(deps.get_db)
):
    result = payroll_service.update_payroll_with_notification(db, payroll_id, payroll_update)
    if not result:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return result


@router.delete(
    "/{payroll_id}",
    response_model=dict,
    dependencies=[Depends(MANAGER_ONLY)]
)
def delete_existing_payroll(
    payroll_id: int,
    db: Session = Depends(deps.get_db)
):
    db_payroll = payroll_crud.get_payroll(db, payroll_id)
    if not db_payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")

    deleted_payroll = payroll_crud.delete_payroll(db, payroll_id)
    return {
        "deleted_payroll": payroll_schema.Payroll.from_orm(deleted_payroll).dict(),
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "status": "success"
    }


@router.get("/teacher/{teacher_user_id}", response_model=List[payroll_schema.Payroll])
def get_teacher_payrolls(
    teacher_user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_active_user)
):
    teacher = teacher_crud.get_teacher(db, teacher_user_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    if "manager" not in current_user.roles and teacher.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this teacher's payrolls")

    payrolls = payroll_crud.get_payrolls_by_teacher_user_id(db, teacher_user_id, skip=skip, limit=limit)
    if not payrolls:
        raise HTTPException(status_code=404, detail="No payrolls found for this teacher")

    return payrolls