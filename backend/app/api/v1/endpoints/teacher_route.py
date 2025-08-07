# app/api/v1/endpoints/teacher_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import teacher_crud
from app.crud import user_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import teacher_schema
from app.schemas.role_schema_with_user_id import TeacherCreateWithUser

# Import các dependencies
from app.api import deps

router = APIRouter()

@router.post("/", response_model=teacher_schema.Teacher, status_code=status.HTTP_201_CREATED)
def create_teacher(teacher_in: TeacherCreateWithUser, db: Session = Depends(deps.get_db)):
    """
    Tạo một vai trò teacher mới và liên kết nó với một người dùng đã tồn tại.
    """
    # Bước 1: Kiểm tra xem user_id có tồn tại trong bảng users không
    db_user = user_crud.get_user(db=db, user_id=teacher_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {teacher_in.user_id} not found."
        )

    # Bước 2: Kiểm tra xem người dùng này đã có vai trò giáo viên chưa
    existing_teacher = teacher_crud.get_teacher_by_user_id(db, user_id=teacher_in.user_id)
    if existing_teacher:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {teacher_in.user_id} is already a teacher."
        )

    # Bước 3: Tạo bản ghi teacher và liên kết với user_id
    # Truyền Pydantic model trực tiếp thay vì dùng .model_dump()
    db_teacher = teacher_crud.create_teacher(db=db, teacher_in=teacher_in)
    return db_teacher

@router.get("/", response_model=List[teacher_schema.Teacher])
def read_all_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả giáo viên.
    """
    teachers = teacher_crud.get_all_teachers(db, skip=skip, limit=limit)
    return teachers

@router.get("/{teacher_id}", response_model=teacher_schema.Teacher)
def read_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một giáo viên cụ thể bằng ID.
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
    Cập nhật thông tin của một giáo viên cụ thể bằng ID.
    """
    db_teacher = teacher_crud.update_teacher(db, teacher_id=teacher_id, teacher_update=teacher)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    return db_teacher

@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_teacher(teacher_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một giáo viên cụ thể bằng ID.
    """
    db_teacher = teacher_crud.delete_teacher(db, teacher_id=teacher_id)
    if db_teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Giáo viên không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, vì đây là tiêu chuẩn cho xóa thành công
    return
