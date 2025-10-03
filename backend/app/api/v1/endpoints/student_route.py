from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.auth.auth import has_roles
from app.api import deps
from app.crud import student_crud, user_crud, user_role_crud
from app.schemas.user_role_schema import UserRoleCreate
from app.schemas import student_schema
from app.schemas import class_schema
from app.schemas.stats_schema import StudentStats

router = APIRouter()

MANAGER_ONLY = has_roles(["manager"])
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

# --- ASSIGN student (gán user thành student) ---
@router.post(
    "/",
    response_model=student_schema.Student,
    status_code=status.HTTP_201_CREATED,
    summary="Gán một user đã tồn tại thành student",
    dependencies=[Depends(MANAGER_ONLY)]
)
def assign_student(
    student_in: student_schema.StudentCreate,
    db: Session = Depends(deps.get_db)
):
    # Kiểm tra user tồn tại
    db_user = user_crud.get_user(db=db, user_id=student_in.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail=f"User with id {student_in.user_id} not found.")

    # Kiểm tra user đã là student chưa
    existing_student = student_crud.get_student_by_user_id(db=db, user_id=student_in.user_id)
    if existing_student:
        raise HTTPException(status_code=400, detail=f"User with id {student_in.user_id} is already a student.")

    # Gán student
    db_student = student_crud.create_student(
        db=db,
        student_in=student_schema.StudentCreate(
            user_id=student_in.user_id,
            parent_id=student_in.parent_id
        )
    )

    # Cập nhật user_roles nếu chưa có role "student"
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


# --- GET all students ---
@router.get(
    "/",
    response_model=List[student_schema.Student],
    summary="Lấy danh sách tất cả học sinh",
    # dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_all_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    students = student_crud.get_all_students(db, skip=skip, limit=limit)
    return students


# --- GET student by ID ---
@router.get(
    "/{user_id}",
    response_model=student_schema.Student,
    summary="Lấy thông tin của một học sinh cụ thể",
    dependencies=[Depends(MANAGER_OR_TEACHER)]
)
def get_student(user_id: int, db: Session = Depends(deps.get_db)):
    db_student = student_crud.get_student(db, user_id=user_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Học sinh không tìm thấy.")
    return db_student


# --- UPDATE student ---
@router.put(
    "/{user_id}",
    response_model=student_schema.Student,
    summary="Cập nhật thông tin của một học sinh",
    dependencies=[Depends(MANAGER_ONLY)]
)
def update_student(user_id: int, student_update: student_schema.StudentUpdate, db: Session = Depends(deps.get_db)):
    db_student = student_crud.update_student(db, user_id=user_id, student_update=student_update)
    if not db_student:
        raise HTTPException(status_code=404, detail="Học sinh không tìm thấy.")
    return db_student


# --- DELETE student ---
@router.delete(
    "/{user_id}",
    response_model=dict,
    summary="Xóa một học sinh",
    dependencies=[Depends(MANAGER_ONLY)]
)
def delete_student(user_id: int, db: Session = Depends(deps.get_db)):
    db_student = student_crud.get_student(db, user_id=user_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Học sinh không tìm thấy.")

    deleted_student = student_crud.delete_student(db, user_id=user_id)
    return {
        "deleted_student": student_schema.Student.from_orm(deleted_student).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.get(
    "/{user_id}/stats",
    response_model=StudentStats,
    summary="Lấy các chỉ số thống kê của một học sinh (GPA, điểm học tập/kỷ luật, số lớp)",
    # dependencies=[Depends(MANAGER_OR_TEACHER)] # Hoặc tùy chỉnh quyền truy cập
)
def get_student_stats(user_id: int, db: Session = Depends(deps.get_db)):
    # 1. Kiểm tra học sinh tồn tại
    db_student = student_crud.get_student(db, user_id=user_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Học sinh không tìm thấy.")
    
    # 2. Lấy thống kê
    # Vì hàm CRUD không còn là async, ta gọi trực tiếp
    stats = student_crud.get_student_stats(db, student_user_id=user_id)
    
    return stats

@router.get(
    "/{user_id}/classes",
    response_model=List[class_schema.ClassView], # SỬ DỤNG CLASSVIEW
    summary="Lấy danh sách các lớp học đang 'active' mà học sinh đã đăng ký",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Cả Manager và Teacher đều có thể xem
)
def get_student_active_classes_endpoint(
    user_id: int, 
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách các lớp học hiện tại (trạng thái enrollment là 'active') mà học sinh đang tham gia.
    
    Quyền truy cập: **manager**, **teacher**
    """
    # 1. Kiểm tra học sinh tồn tại
    db_student = student_crud.get_student(db, user_id=user_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Học sinh không tìm thấy.")

    # 2. Gọi hàm CRUD
    active_classes = student_crud.get_student_active_classes(db, student_user_id=user_id)
    
    return active_classes