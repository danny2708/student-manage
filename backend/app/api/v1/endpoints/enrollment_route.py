# app/api/v1/endpoints/enrollment_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import enrollment_crud
from app.crud import student_crud
from app.crud import class_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import enrollment_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=enrollment_schema.Enrollment, status_code=status.HTTP_201_CREATED)
def create_new_enrollment(enrollment_in: enrollment_schema.EnrollmentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đăng ký mới.
    """
    # Bước 1: Kiểm tra xem student_id có tồn tại không
    db_student = student_crud.get_student(db, student_id=enrollment_in.student_id)
    if not db_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {enrollment_in.student_id} not found."
        )

    # Bước 2: Kiểm tra xem class_id có tồn tại không
    db_class = class_crud.get_class(db, class_id=enrollment_in.class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Class with id {enrollment_in.class_id} not found."
        )

    # Bước 3: Kiểm tra xem bản đăng ký này đã tồn tại chưa
    existing_enrollment = enrollment_crud.get_enrollment_by_student_and_class(
        db, student_id=enrollment_in.student_id, class_id=enrollment_in.class_id
    )
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Học sinh đã được đăng ký vào lớp học này."
        )

    # Bước 4: Tạo bản ghi đăng ký mới
    return enrollment_crud.create_enrollment(db=db, enrollment=enrollment_in)

@router.get("/", response_model=List[enrollment_schema.Enrollment])
def read_all_enrollments(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi đăng ký.
    """
    enrollments = enrollment_crud.get_all_enrollments(db, skip=skip, limit=limit)
    return enrollments

@router.get("/{enrollment_id}", response_model=enrollment_schema.Enrollment)
def read_enrollment(enrollment_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi đăng ký cụ thể bằng ID.
    """
    db_enrollment = enrollment_crud.get_enrollment(db, enrollment_id=enrollment_id)
    if db_enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đăng ký không tìm thấy."
        )
    return db_enrollment

@router.put("/{enrollment_id}", response_model=enrollment_schema.Enrollment)
def update_existing_enrollment(enrollment_id: int, enrollment_update: enrollment_schema.EnrollmentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi đăng ký cụ thể bằng ID.
    """
    db_enrollment = enrollment_crud.update_enrollment(db, enrollment_id=enrollment_id, enrollment_update=enrollment_update)
    if db_enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đăng ký không tìm thấy."
        )
    return db_enrollment

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_enrollment(enrollment_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một bản ghi đăng ký cụ thể bằng ID.
    """
    db_enrollment = enrollment_crud.delete_enrollment(db, enrollment_id=enrollment_id)
    if db_enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đăng ký không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, vì đây là tiêu chuẩn cho xóa th