# app/api/v1/endpoints/student_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Import dependency factory
from app.api.auth.auth import has_roles

# Import các CRUD operations
from app.crud import student_crud
from app.crud import user_crud, user_role_crud
from app.schemas.user_role_schema import UserRoleCreate
# Import các schemas cần thiết trực tiếp từ module
from app.schemas import student_schema

# Import các dependencies
from app.api import deps

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

@router.post(
    "/", 
    response_model=student_schema.Student, 
    status_code=status.HTTP_201_CREATED,
    summary="Gán một user đã tồn tại thành student",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền gán
)
def assign_student(
    student_in: student_schema.StudentAssign, 
    db: Session = Depends(deps.get_db)
):
    """
    Gán một user đã tồn tại thành student và cập nhật role 'student' trong user_roles.
    
    Quyền truy cập: **manager**
    """
    # 1. Kiểm tra user có tồn tại
    db_user = user_crud.get_user(db=db, user_id=student_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {student_in.user_id} not found."
        )

    # 2. Kiểm tra user đã là student chưa
    existing_student = student_crud.get_student_by_user_id(db=db, user_id=student_in.user_id)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {student_in.user_id} is already a student."
        )

    # 3. Gán student
    db_student = student_crud.create_student(
        db=db,
        student_in=student_schema.StudentCreate(user_id=student_in.user_id)
    )

    # 4. Cập nhật user_roles nếu chưa có role "student"
    existing_role = user_role_crud.get_user_role(db, user_id=student_in.user_id, role_name="student")
    if not existing_role:
        user_role_crud.create_user_role(
            db=db,
            role_in=UserRoleCreate(
                user_id=student_in.user_id,
                role_name="student",
                assigned_at=datetime.utcnow()
            )
        )

    return db_student

@router.get(
    "/", 
    response_model=List[student_schema.Student],
    summary="Lấy danh sách tất cả học sinh",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager và teacher đều có thể xem
)
def get_all_students(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả học sinh.
    
    Quyền truy cập: **manager**, **teacher**
    """
    students = student_crud.get_all_students(db, skip=skip, limit=limit)
    return students

@router.get(
    "/{student_id}", 
    response_model=student_schema.Student,
    summary="Lấy thông tin của một học sinh cụ thể bằng ID",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager và teacher đều có thể xem
)
def get_student(
    student_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin của một học sinh cụ thể bằng ID.
    
    Quyền truy cập: **manager**, **teacher**
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.put(
    "/{student_id}", 
    response_model=student_schema.Student,
    summary="Cập nhật thông tin của một học sinh cụ thể",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền cập nhật
)
def update_existing_student(
    student_id: int, 
    student: student_schema.StudentUpdate, 
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin của một học sinh cụ thể bằng ID.
    
    Quyền truy cập: **manager**
    """
    db_student = student_crud.update_student(db, student_id=student_id, student_update=student)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.delete(
    "/{student_id}", 
    response_model=dict,
    summary="Xóa một học sinh",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ manager mới có quyền xóa
)
def delete_existing_student(
    student_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một học sinh khỏi cơ sở dữ liệu.
    
    Quyền truy cập: **manager**
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )

    deleted_student = student_crud.delete_student(db, student_id=student_id)

    return {
        "deleted_student": student_schema.Student.from_orm(deleted_student).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }
