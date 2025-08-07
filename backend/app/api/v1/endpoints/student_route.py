from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import student_crud
from app.crud import user_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import student_schema
from app.schemas.role_schema_with_user_id import StudentCreateWithUser

# Import các dependencies
from app.api import deps

router = APIRouter()

@router.post("/", response_model=student_schema.Student, status_code=status.HTTP_201_CREATED)
def create_student(student_in: StudentCreateWithUser, db: Session = Depends(deps.get_db)):
    """
    Tạo một vai trò student mới và liên kết nó với một người dùng đã tồn tại.
    """
    # Bước 1: Kiểm tra xem user_id có tồn tại không
    db_user = user_crud.get_user(db=db, user_id=student_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {student_in.user_id} not found."
        )

    # Bước 2: Kiểm tra xem người dùng này đã có vai trò student chưa
    existing_student = student_crud.get_student_by_user_id(db=db, user_id=student_in.user_id)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một học sinh khác."
        )

    # Bước 3: Tạo bản ghi student và liên kết với user_id
    db_student = student_crud.create_student(db=db, student_in=student_in)
    return db_student

@router.get("/", response_model=List[student_schema.Student])
def read_all_students(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả học sinh.
    """
    students = student_crud.get_all_students(db, skip=skip, limit=limit)
    return students

@router.get("/{student_id}", response_model=student_schema.Student)
def read_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một học sinh cụ thể bằng ID.
    """
    db_student = student_crud.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.put("/{student_id}", response_model=student_schema.Student)
def update_existing_student(student_id: int, student: student_schema.StudentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một học sinh cụ thể bằng ID.
    """
    db_student = student_crud.update_student(db, student_id=student_id, student_update=student)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return db_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_student(student_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một học sinh cụ thể bằng ID.
    """
    db_student = student_crud.delete_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Học sinh không tìm thấy."
        )
    return
