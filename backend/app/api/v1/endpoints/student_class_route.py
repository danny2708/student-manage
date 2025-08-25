# app/api/v1/endpoints/student_class_route.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
    get_enrollments_by_class_id,
    get_all_enrollments
)

router = APIRouter()

@router.post("/", response_model=StudentClassAssociation, status_code=201)
def create_new_student_enrollment(
    student_class_in: StudentClassAssociationCreate,
    db: Session = Depends(get_db)
):
    """
    Tạo một bản ghi enrollment mới cho một sinh viên vào một lớp học.
    """
    # Kiểm tra xem sinh viên đã được ghi danh vào lớp này chưa
    existing_enrollment = get_enrollment(
        db, 
        student_id=student_class_in.student_id,
        class_id=student_class_in.class_id
    )
    if existing_enrollment:
        raise HTTPException(
            status_code=400,
            detail="Student is already enrolled in this class."
        )
    
    # Tạo bản ghi enrollment mới
    new_enrollment = create_enrollment(db=db, student_class_in=student_class_in)
    
    # Trả về đối tượng Pydantic hoàn chỉnh
    return StudentClassAssociation(
        student_id=new_enrollment.student_id,
        class_id=new_enrollment.class_id,
        # Sử dụng trường enrollment_date từ model SQLAlchemy
        enrollment_date=new_enrollment.enrollment_date,  
        # Lấy giá trị chuỗi từ enum
        status=new_enrollment.enrollment_status.value
    )

@router.delete("/{student_id}/{class_id}", status_code=204)
def remove_student_enrollment(
    student_id: int,
    class_id: int,
    db: Session = Depends(get_db)
):
    """
    Cập nhật trạng thái enrollment của một sinh viên thành 'Inactive'
    và xóa bản ghi liên kết.
    """
    # Gọi hàm set_enrollment_inactive để thực hiện logic
    removed_enrollment = set_enrollment_inactive(
        db=db, student_id=student_id, class_id=class_id
    )
    if not removed_enrollment:
        raise HTTPException(
            status_code=404, 
            detail="Enrollment record not found."
        )
    
    # Không cần trả về nội dung cho status_code 204
    return

@router.get("/student/{student_id}", response_model=list[StudentClassAssociation])
def get_enrollments_for_student(student_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách các lớp học mà một sinh viên đã đăng ký."""
    enrollments = get_enrollments_by_student_id(db, student_id)
    if not enrollments:
        raise HTTPException(status_code=404, detail="Enrollments not found for this student.")
    
    # Chuyển đổi từ model SQLAlchemy sang schema Pydantic
    return [
        StudentClassAssociation(
            student_id=e.student_id,
            class_id=e.class_id,
            enrollment_date=e.enrollment_date,
            status=e.enrollment_status.value
        ) for e in enrollments
    ]
