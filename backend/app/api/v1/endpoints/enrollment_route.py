from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import enrollment_crud as crud_enrollment
from app.schemas import enrollment_schema as schemas_enrollment
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_enrollment.Enrollment, status_code=status.HTTP_201_CREATED)
def create_new_enrollment(enrollment: schemas_enrollment.EnrollmentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một bản ghi đăng ký mới.
    """
    # Bạn có thể thêm kiểm tra xem student_id và class_id có tồn tại không
    return crud_enrollment.create_enrollment(db=db, enrollment=enrollment)

@router.get("/", response_model=List[schemas_enrollment.Enrollment])
def read_all_enrollments(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các bản ghi đăng ký.
    """
    enrollments = crud_enrollment.get_all_enrollments(db, skip=skip, limit=limit)
    return enrollments

@router.get("/{enrollment_id}", response_model=schemas_enrollment.Enrollment)
def read_enrollment(enrollment_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một bản ghi đăng ký cụ thể bằng ID.
    """
    db_enrollment = crud_enrollment.get_enrollment(db, enrollment_id=enrollment_id)
    if db_enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đăng ký không tìm thấy."
        )
    return db_enrollment

@router.put("/{enrollment_id}", response_model=schemas_enrollment.Enrollment)
def update_existing_enrollment(enrollment_id: int, enrollment: schemas_enrollment.EnrollmentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một bản ghi đăng ký cụ thể bằng ID.
    """
    db_enrollment = crud_enrollment.update_enrollment(db, enrollment_id=enrollment_id, enrollment_update=enrollment)
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
    db_enrollment = crud_enrollment.delete_enrollment(db, enrollment_id=enrollment_id)
    if db_enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đăng ký không tìm thấy."
        )
    return {"message": "Đăng ký đã được xóa thành công."}

