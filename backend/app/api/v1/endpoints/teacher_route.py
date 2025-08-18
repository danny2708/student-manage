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
from pydantic import BaseModel

# Dependencies
from app.api import deps

router = APIRouter()

@router.post("/", response_model=teacher_schema.Teacher, status_code=status.HTTP_201_CREATED)
def assign_teacher(teacher_in: teacher_schema.TeacherAssign, db: Session = Depends(deps.get_db)):
    """
    Gán một user đã tồn tại thành giáo viên + cập nhật role 'teacher' trong user_roles.
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
            detail=f"User with id {teacher_in.user_id} is algety a teacher."
        )

    # 3. Gán teacher
    db_teacher = teacher_crud.create_teacher(
        db=db,
        teacher_in=teacher_schema.TeacherCreate(user_id=teacher_in.user_id)
    )

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


@router.get("/", response_model=List[teacher_schema.Teacher])
def get_all_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả giáo viên.
    """
    return teacher_crud.get_all_teachers(db, skip=skip, limit=limit)


@router.get("/{teacher_id}", response_model=teacher_schema.Teacher)
def get_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin một giáo viên theo ID.
    """
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher


@router.put("/{teacher_id}", response_model=teacher_schema.Teacher)
def update_existing_teacher(teacher_id: int, teacher: teacher_schema.TeacherUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin giáo viên theo ID.
    """
    db_teacher = teacher_crud.update_teacher(db, teacher_id=teacher_id, teacher_update=teacher)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher


@router.delete("/{teacher_id}", response_model=dict)
def delete_existing_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    db_teacher = teacher_crud.get_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )

    deleted_teacher = teacher_crud.delete_teacher(db, teacher_id=teacher_id)

    return {
        "deleted_teacher": teacher_schema.Teacher.from_orm(deleted_teacher).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }

