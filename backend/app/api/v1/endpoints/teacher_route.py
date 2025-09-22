# app/api/v1/endpoints/teacher_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# CRUD
from app.crud import teacher_crud
from app.crud import user_crud
from app.crud import user_role_crud # cần import CRUD user_role

# Schemas
from app.schemas import teacher_schema
from app.schemas.user_role_schema import UserRoleCreate

# Dependencies
from app.api import deps
# Import dependency factory
from app.api.auth.auth import get_current_active_user, has_roles
from app.schemas.auth_schema import AuthenticatedUser

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])


@router.post(
    "/",
    response_model=teacher_schema.Teacher,
    status_code=status.HTTP_201_CREATED,
    summary="Gán vai trò giáo viên cho một người dùng đã tồn tại",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền gán vai trò
)
def assign_teacher(
    teacher_in: teacher_schema.TeacherCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Gán vai trò giáo viên cho một user đã tồn tại bằng cách tạo một bản ghi mới trong bảng teachers.
    Các trường bắt buộc: user_id, base_salary_per_class, reward_bonus.

    Quyền truy cập: **manager**
    """
    # 1. Kiểm tra user có tồn tại
    db_user = user_crud.get_user(db=db, user_id=teacher_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {teacher_in.user_id} not found."
        )

    # 2. Kiểm tra user đã là teacher chưa
    existing_teacher = teacher_crud.get_teacher_by_user_id(db, user_id=teacher_in.user_id)
    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {teacher_in.user_id} is already a teacher."
        )

    # 3. Gán teacher bằng cách sử dụng trực tiếp dữ liệu từ request
    db_teacher = teacher_crud.create_teacher(db=db, teacher_in=teacher_in)

    # 4. Cập nhật user_roles nếu chưa có role "teacher"
    existing_role = user_role_crud.get_user_role(db, user_id=teacher_in.user_id, role_name="teacher")
    if not existing_role:
        user_role_crud.create_user_role(
            db=db,
            role_in=UserRoleCreate(
                user_id=teacher_in.user_id,
                role_name="teacher",
                assigned_at=datetime.utcnow()
            )
        )

    return db_teacher


@router.get(
    "/", 
    response_model=List[teacher_schema.Teacher],
    summary="Lấy danh sách tất cả giáo viên",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager và teacher có thể xem
)
def get_all_teachers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả giáo viên.
    
    Quyền truy cập: **manager**, **teacher**
    """
    return teacher_crud.get_all_teachers(db, skip=skip, limit=limit)


@router.get(
    "/{teacher_user_id}", 
    response_model=teacher_schema.Teacher,
    summary="Lấy thông tin một giáo viên theo ID",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager và teacher có thể xem
)
def get_teacher(
    teacher_user_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin một giáo viên theo ID.
    
    Quyền truy cập: **manager**, **teacher**
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_user_id=teacher_user_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher


@router.put(
    "/{teacher_user_id}", 
    response_model=teacher_schema.Teacher,
    summary="Cập nhật thông tin giáo viên theo ID",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền cập nhật
)
def update_existing_teacher(
    teacher_user_id: int, 
    teacher: teacher_schema.TeacherUpdate, 
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin giáo viên theo ID.
    
    Quyền truy cập: **manager**
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_user_id=teacher_user_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )

    updated_teacher = teacher_crud.update_teacher(db, db_obj=db_teacher, obj_in=teacher)
    return updated_teacher


@router.delete(
    "/{teacher_user_id}", 
    response_model=dict,
    summary="Xóa một giáo viên",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền xóa
)
def delete_existing_teacher(
    teacher_user_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một giáo viên khỏi cơ sở dữ liệu.
    
    Quyền truy cập: **manager**
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_user_id=teacher_user_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giáo viên."
        )

    deleted_teacher = teacher_crud.delete_teacher(db, db_obj=db_teacher)

    return {
        "deleted_teacher": teacher_schema.Teacher.from_orm(deleted_teacher).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.get(
    "/{teacher_user_id}/stats",
    response_model=teacher_schema.TeacherStats,
    summary="Lấy số liệu thống kê của giáo viên",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_teacher_stats(
    teacher_user_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy các số liệu thống kê chi tiết của một giáo viên, bao gồm số lớp đã dạy, số lịch trình, số đánh giá và điểm trung bình.

    Quyền truy cập: **manager**, **teacher**
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_user_id=teacher_user_id)
    if not db_teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return teacher_crud.get_teacher_stats(db, teacher_user_id=teacher_user_id)
