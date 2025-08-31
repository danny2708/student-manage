# app/api/v1/endpoints/student_class_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import dependency factory
from app.api.auth.auth import has_roles

from app.api.deps import get_db
from app.schemas.student_class_association_schema import (
    StudentClassAssociationCreate,
    StudentClassAssociation
)
from app.crud.student_class_crud import (
    get_enrollment,
    create_enrollment,
    set_enrollment_inactive,
    get_enrollments_by_student_id,
    get_active_enrollments_by_class_id,
    get_all_enrollments
)

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

# Dependency cho quyền truy cập của Manager hoặc Teacher
MANAGER_OR_TEACHER = has_roles(["manager", "teacher"])

# --- Các endpoint chỉ dành cho Manager ---
# Manager có thể tạo, xóa, và xem tất cả các bản ghi enrollment
@router.post(
    "/", 
    response_model=StudentClassAssociation, 
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một bản ghi enrollment mới cho một sinh viên vào một lớp học",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ Manager mới có quyền tạo
)
def create_new_student_enrollment(
    student_class_in: StudentClassAssociationCreate,
    db: Session = Depends(get_db)
):
    """
    Tạo một bản ghi enrollment mới.
    
    Quyền truy cập: **manager**
    """
    existing_enrollment = get_enrollment(
        db, 
        student_id=student_class_in.student_id,
        class_id=student_class_in.class_id
    )
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this class."
        )
    
    new_enrollment = create_enrollment(db=db, student_class_in=student_class_in)
    
    return StudentClassAssociation(
        student_id=new_enrollment.student_id,
        class_id=new_enrollment.class_id,
        enrollment_date=new_enrollment.enrollment_date,  
        status=new_enrollment.enrollment_status.value
    )

@router.delete(
    "/{student_id}/{class_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Cập nhật trạng thái enrollment của một sinh viên thành 'Inactive'",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ Manager mới có quyền xóa
)
def remove_student_enrollment(
    student_id: int,
    class_id: int,
    db: Session = Depends(get_db)
):
    """
    Cập nhật trạng thái enrollment của một sinh viên thành 'Inactive'.
    
    Quyền truy cập: **manager**
    """
    removed_enrollment = set_enrollment_inactive(
        db=db, student_id=student_id, class_id=class_id
    )
    if not removed_enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Enrollment record not found."
        )
    
    return

# --- Các endpoint dành cho cả Manager và Teacher ---
# Cả hai vai trò này đều có thể xem thông tin enrollment
@router.get(
    "/student/{student_id}", 
    response_model=List[StudentClassAssociation],
    summary="Lấy danh sách các lớp học mà một sinh viên đã đăng ký",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager hoặc Teacher đều có thể xem
)
def get_enrollments_for_student(student_id: int, db: Session = Depends(get_db)):
    """
    Lấy danh sách các lớp học mà một sinh viên đã đăng ký.
    
    Quyền truy cập: **manager**, **teacher**
    """
    enrollments = get_enrollments_by_student_id(db, student_id)
    if not enrollments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollments not found for this student.")
    
    return [
        StudentClassAssociation(
            student_id=e.student_id,
            class_id=e.class_id,
            enrollment_date=e.enrollment_date,
            status=e.enrollment_status.value
        ) for e in enrollments
    ]

@router.get(
    "/class/{class_id}",
    response_model=List[StudentClassAssociation],
    summary="Lấy danh sách các sinh viên đã đăng ký vào một lớp học",
    dependencies=[Depends(MANAGER_OR_TEACHER)] # Manager hoặc Teacher đều có thể xem
)
def get_active_enrollments_by_class(class_id: int, db: Session = Depends(get_db)):
    """
    Lấy danh sách các sinh viên đã đăng ký vào một lớp học.
    
    Quyền truy cập: **manager**, **teacher**
    """
    enrollments = get_active_enrollments_by_class_id(db, class_id)
    if not enrollments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollments not found for this class.")
    
    return [
        StudentClassAssociation(
            student_id=e.student_id,
            class_id=e.class_id,
            enrollment_date=e.enrollment_date,
            status=e.enrollment_status.value
        ) for e in enrollments
    ]
    
@router.get(
    "/",
    response_model=List[StudentClassAssociation],
    summary="Lấy tất cả các bản ghi enrollment",
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ Manager mới có quyền xem toàn bộ
)
def get_all_student_enrollments(db: Session = Depends(get_db)):
    """
    Lấy tất cả các bản ghi enrollment.
    
    Quyền truy cập: **manager**
    """
    enrollments = get_all_enrollments(db)
    if not enrollments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No enrollments found.")
    
    return [
        StudentClassAssociation(
            student_id=e.student_id,
            class_id=e.class_id,
            enrollment_date=e.enrollment_date,
            status=e.enrollment_status.value
        ) for e in enrollments
    ]
